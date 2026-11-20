import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, FileCheck2, Send, Shield, Stamp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PdfPageViewer } from "@/features/pdf/PdfPageViewer"
import { downloadSignedPdf, useLab } from "@/features/lab/useLab"
import { SignaturePad } from "@/features/signing/SignaturePad"
import { labFieldTypes, type FieldRecord, type LabFieldType } from "@/signudoc/field-types.ts"
import { fieldsForSigner } from "@/lib/lab-store.ts"
import { sha256Hex } from "@/lib/sha256.ts"

type Tab = "compose" | "outbox" | "sign" | "audit" | "verify" | "about"

const LEGAL_BANNER =
  "Lab signatures are not legally binding. This demo does not produce a qualified or PAdES/legally valid electronic signature."

export default function App() {
  const lab = useLab()
  const [tab, setTab] = useState<Tab>("compose")
  const [page, setPage] = useState(1)
  const [placeMode, setPlaceMode] = useState<LabFieldType | null>("signature")
  const [selectedSignerId, setSelectedSignerId] = useState<string | null>(null)
  const [signerOne, setSignerOne] = useState({ name: "Alex Rivera", email: "alex@example.com" })
  const [signerTwo, setSignerTwo] = useState({ name: "Jordan Lee", email: "jordan@example.com" })
  const [twoSigners, setTwoSigners] = useState(true)
  const [fieldDrafts, setFieldDrafts] = useState<Map<string, FieldRecord>>(new Map())
  const [verifyHash, setVerifyHash] = useState<string | null>(null)
  const [verifyOutcome, setVerifyOutcome] = useState<string | null>(null)

  const envelope = lab.state.envelope

  const signerOptions = useMemo(
    () => envelope?.signers ?? [],
    [envelope?.signers],
  )

  useEffect(() => {
    if (signerOptions[0] && !selectedSignerId) {
      setSelectedSignerId(signerOptions[0].id)
    }
  }, [signerOptions, selectedSignerId])

  useEffect(() => {
    if (lab.state.signingToken) {
      setTab("sign")
    }
  }, [lab.state.signingToken])

  async function handleVerifyFile(file: File) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const hash = await sha256Hex(bytes)
    setVerifyHash(hash)
    const record = lab.state.verifyRegistry.lookup(hash)
    if (record) {
      setVerifyOutcome(
        `match — unchanged ${record.title} (${record.signerCount} signers, completed)`,
      )
      return
    }
    if (envelope?.lastKnownGoodHash && hash !== envelope.lastKnownGoodHash) {
      setVerifyOutcome("modified — hash does not match the last sealed export from this lab session")
      return
    }
    setVerifyOutcome("unknown — no record for this hash in the local lab registry")
  }

  function renderCompose() {
    if (!envelope) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Load a document</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button type="button" onClick={() => void lab.loadSample()}>
              Load bundled sample PDF
            </Button>
            <div>
              <Label htmlFor="pdf-upload">Or upload a PDF</Label>
              <Input
                id="pdf-upload"
                type="file"
                accept="application/pdf,.pdf"
                className="mt-1"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    void lab.loadUpload(file)
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{envelope.title}</Badge>
            <Badge>{envelope.status}</Badge>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev page
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} / {envelope.pages.length}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page >= envelope.pages.length}
              onClick={() => setPage((p) => p + 1)}
            >
              Next page
            </Button>
          </div>
          <PdfPageViewer
            pdfBytes={envelope.pdfBytes}
            page={page}
            fields={envelope.fields}
            selectedSignerId={selectedSignerId}
            placeMode={placeMode}
            onPlaceField={lab.placeField}
          />
        </div>
        <aside className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Signers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={twoSigners}
                  onChange={(e) => setTwoSigners(e.target.checked)}
                />
                Two-signer flow
              </label>
              <Input
                aria-label="Signer one name"
                value={signerOne.name}
                onChange={(e) => setSignerOne((s) => ({ ...s, name: e.target.value }))}
                placeholder="Signer 1 name"
              />
              <Input
                aria-label="Signer one email"
                value={signerOne.email}
                onChange={(e) => setSignerOne((s) => ({ ...s, email: e.target.value }))}
                placeholder="Signer 1 email"
              />
              {twoSigners ? (
                <>
                  <Input
                    aria-label="Signer two name"
                    value={signerTwo.name}
                    onChange={(e) => setSignerTwo((s) => ({ ...s, name: e.target.value }))}
                    placeholder="Signer 2 name"
                  />
                  <Input
                    aria-label="Signer two email"
                    value={signerTwo.email}
                    onChange={(e) => setSignerTwo((s) => ({ ...s, email: e.target.value }))}
                    placeholder="Signer 2 email"
                  />
                </>
              ) : null}
              <Button
                type="button"
                className="w-full"
                onClick={() =>
                  lab.setSigners(twoSigners ? [signerOne, signerTwo] : [signerOne])
                }
              >
                Save signers
              </Button>
              {signerOptions.map((s) => (
                <Button
                  key={s.id}
                  type="button"
                  size="sm"
                  variant={selectedSignerId === s.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedSignerId(s.id)}
                >
                  #{s.order + 1} {s.name}
                </Button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Place fields</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1">
              {labFieldTypes.map((type) => (
                <Button
                  key={type}
                  type="button"
                  size="sm"
                  variant={placeMode === type ? "default" : "outline"}
                  onClick={() => setPlaceMode(type)}
                >
                  {type}
                </Button>
              ))}
            </CardContent>
          </Card>
          <Button
            type="button"
            className="w-full"
            onClick={() =>
              lab.send(twoSigners ? [signerOne, signerTwo] : [signerOne])
            }
          >
            <Send className="size-3.5" />
            Send for signature
          </Button>
          {lab.sealing ? (
            <p className="text-xs text-muted-foreground">Sealing PDF and audit certificate…</p>
          ) : null}
          {envelope.status === "completed" && envelope.signedPdfBytes ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() =>
                void downloadSignedPdf(envelope.signedPdfBytes!, envelope.title)
              }
            >
              <FileCheck2 className="size-3.5" />
              Download sealed PDF
            </Button>
          ) : envelope.status === "completed" && !lab.sealing ? (
            <p className="text-xs text-destructive">
              Sealed PDF is not ready yet — place at least one completed signature field and
              finish signing again on a fresh envelope.
            </p>
          ) : null}
        </aside>
      </div>
    )
  }

  function renderSigning() {
    if (!envelope || !lab.activeSigner) {
      return (
        <p className="text-sm text-muted-foreground">
          Open a signing link from the outbox to fill fields for the active signer.
        </p>
      )
    }

    const assigned = fieldsForSigner(envelope, lab.activeSigner.id)

    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <PdfPageViewer
          pdfBytes={envelope.pdfBytes}
          page={page}
          fields={envelope.fields}
          selectedSignerId={lab.activeSigner.id}
          placeMode={null}
          readOnly
          highlightSignerId={lab.activeSigner.id}
        />
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Signing as {lab.activeSigner.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {assigned.length === 0 ? (
                <p className="text-muted-foreground">No fields assigned to this signer.</p>
              ) : (
                assigned.map((field) => (
                  <div key={field.id} className="space-y-2 rounded border p-2">
                    <p className="font-medium capitalize">{field.type}</p>
                    {field.type === "date" ? (
                      <Input
                        type="date"
                        aria-label="Date field"
                        onChange={(e) => {
                          const next = new Map(fieldDrafts)
                          next.set(field.id, {
                            ...field,
                            value: e.target.value,
                            inputMethod: "typed",
                          })
                          setFieldDrafts(next)
                        }}
                      />
                    ) : null}
                    {field.type === "text" || field.type === "name" ? (
                      <Input
                        aria-label={`${field.type} field`}
                        defaultValue={field.type === "name" ? lab.activeSigner!.name : ""}
                        onChange={(e) => {
                          const next = new Map(fieldDrafts)
                          next.set(field.id, {
                            ...field,
                            value: e.target.value,
                            inputMethod: "typed",
                          })
                          setFieldDrafts(next)
                        }}
                      />
                    ) : null}
                    {field.type === "signature" || field.type === "initials" ? (
                      <SignaturePad
                        label={field.type}
                        onApply={(value) => {
                          const next = new Map(fieldDrafts)
                          next.set(field.id, { ...field, ...value })
                          setFieldDrafts(next)
                        }}
                      />
                    ) : null}
                  </div>
                ))
              )}
              <Button
                type="button"
                className="w-full"
                onClick={() => void lab.submitSigner(fieldDrafts)}
              >
                <Stamp className="size-3.5" />
                Finish signing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "compose", label: "Compose" },
    { id: "outbox", label: "Outbox" },
    { id: "sign", label: "Sign" },
    { id: "audit", label: "Audit" },
    { id: "verify", label: "Verify" },
    { id: "about", label: "About" },
  ]

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-3 p-3 md:p-4">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Shield className="size-5 text-primary" aria-hidden />
          <h1 className="text-lg font-semibold tracking-tight">SignuDoc Seal Lab</h1>
          <Badge variant="outline">offline · MIT SignuDoc @ 23add989</Badge>
        </div>
        <p className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {LEGAL_BANNER}
        </p>
      </header>

      <nav className="flex flex-wrap gap-1" aria-label="Lab sections">
        {tabs.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={tab === item.id ? "default" : "outline"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </nav>

      <main className="flex-1 pb-8">
        {tab === "compose" ? renderCompose() : null}
        {tab === "outbox" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Mock signing links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {lab.outbox.length === 0 ? (
                <p className="text-muted-foreground">Send an envelope to populate the outbox.</p>
              ) : (
                lab.outbox.map((link) => (
                  <div
                    key={link.token}
                    className="flex flex-wrap items-center justify-between gap-2 rounded border p-2"
                  >
                    <span>
                      {link.signerName} — token …{link.token.slice(-8)}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        lab.openSigningLink(link.token)
                        setTab("sign")
                      }}
                    >
                      Open signing view
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}
        {tab === "sign" ? renderSigning() : null}
        {tab === "audit" ? (
          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Hash-chained audit trail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {lab.chain ? (
                  <p
                    className={
                      lab.chain.ok
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-destructive"
                    }
                  >
                    {lab.chain.ok
                      ? `Intact (${lab.chain.chainedEvents} chained events)`
                      : `BROKEN at sequence ${lab.chain.brokenAtSequence}`}
                  </p>
                ) : null}
                <div className="max-h-64 overflow-auto rounded border">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2">seq</th>
                        <th className="p-2">event</th>
                        <th className="p-2">actor</th>
                        <th className="p-2">row_hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(lab.state.tamperedAudit ?? envelope?.audit ?? [])
                        .filter((r) => r.sequence != null)
                        .map((row) => (
                          <tr key={row.id} className="border-b align-top">
                            <td className="p-2">{row.sequence}</td>
                            <td className="p-2">{row.event}</td>
                            <td className="p-2">{row.actorType}</td>
                            <td className="p-2 font-mono text-[10px]">
                              {row.rowHash?.slice(0, 18)}…
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={!envelope?.audit.some((r) => r.sequence === 2)}
                    onClick={() => lab.tamper(2, "edit")}
                  >
                    Tamper row 2
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={!envelope?.audit.some((r) => r.sequence === 2)}
                    onClick={() => lab.tamper(2, "delete")}
                  >
                    Delete row 2
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={lab.resetTamper}>
                    Reset tamper demo
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">How production SignuDoc seals PDFs</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                SignuDoc&apos;s <code className="text-xs">pdf-seal.ts</code> applies a PAdES
                baseline CMS signature over the finished PDF using <code>@signpdf/*</code> and an
                install key — readers can detect post-seal tampering. This lab only flattens field
                values and appends a readable audit certificate page; it does not run PAdES or
                qualified signatures.
              </CardContent>
            </Card>
          </div>
        ) : null}
        {tab === "verify" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Verify (local registry)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Label htmlFor="verify-pdf">Drop a sealed PDF back in</Label>
              <Input
                id="verify-pdf"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    void handleVerifyFile(file)
                  }
                }}
              />
              {verifyHash ? (
                <p className="font-mono text-xs break-all">SHA-256: {verifyHash}</p>
              ) : null}
              {verifyOutcome ? (
                <p className="rounded-md border bg-muted/40 px-3 py-2">{verifyOutcome}</p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
        {tab === "about" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Credits & license</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Independent demo built on{" "}
                <a
                  className="text-primary underline"
                  href="https://github.com/NYLLON-SOFTWARE/SignuDoc"
                  rel="noreferrer"
                  target="_blank"
                >
                  SignuDoc
                </a>{" "}
                (MIT, Nyllon Software) pinned at commit{" "}
                <code className="text-xs">23add9893ac0a9747f3aeba5d112d89581c8abea</code>.
              </p>
              <p>
                Launch reference:{" "}
                <a
                  className="text-primary underline"
                  href="https://x.com/kevinrose/status/2122394902168473975"
                  rel="noreferrer"
                  target="_blank"
                >
                  @kevinrose post
                </a>
                .
              </p>
              <Separator />
              <p>Copyright (c) 2026 Nyllon Software — MIT License (see THIRD_PARTY_LICENSES).</p>
              <p>{LEGAL_BANNER}</p>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  )
}