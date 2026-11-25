import {
  appendChainedAuditEvent,
  type StoredAuditRow,
  verifyAuditChain,
} from "../signudoc/audit-chain.ts"
import type { FieldPlacement, FieldRecord } from "../signudoc/field-types.ts"
import { createId, createSigningToken } from "./ids.ts"
import { VerifyRegistry, type VerifyRecord } from "./verify-registry.ts"

export type Signer = {
  id: string
  name: string
  email: string
  order: number
  status: "pending" | "sent" | "completed"
  token: string | null
}

export type PageMeta = {
  page: number
  widthPt: number
  heightPt: number
}

export type EnvelopeStatus = "draft" | "out_for_signature" | "completed"

export type LabEnvelope = {
  id: string
  title: string
  pdfBytes: Uint8Array
  pages: PageMeta[]
  signers: Signer[]
  fields: FieldRecord[]
  status: EnvelopeStatus
  audit: StoredAuditRow[]
  signedPdfBytes?: Uint8Array
  lastKnownGoodHash?: string
}

export type OutboxLink = {
  signerId: string
  signerName: string
  token: string
  href: string
}

export type LabState = {
  envelope: LabEnvelope | null
  verifyRegistry: VerifyRegistry
  signingToken: string | null
  tamperedAudit: StoredAuditRow[] | null
}

const STORAGE_KEY = "signudoc-seal-lab-state-v3"

function nowSec(): number {
  return Math.floor(Date.now() / 1000)
}

export function createEnvelope(input: {
  title: string
  pdfBytes: Uint8Array
  pages: PageMeta[]
}): LabEnvelope {
  const id = createId()
  const audit = [
    appendChainedAuditEvent([], {
      actorEmail: "sender@lab.local",
      actorType: "sender",
      createdAt: nowSec(),
      envelopeId: id,
      event: "envelope_created",
      id: createId(),
      ipAddress: null,
      metadata: { title: input.title },
      userAgent: "SignuDoc Seal Lab",
    }),
  ]

  return {
    id,
    title: input.title,
    pdfBytes: input.pdfBytes,
    pages: input.pages,
    signers: [],
    fields: [],
    status: "draft",
    audit,
  }
}

export function replaceSigners(
  envelope: LabEnvelope,
  signers: Array<{ name: string; email: string }>,
): LabEnvelope {
  const nextSigners: Signer[] = signers.map((s, index) => {
    const email = s.email.trim().toLowerCase()
    const existing = envelope.signers.find((row) => row.email === email)
    return {
      id: existing?.id ?? createId(),
      name: s.name.trim(),
      email,
      order: index,
      status: existing?.status ?? "pending",
      token: existing?.token ?? null,
    }
  })

  return { ...envelope, signers: nextSigners }
}

export function replaceFields(
  envelope: LabEnvelope,
  fields: FieldPlacement[],
): LabEnvelope {
  const merged: FieldRecord[] = fields.map((field) => {
    const existing = envelope.fields.find((f) => f.id === field.id)
    return { ...field, ...existing, ...field }
  })
  return { ...envelope, fields: merged }
}

export function addField(
  envelope: LabEnvelope,
  placement: FieldPlacement,
): LabEnvelope {
  return { ...envelope, fields: [...envelope.fields, { ...placement }] }
}

export function sendEnvelope(envelope: LabEnvelope): {
  envelope: LabEnvelope
  outbox: OutboxLink[]
} {
  if (envelope.signers.length === 0) {
    throw new Error("Add at least one signer before sending.")
  }

  const first = envelope.signers
    .slice()
    .sort((a, b) => a.order - b.order)[0]
  if (!first) {
    throw new Error("No signers configured.")
  }

  const token = createSigningToken()
  const signers = envelope.signers.map((s) =>
    s.id === first.id
      ? { ...s, status: "sent" as const, token }
      : { ...s, status: s.order === first.order ? "sent" : s.status },
  )

  const audit = [
    ...envelope.audit,
    appendChainedAuditEvent(envelope.audit, {
      actorEmail: "sender@lab.local",
      actorType: "sender",
      createdAt: nowSec(),
      envelopeId: envelope.id,
      event: "envelope_sent",
      id: createId(),
      ipAddress: null,
      metadata: { signerId: first.id },
      userAgent: "SignuDoc Seal Lab",
    }),
  ]

  const outbox: OutboxLink[] = signers
    .filter((s) => s.token)
    .map((s) => ({
      signerId: s.id,
      signerName: s.name,
      token: s.token!,
      href: `#sign/${s.token}`,
    }))

  return {
    envelope: { ...envelope, signers, status: "out_for_signature", audit },
    outbox,
  }
}

export function signerByToken(
  envelope: LabEnvelope,
  token: string,
): Signer | undefined {
  return envelope.signers.find((s) => s.token === token)
}

export function fieldsForSigner(
  envelope: LabEnvelope,
  signerId: string,
): FieldRecord[] {
  return envelope.fields.filter((f) => f.signerId === signerId)
}

export function applySignerSubmission(
  envelope: LabEnvelope,
  signerId: string,
  updates: Map<string, FieldRecord>,
): LabEnvelope {
  const fields = envelope.fields.map((field) => {
    const update = updates.get(field.id)
    return update ? { ...field, ...update, submittedAt: nowSec() } : field
  })

  const signer = envelope.signers.find((s) => s.id === signerId)
  const audit = [
    ...envelope.audit,
    appendChainedAuditEvent(envelope.audit, {
      actorEmail: signer?.email ?? null,
      actorType: "signer",
      createdAt: nowSec(),
      envelopeId: envelope.id,
      event: "signature_submitted",
      id: createId(),
      ipAddress: null,
      metadata: { signerId, fieldCount: updates.size },
      userAgent: "SignuDoc Seal Lab",
    }),
  ]

  const signers = envelope.signers.map((s) =>
    s.id === signerId ? { ...s, status: "completed" as const, token: null } : s,
  )

  const nextPending = signers
    .filter((s) => s.status !== "completed")
    .sort((a, b) => a.order - b.order)[0]

  if (nextPending) {
    const token = createSigningToken()
    const withNext = signers.map((s) =>
      s.id === nextPending.id
        ? { ...s, status: "sent" as const, token }
        : s,
    )
    return {
      ...envelope,
      fields,
      signers: withNext,
      audit: [
        ...audit,
        appendChainedAuditEvent(audit, {
          actorEmail: "system@lab.local",
          actorType: "system",
          createdAt: nowSec(),
          envelopeId: envelope.id,
          event: "signing_invitation",
          id: createId(),
          ipAddress: null,
          metadata: { signerId: nextPending.id },
          userAgent: "SignuDoc Seal Lab",
        }),
      ],
    }
  }

  const completedAudit = [
    ...audit,
    appendChainedAuditEvent(audit, {
      actorEmail: "system@lab.local",
      actorType: "system",
      createdAt: nowSec(),
      envelopeId: envelope.id,
      event: "envelope_completed",
      id: createId(),
      ipAddress: null,
      metadata: null,
      userAgent: "SignuDoc Seal Lab",
    }),
  ]

  return {
    ...envelope,
    fields,
    signers,
    status: "completed",
    audit: completedAudit,
  }
}

export function assertSignerFieldOwnership(
  envelope: LabEnvelope,
  signerOrders: Map<string, number>,
): boolean {
  for (const field of envelope.fields) {
    const order = signerOrders.get(field.signerId)
    if (order === undefined) {
      return false
    }
  }
  return true
}

export function auditChainView(
  envelope: LabEnvelope,
  tampered: StoredAuditRow[] | null,
): ReturnType<typeof verifyAuditChain> {
  return verifyAuditChain(tampered ?? envelope.audit)
}

export function tamperAuditRow(
  rows: StoredAuditRow[],
  sequence: number,
  mode: "edit" | "delete",
): StoredAuditRow[] {
  if (mode === "delete") {
    return rows.filter((row) => row.sequence !== sequence)
  }

  return rows.map((row) =>
    row.sequence === sequence
      ? {
          ...row,
          event: `${row.event}_tampered`,
          rowHash: "deadbeef".repeat(8),
        }
      : row,
  )
}

export function registerVerifyRecord(
  registry: VerifyRegistry,
  record: VerifyRecord,
): VerifyRegistry {
  const next = VerifyRegistry.fromJSON(registry.toJSON())
  next.register(record)
  return next
}

export function serializeState(state: LabState): string {
  const envelope = state.envelope
    ? {
        id: state.envelope.id,
        title: state.envelope.title,
        status: state.envelope.status,
        signers: state.envelope.signers,
        fields: state.envelope.fields,
        audit: state.envelope.audit,
        pages: state.envelope.pages,
        lastKnownGoodHash: state.envelope.lastKnownGoodHash,
      }
    : null

  return JSON.stringify({
    envelope,
    verify: state.verifyRegistry.toJSON(),
    signingToken: state.signingToken,
  })
}

export function loadPersistedState(): Partial<LabState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as {
      envelope: (Omit<LabEnvelope, "pdfBytes" | "signedPdfBytes">) | null
      verify: VerifyRecord[]
      signingToken: string | null
    }

    return {
      envelope: null,
      verifyRegistry: VerifyRegistry.fromJSON(parsed.verify ?? []),
      signingToken: null,
      tamperedAudit: null,
    }
  } catch {
    return null
  }
}

export function persistState(state: LabState): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeState(state))
  } catch {
    // Verify registry only if quota exceeded (PDF bytes are not persisted).
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ envelope: null, verify: state.verifyRegistry.toJSON(), signingToken: null }),
      )
    } catch {
      // ignore
    }
  }
}