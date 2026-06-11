'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, Field, PageHeader, StatusBadge, inputCls } from '@/components/ui'
import { useCaseState } from '@/hooks/use-case'
import { buildDeficiencyLog, mapGrounds } from '@/lib/mapping'
import { DEFICIENCY_DESCRIPTIONS } from '@/config/knowledge/deficiencies'
import { CorrespondenceKind, GroundCitation } from '@/lib/case'

function GroundRow({ g }: { g: GroundCitation }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-sm">{g.label}</p>
        <StatusBadge status={g.status} />
      </div>
      <p className="mt-1 text-sm text-zinc-600">{g.detail}</p>
      <p className="mt-1 text-xs text-zinc-500">
        {g.citation} ·{' '}
        <a className="underline" href={g.sourceUrl} target="_blank" rel="noopener noreferrer">
          source
        </a>{' '}
        · as of {g.asOf}
      </p>
    </div>
  )
}

const EVENT_KINDS: CorrespondenceKind[] = [
  'complaint_filed',
  'bank_reply',
  'reminder_sent',
  'false_closure',
  'inconsistent_refs',
  'silent_extension',
  'contradicts_own_records',
  'merchant_representment_incomplete',
  'burden_shift',
  'block_card_precondition',
]

const KIND_LABELS: Record<CorrespondenceKind, string> = {
  complaint_filed: 'I filed a complaint',
  bank_reply: 'Bank replied (ordinary)',
  reminder_sent: 'I sent a reminder',
  false_closure: 'Bank closed it on a wrong basis',
  inconsistent_refs: 'Bank used inconsistent reference numbers',
  silent_extension: 'Bank silently extended its own deadline',
  contradicts_own_records: "Reply contradicts the bank's own records",
  merchant_representment_incomplete: 'Bank accepted incomplete merchant evidence',
  burden_shift: 'Bank shifted its burden onto me',
  block_card_precondition: 'Bank demanded a card block first',
}

export default function GroundsPage() {
  const { c, update } = useCaseState()
  const [ev, setEv] = useState({ date: '', kind: 'bank_reply' as CorrespondenceKind, note: '', ref: '' })
  if (!c) return null

  const grounds = mapGrounds(c)
  const deficiencies = buildDeficiencyLog(c.events)
  const saved = JSON.stringify(c.grounds) === JSON.stringify(grounds)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Your legal grounds"
        sub="Mapped deterministically from your dispute type — two independent pillars wherever they exist: a card-network dispute category AND an RBI rule. Every entry is dated and linked to its official source."
      />

      {grounds.network.length > 0 && (
        <Card title="Pillar 1 — card-network dispute category">
          <div className="space-y-2">{grounds.network.map((g) => <GroundRow key={g.id} g={g} />)}</div>
        </Card>
      )}
      <Card title={grounds.network.length ? 'Pillar 2 — RBI rules' : 'RBI rules (your complaint rests on these)'}>
        <div className="space-y-2">{grounds.rbi.map((g) => <GroundRow key={g.id} g={g} />)}</div>
      </Card>

      {grounds.notes.length > 0 && (
        <Card title="Read this" tone="warn">
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
            {grounds.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Correspondence log → deficiency-in-service record">
        <p className="mb-3 text-sm text-zinc-600">
          Log what the bank does as it happens. Stalls and contradictions become an independent &quot;deficiency in
          service&quot; record that strengthens the Ombudsman complaint beyond the charge itself.
        </p>
        <div className="grid gap-2 sm:grid-cols-4">
          <input type="date" className={inputCls} value={ev.date} onChange={(e) => setEv({ ...ev, date: e.target.value })} />
          <select className={inputCls} value={ev.kind} onChange={(e) => setEv({ ...ev, kind: e.target.value as CorrespondenceKind })}>
            {EVENT_KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </select>
          <input className={inputCls} placeholder="One factual line" value={ev.note} onChange={(e) => setEv({ ...ev, note: e.target.value })} />
          <div className="flex gap-2">
            <input className={inputCls} placeholder="Bank ref (optional)" value={ev.ref} onChange={(e) => setEv({ ...ev, ref: e.target.value })} />
            <button
              type="button"
              className="shrink-0 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white disabled:opacity-40"
              disabled={!ev.date || !ev.note}
              onClick={() => {
                update((d) => {
                  d.events.push({ id: `ev-${Date.now()}`, date: ev.date, kind: ev.kind, note: ev.note, ref: ev.ref || undefined })
                  d.events.sort((a, b) => a.date.localeCompare(b.date))
                })
                setEv({ date: '', kind: 'bank_reply', note: '', ref: '' })
              }}
            >
              Add
            </button>
          </div>
        </div>

        {c.events.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {c.events.map((e) => {
              const isDeficiency = e.kind in DEFICIENCY_DESCRIPTIONS
              return (
                <li key={e.id} className={`flex items-start justify-between gap-2 rounded-md border p-2 text-sm ${isDeficiency ? 'border-amber-300 bg-amber-50' : 'border-zinc-200 bg-white'}`}>
                  <span>
                    <span className="font-mono text-xs text-zinc-500">{e.date}</span> · <strong>{KIND_LABELS[e.kind]}</strong> — {e.note}
                    {e.ref && <span className="text-zinc-500"> (ref {e.ref})</span>}
                    {isDeficiency && <span className="ml-1 rounded bg-amber-200 px-1 text-[10px] font-semibold uppercase">deficiency</span>}
                  </span>
                  <button type="button" className="text-xs text-zinc-400 hover:text-red-600" onClick={() => update((d) => void (d.events = d.events.filter((x) => x.id !== e.id)))}>
                    remove
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {deficiencies.length > 0 && (
          <p className="mt-3 text-sm text-zinc-700">
            <strong>{deficiencies.length}</strong> deficiency record{deficiencies.length > 1 ? 's' : ''} will be cited in your drafts and filing.
          </p>
        )}
      </Card>

      <div className="flex justify-between">
        <button
          type="button"
          className={`rounded-md px-4 py-2.5 text-sm font-semibold ${saved ? 'border border-emerald-300 bg-emerald-50 text-emerald-800' : 'bg-zinc-900 text-white hover:bg-zinc-700'}`}
          onClick={() => update((d) => void (d.grounds = grounds))}
        >
          {saved ? 'Grounds saved to case ✓' : 'Save grounds to my case'}
        </button>
        <Link href="/drafts" className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700">
          Continue → Drafts
        </Link>
      </div>
    </div>
  )
}
