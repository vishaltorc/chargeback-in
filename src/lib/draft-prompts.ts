// Prompt construction + payload minimisation for the AI drafting route, and the
// no-AI fallback skeleton. The LLM words the draft; it never decides grounds
// (those come from the deterministic mapping engine) and never invents facts.

import { Case, DISPUTE_TYPE_LABELS } from './case'
import { buildDeficiencyLog } from './mapping'

export type DocKind = 're_complaint' | 'reminder' | 'gro_escalation' | 'pno_escalation'

export const DOC_KIND_LABELS: Record<DocKind, string> = {
  re_complaint: 'First written complaint to the bank',
  reminder: 'Reminder for a pending complaint',
  gro_escalation: 'Escalation to the Grievance Redressal Officer',
  pno_escalation: 'Escalation to the Principal Nodal Officer',
}

// Only what drafting needs leaves the browser — no complainant address,
// no email, no eligibility answers (data minimisation, PRD §10).
export interface DraftPayload {
  docKind: DocKind
  disputeLabel: string
  bank: string
  facts: {
    transactionDate?: string
    amount?: string
    currency: string
    merchant?: string
    cardLast4?: string
    mandateId?: string
    channel: string
    network?: string
    cancellationDate?: string
    cancellationMethod?: string
    reportedDate?: string
    summary?: string
  }
  re: { complaintDate?: string; replyDate?: string; replyKind?: string; caseRefs: string[] }
  grounds: { kind: string; label: string; citation: string; status: string; detail: string }[]
  deficiencies: { date: string; label: string; note: string; ref?: string }[]
}

export function buildDraftPayload(c: Case, docKind: DocKind): DraftPayload {
  const g = c.grounds
  return {
    docKind,
    disputeLabel: c.disputeType ? DISPUTE_TYPE_LABELS[c.disputeType] : 'a disputed transaction',
    bank: c.re.name ?? 'the bank',
    facts: {
      transactionDate: c.facts.transactionDate,
      amount: c.facts.amount,
      currency: c.facts.currency,
      merchant: c.facts.merchant,
      cardLast4: c.facts.cardLast4,
      mandateId: c.facts.mandateId,
      channel: c.facts.channel,
      network: c.facts.network,
      cancellationDate: c.facts.cancellationDate,
      cancellationMethod: c.facts.cancellationMethod,
      reportedDate: c.facts.reportedDate,
      summary: c.facts.summary,
    },
    re: {
      complaintDate: c.re.complaintDate,
      replyDate: c.re.replyDate,
      replyKind: c.re.replyKind,
      caseRefs: c.re.caseRefs,
    },
    grounds: [...(g?.network ?? []), ...(g?.rbi ?? [])].map((x) => ({
      kind: x.kind,
      label: x.label,
      citation: x.citation,
      status: x.status,
      detail: x.detail,
    })),
    deficiencies: buildDeficiencyLog(c.events).map((d) => ({
      date: d.date,
      label: d.label,
      note: d.note,
      ref: d.ref,
    })),
  }
}

export const DRAFT_SYSTEM_PROMPT = `You draft consumer banking complaint emails for Indian bank customers. You receive structured case data and produce ONE email draft (subject line + body).

Hard rules — violating any of these makes the draft unusable:
1. Use ONLY the facts in the payload. Never invent dates, amounts, reference numbers, names, or events. If a needed fact is absent, write a bracketed placeholder like [DATE YOU CANCELLED] instead.
2. Cite ONLY the grounds supplied, using their citation text. For any ground with status UNVERIFIED, do not assert the code/number — describe the fact pattern and ask the bank to apply the applicable category.
3. Never predict outcomes. No "you will be refunded", no "this guarantees", no probability language.
4. Tone: factual, civil, firm. No threats, sarcasm, or adjectives doing the work of facts. State facts with dates, quote references verbatim, make one clear ask with a deadline.
5. Never quote anything as said by the bank or merchant unless it appears verbatim in the payload (deficiency notes are the user's words — paraphrase them as the user's account, not as quotes).
6. Structure: Subject line, then body. Body ends with a single specific ask appropriate to the document kind (registration + reference number for a first complaint; substantive response by the published timeline for escalations). Under 350 words.
7. The email is from the customer, first person. Sign-off placeholder: [YOUR NAME], card ending {cardLast4 if present}.
8. Plain text only. No markdown headers, no bullets symbols other than simple numbered lists.`

export function buildDraftUserMessage(p: DraftPayload): string {
  return `Document kind: ${DOC_KIND_LABELS[p.docKind]}\n\nCase data (JSON):\n${JSON.stringify(p, null, 2)}\n\nDraft the email now.`
}

// No-AI fallback: a fill-in skeleton assembled from the same payload, so the
// product works fully offline / without an API key.
export function fallbackSkeleton(p: DraftPayload): string {
  const refs = p.re.caseRefs.length ? ` (reference ${p.re.caseRefs.join(', ')})` : ''
  const groundLines = p.grounds
    .map((g) =>
      g.status === 'UNVERIFIED'
        ? `- ${g.detail}`
        : `- ${g.label} (${g.citation})`
    )
    .join('\n')
  const deficiencyLines = p.deficiencies.length
    ? `\nThe handling of this complaint has itself shown deficiencies in service:\n${p.deficiencies.map((d) => `- ${d.date}: ${d.label} — ${d.note}${d.ref ? ` (ref ${d.ref})` : ''}`).join('\n')}\n`
    : ''
  const ask =
    p.docKind === 're_complaint'
      ? 'Please register this as a formal dispute, provide the complaint reference number, and confirm the dispute category and resolution timeline.'
      : 'Please provide a substantive written response within the published timeline for this level. The complaint and my ask are unchanged.'

  return `Subject: ${p.docKind === 're_complaint' ? 'Dispute of transaction' : 'Escalation of unresolved complaint'} — card ending ${p.facts.cardLast4 ?? '[LAST 4]'} — ${p.facts.currency} ${p.facts.amount ?? '[AMOUNT]'} on ${p.facts.transactionDate ?? '[DATE]'}

Dear Sir/Madam,

I am writing about ${p.disputeLabel.toLowerCase()}: a debit of ${p.facts.currency} ${p.facts.amount ?? '[AMOUNT]'} by ${p.facts.merchant ?? '[MERCHANT]'} on ${p.facts.transactionDate ?? '[DATE]'}, on my card ending ${p.facts.cardLast4 ?? '[LAST 4]'}${p.re.complaintDate ? `. I first complained in writing on ${p.re.complaintDate}${refs}` : ''}.

${p.facts.summary ?? '[ONE SENTENCE: WHAT HAPPENED, IN YOUR WORDS]'}

The applicable grounds:
${groundLines}
${deficiencyLines}
${ask}

Sincerely,
[YOUR NAME]
Card ending ${p.facts.cardLast4 ?? '[LAST 4]'}`
}
