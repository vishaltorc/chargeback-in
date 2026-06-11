'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CopyButton, Disclaimer, PageHeader, inputCls } from '@/components/ui'
import { useCaseState } from '@/hooks/use-case'
import { DOC_KIND_LABELS, DocKind, buildDraftPayload, fallbackSkeleton } from '@/lib/draft-prompts'

const ORDER: DocKind[] = ['re_complaint', 'reminder', 'gro_escalation', 'pno_escalation']

const WHEN: Record<DocKind, string> = {
  re_complaint: 'Send this first. The Ombudsman route only opens after the bank has had its chance.',
  reminder: 'No reply and the response window is running out? A dated reminder strengthens the record.',
  gro_escalation: "Bank's first level failed — escalate to its Grievance Redressal Officer with your reference numbers.",
  pno_escalation: 'Last internal step: the Principal Nodal Officer. After this (or 30 days of silence), the RBI route opens.',
}

export default function DraftsPage() {
  const { c, update } = useCaseState()
  const [busy, setBusy] = useState<DocKind | null>(null)
  const [error, setError] = useState<string | null>(null)
  if (!c) return null

  const groundsSaved = !!c.grounds

  async function aiDraft(kind: DocKind) {
    if (!c) return
    setBusy(kind)
    setError(null)
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(buildDraftPayload(c, kind)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Drafting failed')
      update((d) => void (d.drafts[kind] = data.draft))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Drafting failed — use the template instead.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bank complaint drafts"
        sub="Factual, regulation-anchored, non-abusive. The AI only words what your saved grounds and facts say — it cannot invent anything. You review, you edit, you send from your own email."
      />

      {!groundsSaved && (
        <Card tone="warn">
          <p className="text-sm">
            Save your grounds first (
            <Link href="/grounds" className="underline">
              Grounds page
            </Link>
            ) — drafts cite them.
          </p>
        </Card>
      )}

      {error && (
        <Card tone="danger">
          <p className="text-sm">{error}</p>
        </Card>
      )}

      {ORDER.map((kind) => (
        <Card key={kind} title={DOC_KIND_LABELS[kind]}>
          <p className="mb-2 text-sm text-zinc-600">{WHEN[kind]}</p>
          <div className="mb-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              disabled={busy !== null || !groundsSaved}
              onClick={() => aiDraft(kind)}
            >
              {busy === kind ? 'Drafting…' : 'Draft with AI'}
            </button>
            <button
              type="button"
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 disabled:opacity-40"
              disabled={!groundsSaved}
              onClick={() => update((d) => void (d.drafts[kind] = fallbackSkeleton(buildDraftPayload(d, kind))))}
            >
              Use fill-in template
            </button>
            {c.drafts[kind] && <CopyButton text={c.drafts[kind]!} label="Copy draft" />}
          </div>
          <textarea
            className={`${inputCls} font-mono text-xs`}
            rows={c.drafts[kind] ? 14 : 3}
            placeholder="Your draft will appear here — fully editable."
            value={c.drafts[kind] ?? ''}
            onChange={(e) => update((d) => void (d.drafts[kind] = e.target.value))}
          />
        </Card>
      ))}

      <Disclaimer />

      <div className="flex justify-between">
        <Link href="/grounds" className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-100">
          ← Grounds
        </Link>
        <Link href="/dossier" className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700">
          Continue → Dossier
        </Link>
      </div>
    </div>
  )
}
