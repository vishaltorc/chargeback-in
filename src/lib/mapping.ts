// The legal mapping engine — deterministic, auditable, config-driven (PRD §7.4).
// The LLM never decides grounds; it only words what this table outputs.
// Two-pillar principle: attach at least one card-network ground AND one RBI
// ground wherever both exist; flag rail-agnostic grounds as the most defensible.

import { Case, CardNetwork, CorrespondenceEvent, DisputeType, GroundCitation, Grounds } from './case'
import { NETWORK_CODES } from '@/config/knowledge/network-codes'
import { RBI_RULES } from '@/config/knowledge/rbi-rules'
import { DEFICIENCY_DESCRIPTIONS } from '@/config/knowledge/deficiencies'

function networkPick(
  network: CardNetwork | undefined,
  visaKey: string,
  mcKey: string
): GroundCitation[] {
  if (network === 'visa') return [NETWORK_CODES[visaKey]]
  if (network === 'mastercard') return [NETWORK_CODES[mcKey]]
  if (network === 'rupay') return [NETWORK_CODES.rupay_generic]
  // unknown: show both candidates and tell the user to check the card face
  return [NETWORK_CODES[visaKey], NETWORK_CODES[mcKey]]
}

export function mapGrounds(c: Case): Grounds {
  const t = c.disputeType
  const net = c.facts.network
  const notes: string[] = []
  let network: GroundCitation[] = []
  let rbi: GroundCitation[] = []

  switch (t) {
    case 'cancelled_recurring':
      network = networkPick(net, 'visa_13_2', 'mc_4853_recurring')
      rbi = [RBI_RULES.emandate_withdrawal, RBI_RULES.emandate_predebit_notice, RBI_RULES.emandate_liability_bridge]
      notes.push(
        'Your cancellation date must precede the charge date — it is the load-bearing fact; evidence it first.',
        'The pre-debit-notification ground is rail-agnostic: it stands even if the merchant argues "card-on-file" instead of "e-mandate".'
      )
      break
    case 'no_predebit_notice':
      network = networkPick(net, 'visa_13_2', 'mc_4853_recurring')
      rbi = [RBI_RULES.emandate_predebit_notice, RBI_RULES.emandate_liability_bridge]
      notes.push(
        'The 24-hour pre-debit notification duty is amount-independent and applies to every recurring debit on an Indian-issued card.'
      )
      break
    case 'unauthorised':
      network = networkPick(net, 'visa_10_4', 'mc_4837')
      rbi = [RBI_RULES.liability_zero_3days, RBI_RULES.liability_burden_on_bank, RBI_RULES.liability_shadow_credit]
      notes.push(
        'URGENT: report to the bank in writing TODAY if not already done — zero liability depends on reporting within 3 working days.',
        'Do not also call this a billing dispute: fraud and consumer-dispute code families are mutually exclusive at the networks.'
      )
      break
    case 'not_delivered':
      network = networkPick(net, 'visa_13_1', 'mc_goods_not_provided')
      rbi = [RBI_RULES.deficiency_in_service]
      notes.push(
        'Networks expect a documented attempt to resolve with the merchant first — one written attempt with a deadline, then the bank.'
      )
      break
    case 'duplicate':
      network = networkPick(net, 'visa_12_6', 'mc_duplicate')
      rbi = [RBI_RULES.deficiency_in_service]
      notes.push(
        'Mastercard allows only 90 days from settlement for duplicate-processing chargebacks — shorter than the usual 120. Move fast.'
      )
      break
    case 'refund_not_processed':
      network = networkPick(net, 'visa_13_6', 'mc_4853_refund')
      rbi = [RBI_RULES.deficiency_in_service]
      notes.push(
        'Keep the refund promise (receipt, email, chat) front and centre — the network condition runs from its date.'
      )
      break
    default:
      rbi = [RBI_RULES.deficiency_in_service]
      notes.push(
        'No specific network code mapped for this dispute type yet; the complaint proceeds on RBI/service-deficiency grounds. Describe the facts precisely and the bank must classify it.'
      )
  }

  if (network.some((g) => g.status === 'UNVERIFIED')) {
    notes.push(
      'One or more cited categories could not be verified against a public official source — the drafts will name the fact pattern and ask the bank (which has rulebook access) to file under the applicable category, rather than asserting a code.'
    )
  }
  if (c.facts.channel !== 'card') {
    notes.push(
      'Card-network chargeback codes apply to card transactions. For UPI/netbanking the RBI grounds carry the complaint.'
    )
    network = []
  }

  return { network, rbi, notes }
}

export interface Deficiency {
  kind: CorrespondenceEvent['kind']
  date: string
  label: string
  whyItMatters: string
  note: string
  ref?: string
}

export function buildDeficiencyLog(events: CorrespondenceEvent[]): Deficiency[] {
  return events
    .filter((e) => e.kind in DEFICIENCY_DESCRIPTIONS)
    .map((e) => {
      const d = DEFICIENCY_DESCRIPTIONS[e.kind]!
      return { kind: e.kind, date: e.date, label: d.label, whyItMatters: d.whyItMatters, note: e.note, ref: e.ref }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}
