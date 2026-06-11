'use client'

// The one way UI pages read/write the canonical Case. Loads from localStorage
// after mount (SSR-safe), saves on every update.

import { useCallback, useEffect, useState } from 'react'
import { Case } from '@/lib/case'
import { getOrCreateCase, saveCase } from '@/lib/store'

export function useCaseState() {
  const [c, setC] = useState<Case | null>(null)

  useEffect(() => {
    setC(getOrCreateCase())
  }, [])

  const update = useCallback((fn: (draft: Case) => void) => {
    setC((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      fn(next)
      saveCase(next)
      return next
    })
  }, [])

  return { c, update }
}
