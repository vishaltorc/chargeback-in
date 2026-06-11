// RBI grounds the mapping engine can cite. All verified against rbi.org.in on
// 2026-06-10 (see the dispute-desk knowledge repo this app inherits from:
// https://github.com/vishaltorc/dispute-desk).

import { GroundCitation } from '@/lib/case'

const EMANDATE_2026_URL = 'https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13374'
const RBC_2025_URL = 'https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140'

export const RBI_RULES: Record<string, GroundCitation> = {
  emandate_predebit_notice: {
    id: 'rbi-emandate-6a',
    kind: 'rbi',
    label: 'E-mandate: 24-hour pre-debit notification required',
    detail:
      'The issuer must notify you at least 24 hours before every recurring debit, stating merchant, amount, date, reference and reason. Its absence is a framework violation regardless of amount.',
    citation:
      'Digital Payments – E-mandate Framework, 2026 (RBI/DPSS/2026-27/396), clauses 6(a)-(b)',
    sourceUrl: EMANDATE_2026_URL,
    asOf: '2026-06-10',
    status: 'verified',
    railAgnostic: true,
  },
  emandate_withdrawal: {
    id: 'rbi-emandate-4b',
    kind: 'rbi',
    label: 'E-mandate: no debits after withdrawal',
    detail:
      'You can withdraw a mandate at any time; after withdrawal, further recurring debits must not be processed.',
    citation:
      'Digital Payments – E-mandate Framework, 2026 (RBI/DPSS/2026-27/396), clauses 4(b), 4(e), 6(c)',
    sourceUrl: EMANDATE_2026_URL,
    asOf: '2026-06-10',
    status: 'verified',
    railAgnostic: true,
  },
  emandate_liability_bridge: {
    id: 'rbi-emandate-9b',
    kind: 'rbi',
    label: 'Non-compliant recurring debits fall under unauthorised-transaction liability rules',
    detail:
      "RBI's limited-liability instructions for unauthorised electronic transactions expressly apply to e-mandate recurring transactions.",
    citation: 'Digital Payments – E-mandate Framework, 2026, clause 9(b)',
    sourceUrl: EMANDATE_2026_URL,
    asOf: '2026-06-10',
    status: 'verified',
    railAgnostic: true,
  },
  liability_zero_3days: {
    id: 'rbi-rbc-67',
    kind: 'rbi',
    label: 'Zero liability if reported within 3 working days',
    detail:
      'For an unauthorised electronic transaction from a third-party breach, your liability is zero if you report within 3 working days of the bank communicating the transaction. Bank-side fault: zero liability regardless.',
    citation:
      'RBI (Commercial Banks – Responsible Business Conduct) Directions, 2025, Chapter IV-D, para 67 (origin: DBR.No.Leg.BC.78/09.07.005/2017-18)',
    sourceUrl: RBC_2025_URL,
    asOf: '2026-06-10',
    status: 'verified',
  },
  liability_burden_on_bank: {
    id: 'rbi-rbc-75',
    kind: 'rbi',
    label: 'Burden of proving customer liability lies on the bank',
    citation: 'RBC Directions 2025, Chapter IV-D, para 75',
    detail:
      'The bank must prove you are liable; a closure asserting your negligence without evidence is contestable on this ground.',
    sourceUrl: RBC_2025_URL,
    asOf: '2026-06-10',
    status: 'verified',
  },
  liability_shadow_credit: {
    id: 'rbi-rbc-72',
    kind: 'rbi',
    label: 'Shadow credit within 10 working days; resolution within 90 days',
    detail:
      'The bank must credit the disputed amount (value-dated) within 10 working days of notification, and resolve within 90 days.',
    citation: 'RBC Directions 2025, Chapter IV-D, paras 72-73',
    sourceUrl: RBC_2025_URL,
    asOf: '2026-06-10',
    status: 'verified',
  },
  deficiency_in_service: {
    id: 'rbi-deficiency',
    kind: 'rbi',
    label: 'Deficiency in service (Ombudsman ground)',
    detail:
      'False closures, contradicting its own records, inconsistent references, and silent deadline extensions are deficiencies in service — independent grounds before the Ombudsman.',
    citation: 'RB-IOS: complaints of deficiency in service against regulated entities',
    sourceUrl: 'https://rbidocs.rbi.org.in/rdocs/content/pdfs/RBIOS2021_amendments05082022.pdf',
    asOf: '2026-06-10',
    status: 'verified',
  },
}
