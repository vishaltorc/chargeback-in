// RBI Ombudsman schemes — RB-IOS 2021 (sunset 2026-06-30) and RB-IOS 2026.
// 2021 values verified against the official scheme text on 2026-06-10.
// 2026 values pending primary-source verification (agent dispatched 2026-06-12);
// fields not yet confirmed verbatim carry status 'UNVERIFIED' and the UI says so.

import { Sourced } from './types'

export interface OmbudsmanScheme {
  id: '2021' | '2026'
  name: string
  inForceFrom: string // YYYY-MM-DD
  inForceTo?: string
  reFirstWaitDays: Sourced<number> // wait after written complaint to RE
  filingWindow: Sourced<{ description: string; days?: number; years?: number; graceDays?: number }>
  compensationFinancialLossMax: Sourced<string>
  compensationHarassmentMax: Sourced<string>
  appealWindowDays: Sourced<number>
  appellateAuthority: Sourced<string>
  portalUrl: Sourced<string>
  helpline: Sourced<string>
  crpcAddress: Sourced<string>
  nonMaintainability: Sourced<string[]>
}

const SCHEME_2021_PDF =
  'https://rbidocs.rbi.org.in/rdocs/content/pdfs/RBIOS2021_amendments05082022.pdf'

export const RBIOS_2021: OmbudsmanScheme = {
  id: '2021',
  name: 'Reserve Bank - Integrated Ombudsman Scheme, 2021',
  inForceFrom: '2021-11-12',
  inForceTo: '2026-06-30',
  reFirstWaitDays: {
    value: 30,
    asOf: '2026-06-10',
    sourceUrl: SCHEME_2021_PDF,
    status: 'verified',
    note: 'Clause 10(2)(a)(i): rejected wholly/partly, or no reply within 30 days of the RE receiving the complaint.',
  },
  filingWindow: {
    value: {
      description:
        'Within one year of receiving the RE reply; or, where no reply, within one year and 30 days of the complaint to the RE.',
      years: 1,
      graceDays: 30,
    },
    asOf: '2026-06-10',
    sourceUrl: SCHEME_2021_PDF,
    status: 'verified',
    note: 'Clause 10(2)(a)(ii).',
  },
  compensationFinancialLossMax: {
    value: 'Rs 20 lakh',
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2021_PDF,
    status: 'verified',
    note: 'Verbatim-read from the amended 2021 scheme text (clauses 8(2), 15(4)).',
  },
  compensationHarassmentMax: {
    value: 'Rs 1 lakh',
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2021_PDF,
    status: 'verified',
    note: 'Clause 15(5), verbatim-read.',
  },
  appealWindowDays: {
    value: 30,
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2021_PDF,
    status: 'verified',
    note: 'Clause 17(3): 30 days; under the 2021 scheme this covered both Awards AND rejections under 16(2)(c)-(f).',
  },
  appellateAuthority: {
    value: 'Executive Director, Consumer Education and Protection Department, RBI',
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2021_PDF,
    status: 'verified',
  },
  portalUrl: {
    value: 'https://cms.rbi.org.in',
    asOf: '2026-06-10',
    sourceUrl: SCHEME_2021_PDF,
    status: 'verified',
    note: 'Clause 11(1); portal confirmed live 2026-06-10.',
  },
  helpline: {
    value: '14448',
    asOf: '2026-06-10',
    sourceUrl: SCHEME_2021_PDF,
    status: 'verified',
  },
  crpcAddress: {
    value:
      'Centralised Receipt and Processing Centre (CRPC), 4th Floor, Reserve Bank of India, Sector 17, Chandigarh - 160017 (email: CRPC@rbi.org.in)',
    asOf: '2026-06-10',
    sourceUrl: SCHEME_2021_PDF,
    status: 'verified',
  },
  nonMaintainability: {
    value: [
      'Matter is in / decided by a court, tribunal, arbitrator or other forum (same cause of action)',
      'Complaint not first made in writing to the bank/NBFC, or made too early (30-day wait not met)',
      'Filed beyond the time window',
      'Complaint lodged through an advocate (unless the advocate is the aggrieved person)',
      'Abusive / frivolous / vexatious complaints',
      'Complaint to the RE was time-barred under the Limitation Act, 1963',
      'Commercial judgment of the entity; outsourcing-contract disputes; RE-vs-RE disputes; employment grievances',
      'Incomplete information (not as specified in clause 11)',
    ],
    asOf: '2026-06-10',
    sourceUrl: SCHEME_2021_PDF,
    status: 'verified',
    note: 'Clause 10(1)(a)-(j) and 10(2)(b)-(f), plain-English condensed.',
  },
}

const SCHEME_2026_PDF = 'https://rbidocs.rbi.org.in/rdocs/content/pdfs/SCHEME16012026_A.pdf'

export const RBIOS_2026: OmbudsmanScheme = {
  id: '2026',
  name: 'Reserve Bank - Integrated Ombudsman Scheme, 2026',
  inForceFrom: '2026-07-01',
  reFirstWaitDays: {
    value: 30,
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2026_PDF,
    status: 'verified',
    note: 'Clause 10(1)(e)-(f): complaint to the RE first (in writing OR any other mode with producible proof); escalate after no reply within 30 days OR the RBI/NPCI/Card-Network-specified time, WHICHEVER IS HIGHER, from the RE receiving it - or if not satisfied with the reply/resolution. Rejection is subsumed under "not satisfied".',
  },
  filingWindow: {
    value: {
      description:
        'Within 90 days from the date the clause 10(1)(f) timeline expires or the date of the last communication from the Regulated Entity, whichever is later. NO condonation/extension provision exists for this window.',
      days: 90,
    },
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2026_PDF,
    status: 'verified',
    note: 'Clause 10(1)(g), verbatim-verified. Drastic reduction from the 2021 one-year window.',
  },
  compensationFinancialLossMax: {
    value: 'Rs 30 lakh (consequential loss; the disputed amount itself is uncapped)',
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2026_PDF,
    status: 'verified',
    note: 'Clause 8(3), verbatim-verified.',
  },
  compensationHarassmentMax: {
    value: 'Rs 3 lakh (time lost, expenses, harassment/mental anguish)',
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2026_PDF,
    status: 'verified',
    note: 'Clause 8(3), verbatim-verified.',
  },
  appealWindowDays: {
    value: 30,
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2026_PDF,
    status: 'verified',
    note: 'Clause 17(3): within 30 days of receipt of an AWARD (Appellate Authority may allow +30 days for sufficient cause). IMPORTANT: under the 2026 scheme the complainant appeal lies ONLY against an Award under 15(1) - there is no appeal against rejection/closure (unlike 2021). Do not furnish the Award acceptance letter if you intend to appeal (cl.15(4) proviso).',
  },
  appellateAuthority: {
    value: 'Executive Director in-Charge of Consumer Education and Protection Department, RBI',
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2026_PDF,
    status: 'verified',
    note: 'Clause 3(1)(a).',
  },
  portalUrl: {
    value: 'https://cms.rbi.org.in',
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2026_PDF,
    status: 'verified',
    note: 'Clauses 6(2), 11(1).',
  },
  helpline: {
    value: '14448',
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2026_PDF,
    status: 'verified',
    note: 'Annex Part A para 7: IVRS 24x7; live agents Mon-Sat 8:00-22:00 (English, Hindi, ten regional languages).',
  },
  crpcAddress: {
    value:
      'Centralised Receipt and Processing Centre, 4th Floor, Reserve Bank of India, Sector 17, Central Vista, Chandigarh - 160017 (email: crpc@rbi.org.in)',
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2026_PDF,
    status: 'verified',
    note: 'Clause 6(2)/11(2) footnotes.',
  },
  nonMaintainability: {
    value: [
      'Not first complained to the bank/NBFC itself (any mode, with producible proof) - clause 10(1)(e)',
      'Filed before the escalation trigger: no reply within 30 days (or the higher regulatory TAT), and not dissatisfied with a reply - clause 10(1)(f)',
      'Filed beyond 90 days of the trigger/last RE communication, whichever later (no condonation) - clause 10(1)(g)',
      'Same matter pending/settled before an Ombudsman, court, tribunal or arbitrator (criminal proceedings carved out) - clauses 10(1)(h)-(k)',
      'Lodged through an advocate (unless the advocate is the aggrieved person) - clause 10(1)(b)',
      'Abusive / frivolous / vexatious - clause 10(1)(d)',
      'Complaint to the RE was time-barred under the Limitation Act 1963 - clause 10(1)(l)',
      'Excluded matters: commercial judgment, vendor-RE disputes (now ANY vendor dispute), management grievances, statutory/judicial-order compliance, outside RBI purview, RE-vs-RE, employment, CICRA remedy, non-covered customers - clause 10(2)(a)-(i)',
      'Incomplete information / RBI merely copied on correspondence - clauses 10(1)(a), 10(1)(c)',
      'NEW: non-maintainable complaints are rejected AT THE OUTSET without further examination - clause 10(3); portal complaints undergo system-based validation - clause 12',
    ],
    asOf: '2026-06-12',
    sourceUrl: SCHEME_2026_PDF,
    status: 'verified',
    note: 'Verbatim-read from the 2026 scheme text, all 24 pages.',
  },
}

// Repeal-and-saving (verified 2026-06-10 via press release): complaints received
// before 2026-07-01 remain governed by RB-IOS 2021.
export function schemeFor(filingDate: Date): OmbudsmanScheme {
  return filingDate >= new Date('2026-07-01T00:00:00+05:30') ? RBIOS_2026 : RBIOS_2021
}
