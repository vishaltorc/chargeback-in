// The RBI CMS portal (cms.rbi.org.in) form spec and its OBSERVED input traps.
// Status 'observed': this is operational knowledge from a real end-to-end filed
// case (PRD §7.8), not published documentation. The portal can change without
// notice — the filing sheet tells users to expect minor drift.

export const CMS_FORM_AS_OF = '2026-06-12'
export const CMS_FORM_SOURCE = 'Observed during a real CMS filing (Recourse PRD §7.8); not officially documented'

export const FACTS_MAX_LEN = 2000
export const MAX_ATTACHMENTS = 10
export const MAX_AGGREGATE_MB = 10

// Characters the Facts box has been observed to reject.
export const FACTS_FORBIDDEN = ['"', "'", '(', ')', ':', '-', ';', '/', '\\'] as const

export interface CmsField {
  section: string
  field: string
  guidance: string // how the filing sheet derives the value
}

export const CMS_FIELDS: CmsField[] = [
  { section: 'Complainant details', field: 'Name', guidance: 'complainant.name' },
  { section: 'Complainant details', field: 'Category', guidance: 'Individual' },
  { section: 'Complainant details', field: 'Age / Gender', guidance: 'complainant.age / complainant.gender' },
  { section: 'Complainant details', field: 'Email / Mobile', guidance: 'complainant.email (mobile as registered with the bank)' },
  { section: 'Complainant details', field: 'State / District / Address / Pincode', guidance: 'complainant address fields' },
  { section: 'Details of complaint', field: 'Sub-judice / arbitration / decided elsewhere?', guidance: 'No (gate-checked; if Yes, the complaint is non-maintainable)' },
  { section: 'Details of complaint', field: 'Filed through an advocate?', guidance: 'No (advocates barred unless the complainant)' },
  { section: 'Details of complaint', field: 'Already with an Ombudsman?', guidance: 'No (gate-checked)' },
  { section: 'Details of complaint', field: 'Staff / employer-employee grievance?', guidance: 'No (gate-checked)' },
  { section: 'Regulated Entity', field: 'Complaint related to Credit Card?', guidance: 'Yes for card disputes; else No' },
  { section: 'Regulated Entity', field: 'Entity Name', guidance: 're.name (pick from the dropdown exactly)' },
  { section: 'Regulated Entity', field: 'Filed complaint with Entity?', guidance: 'Yes — mandatory precondition' },
  { section: 'Regulated Entity', field: 'Date complaint first filed', guidance: 're.complaintDate' },
  { section: 'Regulated Entity', field: 'Upload: complaint copy', guidance: 'Slot 1 — your written RE complaint (PDF)' },
  { section: 'Regulated Entity', field: 'Received reply?', guidance: 'Yes/No per re.replyDate; if Yes, date + upload reply PDF (Slot 2)' },
  { section: 'Regulated Entity', field: 'Sent reminder?', guidance: 'Yes/No per re.reminderDate; if Yes, date + upload (Slot 3, optional)' },
  { section: 'Regulated Entity', field: 'Against wallet? / Business Correspondent?', guidance: 'No (for card disputes)' },
  { section: 'Regulated Entity', field: 'Card number', guidance: 'Card last-4 with format the portal requires; never type the full PAN anywhere else' },
  { section: 'Complaint', field: 'Complaint category', guidance: 'Closest category to the mapped dispute type' },
  { section: 'Complaint', field: 'Facts of the complaint (free text)', guidance: 'PASTE THE SANITISED FACTS STRING (auto-generated, <= 2000 chars, portal-safe)' },
  { section: 'Complaint', field: 'Disputed amount', guidance: 'Whole-rupee figure; THE PORTAL DROPS DECIMALS — exact amount with decimals lives in the Facts text and PDFs' },
  { section: 'Complaint', field: 'Compensation sought (dispute / expenses-harassment)', guidance: 'Your figures; scheme caps shown alongside' },
  { section: 'Attachments', field: 'Additional attachments', guidance: `Up to ${MAX_ATTACHMENTS} files, aggregate <= ${MAX_AGGREGATE_MB} MB: evidence pack, correspondence log, invoices, representment docs` },
  { section: 'Authorisation', field: 'Representative? / Declaration', guidance: 'No / Accept' },
]

export const OBSERVED_TRAPS: string[] = [
  `The Facts box rejects special characters (observed: quotes, parentheses, colons, hyphens, decimal points). Use the auto-sanitised string.`,
  `The Facts box truncates at ${FACTS_MAX_LEN} characters. The generator produces a complete <= ${FACTS_MAX_LEN}-char version.`,
  'The Disputed Amount field silently drops decimals (9551.97 becomes 9551). Acceptable: the exact amount appears in the Facts and the attached PDFs.',
  `Keep aggregate attachments within ${MAX_AGGREGATE_MB} MB; compress images before building PDFs.`,
]
