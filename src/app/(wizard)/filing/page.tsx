'use client'

import Link from 'next/link'
import { Card, CopyButton, Disclaimer, PageHeader, inputCls } from '@/components/ui'
import { useCaseState } from '@/hooks/use-case'
import { allGatesPass, checkMaintainability } from '@/lib/gates'
import { buildFilingSheet } from '@/lib/filing-sheet'
import { schemeFor } from '@/config/knowledge/schemes'
import { FACTS_MAX_LEN } from '@/config/knowledge/cms-form'

export default function FilingPage() {
  const { c, update } = useCaseState()
  if (!c) return null

  const today = new Date()
  const gates = checkMaintainability(c, today)
  const eligible = allGatesPass(gates)
  const scheme = schemeFor(today)

  if (!eligible) {
    return (
      <div className="space-y-5">
        <PageHeader title="RBI filing — locked" sub="Filing now would produce a non-maintainable complaint. Here's exactly what's missing:" />
        {gates
          .filter((g) => !g.pass)
          .map((g) => (
            <Card key={g.gate} tone="danger">
              <p className="font-semibold">{g.label}</p>
              <p className="mt-0.5 text-sm">{g.why}</p>
              {g.fixPath && <p className="mt-1 text-sm font-medium">What to do: {g.fixPath}</p>}
            </Card>
          ))}
        <Link href="/gates" className="inline-block rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white">
          ← Back to the eligibility check
        </Link>
      </div>
    )
  }

  const sheet = buildFilingSheet(c)
  const sections = [...new Set(sheet.rows.map((r) => r.section))]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Your RBI CMS filing sheet"
        sub={`Open ${scheme.portalUrl.value} in another tab and transcribe field by field. Every value below is pre-checked and the Facts text is pre-sanitised for the portal's input rules. Print this page if you prefer paper.`}
      />

      <Card title={`Scheme in force: ${scheme.name}`}>
        <ul className="space-y-1 text-sm text-zinc-700">
          <li>Portal: <a className="underline" href={scheme.portalUrl.value} target="_blank" rel="noopener noreferrer">{scheme.portalUrl.value}</a> · Helpline {scheme.helpline.value}</li>
          <li>Physical/email: {scheme.crpcAddress.value}</li>
          <li>Compensation powers: {scheme.compensationFinancialLossMax.value}; plus {scheme.compensationHarassmentMax.value}.</li>
          <li className="text-xs text-zinc-500">Values verified against the scheme text, as of {scheme.filingWindow.asOf}.</li>
        </ul>
      </Card>

      <Card title="Portal traps (observed in a real filing — handled for you)" tone="warn">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {sheet.traps.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-zinc-500">Observed behaviour as of {sheet.asOf}; the portal can change without notice.</p>
      </Card>

      {sections.map((s) => (
        <Card key={s} title={s}>
          <table className="w-full text-sm">
            <tbody>
              {sheet.rows
                .filter((r) => r.section === s)
                .map((r) => (
                  <tr key={r.field} className="border-t border-zinc-100 align-top">
                    <td className="w-2/5 py-1.5 pr-3 font-medium text-zinc-700">{r.field}</td>
                    <td className="py-1.5">
                      <span className={r.value === 'ANSWER REQUIRED' ? 'font-semibold text-red-700' : ''}>{r.value || '—'}</span>
                      {r.note && <p className="text-xs text-zinc-500">{r.note}</p>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      ))}

      <Card title={`Facts of the complaint — sanitised, ${sheet.facts.text.length}/${FACTS_MAX_LEN} characters`} tone={sheet.facts.truncated ? 'warn' : 'default'}>
        {sheet.facts.truncated && (
          <p className="mb-2 text-sm text-amber-800">
            Your full narrative exceeded the portal limit; lower-priority detail was dropped. The complete story is in
            your attached dossier PDF — which is exactly what the attachments are for.
          </p>
        )}
        <pre className="whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs">{sheet.facts.text}</pre>
        <div className="mt-2">
          <CopyButton text={sheet.facts.text} label="Copy sanitised Facts" />
        </div>
      </Card>

      <Card title="Upload map">
        <table className="w-full text-sm">
          <tbody>
            {sheet.uploadMap.map((u) => (
              <tr key={u.slot} className="border-t border-zinc-100 align-top">
                <td className="w-2/5 py-1.5 pr-3 font-medium text-zinc-700">{u.slot}</td>
                <td className="py-1.5">{u.document}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="After you file">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-zinc-700">CMS complaint number</span>
            <input className={`${inputCls} mt-1`} value={c.filing.cmsComplaintNo ?? ''} onChange={(e) => update((d) => void (d.filing.cmsComplaintNo = e.target.value))} />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Date filed</span>
            <input type="date" className={`${inputCls} mt-1`} value={c.filing.filedAt ?? ''} onChange={(e) => update((d) => { d.filing.filedAt = e.target.value || undefined; d.filing.status = e.target.value ? 'filed' : 'draft' })} />
          </label>
        </div>
        <p className="mt-2 text-xs text-zinc-500">Saving these starts the post-filing tracking on the Deadlines page.</p>
      </Card>

      <Disclaimer />

      <div className="flex justify-between">
        <Link href="/dossier" className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-100">
          ← Dossier
        </Link>
        <Link href="/tracker" className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700">
          Continue → Deadlines
        </Link>
      </div>
    </div>
  )
}
