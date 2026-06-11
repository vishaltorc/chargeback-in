import { describe, it, expect } from 'vitest'
import { newCase } from '@/lib/case'
import { checkMaintainability, allGatesPass } from '@/lib/gates'
import { computeDeadlines, computeOmbudsmanWindowEnd } from '@/lib/deadlines'

const TODAY_2026 = new Date('2026-08-15T00:00:00Z') // RB-IOS 2026 era
const TODAY_2021_ERA = new Date('2026-06-12T00:00:00Z') // before 2026-07-01

function eligibleCase() {
  const c = newCase()
  c.re.name = 'HDFC Bank'
  c.re.complaintDate = '2026-07-01'
  c.re.replyDate = '2026-07-20'
  c.re.replyKind = 'rejected'
  c.eligibility = {
    subJudice: false,
    throughAdvocate: false,
    alreadyWithOmbudsman: false,
    staffGrievance: false,
  }
  return c
}

describe('maintainability gates (PRD §7.2)', () => {
  it('passes a fully eligible case', () => {
    const results = checkMaintainability(eligibleCase(), TODAY_2026)
    expect(allGatesPass(results)).toBe(true)
  })

  it('fails RE-first when no bank complaint exists, with a fix path', () => {
    const c = eligibleCase()
    c.re.complaintDate = undefined
    const r = checkMaintainability(c, TODAY_2026).find((g) => g.gate === 're_first')!
    expect(r.pass).toBe(false)
    expect(r.fixPath).toMatch(/bank first/i)
  })

  it('fails the trigger gate inside the 30-day wait with the resume date', () => {
    const c = eligibleCase()
    c.re.complaintDate = '2026-08-10' // 5 days ago
    c.re.replyDate = undefined
    c.re.replyKind = undefined
    const r = checkMaintainability(c, TODAY_2026).find((g) => g.gate === 'trigger')!
    expect(r.pass).toBe(false)
    expect(r.why).toContain('2026-09-09') // complaint + 30 days
  })

  it('fails the window gate when the 90-day window (2026 scheme) has lapsed', () => {
    const c = eligibleCase()
    c.re.complaintDate = '2026-07-02'
    c.re.replyDate = '2026-07-10'
    c.re.replyKind = 'rejected'
    // window: later of (complaint+30 = Aug 1, reply Jul 10) = Aug 1; +90d = Oct 30
    const lateToday = new Date('2026-11-15T00:00:00Z')
    const r = checkMaintainability(c, lateToday).find((g) => g.gate === 'window')!
    expect(r.pass).toBe(false)
    expect(r.why).toContain('2026-10-30')
  })

  it('treats unanswered eligibility questions as blocking', () => {
    const c = eligibleCase()
    c.eligibility.subJudice = undefined
    const r = checkMaintainability(c, TODAY_2026).find((g) => g.gate === 'sub_judice')!
    expect(r.pass).toBe(false)
  })

  it('a satisfactorily resolved complaint is not maintainable', () => {
    const c = eligibleCase()
    c.re.replyKind = 'resolved'
    const r = checkMaintainability(c, TODAY_2026).find((g) => g.gate === 'trigger')!
    expect(r.pass).toBe(false)
  })
})

describe('deadlines (scheme-aware)', () => {
  it('2026 scheme: window = later of RE-deadline-expiry or last communication, + 90 days', () => {
    const c = newCase()
    c.re.complaintDate = '2026-07-02' // +30d => 2026-08-01
    c.re.replyDate = '2026-08-20' // later than Aug 1 → trigger
    const end = computeOmbudsmanWindowEnd(c, TODAY_2026)!
    expect(end.toISOString().slice(0, 10)).toBe('2026-11-18') // Aug 20 + 90
  })

  it('2021 scheme (filing today, before 2026-07-01): 1 year from reply', () => {
    const c = newCase()
    c.re.complaintDate = '2026-01-10'
    c.re.replyDate = '2026-02-01'
    const end = computeOmbudsmanWindowEnd(c, TODAY_2021_ERA)!
    expect(end.toISOString().slice(0, 10)).toBe('2027-02-01')
  })

  it('2021 scheme, no reply: 1 year + 30 days from the complaint', () => {
    const c = newCase()
    c.re.complaintDate = '2026-01-10'
    const end = computeOmbudsmanWindowEnd(c, TODAY_2021_ERA)!
    expect(end.toISOString().slice(0, 10)).toBe('2027-02-09')
  })

  it('flags the closing window with the right urgency and stops after filing', () => {
    const c = newCase()
    c.re.complaintDate = '2026-07-02'
    c.re.replyDate = '2026-08-20'
    const items = computeDeadlines(c, new Date('2026-11-10T00:00:00Z')) // 8 days left
    const win = items.find((i) => i.key === 'ombudsman_window')!
    expect(win.urgency).toBe('critical')
    c.filing.filedAt = '2026-11-11'
    expect(
      computeDeadlines(c, new Date('2026-11-12T00:00:00Z')).find((i) => i.key === 'ombudsman_window')
    ).toBeUndefined()
  })
})
