// Local-first persistence: the Case lives ONLY in the user's browser storage.
// No server, no sync, no analytics. Export/import gives the user full custody;
// deleteCase is the one-tap "delete my case" control (PRD §10).

import { Case, newCase } from './case'

const KEY = 'cbk.case.v1'

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function storage(custom?: StorageLike): StorageLike | null {
  if (custom) return custom
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export function loadCase(s?: StorageLike): Case | null {
  const st = storage(s)
  if (!st) return null
  const raw = st.getItem(KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Case
    if (parsed.schemaVersion !== 1) return null // future migrations hook here
    return parsed
  } catch {
    return null
  }
}

export function saveCase(c: Case, s?: StorageLike): void {
  const st = storage(s)
  if (!st) return
  st.setItem(KEY, JSON.stringify(c))
}

export function deleteCase(s?: StorageLike): void {
  const st = storage(s)
  if (!st) return
  st.removeItem(KEY)
}

export function getOrCreateCase(s?: StorageLike): Case {
  return loadCase(s) ?? newCase()
}

export function exportCase(c: Case): string {
  return JSON.stringify(c, null, 2)
}

export function importCase(json: string): Case {
  const parsed = JSON.parse(json) as Case
  if (parsed.schemaVersion !== 1 || typeof parsed.id !== 'string') {
    throw new Error('Not a valid ChargeBack.in case file')
  }
  return parsed
}
