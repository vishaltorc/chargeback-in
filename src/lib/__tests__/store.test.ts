import { describe, it, expect } from 'vitest'
import { newCase } from '@/lib/case'
import { loadCase, saveCase, deleteCase, exportCase, importCase } from '@/lib/store'

function memStorage() {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  }
}

describe('store', () => {
  it('round-trips a case', () => {
    const s = memStorage()
    const c = newCase()
    c.facts.amount = '9551.97'
    saveCase(c, s)
    const back = loadCase(s)
    expect(back?.id).toBe(c.id)
    expect(back?.facts.amount).toBe('9551.97') // decimals preserved as string
  })

  it('delete clears the case', () => {
    const s = memStorage()
    saveCase(newCase(), s)
    deleteCase(s)
    expect(loadCase(s)).toBeNull()
  })

  it('export/import preserves the case and rejects junk', () => {
    const c = newCase()
    expect(importCase(exportCase(c)).id).toBe(c.id)
    expect(() => importCase('{"nope":true}')).toThrow()
  })

  it('every new case carries schemaVersion 1', () => {
    expect(newCase().schemaVersion).toBe(1)
  })
})
