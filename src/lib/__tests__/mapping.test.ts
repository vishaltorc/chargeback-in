import { describe, it, expect } from 'vitest'
import { newCase } from '@/lib/case'
import { mapGrounds, buildDeficiencyLog } from '@/lib/mapping'
import { buildFilingSheet } from '@/lib/filing-sheet'

describe('mapping engine (deterministic, two-pillar)', () => {
  it('cancelled_recurring on Visa → 13.2 + e-mandate grounds, rail-agnostic flagged', () => {
    const c = newCase()
    c.disputeType = 'cancelled_recurring'
    c.facts.network = 'visa'
    const g = mapGrounds(c)
    expect(g.network.map((x) => x.id)).toEqual(['visa-13.2'])
    expect(g.rbi.some((x) => x.id === 'rbi-emandate-4b')).toBe(true)
    expect(g.rbi.some((x) => x.railAgnostic)).toBe(true)
    expect(g.network.length + g.rbi.length).toBeGreaterThanOrEqual(2) // two pillars
  })

  it('unauthorised on Mastercard → 4837 + liability paras + urgency note', () => {
    const c = newCase()
    c.disputeType = 'unauthorised'
    c.facts.network = 'mastercard'
    const g = mapGrounds(c)
    expect(g.network.map((x) => x.id)).toEqual(['mc-4837'])
    expect(g.rbi.some((x) => x.id === 'rbi-rbc-67')).toBe(true)
    expect(g.notes.join(' ')).toMatch(/3 working days/)
  })

  it('duplicate on Mastercard carries the 90-day (not 120) warning', () => {
    const c = newCase()
    c.disputeType = 'duplicate'
    c.facts.network = 'mastercard'
    const g = mapGrounds(c)
    expect(g.network[0].id).toBe('mc-4834-duplicate')
    expect(g.notes.join(' ')).toMatch(/90 days/)
  })

  it('RuPay → no invented code; ask-the-bank ground with UNVERIFIED surfaced', () => {
    const c = newCase()
    c.disputeType = 'cancelled_recurring'
    c.facts.network = 'rupay'
    const g = mapGrounds(c)
    expect(g.network[0].id).toBe('rupay-issuer-files')
    expect(g.network[0].status).toBe('UNVERIFIED')
    expect(g.notes.join(' ')).toMatch(/could not be verified|ask the bank/i)
  })

  it('unknown network → both candidates shown', () => {
    const c = newCase()
    c.disputeType = 'refund_not_processed'
    c.facts.network = 'unknown'
    const g = mapGrounds(c)
    expect(g.network.map((x) => x.id).sort()).toEqual(['mc-4853-refund', 'visa-13.6'])
  })

  it('UPI channel → network codes dropped, RBI grounds carry it', () => {
    const c = newCase()
    c.disputeType = 'cancelled_recurring'
    c.facts.channel = 'upi'
    const g = mapGrounds(c)
    expect(g.network).toHaveLength(0)
    expect(g.rbi.length).toBeGreaterThan(0)
  })
})

describe('deficiency log', () => {
  it('maps logged events to dated deficiencies, chronologically', () => {
    const log = buildDeficiencyLog([
      { id: '2', date: '2026-03-01', kind: 'inconsistent_refs', note: 'two refs in one mail', ref: 'B' },
      { id: '1', date: '2026-02-18', kind: 'false_closure', note: 'closed claiming no debit', ref: 'A' },
      { id: '3', date: '2026-02-19', kind: 'bank_reply', note: 'ordinary reply' }, // not a deficiency
    ])
    expect(log.map((d) => d.kind)).toEqual(['false_closure', 'inconsistent_refs'])
    expect(log[0].whyItMatters).toMatch(/own (records|statement)/i)
  })
})

describe('filing sheet', () => {
  it('produces a complete sheet with sanitised facts, whole-rupee amount, and upload map', () => {
    const c = newCase()
    c.disputeType = 'cancelled_recurring'
    c.facts = { ...c.facts, amount: '9551.97', merchant: 'STREAMCO', transactionDate: '2026-02-01', cardLast4: '4321', network: 'visa' }
    c.complainant.name = 'Test Person'
    c.re.name = 'HDFC Bank'
    c.re.complaintDate = '2026-02-04'
    c.eligibility = { subJudice: false, throughAdvocate: false, alreadyWithOmbudsman: false, staffGrievance: false }
    const sheet = buildFilingSheet(c)
    const amountRow = sheet.rows.find((r) => r.field === 'Disputed amount')!
    expect(amountRow.value).toBe('9551')
    expect(amountRow.note).toMatch(/decimals/)
    expect(sheet.facts.text).toContain('9551 point 97')
    expect(sheet.rows.find((r) => r.field === 'Filed complaint with Entity?')!.value).toBe('Yes')
    expect(sheet.uploadMap.length).toBeGreaterThanOrEqual(4)
    expect(sheet.traps.length).toBeGreaterThanOrEqual(4)
  })

  it('marks unanswered eligibility questions loudly', () => {
    const c = newCase()
    const sheet = buildFilingSheet(c)
    expect(sheet.rows.find((r) => r.field === 'Filed through an advocate?')!.value).toBe('ANSWER REQUIRED')
  })
})
