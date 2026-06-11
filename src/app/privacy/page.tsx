import Link from 'next/link'

export const metadata = { title: 'Privacy & data — ChargeBack.in' }

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 text-zinc-800">
      <h1 className="text-2xl font-bold">Privacy &amp; data</h1>
      <p className="mt-2 text-sm text-zinc-600">
        This product handles financial-dispute data, so the architecture — not just the policy — is built to keep it
        yours.
      </p>

      <div className="mt-6 space-y-4 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold">Local-first, by construction</h2>
          <p>
            Your case — facts, contact details, eligibility answers, drafts, deadlines — lives in your browser&apos;s
            local storage on your device. There is no account, no database, and no server-side persistence of any
            case data. &quot;Export case file&quot; gives you the complete case as a JSON file; &quot;Delete my
            case&quot; removes it from the browser permanently.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">The one network call: AI drafting (optional)</h2>
          <p>
            When you click &quot;Draft with AI&quot;, the app sends a <em>minimised</em> payload to the drafting
            endpoint: the dispute facts (dates, amount, merchant, card last-4, mandate ID), the bank name and
            reference numbers, your saved grounds, and your correspondence notes. It deliberately excludes your name,
            address, email, and eligibility answers. The endpoint forwards it to the Claude API to word the draft and
            returns the text; nothing is stored. If you prefer zero network calls, use the &quot;fill-in
            template&quot; button instead — the product works completely without AI.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">What we never ask for</h2>
          <p>
            Your full card number (last 4 digits are sufficient everywhere, including the RBI form guidance), OTPs,
            passwords, or banking credentials. Anything asking for those is not this product.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">No analytics</h2>
          <p>No third-party analytics or advertising SDKs run on any page of this app.</p>
        </section>
        <section>
          <h2 className="font-semibold">Not legal advice</h2>
          <p>
            ChargeBack.in is not a law firm and does not provide legal advice. It helps you organise and file your own
            complaint, and it never predicts or guarantees outcomes. Regulatory values shown in the app carry their
            as-of dates and link to official sources — verify against those sources before relying on them.
          </p>
        </section>
      </div>

      <p className="mt-8 text-sm">
        <Link href="/" className="underline">
          ← Back to home
        </Link>
      </p>
    </main>
  )
}
