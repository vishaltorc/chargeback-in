'use client'

import Link from 'next/link'
import { Card, Field, PageHeader, YesNo } from '@/components/ui'
import { useCaseState } from '@/hooks/use-case'
import { allGatesPass, checkMaintainability } from '@/lib/gates'

export default function GatesPage() {
  const { c, update } = useCaseState()
  if (!c) return null
  const results = checkMaintainability(c, new Date())
  const eligible = allGatesPass(results)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Will this complaint stick?"
        sub="Most rejected Ombudsman complaints fail on these gates, not on their merits. Answer the four questions, then read the verdicts — every red gate explains exactly what to do first."
      />

      <Card title="Four questions the RBI form asks (answer truthfully)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Is this matter in court, arbitration, or another forum — or already decided there?">
            <YesNo value={c.eligibility.subJudice} onChange={(v) => update((d) => void (d.eligibility.subJudice = v))} />
          </Field>
          <Field label="Are you filing through an advocate?">
            <YesNo value={c.eligibility.throughAdvocate} onChange={(v) => update((d) => void (d.eligibility.throughAdvocate = v))} />
          </Field>
          <Field label="Is the same complaint already with an Ombudsman?">
            <YesNo value={c.eligibility.alreadyWithOmbudsman} onChange={(v) => update((d) => void (d.eligibility.alreadyWithOmbudsman = v))} />
          </Field>
          <Field label="Is this an employee/employer grievance with the bank?">
            <YesNo value={c.eligibility.staffGrievance} onChange={(v) => update((d) => void (d.eligibility.staffGrievance = v))} />
          </Field>
        </div>
      </Card>

      <div className="space-y-2">
        {results.map((r) => (
          <Card key={r.gate} tone={r.pass ? 'ok' : 'danger'}>
            <div className="flex items-start gap-2">
              <span className="text-lg leading-6">{r.pass ? '✓' : '✗'}</span>
              <div>
                <p className="font-semibold">{r.label}</p>
                <p className="mt-0.5 text-sm text-zinc-700">{r.why}</p>
                {!r.pass && r.fixPath && <p className="mt-1 text-sm font-medium text-zinc-900">What to do: {r.fixPath}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card tone={eligible ? 'ok' : 'warn'}>
        {eligible ? (
          <p className="text-sm">
            <strong>All gates pass.</strong> The Ombudsman route is open for this complaint. Continue building the
            case — and watch the filing window on the Deadlines page.
          </p>
        ) : (
          <p className="text-sm">
            <strong>Not filing-ready yet — and that&apos;s normal.</strong> The bank stage (Grounds and Drafts) is
            usually the right next step; the RBI Filing page stays locked until every gate above is green, so you
            can&apos;t accidentally file a complaint that bounces.
          </p>
        )}
      </Card>

      <div className="flex justify-between">
        <Link href="/intake" className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-100">
          ← Intake
        </Link>
        <Link href="/grounds" className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700">
          Continue → Grounds
        </Link>
      </div>
    </div>
  )
}
