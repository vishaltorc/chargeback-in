// Maintainability gates (PRD §7.2). Every gate must pass before the app will
// produce a filing sheet. A failed gate explains itself and redirects — the
// product must never let a user file a complaint that will bounce.

import { Case } from './case'
import { schemeFor } from '@/config/knowledge/schemes'
import { computeOmbudsmanWindowEnd } from './deadlines'

export interface GateResult {
  gate: string
  label: string
  pass: boolean
  why: string
  fixPath?: string // what to do first, when failing
}

const fmt = (d: Date) => d.toISOString().slice(0, 10)

export function checkMaintainability(c: Case, today: Date): GateResult[] {
  const scheme = schemeFor(today)
  const results: GateResult[] = []

  // Gate 1 — RE-first written complaint
  if (!c.re.complaintDate) {
    results.push({
      gate: 're_first',
      label: 'Complained to your bank first, in writing',
      pass: false,
      why: 'The Ombudsman only takes complaints the bank has already had a chance to resolve. No written complaint to the bank is recorded yet.',
      fixPath:
        'File the written complaint with your bank first (the Drafts step generates it), save the date and reference number here, then come back.',
    })
  } else {
    results.push({
      gate: 're_first',
      label: 'Complained to your bank first, in writing',
      pass: true,
      why: `Written complaint to ${c.re.name ?? 'the bank'} recorded on ${c.re.complaintDate}.`,
    })
  }

  // Gate 2 — escalation trigger: 30 days passed, or rejected/partly/unsatisfactory
  if (c.re.complaintDate) {
    const waitDays = scheme.reFirstWaitDays.value
    const due = new Date(c.re.complaintDate + 'T00:00:00Z')
    due.setUTCDate(due.getUTCDate() + waitDays)
    const replyTriggers = ['rejected', 'partly_rejected', 'unsatisfactory'] as const
    const replyTriggered =
      c.re.replyKind !== undefined &&
      (replyTriggers as readonly string[]).includes(c.re.replyKind)
    if (c.re.replyKind === 'resolved') {
      results.push({
        gate: 'trigger',
        label: 'Bank failed to resolve it',
        pass: false,
        why: 'You marked the bank’s reply as having resolved the complaint. A resolved complaint is not maintainable before the Ombudsman.',
        fixPath:
          'If the resolution was actually inadequate (wrong amount, conditions attached), change the reply status to "unsatisfactory" and describe why.',
      })
    } else if (replyTriggered || today >= due) {
      results.push({
        gate: 'trigger',
        label: 'Bank failed to resolve it',
        pass: true,
        why: replyTriggered
          ? `The bank's reply (${c.re.replyDate ?? 'date not recorded'}) ${c.re.replyKind === 'unsatisfactory' ? 'did not satisfactorily resolve the complaint' : 'rejected the complaint in whole or part'}.`
          : `${waitDays} days have passed since your complaint (${c.re.complaintDate}) with no resolution.`,
      })
    } else {
      results.push({
        gate: 'trigger',
        label: 'Bank failed to resolve it',
        pass: false,
        why: `The bank has until ${fmt(due)} (${waitDays} days from your complaint) to respond. Filing before that makes the complaint non-maintainable.`,
        fixPath: `Wait until ${fmt(due)} unless the bank rejects it in writing first. Use the waiting time to log correspondence and build the dossier; the tracker will flag the date.`,
      })
    }
  }

  // Gate 3 — filing window not expired
  if (c.re.complaintDate) {
    const windowEnd = computeOmbudsmanWindowEnd(c, today)
    if (windowEnd && today > windowEnd) {
      results.push({
        gate: 'window',
        label: 'Within the filing window',
        pass: false,
        why: `The window to approach the Ombudsman closed on ${fmt(windowEnd)} under the ${scheme.name}. A late complaint is non-maintainable.`,
        fixPath:
          'The Ombudsman route has lapsed for this complaint. Other forums (e.g. consumer commission) have their own rules and time limits — this tool does not cover them.',
      })
    } else {
      results.push({
        gate: 'window',
        label: 'Within the filing window',
        pass: true,
        why: windowEnd
          ? `Window open until ${fmt(windowEnd)} (${scheme.name}${scheme.filingWindow.status === 'UNVERIFIED' ? ' — window parameters pending primary-source verification; re-check before relying' : ''}).`
          : 'Window will be computed once reply/deadline dates are known.',
      })
    }
  }

  // Gates 4-7 — CMS eligibility questions (must be answered, and answered "No")
  const eligibilityGates: Array<{
    gate: string
    label: string
    value: boolean | undefined
    whyFail: string
    fix: string
  }> = [
    {
      gate: 'sub_judice',
      label: 'Not in court / arbitration / decided elsewhere',
      value: c.eligibility.subJudice,
      whyFail:
        'A complaint on the same matter pending or decided in a court, tribunal, arbitration or another forum is non-maintainable.',
      fix: 'If proceedings exist elsewhere on this dispute, the Ombudsman route is closed for it.',
    },
    {
      gate: 'advocate',
      label: 'Not filed through an advocate',
      value: c.eligibility.throughAdvocate,
      whyFail:
        'Complaints lodged through an advocate are non-maintainable (unless the advocate is the aggrieved person).',
      fix: 'File it yourself — this tool exists precisely so you can.',
    },
    {
      gate: 'already_with_ombudsman',
      label: 'Not already with an Ombudsman',
      value: c.eligibility.alreadyWithOmbudsman,
      whyFail: 'The same complaint pending or decided by an Ombudsman cannot be re-filed.',
      fix: 'If you already filed, track that complaint; do not file a duplicate.',
    },
    {
      gate: 'staff_grievance',
      label: 'Not an employment grievance',
      value: c.eligibility.staffGrievance,
      whyFail: 'Staff / employer-employee matters are outside the scheme.',
      fix: 'Use the employment grievance channels instead.',
    },
  ]

  for (const g of eligibilityGates) {
    if (g.value === undefined) {
      results.push({
        gate: g.gate,
        label: g.label,
        pass: false,
        why: 'Not answered yet. The CMS form asks this directly; answer it truthfully here first.',
        fixPath: 'Answer the eligibility questions on this page.',
      })
    } else if (g.value === true) {
      results.push({ gate: g.gate, label: g.label, pass: false, why: g.whyFail, fixPath: g.fix })
    } else {
      results.push({ gate: g.gate, label: g.label, pass: true, why: 'Confirmed.' })
    }
  }

  return results
}

export function allGatesPass(results: GateResult[]): boolean {
  return results.every((r) => r.pass)
}
