// Canonical Case object — every module reads/writes only this shape (PRD §9).
// Sensitive by design: lives only in the user's browser storage. Never send the
// whole Case to any server; /api/draft receives a purpose-built subset.

export type SchemeVersion = '2021' | '2026'

export type DisputeType =
  | 'cancelled_recurring' // charged after recurring mandate cancelled
  | 'no_predebit_notice' // recurring charge without 24h pre-debit notification
  | 'unauthorised' // fraud / never authorised
  | 'not_delivered' // paid, goods/services not received
  | 'duplicate' // charged twice / duplicate processing
  | 'refund_not_processed' // promised credit never arrived
  | 'other'

export type Channel = 'card' | 'upi' | 'netbanking' | 'other'

export type CardNetwork = 'visa' | 'mastercard' | 'rupay' | 'unknown'

export interface CaseFacts {
  transactionDate?: string // YYYY-MM-DD as on statement
  amount?: string // keep as string to preserve exact decimals (e.g. "9551.97")
  currency: string // default "INR"
  merchant?: string
  cardLast4?: string // never more than 4 digits
  mandateId?: string // mandate / SI Hub ID if present
  channel: Channel
  network?: CardNetwork // from the card face; decides which code family to cite
  international: boolean
  cancellationDate?: string // category: cancelled_recurring
  cancellationMethod?: string
  expectedDeliveryDate?: string // category: not_delivered
  refundPromisedDate?: string // category: refund_not_processed
  reportedDate?: string // category: unauthorised — when user reported to bank
  summary?: string // one-line, user's words
}

export interface Complainant {
  name?: string
  age?: string
  gender?: string
  email?: string
  state?: string
  district?: string
  address?: string
  pincode?: string
}

export type CorrespondenceKind =
  | 'complaint_filed'
  | 'bank_reply'
  | 'reminder_sent'
  | 'false_closure'
  | 'inconsistent_refs'
  | 'silent_extension'
  | 'contradicts_own_records'
  | 'merchant_representment_incomplete'
  | 'burden_shift'
  | 'block_card_precondition'

export interface CorrespondenceEvent {
  id: string
  date: string // YYYY-MM-DD
  kind: CorrespondenceKind
  note: string // one factual line, user's words
  ref?: string // bank case reference quoted verbatim
}

export interface RegulatedEntity {
  name?: string // bank / NBFC / PPI issuer
  complaintDate?: string // first WRITTEN complaint to the RE
  replyDate?: string
  replyKind?: 'none' | 'rejected' | 'partly_rejected' | 'unsatisfactory' | 'resolved'
  reminderDate?: string
  caseRefs: string[]
}

export interface EligibilityAnswers {
  // CMS gate questions — all must be answerable truthfully (PRD §7.2 / §7.8)
  subJudice?: boolean // pending/decided in court, arbitration, other forum
  throughAdvocate?: boolean
  alreadyWithOmbudsman?: boolean
  staffGrievance?: boolean
}

export interface GroundCitation {
  id: string // e.g. "visa-13.2", "rbi-emandate-6a"
  kind: 'network' | 'rbi'
  label: string // human-readable name
  detail: string // one-line plain-English description
  citation: string // official reference text
  sourceUrl: string
  asOf: string
  status: 'verified' | 'UNVERIFIED' | 'observed'
  railAgnostic?: boolean
}

export interface Grounds {
  network: GroundCitation[]
  rbi: GroundCitation[]
  notes: string[]
}

export interface Filing {
  cmsComplaintNo?: string
  filedAt?: string // YYYY-MM-DD
  status?: 'draft' | 'filed' | 'resolved' | 'award' | 'rejected'
  decisionDate?: string // award/rejection date (starts appeal clock)
}

export interface Case {
  id: string
  createdAt: string // ISO
  schemaVersion: 1
  schemeVersion?: SchemeVersion // derived at filing time; see deadlines.ts
  disputeType?: DisputeType
  facts: CaseFacts
  complainant: Complainant
  re: RegulatedEntity
  eligibility: EligibilityAnswers
  events: CorrespondenceEvent[]
  grounds?: Grounds
  filing: Filing
  drafts: Partial<Record<'re_complaint' | 'reminder' | 'gro_escalation' | 'pno_escalation', string>>
}

export function newCase(now: Date = new Date()): Case {
  return {
    id: `case-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now.toISOString(),
    schemaVersion: 1,
    facts: { currency: 'INR', channel: 'card', international: false },
    complainant: {},
    re: { caseRefs: [] },
    eligibility: {},
    events: [],
    filing: {},
    drafts: {},
  }
}

export const DISPUTE_TYPE_LABELS: Record<DisputeType, string> = {
  cancelled_recurring: 'Charged after I cancelled a subscription / mandate',
  no_predebit_notice: 'A recurring charge hit without any advance notification',
  unauthorised: 'Charged without my approval (I never authorised this)',
  not_delivered: 'I paid, but the goods or service never came',
  duplicate: 'Charged twice for the same thing',
  refund_not_processed: 'A promised refund never arrived',
  other: 'Something else',
}
