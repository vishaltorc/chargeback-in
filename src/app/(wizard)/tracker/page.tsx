'use client'

import Link from 'next/link'
import { Card, PageHeader, UrgencyBadge, inputCls } from '@/components/ui'
import { useCaseState } from '@/hooks/use-case'
import { computeDeadlines } from '@/lib/deadlines'
import { schemeFor } from '@/config/knowledge/schemes'

export default function TrackerPage() {
  const { c, update } = useCaseState()
  if (!c) return null
  const today = new Date()
  const items = computeDeadlines(c, today)
  const scheme = schemeFor(today)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Deadlines"
        sub="Two clocks decide these cases: the bank's response window, and the Ombudsman filing window that opens after it. Missing the second one kills the complaint — check this page (or your exported case) regularly."
      />

      {items.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-600">
            No live deadlines yet. Record the date of your first written complaint to the bank on the{' '}
            <Link href="/intake" className="underline">
              Intake page
            </Link>{' '}
            and the clocks start automatically.
          </p>
        </Card>
      ) : (
        items.map((i) => (
          <Card key={i.key} tone={i.urgency === 'critical' || i.urgency === 'expired' ? 'danger' : i.urgency === 'soon' ? 'warn' : 'default'}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{i.label}</p>
              <UrgencyBadge urgency={i.urgency} />
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">{i.date}</p>
            <p className="mt-1 text-sm text-zinc-600">{i.note}</p>
          </Card>
        ))
      )}

      {c.filing.filedAt && (
        <Card title="After the decision">
          <p className="mb-2 text-sm text-zinc-600">
            When the Ombudsman issues an Award or closes the complaint, record the date — the appeal window (
            {scheme.appealWindowDays.value} days, to the {scheme.appellateAuthority.value}) starts from it.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-zinc-700">Decision date</span>
              <input type="date" className={`${inputCls} mt-1`} value={c.filing.decisionDate ?? ''} onChange={(e) => update((d) => void (d.filing.decisionDate = e.target.value || undefined))} />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-zinc-700">Outcome</span>
              <select
                className={`${inputCls} mt-1`}
                value={c.filing.status ?? 'filed'}
                onChange={(e) => update((d) => void (d.filing.status = e.target.value as NonNullable<typeof c.filing.status>))}
              >
                <option value="filed">Filed / pending</option>
                <option value="resolved">Resolved / settled</option>
                <option value="award">Award issued</option>
                <option value="rejected">Rejected / closed</option>
              </select>
            </label>
          </div>
          {scheme.id === '2026' && c.filing.status === 'rejected' && (
            <p className="mt-3 rounded-md bg-amber-50 p-2 text-sm text-amber-900">
              Note: under the 2026 scheme, the complainant appeal lies only against an <em>Award</em> — the scheme text
              provides no appeal against a rejection/closure (unlike 2021). Verify against the scheme before planning
              an appeal.
            </p>
          )}
          {c.filing.status === 'award' && (
            <p className="mt-3 rounded-md bg-amber-50 p-2 text-sm text-amber-900">
              If you intend to appeal an Award, do <strong>not</strong> send the Award acceptance letter — acceptance
              and appeal are mutually exclusive (clause 15(4) proviso).
            </p>
          )}
        </Card>
      )}

      <Card title="The numbers behind these clocks">
        <ul className="space-y-1 text-sm text-zinc-700">
          <li>
            Bank response wait: <strong>{scheme.reFirstWaitDays.value} days</strong>{' '}
            <span className="text-xs text-zinc-500">({scheme.reFirstWaitDays.note})</span>
          </li>
          <li>
            Filing window: <strong>{scheme.filingWindow.value.description}</strong>
          </li>
          <li className="text-xs text-zinc-500">
            From {scheme.name}, verified {scheme.filingWindow.asOf} —{' '}
            <a className="underline" href={scheme.filingWindow.sourceUrl} target="_blank" rel="noopener noreferrer">
              official text
            </a>
            .
          </li>
        </ul>
      </Card>

      <div className="flex justify-between">
        <Link href="/filing" className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-100">
          ← Filing
        </Link>
        <Link href="/" className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-100">
          Home
        </Link>
      </div>
    </div>
  )
}
