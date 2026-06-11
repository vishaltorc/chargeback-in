'use client'

import Link from 'next/link'
import { Card, PageHeader } from '@/components/ui'
import { useCaseState } from '@/hooks/use-case'
import { buildDeficiencyLog } from '@/lib/mapping'
import { DISPUTE_TYPE_LABELS } from '@/lib/case'
import { MAX_AGGREGATE_MB, MAX_ATTACHMENTS } from '@/config/knowledge/cms-form'

export default function DossierPage() {
  const { c } = useCaseState()
  if (!c) return null
  const deficiencies = buildDeficiencyLog(c.events)
  const grounds = c.grounds

  return (
    <div className="space-y-5">
      <div className="print:hidden">
        <PageHeader
          title="Your dossier"
          sub="A complaint summary the Ombudsman's office can read in two minutes. Print this page to PDF (Cmd/Ctrl+P → Save as PDF) — it becomes your complaint-summary attachment. Keep each PDF small; the portal caps uploads."
        />
        <Card tone="warn">
          <p className="text-sm">
            CMS upload limits: max {MAX_ATTACHMENTS} additional files, {MAX_AGGREGATE_MB} MB aggregate. Compress
            statement screenshots before building evidence PDFs.
          </p>
        </Card>
        <div className="mt-3 flex gap-2">
          <button type="button" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable summary */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 print:border-0 print:p-0">
        <h1 className="text-lg font-bold">Complaint Summary</h1>
        <p className="text-sm text-zinc-600">Prepared by the complainant{c.complainant.name ? `: ${c.complainant.name}` : ''}</p>

        <h2 className="mt-4 font-semibold">The dispute</h2>
        <table className="mt-1 w-full text-sm">
          <tbody>
            {(
              [
                ['Nature', c.disputeType ? DISPUTE_TYPE_LABELS[c.disputeType] : '—'],
                ['Amount', c.facts.amount ? `Rs ${c.facts.amount}` : '—'],
                ['Merchant', c.facts.merchant ?? '—'],
                ['Transaction date', c.facts.transactionDate ?? '—'],
                ['Instrument', `${c.facts.network && c.facts.network !== 'unknown' ? c.facts.network + ' ' : ''}${c.facts.channel}${c.facts.cardLast4 ? ` ending ${c.facts.cardLast4}` : ''}`],
                ['Mandate / SI reference', c.facts.mandateId ?? '—'],
                ['Bank', c.re.name ?? '—'],
                ['First complaint to bank', c.re.complaintDate ?? '—'],
                ['Bank reference number(s)', c.re.caseRefs.join(', ') || '—'],
                ["Bank's reply", c.re.replyDate ? `${c.re.replyDate} (${c.re.replyKind ?? ''})` : 'None received'],
              ] as const
            ).map(([k, v]) => (
              <tr key={k} className="border-t border-zinc-100">
                <td className="py-1 pr-3 font-medium text-zinc-600">{k}</td>
                <td className="py-1">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {c.facts.summary && (
          <>
            <h2 className="mt-4 font-semibold">In the complainant&apos;s words</h2>
            <p className="text-sm">{c.facts.summary}</p>
          </>
        )}

        {grounds && (
          <>
            <h2 className="mt-4 font-semibold">Grounds</h2>
            <ul className="list-disc pl-5 text-sm">
              {[...grounds.network, ...grounds.rbi].map((g) => (
                <li key={g.id}>
                  {g.status === 'UNVERIFIED' ? g.detail : `${g.label} — ${g.citation}`}
                </li>
              ))}
            </ul>
          </>
        )}

        {c.events.length > 0 && (
          <>
            <h2 className="mt-4 font-semibold">Correspondence timeline</h2>
            <table className="mt-1 w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-600">
                  <th className="py-1 pr-3 font-medium">Date</th>
                  <th className="py-1 pr-3 font-medium">Event</th>
                  <th className="py-1 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {c.events.map((e) => (
                  <tr key={e.id} className="border-t border-zinc-100 align-top">
                    <td className="py-1 pr-3 font-mono text-xs">{e.date}</td>
                    <td className="py-1 pr-3">{e.note}</td>
                    <td className="py-1">{e.ref ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {deficiencies.length > 0 && (
          <>
            <h2 className="mt-4 font-semibold">Deficiencies in service (independent of the disputed charge)</h2>
            <table className="mt-1 w-full text-sm">
              <tbody>
                {deficiencies.map((d, i) => (
                  <tr key={i} className="border-t border-zinc-100 align-top">
                    <td className="py-1 pr-3 font-mono text-xs">{d.date}</td>
                    <td className="py-1">
                      <strong>{d.label}.</strong> {d.note} <span className="text-zinc-500">({d.whyItMatters})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <h2 className="mt-4 font-semibold">Relief sought</h2>
        <p className="text-sm">
          Reversal of the disputed amount of Rs {c.facts.amount ?? '—'} with applicable interest and reversal of
          consequential fees, and compensation for the deficiency in service set out above.
        </p>

        <p className="mt-6 border-t border-zinc-200 pt-2 text-xs text-zinc-500 print:block">
          Prepared with ChargeBack.in, an organisational tool. This document presents the complainant&apos;s own facts
          and is not legal advice; no outcome is implied.
        </p>
      </div>

      <div className="flex justify-between print:hidden">
        <Link href="/drafts" className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-100">
          ← Drafts
        </Link>
        <Link href="/filing" className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700">
          Continue → RBI Filing
        </Link>
      </div>
    </div>
  )
}
