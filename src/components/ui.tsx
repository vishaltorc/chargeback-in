'use client'

import { useState } from 'react'

export function Card({ title, children, tone = 'default' }: { title?: string; children: React.ReactNode; tone?: 'default' | 'warn' | 'danger' | 'ok' }) {
  const tones = {
    default: 'border-zinc-200 bg-white',
    warn: 'border-amber-300 bg-amber-50',
    danger: 'border-red-300 bg-red-50',
    ok: 'border-emerald-300 bg-emerald-50',
  }
  return (
    <section className={`rounded-lg border p-4 ${tones[tone]}`}>
      {title && <h3 className="mb-2 font-semibold text-zinc-900">{title}</h3>}
      {children}
    </section>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-zinc-700">{label}</span>
      {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  )
}

export const inputCls =
  'w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none bg-white'

export function YesNo({ value, onChange }: { value: boolean | undefined; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      {[
        { label: 'Yes', v: true },
        { label: 'No', v: false },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onChange(o.v)}
          className={`rounded-md border px-4 py-1.5 text-sm ${value === o.v ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'verified'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'observed'
        ? 'bg-sky-100 text-sky-800'
        : 'bg-amber-100 text-amber-900'
  return <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase ${cls}`}>{status}</span>
}

export function UrgencyBadge({ urgency }: { urgency: 'ok' | 'soon' | 'critical' | 'expired' }) {
  const map = {
    ok: 'bg-emerald-100 text-emerald-800',
    soon: 'bg-amber-100 text-amber-900',
    critical: 'bg-red-100 text-red-800',
    expired: 'bg-zinc-800 text-white',
  }
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${map[urgency]}`}>{urgency}</span>
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? 'Copied ✓' : label}
    </button>
  )
}

export function Disclaimer() {
  return (
    <p className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600">
      <strong>ChargeBack.in is not a law firm and does not provide legal advice.</strong> It helps you organise and
      file your own complaint. No outcome is predicted or guaranteed. Review every draft and every filing-sheet value
      yourself before using it; verify regulatory citations against the linked official sources.
    </p>
  )
}

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="mb-4">
      <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
      {sub && <p className="mt-1 text-sm text-zinc-600">{sub}</p>}
    </header>
  )
}
