// The printable "filing sheet": every CMS field with the exact value to paste
// or select, the sanitised Facts string, and the upload-slot map (PRD §7.8).

import { Case } from './case'
import { CMS_FIELDS, OBSERVED_TRAPS, CMS_FORM_AS_OF, MAX_ATTACHMENTS, MAX_AGGREGATE_MB } from '@/config/knowledge/cms-form'
import { composeFacts } from './sanitize'

export interface FilingRow {
  section: string
  field: string
  value: string
  note?: string
}

export interface FilingSheet {
  rows: FilingRow[]
  facts: { text: string; truncated: boolean }
  uploadMap: { slot: string; document: string }[]
  traps: string[]
  asOf: string
}

const yn = (b: boolean | undefined) => (b === undefined ? 'ANSWER REQUIRED' : b ? 'Yes' : 'No')

export function buildFilingSheet(c: Case): FilingSheet {
  const facts = composeFacts(c)
  const f = c.facts
  const wholeRupees = f.amount ? f.amount.split('.')[0] : ''

  const valueFor = (field: string): { value: string; note?: string } => {
    switch (field) {
      case 'Name':
        return { value: c.complainant.name ?? '' }
      case 'Category':
        return { value: 'Individual' }
      case 'Age / Gender':
        return { value: [c.complainant.age, c.complainant.gender].filter(Boolean).join(' / ') }
      case 'Email / Mobile':
        return { value: c.complainant.email ?? '', note: 'Use the mobile number registered with the bank.' }
      case 'State / District / Address / Pincode':
        return {
          value: [c.complainant.state, c.complainant.district, c.complainant.address, c.complainant.pincode]
            .filter(Boolean)
            .join(', '),
        }
      case 'Sub-judice / arbitration / decided elsewhere?':
        return { value: yn(c.eligibility.subJudice) }
      case 'Filed through an advocate?':
        return { value: yn(c.eligibility.throughAdvocate) }
      case 'Already with an Ombudsman?':
        return { value: yn(c.eligibility.alreadyWithOmbudsman) }
      case 'Staff / employer-employee grievance?':
        return { value: yn(c.eligibility.staffGrievance) }
      case 'Complaint related to Credit Card?':
        return { value: f.channel === 'card' ? 'Yes' : 'No' }
      case 'Entity Name':
        return { value: c.re.name ?? '', note: 'Pick the exact name from the portal dropdown.' }
      case 'Filed complaint with Entity?':
        return { value: 'Yes' }
      case 'Date complaint first filed':
        return { value: c.re.complaintDate ?? '' }
      case 'Upload: complaint copy':
        return { value: 'Attach: your written complaint to the bank (PDF)' }
      case 'Received reply?':
        return c.re.replyDate
          ? { value: `Yes — ${c.re.replyDate}`, note: 'Attach the bank reply PDF in the reply slot.' }
          : { value: 'No' }
      case 'Sent reminder?':
        return c.re.reminderDate ? { value: `Yes — ${c.re.reminderDate}` } : { value: 'No' }
      case 'Against wallet? / Business Correspondent?':
        return { value: 'No / No' }
      case 'Card number':
        return { value: f.cardLast4 ? `Card ending ${f.cardLast4}` : '', note: 'Enter in the format the portal asks; never type the full card number anywhere else.' }
      case 'Complaint category':
        return { value: 'Select the category closest to your dispute type (see the grounds page).' }
      case 'Facts of the complaint (free text)':
        return { value: 'PASTE THE SANITISED FACTS BELOW (copy button provided)' }
      case 'Disputed amount':
        return {
          value: wholeRupees,
          note: f.amount?.includes('.')
            ? `Portal drops decimals: the exact amount Rs ${f.amount} is stated in the Facts text and the attached PDFs.`
            : undefined,
        }
      case 'Compensation sought (dispute / expenses-harassment)':
        return { value: '', note: 'Your figures; the scheme caps are shown on the tracker page.' }
      case 'Additional attachments':
        return { value: `Up to ${MAX_ATTACHMENTS} files, total <= ${MAX_AGGREGATE_MB} MB — see upload map below.` }
      case 'Representative? / Declaration':
        return { value: 'No / Accept' }
      default:
        return { value: '' }
    }
  }

  const rows: FilingRow[] = CMS_FIELDS.map((fld) => {
    const v = valueFor(fld.field)
    return { section: fld.section, field: fld.field, value: v.value, note: v.note }
  })

  const uploadMap = [
    { slot: 'Complaint copy (mandatory)', document: 'Your written RE complaint as sent (PDF)' },
    { slot: 'Reply copy (if reply received)', document: "The bank's reply (PDF)" },
    { slot: 'Reminder copy (optional)', document: 'Your reminder email (PDF)' },
    {
      slot: `Additional attachments (max ${MAX_ATTACHMENTS}, <= ${MAX_AGGREGATE_MB} MB total)`,
      document: 'Complaint summary PDF, correspondence log PDF, statement extracts, invoices, merchant representment docs',
    },
  ]

  return { rows, facts, uploadMap, traps: [...OBSERVED_TRAPS], asOf: CMS_FORM_AS_OF }
}
