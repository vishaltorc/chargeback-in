'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const STEPS = [
  ['/intake', '1. Intake'],
  ['/gates', '2. Eligibility'],
  ['/grounds', '3. Grounds'],
  ['/drafts', '4. Drafts'],
  ['/dossier', '5. Dossier'],
  ['/filing', '6. RBI Filing'],
  ['/tracker', '7. Deadlines'],
] as const

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-6">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm print:hidden">
        <Link href="/" className="mr-2 font-bold text-zinc-900">
          ChargeBack.in
        </Link>
        {STEPS.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={`rounded-md px-2.5 py-1 ${path === href ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-200'}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  )
}
