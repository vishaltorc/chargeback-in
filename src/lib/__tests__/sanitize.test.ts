import { describe, it, expect } from 'vitest'
import { sanitizeFacts, composeFacts } from '@/lib/sanitize'
import { newCase } from '@/lib/case'
import { FACTS_MAX_LEN } from '@/config/knowledge/cms-form'

describe('sanitizeFacts — the observed CMS portal traps (PRD §7.8)', () => {
  it('converts decimal amounts to "point" words', () => {
    expect(sanitizeFacts('Rs 9551.97 was debited')).toBe('Rupees 9551 point 97 was debited')
  })

  it('converts network codes like 13.2', () => {
    expect(sanitizeFacts('under Visa code 13.2')).toBe('under Visa code 13 point 2')
  })

  it('flattens circular references with slashes and hyphens', () => {
    expect(sanitizeFacts('RBI/2020-21/118')).toBe('RBI 2020 21 118')
  })

  it('strips quotes but keeps the quoted words', () => {
    expect(sanitizeFacts('the bank said "no debit was processed"')).toBe(
      'the bank said no debit was processed'
    )
  })

  it('drops parentheses, keeps content', () => {
    expect(sanitizeFacts('the mandate (ref MNDT01) was cancelled')).toBe(
      'the mandate ref MNDT01 was cancelled'
    )
  })

  it('replaces colons and semicolons with commas', () => {
    expect(sanitizeFacts('three issues: closure; deflection')).toBe(
      'three issues, closure, deflection'
    )
  })

  it('replaces ₹ and Rs. with Rupees', () => {
    expect(sanitizeFacts('₹1499 then Rs. 500')).toBe('Rupees 1499 then Rupees 500')
  })

  it('collapses newlines into a single paragraph', () => {
    expect(sanitizeFacts('line one\n\nline two')).toBe('line one line two')
  })

  it('emits only the allowed alphabet', () => {
    const out = sanitizeFacts('weird * stuff — em-dash & 50% (done): "ok"; ₹9.5/day')
    expect(out).toMatch(/^[A-Za-z0-9 ,.]*$/)
  })

  it('is idempotent', () => {
    const once = sanitizeFacts('Rs 9551.97 ("test"): RBI/2021-22/1')
    expect(sanitizeFacts(once)).toBe(once)
  })
})

describe('composeFacts', () => {
  function bigCase() {
    const c = newCase()
    c.disputeType = 'cancelled_recurring'
    c.facts.amount = '9551.97'
    c.facts.merchant = 'STREAMCO'
    c.facts.transactionDate = '2026-02-01'
    c.facts.cardLast4 = '4321'
    c.facts.network = 'visa'
    c.facts.cancellationDate = '2026-01-05'
    c.re.name = 'HDFC Bank'
    c.re.complaintDate = '2026-02-04'
    c.re.caseRefs = ['CC-0000001']
    return c
  }

  it('stays within the portal limit and is portal-safe', () => {
    const { text } = composeFacts(bigCase())
    expect(text.length).toBeLessThanOrEqual(FACTS_MAX_LEN)
    expect(text).toMatch(/^[A-Za-z0-9 ,.]*$/)
  })

  it('preserves the exact amount as words (decimals survive the portal)', () => {
    const { text } = composeFacts(bigCase())
    expect(text).toContain('9551 point 97')
  })

  it('mentions the cancellation predating the debit for cancelled_recurring', () => {
    const { text } = composeFacts(bigCase())
    expect(text).toContain('2026 01 05') // sanitised date
    expect(text.toLowerCase()).toContain('cancel')
  })

  it('drops low-priority segments rather than exceeding the cap', () => {
    const c = bigCase()
    c.facts.summary = 'x'.repeat(3000) // absurd user summary
    const { text, truncated } = composeFacts(c)
    expect(text.length).toBeLessThanOrEqual(FACTS_MAX_LEN)
    expect(truncated).toBe(true)
    // core ask must survive truncation
    expect(text).toContain('reversal of the disputed amount')
  })
})
