// Deficiency-in-service patterns observed in real bank correspondence (PRD §2.2
// + the dispute-desk deflection catalogue). Each correspondence event the user
// logs maps to one of these; together they form the deficiency log that
// strengthens the Ombudsman complaint beyond the core chargeback ask.

import { CorrespondenceKind } from '@/lib/case'

export const DEFICIENCY_DESCRIPTIONS: Partial<
  Record<CorrespondenceKind, { label: string; whyItMatters: string }>
> = {
  false_closure: {
    label: 'Case closed on a factually wrong basis',
    whyItMatters:
      "Closing a complaint while the disputed debit is on the bank's own statement (e.g. 'no debit was processed') contradicts the bank's own records.",
  },
  inconsistent_refs: {
    label: 'Inconsistent case reference numbers',
    whyItMatters:
      'Different reference numbers cited in the same thread fragment the record and restart clocks; noting each one documents the inconsistency.',
  },
  silent_extension: {
    label: 'Resolution deadline silently extended',
    whyItMatters:
      'The bank extended its own committed timeline without notice or consent — a service deficiency in itself.',
  },
  contradicts_own_records: {
    label: "Reply contradicts the bank's own records",
    whyItMatters:
      "E.g. 'international merchant transactions do not require authorisation' against the RBI pre-debit-notification mandate, or denying a debit shown on the bank's statement.",
  },
  merchant_representment_incomplete: {
    label: 'Merchant representment accepted despite omissions',
    whyItMatters:
      'The bank accepted merchant evidence that omits the cancellation record, and moved to reverse the provisional credit without giving you the documents to rebut.',
  },
  burden_shift: {
    label: 'Burden shifted to the customer',
    whyItMatters:
      'E.g. demanding you obtain a refund letter from the merchant who is contesting you, or making you chase the merchant for an issuer-side dispute.',
  },
  block_card_precondition: {
    label: 'Card block demanded as a precondition',
    whyItMatters:
      'Blocking addresses credential compromise; demanding it for a mandate/billing dispute imposes cost without addressing the complaint.',
  },
}
