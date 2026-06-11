// Every regulatory value in this app is a dated, sourced, reviewable entry.
// 'verified'   = read from the official source on asOf date
// 'UNVERIFIED' = could not be confirmed on an official source — UI must surface this
// 'observed'   = operational knowledge from a real filed case, not a regulation
export type KnowledgeStatus = 'verified' | 'UNVERIFIED' | 'observed'

export interface Sourced<T> {
  value: T
  asOf: string // YYYY-MM-DD the source was actually loaded
  sourceUrl: string
  status: KnowledgeStatus
  note?: string
}
