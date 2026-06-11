'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Card, Disclaimer } from '@/components/ui'
import { deleteCase, exportCase, importCase, loadCase, saveCase } from '@/lib/store'
import { Case } from '@/lib/case'

const STEPS = [
  ['Tell us what happened', 'Plain language, no jargon — under five minutes.'],
  ['Check it will stick', 'The RBI Ombudsman rejects complaints that skip steps. We gate every one.'],
  ['Get your legal grounds', 'Card-network dispute codes + the RBI rules involved — dated and source-linked.'],
  ['Draft the bank complaint', 'Firm, factual emails for every escalation level. You review, you send.'],
  ['Track every deadline', 'Including the 90-day Ombudsman window that kills late complaints.'],
  ['Fill the RBI form, trap-free', 'Field-by-field answers, pre-sanitised for the portal’s hidden input rules.'],
] as const

export default function Home() {
  const [existing, setExisting] = useState<Case | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setExisting(loadCase())
  }, [])

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight">ChargeBack.in</h1>
      <p className="mt-2 text-lg text-zinc-700">
        Your bank charged you wrongly. Fighting it properly used to cost more than the charge. Not anymore.
      </p>
      <p className="mt-2 text-sm text-zinc-600">
        Free, open, and <strong>local-first</strong>: your case lives only in this browser. Nothing is uploaded or
        stored on any server (the optional AI drafting step sends only the minimum case facts, and keeps nothing).
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/intake"
          className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          {existing?.disputeType ? 'Resume my case' : 'Start my case'}
        </Link>
        {existing && (
          <>
            <button
              type="button"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-100"
              onClick={() => {
                const blob = new Blob([exportCase(existing)], { type: 'application/json' })
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = 'chargeback-case.json'
                a.click()
                URL.revokeObjectURL(a.href)
              }}
            >
              Export case file
            </button>
            <button
              type="button"
              className={`rounded-md border px-4 py-2.5 text-sm font-medium ${confirmDelete ? 'border-red-600 bg-red-600 text-white' : 'border-red-300 bg-white text-red-700 hover:bg-red-50'}`}
              onClick={() => {
                if (!confirmDelete) return setConfirmDelete(true)
                deleteCase()
                setExisting(null)
                setConfirmDelete(false)
              }}
            >
              {confirmDelete ? 'Click again to permanently delete' : 'Delete my case'}
            </button>
          </>
        )}
        <button
          type="button"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-100"
          onClick={() => fileRef.current?.click()}
        >
          Import case file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            try {
              const imported = importCase(await f.text())
              saveCase(imported)
              setExisting(imported)
            } catch {
              alert('Not a valid ChargeBack.in case file.')
            }
          }}
        />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {STEPS.map(([t, d], i) => (
          <Card key={t}>
            <p className="text-sm font-semibold text-zinc-900">
              {i + 1}. {t}
            </p>
            <p className="mt-1 text-sm text-zinc-600">{d}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <Disclaimer />
        <p className="text-xs text-zinc-500">
          Built on a knowledge base verified against official sources (RBI scheme texts, Visa/Mastercard rulebooks,
          observed RBI CMS portal behaviour). Every regulatory value in the app carries its as-of date and source —
          and anything that could not be verified on an official source is labelled UNVERIFIED, never guessed. See{' '}
          <Link className="underline" href="/privacy">
            privacy &amp; data
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
