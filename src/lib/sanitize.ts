// Portal-safe text generation for the RBI CMS "Facts of the complaint" box.
// The box rejects special characters and truncates at 2000 chars (observed
// behaviour, PRD §7.8). Output alphabet: letters, digits, spaces, commas,
// full stops. Decimals become the word "point" so exact amounts survive.

import { Case, DISPUTE_TYPE_LABELS } from './case'
import { FACTS_MAX_LEN } from '@/config/knowledge/cms-form'
import { buildDeficiencyLog } from './mapping'

export function sanitizeFacts(input: string): string {
  let s = input
  // 1. Decimal numbers -> "N point M" (amounts 9551.97, codes 13.2) BEFORE any
  //    punctuation stripping, so the decimal point isn't lost.
  s = s.replace(/(\d+)\.(\d+)/g, '$1 point $2')
  // 2. Currency: ₹ and Rs/Rs. -> Rupees
  s = s.replace(/₹\s*/g, 'Rupees ')
  s = s.replace(/\bRs\.?\s*/g, 'Rupees ')
  // 3. Reference strings with slashes/hyphens (RBI/2020-21/118) -> spaces
  s = s.replace(/[/\\]/g, ' ')
  s = s.replace(/[-–—]/g, ' ')
  // 4. Quotes and brackets: drop the marks, keep the content
  s = s.replace(/["'""''`]/g, '')
  s = s.replace(/[()\[\]{}]/g, ' ')
  // 5. Colons and semicolons -> comma (keeps list rhythm without forbidden chars)
  s = s.replace(/[:;]/g, ',')
  // 6. Ampersand and percent in words
  s = s.replace(/&/g, ' and ')
  s = s.replace(/(\d+)\s*%/g, '$1 percent')
  // 7. Newlines -> single paragraph; strip everything outside the allowed set
  s = s.replace(/\s*\n+\s*/g, ' ')
  s = s.replace(/[^A-Za-z0-9 ,.]/g, ' ')
  // 8. Tidy: collapse runs, no space before punctuation, no doubled punctuation
  s = s.replace(/\s+/g, ' ')
  s = s.replace(/\s+([,.])/g, '$1')
  s = s.replace(/([,.]){2,}/g, '$1')
  return s.trim()
}

// Compose a complete, <= 2000-char, portal-safe Facts narrative from the Case.
// Built as prioritised segments: if over the cap, lowest-priority segments drop
// first, and the result still reads as a complete complaint.
export function composeFacts(c: Case): { text: string; truncated: boolean } {
  const f = c.facts
  const seg: { priority: number; text: string }[] = []

  const typeLabel = c.disputeType ? DISPUTE_TYPE_LABELS[c.disputeType] : 'a disputed transaction'
  seg.push({
    priority: 0,
    text: `Complaint regarding ${typeLabel.toLowerCase()} on my ${f.network && f.network !== 'unknown' ? f.network : ''} ${f.channel === 'card' ? 'card' : f.channel} ending ${f.cardLast4 ?? ''} issued by ${c.re.name ?? 'the bank'}.`,
  })
  seg.push({
    priority: 0,
    text: `The disputed debit is of Rs ${f.amount ?? ''} by merchant ${f.merchant ?? ''} dated ${f.transactionDate ?? ''}.`,
  })
  if (c.disputeType === 'cancelled_recurring' && f.cancellationDate) {
    seg.push({
      priority: 1,
      text: `I had cancelled the mandate or recurring consent on ${f.cancellationDate} via ${f.cancellationMethod ?? 'the issuer channel'}${f.mandateId ? `, mandate reference ${f.mandateId}` : ''}. The debit was processed after that cancellation.`,
    })
  }
  if (c.disputeType === 'no_predebit_notice' || c.disputeType === 'cancelled_recurring') {
    seg.push({
      priority: 2,
      text: 'No pre debit notification was received at least 24 hours before the debit as required under the RBI e mandate framework.',
    })
  }
  if (c.disputeType === 'unauthorised' && f.reportedDate) {
    seg.push({
      priority: 1,
      text: `I did not authorise this transaction and reported it to the bank on ${f.reportedDate}. Under the RBI limiting liability framework my liability is zero when reported within 3 working days and the burden of proof lies on the bank.`,
    })
  }
  if (f.summary) seg.push({ priority: 2, text: f.summary })

  if (c.re.complaintDate) {
    seg.push({
      priority: 1,
      text: `I complained in writing to the bank on ${c.re.complaintDate}${c.re.caseRefs.length ? `, reference ${c.re.caseRefs.join(' and ')}` : ''}.${c.re.replyDate ? ` The bank replied on ${c.re.replyDate} and the reply did not resolve the complaint.` : ' No satisfactory resolution has been provided within the required time.'}`,
    })
  }

  const grounds = c.grounds
  if (grounds) {
    const verified = [...grounds.network, ...grounds.rbi].filter((g) => g.status === 'verified')
    if (verified.length) {
      seg.push({
        priority: 3,
        text: `The applicable grounds include ${verified.map((g) => g.label).join(', ')}.`,
      })
    }
  }

  const deficiencies = buildDeficiencyLog(c.events)
  if (deficiencies.length) {
    seg.push({
      priority: 4,
      text: `The bank's handling itself shows deficiency in service, ${deficiencies.map((d) => `${d.label.toLowerCase()} on ${d.date}`).join(', ')}.`,
    })
  }

  seg.push({
    priority: 0,
    text: `I request reversal of the disputed amount of Rs ${f.amount ?? ''} with applicable interest and reversal of related fees, and compensation for the deficiency in service. Detailed documents are attached.`,
  })

  // Assemble by priority, dropping lowest-priority segments until within cap.
  let active = [...seg]
  let text = sanitizeFacts(active.map((s) => s.text).join(' '))
  let truncated = false
  while (text.length > FACTS_MAX_LEN) {
    const worst = Math.max(...active.map((s) => s.priority))
    if (worst === 0) break // nothing droppable left
    active = active.filter((s) => s.priority !== worst)
    truncated = true
    text = sanitizeFacts(active.map((s) => s.text).join(' '))
  }
  if (text.length > FACTS_MAX_LEN) {
    // hard fallback: cut at the last sentence boundary inside the cap
    const cut = text.slice(0, FACTS_MAX_LEN)
    const lastStop = cut.lastIndexOf('.')
    text = lastStop > 0 ? cut.slice(0, lastStop + 1) : cut
    truncated = true
  }
  return { text, truncated }
}
