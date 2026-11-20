import { useCallback, useEffect, useMemo, useState } from "react"

import { exportSignedPdf } from "@/lib/pdf-export.ts"
import {
  addField,
  applySignerSubmission,
  auditChainView,
  createEnvelope,
  loadPersistedState,
  persistState,
  registerVerifyRecord,
  replaceSigners,
  sendEnvelope,
  signerByToken,
  tamperAuditRow,
  type LabState,
} from "@/lib/lab-store.ts"
import { sha256Hex } from "@/lib/sha256.ts"
import { VerifyRegistry } from "@/lib/verify-registry.ts"
import type { FieldRecord } from "@/signudoc/field-types.ts"
import { extractPageMeta } from "@/features/pdf/pdfjs.ts"

function readHashSigningToken(): string | null {
  const match = /^#sign\/([a-f0-9]+)/.exec(window.location.hash)
  return match?.[1] ?? null
}

function buildInitialState(): LabState {
  const persisted = loadPersistedState()
  return {
    envelope: persisted?.envelope ?? null,
    verifyRegistry: VerifyRegistry.fromJSON(persisted?.verifyRegistry?.toJSON() ?? []),
    signingToken: persisted?.signingToken ?? null,
    tamperedAudit: null,
  }
}

export function useLab() {
  const [state, setState] = useState<LabState>(buildInitialState)
  const [sealing, setSealing] = useState(false)
  const outbox = useMemo(() => {
    if (!state.envelope) {
      return []
    }
    return state.envelope.signers
      .filter((s) => s.token)
      .map((s) => ({
        signerId: s.id,
        signerName: s.name,
        token: s.token!,
        href: `#sign/${s.token}`,
      }))
  }, [state.envelope])

  useEffect(() => {
    persistState(state)
  }, [state])

  useEffect(() => {
    const onHash = () => {
      const match = /^#sign\/([a-f0-9]+)/.exec(window.location.hash)
      setState((s) => ({ ...s, signingToken: match?.[1] ?? null }))
    }
    onHash()
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  const loadSample = useCallback(async () => {
    const res = await fetch("/sample-contract.pdf")
    const buf = new Uint8Array(await res.arrayBuffer())
    const pages = await extractPageMeta(buf)
    let envelope = createEnvelope({
      title: "Sample services agreement",
      pdfBytes: buf,
      pages,
    })
    envelope = replaceSigners(envelope, [
      { name: "Alex Rivera", email: "alex@example.com" },
      { name: "Jordan Lee", email: "jordan@example.com" },
    ])
    setState((s) => ({ ...s, envelope, tamperedAudit: null }))
  }, [])

  const loadUpload = useCallback(async (file: File) => {
    const buf = new Uint8Array(await file.arrayBuffer())
    const pages = await extractPageMeta(buf)
    const envelope = createEnvelope({
      title: file.name.replace(/\.pdf$/i, ""),
      pdfBytes: buf,
      pages,
    })
    setState((s) => ({ ...s, envelope, tamperedAudit: null }))
  }, [])

  const setSigners = useCallback((rows: Array<{ name: string; email: string }>) => {
    setState((s) => {
      if (!s.envelope) {
        return s
      }
      return { ...s, envelope: replaceSigners(s.envelope, rows) }
    })
  }, [])

  const placeField = useCallback((field: FieldRecord) => {
    setState((s) => {
      if (!s.envelope) {
        return s
      }
      return { ...s, envelope: addField(s.envelope, field) }
    })
  }, [])

  const send = useCallback(
    (signers?: Array<{ name: string; email: string }>) => {
      setState((s) => {
        if (!s.envelope) {
          return s
        }
        try {
          const prepared = signers ? replaceSigners(s.envelope, signers) : s.envelope
          const result = sendEnvelope(prepared)
          return { ...s, envelope: result.envelope, tamperedAudit: null }
        } catch (error) {
          console.error(error)
          return s
        }
      })
    },
    [],
  )

  const openSigningLink = useCallback((token: string) => {
    window.location.hash = `sign/${token}`
    setState((s) => ({ ...s, signingToken: token }))
  }, [])

  const submitSigner = useCallback((updates: Map<string, FieldRecord>) => {
    setState((s) => {
      if (!s.envelope || !s.signingToken) {
        return s
      }
      const signer = signerByToken(s.envelope, s.signingToken)
      if (!signer) {
        return s
      }
      const envelope = applySignerSubmission(s.envelope, signer.id, updates)
      if (envelope.status === "completed") {
        setSealing(true)
        void finalizeExport(envelope, setState).finally(() => setSealing(false))
      }
      window.location.hash = ""
      return { ...s, envelope, signingToken: null }
    })
  }, [])

  const tamper = useCallback((sequence: number, mode: "edit" | "delete") => {
    setState((s) => {
      if (!s.envelope) {
        return s
      }
      const base = s.tamperedAudit ?? s.envelope.audit
      return { ...s, tamperedAudit: tamperAuditRow(base, sequence, mode) }
    })
  }, [])

  const resetTamper = useCallback(() => {
    setState((s) => ({ ...s, tamperedAudit: null }))
  }, [])

  const chain = useMemo(() => {
    if (!state.envelope) {
      return null
    }
    return auditChainView(state.envelope, state.tamperedAudit)
  }, [state.envelope, state.tamperedAudit])

  const activeSigner = useMemo(() => {
    if (!state.envelope) {
      return null
    }
    const token = state.signingToken ?? readHashSigningToken()
    if (!token) {
      return null
    }
    return signerByToken(state.envelope, token) ?? null
  }, [state.envelope, state.signingToken])

  return {
    state,
    outbox,
    chain,
    activeSigner,
    loadSample,
    loadUpload,
    setSigners,
    placeField,
    send,
    openSigningLink,
    submitSigner,
    tamper,
    resetTamper,
    sealing,
  }
}

async function finalizeExport(
  envelope: NonNullable<LabState["envelope"]>,
  setState: React.Dispatch<React.SetStateAction<LabState>>,
) {
  const docHash = await sha256Hex(envelope.pdfBytes)
  const { pdfBytes } = await exportSignedPdf({
    originalPdf: envelope.pdfBytes,
    pages: envelope.pages,
    fields: envelope.fields,
    title: envelope.title,
    audit: envelope.audit,
    documentHash: docHash,
  })
  const signedHash = await sha256Hex(pdfBytes)
  setState((s) => ({
    ...s,
    envelope: {
      ...envelope,
      signedPdfBytes: pdfBytes,
      lastKnownGoodHash: signedHash,
    },
    verifyRegistry: registerVerifyRecord(s.verifyRegistry, {
      envelopeId: envelope.id,
      title: envelope.title,
      status: "completed",
      finishedAt: Math.floor(Date.now() / 1000),
      signerCount: envelope.signers.length,
      signedPdfSha256: signedHash,
    }),
  }))
}

export async function downloadSignedPdf(bytes: Uint8Array, title: string) {
  const blob = new Blob([Uint8Array.from(bytes)], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${title.replace(/\s+/g, "-").toLowerCase()}-signed.pdf`
  a.click()
  URL.revokeObjectURL(url)
}