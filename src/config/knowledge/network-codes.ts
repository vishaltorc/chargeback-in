// Card-network dispute grounds. Visa/Mastercard verified against the official
// rulebook PDFs on 2026-06-10; 13.1/12.6 and Mastercard goods-not-provided /
// duplicate entries pending verification (agent dispatched 2026-06-12) — they
// carry status 'UNVERIFIED' until confirmed and the UI must say so.
// RuPay: NPCI does not publish reason codes publicly (member-bank manual only).

import { GroundCitation } from '@/lib/case'

const VISA_RULES_URL = 'https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf'
const MC_GUIDE_URL =
  'https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/chargeback-guide.pdf'

export const NETWORK_CODES: Record<string, GroundCitation> = {
  visa_13_2: {
    id: 'visa-13.2',
    kind: 'network',
    label: 'Visa 13.2 — Cancelled Recurring Transaction',
    detail:
      'Permission for the recurring charge was withdrawn before processing, but the charge was billed anyway. Issuer files within 120 days of processing. Note: cancellation must precede the charge (Apr 2026 rule).',
    citation: 'Visa Core Rules, 18 Apr 2026 edition, rule 11.10.3 (Dispute Condition 13.2)',
    sourceUrl: VISA_RULES_URL,
    asOf: '2026-06-10',
    status: 'verified',
  },
  visa_13_6: {
    id: 'visa-13.6',
    kind: 'network',
    label: 'Visa 13.6 — Credit Not Processed',
    detail:
      'A credit/void receipt was issued but never processed. 15-day wait, then within 120 days of the credit-receipt date (540-day outer cap).',
    citation: 'Visa Core Rules, 18 Apr 2026 edition, rule 11.10.7 (Dispute Condition 13.6)',
    sourceUrl: VISA_RULES_URL,
    asOf: '2026-06-10',
    status: 'verified',
  },
  visa_13_7: {
    id: 'visa-13.7',
    kind: 'network',
    label: 'Visa 13.7 — Cancelled Merchandise/Services',
    detail: 'Cancelled or returned, still charged. 15-day wait; 120 days; 540-day cap.',
    citation: 'Visa Core Rules, 18 Apr 2026 edition, rule 11.10.8 (Dispute Condition 13.7)',
    sourceUrl: VISA_RULES_URL,
    asOf: '2026-06-10',
    status: 'verified',
  },
  visa_10_4: {
    id: 'visa-10.4',
    kind: 'network',
    label: 'Visa 10.4 — Other Fraud, Card-Absent',
    detail:
      'The unauthorised online/card-not-present transaction condition. 120 days from processing. Fraud and 13.x are mutually exclusive.',
    citation: 'Visa Core Rules, 18 Apr 2026 edition, rule 11.7.5 area (Dispute Condition 10.4)',
    sourceUrl: VISA_RULES_URL,
    asOf: '2026-06-10',
    status: 'verified',
  },
  visa_13_1: {
    id: 'visa-13.1',
    kind: 'network',
    label: 'Visa 13.1 — Merchandise/Services Not Received',
    detail:
      'Paid, but goods/services never received. 120 days from processing or from the last expected receipt date (540-day cap); 15-day wait first (30 for travel/ticket agencies), waived if the merchant is insolvent.',
    citation: 'Visa Core Rules, 18 Apr 2026 edition, rule 11.10.2 (Dispute Condition 13.1), Tables 11-89/11-92',
    sourceUrl: VISA_RULES_URL,
    asOf: '2026-06-12',
    status: 'verified',
  },
  visa_12_6: {
    id: 'visa-12.6',
    kind: 'network',
    label: 'Visa 12.6 — Duplicate Processing/Paid by Other Means',
    detail:
      'One combined condition (no 12.6.1/12.6.2 sub-codes in the current rules): charged more than once for the same transaction, or paid for the same thing by other means. 120 days from the processing date.',
    citation: 'Visa Core Rules, 18 Apr 2026 edition, rule 11.9.5 (Dispute Condition 12.6), Tables 11-77/11-80',
    sourceUrl: VISA_RULES_URL,
    asOf: '2026-06-12',
    status: 'verified',
  },
  mc_4853_recurring: {
    id: 'mc-4853-recurring',
    kind: 'network',
    label: 'Mastercard 4853 — Cardholder Dispute of a Recurring Transaction',
    detail:
      'Merchant billed after cancellation (or cardholder unaware of recurring terms). Within 120 days of settlement.',
    citation: 'Mastercard Chargeback Guide, 19 May 2026, reason code 4853 sub-condition',
    sourceUrl: MC_GUIDE_URL,
    asOf: '2026-06-10',
    status: 'verified',
  },
  mc_4853_refund: {
    id: 'mc-4853-refund',
    kind: 'network',
    label: 'Mastercard 4853 — Refund Not Processed',
    detail: 'Merchant agreed to or owed a refund and failed to process it. 15-120 days.',
    citation: 'Mastercard Chargeback Guide, 19 May 2026, reason code 4853 sub-condition',
    sourceUrl: MC_GUIDE_URL,
    asOf: '2026-06-10',
    status: 'verified',
  },
  mc_4837: {
    id: 'mc-4837',
    kind: 'network',
    label: 'Mastercard 4837 — No Cardholder Authorization',
    detail:
      'The fraud track: cardholder did not authorise the transaction. Within 120 days. 4853 requires the cardholder engaged in the transaction — fraud must go here.',
    citation: 'Mastercard Chargeback Guide, 19 May 2026, reason code 4837',
    sourceUrl: MC_GUIDE_URL,
    asOf: '2026-06-10',
    status: 'verified',
  },
  mc_goods_not_provided: {
    id: 'mc-4853-not-provided',
    kind: 'network',
    label: 'Mastercard 4853 — Goods or Services Not Provided',
    detail:
      'Paid, never received. Generally 120 days from settlement; if a delivery date was promised and passed, 120 days from the latest anticipated delivery date; interrupted ongoing services capped at 540 days. (Legacy code 4855 being phased out.)',
    citation:
      'Mastercard Chargeback Guide, 19 May 2026, ch.2 "Goods or Services Not Provided" under reason code 4853',
    sourceUrl: MC_GUIDE_URL,
    asOf: '2026-06-12',
    status: 'verified',
  },
  mc_duplicate: {
    id: 'mc-4834-duplicate',
    kind: 'network',
    label: 'Mastercard 4834 — Debited More than Once / Paid by Other Means',
    detail:
      'Duplicate debit, or paid one way and charged again another way. NOTE: 90 days from settlement (shorter than the usual 120) — act fast. (Lives under 4834 Point-of-Interaction Error; renumbers to 4831 for chargebacks processed on/after 21 Apr 2028.)',
    citation:
      'Mastercard Chargeback Guide, 19 May 2026, ch.2 "Cardholder Debited More than Once for the Same Goods or Services" under reason code 4834',
    sourceUrl: MC_GUIDE_URL,
    asOf: '2026-06-12',
    status: 'verified',
  },
  rupay_generic: {
    id: 'rupay-issuer-files',
    kind: 'network',
    label: 'RuPay — dispute category named by fact pattern',
    detail:
      'NPCI does not publish RuPay reason codes publicly (member-bank manual v6.0). Ask the bank, which has manual access, to identify and file under the applicable RuPay dispute category for your fact pattern. Your RBI grounds apply in full regardless.',
    citation: 'RuPay Dispute Management Rules and Regulations manual v6.0 (member-bank access only)',
    sourceUrl: 'https://www.npcisupport.org.in/portal/en/kb/articles/dispute-tat',
    asOf: '2026-06-10',
    status: 'UNVERIFIED',
  },
}
