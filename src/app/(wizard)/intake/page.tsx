'use client'

import Link from 'next/link'
import { Card, Field, PageHeader, inputCls } from '@/components/ui'
import { useCaseState } from '@/hooks/use-case'
import { DISPUTE_TYPE_LABELS, DisputeType } from '@/lib/case'

export default function IntakePage() {
  const { c, update } = useCaseState()
  if (!c) return null
  const f = c.facts

  return (
    <div className="space-y-5">
      <PageHeader
        title="What went wrong?"
        sub="Plain language only — pick the closest description and fill in what you know. You can come back any time; everything saves automatically in your browser."
      />

      <Card title="The problem">
        <div className="space-y-2">
          {(Object.entries(DISPUTE_TYPE_LABELS) as [DisputeType, string][]).map(([k, label]) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="disputeType"
                checked={c.disputeType === k}
                onChange={() => update((d) => void (d.disputeType = k))}
              />
              {label}
            </label>
          ))}
        </div>
        {c.disputeType === 'unauthorised' && (
          <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-800">
            <strong>Time matters:</strong> if you haven&apos;t told the bank yet, do it today — your liability for an
            unauthorised transaction depends on reporting within 3 working days (see the Grounds step).
          </p>
        )}
      </Card>

      <Card title="The charge">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Date on the statement">
            <input type="date" className={inputCls} value={f.transactionDate ?? ''} onChange={(e) => update((d) => void (d.facts.transactionDate = e.target.value))} />
          </Field>
          <Field label="Amount (₹)" hint="Exactly as it appears, with paise — e.g. 9551.97">
            <input className={inputCls} inputMode="decimal" value={f.amount ?? ''} onChange={(e) => update((d) => void (d.facts.amount = e.target.value.replace(/[^0-9.]/g, '')))} />
          </Field>
          <Field label="Merchant name (as on statement)">
            <input className={inputCls} value={f.merchant ?? ''} onChange={(e) => update((d) => void (d.facts.merchant = e.target.value))} />
          </Field>
          <Field label="Card — last 4 digits only" hint="Never enter the full card number anywhere in this app">
            <input className={inputCls} maxLength={4} inputMode="numeric" value={f.cardLast4 ?? ''} onChange={(e) => update((d) => void (d.facts.cardLast4 = e.target.value.replace(/\D/g, '')))} />
          </Field>
          <Field label="How was it paid?">
            <select className={inputCls} value={f.channel} onChange={(e) => update((d) => void (d.facts.channel = e.target.value as typeof f.channel))}>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Netbanking</option>
              <option value="other">Other</option>
            </select>
          </Field>
          {f.channel === 'card' && (
            <Field label="Card network" hint="The logo on your card">
              <select className={inputCls} value={f.network ?? 'unknown'} onChange={(e) => update((d) => void (d.facts.network = e.target.value as NonNullable<typeof f.network>))}>
                <option value="unknown">Not sure</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="rupay">RuPay</option>
              </select>
            </Field>
          )}
          <Field label="Mandate / SI Hub ID (if any)" hint="From the mandate registration or cancellation message">
            <input className={inputCls} value={f.mandateId ?? ''} onChange={(e) => update((d) => void (d.facts.mandateId = e.target.value))} />
          </Field>
          <Field label="International merchant?">
            <select className={inputCls} value={f.international ? 'yes' : 'no'} onChange={(e) => update((d) => void (d.facts.international = e.target.value === 'yes'))}>
              <option value="no">No / not sure</option>
              <option value="yes">Yes</option>
            </select>
          </Field>
        </div>

        {(c.disputeType === 'cancelled_recurring' || c.disputeType === 'no_predebit_notice') && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="When did you cancel?" hint="The date of your cancellation, if you cancelled">
              <input type="date" className={inputCls} value={f.cancellationDate ?? ''} onChange={(e) => update((d) => void (d.facts.cancellationDate = e.target.value))} />
            </Field>
            <Field label="How did you cancel?" hint="e.g. bank app, SI hub, merchant portal, email">
              <input className={inputCls} value={f.cancellationMethod ?? ''} onChange={(e) => update((d) => void (d.facts.cancellationMethod = e.target.value))} />
            </Field>
          </div>
        )}
        {c.disputeType === 'unauthorised' && (
          <div className="mt-3">
            <Field label="When did you report it to the bank?" hint="Leave blank if not yet — then report it today">
              <input type="date" className={inputCls} value={f.reportedDate ?? ''} onChange={(e) => update((d) => void (d.facts.reportedDate = e.target.value))} />
            </Field>
          </div>
        )}
        <div className="mt-3">
          <Field label="In one or two sentences, what happened?" hint="Your words — this anchors every draft">
            <textarea className={inputCls} rows={2} value={f.summary ?? ''} onChange={(e) => update((d) => void (d.facts.summary = e.target.value))} />
          </Field>
        </div>
      </Card>

      <Card title="Your bank, and where the complaint stands">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Bank / card issuer">
            <input className={inputCls} value={c.re.name ?? ''} onChange={(e) => update((d) => void (d.re.name = e.target.value))} />
          </Field>
          <Field label="Date you first complained in writing" hint="Leave blank if you haven't yet — the Drafts step writes it for you">
            <input type="date" className={inputCls} value={c.re.complaintDate ?? ''} onChange={(e) => update((d) => void (d.re.complaintDate = e.target.value || undefined))} />
          </Field>
          <Field label="Bank reference number(s)" hint="Comma-separated, exactly as the bank wrote them">
            <input className={inputCls} value={c.re.caseRefs.join(', ')} onChange={(e) => update((d) => void (d.re.caseRefs = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)))} />
          </Field>
          <Field label="Did the bank reply?">
            <select
              className={inputCls}
              value={c.re.replyKind ?? 'none'}
              onChange={(e) => update((d) => void (d.re.replyKind = e.target.value === 'none' ? undefined : (e.target.value as NonNullable<typeof c.re.replyKind>)))}
            >
              <option value="none">No reply yet</option>
              <option value="rejected">Rejected it</option>
              <option value="partly_rejected">Partly rejected it</option>
              <option value="unsatisfactory">Replied, but didn&apos;t fix it</option>
              <option value="resolved">Resolved it to my satisfaction</option>
            </select>
          </Field>
          {c.re.replyKind && c.re.replyKind !== 'resolved' && (
            <Field label="Date of the bank's reply">
              <input type="date" className={inputCls} value={c.re.replyDate ?? ''} onChange={(e) => update((d) => void (d.re.replyDate = e.target.value || undefined))} />
            </Field>
          )}
        </div>
      </Card>

      <Card title="About you (used only on the filing sheet)">
        <p className="mb-3 text-xs text-zinc-500">
          The RBI CMS form asks for these. They stay in your browser and are never sent to any server by this app.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ['name', 'Full name'],
              ['age', 'Age'],
              ['gender', 'Gender'],
              ['email', 'Email'],
              ['state', 'State'],
              ['district', 'District'],
              ['address', 'Address'],
              ['pincode', 'Pincode'],
            ] as const
          ).map(([k, label]) => (
            <Field key={k} label={label}>
              <input className={inputCls} value={c.complainant[k] ?? ''} onChange={(e) => update((d) => void (d.complainant[k] = e.target.value))} />
            </Field>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Link href="/gates" className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700">
          Continue → Eligibility check
        </Link>
      </div>
    </div>
  )
}
