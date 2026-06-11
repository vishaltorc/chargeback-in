// Scheme-aware deadline math. The 90-day RB-IOS 2026 window is the single most
// important number in the product (missing it kills the complaint), so all
// window parameters come from the dated knowledge config, never inline.

import { Case } from './case'
import { schemeFor } from '@/config/knowledge/schemes'

export type Urgency = 'ok' | 'soon' | 'critical' | 'expired'

export interface DeadlineItem {
  key: 're_response' | 'ombudsman_window' | 'appeal_window'
  label: string
  date: string // YYYY-MM-DD
  urgency: Urgency
  note: string
}

const DAY = 24 * 60 * 60 * 1000

function parse(d: string): Date {
  return new Date(d + 'T00:00:00Z')
}
function fmt(d: Date): string {
  return d.toISOString().slice(0, 10)
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY)
}
function addYears(d: Date, n: number): Date {
  const out = new Date(d)
  out.setUTCFullYear(out.getUTCFullYear() + n)
  return out
}

export function urgencyFor(deadline: Date, today: Date): Urgency {
  const days = Math.floor((deadline.getTime() - today.getTime()) / DAY)
  if (days < 0) return 'expired'
  if (days <= 14) return 'critical'
  if (days <= 45) return 'soon'
  return 'ok'
}

export function computeReResponseDue(c: Case, today: Date): Date | null {
  if (!c.re.complaintDate) return null
  const scheme = schemeFor(today)
  return addDays(parse(c.re.complaintDate), scheme.reFirstWaitDays.value)
}

// Window to approach the Ombudsman.
// 2021 scheme: 1 year from RE reply; or 1 year + 30 days from the complaint if no reply.
// 2026 scheme (per config; flagged until verbatim-verified): N days from the later of
// the RE response-deadline expiry or the last communication from the RE.
export function computeOmbudsmanWindowEnd(c: Case, today: Date): Date | null {
  if (!c.re.complaintDate) return null
  const scheme = schemeFor(today)
  const win = scheme.filingWindow.value
  const reDue = computeReResponseDue(c, today)!
  const reply = c.re.replyDate ? parse(c.re.replyDate) : null

  if (win.years !== undefined) {
    // 2021-style window
    if (reply) return addYears(reply, win.years)
    return addDays(addYears(parse(c.re.complaintDate), win.years), win.graceDays ?? 0)
  }
  // 2026-style window: days from the later of (RE deadline expiry, last communication)
  const trigger = reply && reply > reDue ? reply : reDue
  return addDays(trigger, win.days ?? 90)
}

export function computeAppealWindowEnd(c: Case, today: Date): Date | null {
  if (!c.filing.decisionDate) return null
  const scheme = schemeFor(today)
  return addDays(parse(c.filing.decisionDate), scheme.appealWindowDays.value)
}

export function computeDeadlines(c: Case, today: Date): DeadlineItem[] {
  const items: DeadlineItem[] = []
  const scheme = schemeFor(today)

  const reDue = computeReResponseDue(c, today)
  if (reDue && !c.re.replyDate && c.re.replyKind !== 'resolved') {
    items.push({
      key: 're_response',
      label: `Bank's ${scheme.reFirstWaitDays.value}-day response window`,
      date: fmt(reDue),
      urgency: urgencyFor(reDue, today),
      note: 'After this date (or a written rejection, whichever first) the Ombudsman route opens.',
    })
  }

  const windowEnd = computeOmbudsmanWindowEnd(c, today)
  if (windowEnd && !c.filing.filedAt) {
    items.push({
      key: 'ombudsman_window',
      label: 'Ombudsman filing window closes',
      date: fmt(windowEnd),
      urgency: urgencyFor(windowEnd, today),
      note:
        `Missing this kills the complaint. ${scheme.name}.` +
        (scheme.filingWindow.status === 'UNVERIFIED'
          ? ' Window parameters pending primary-source verification — treat the earlier date as binding.'
          : ''),
    })
  }

  const appealEnd = computeAppealWindowEnd(c, today)
  if (appealEnd) {
    items.push({
      key: 'appeal_window',
      label: 'Appeal window (Appellate Authority)',
      date: fmt(appealEnd),
      urgency: urgencyFor(appealEnd, today),
      note: `${scheme.appealWindowDays.value} days from the Award/rejection to appeal to the ${scheme.appellateAuthority.value}.`,
    })
  }

  return items
}
