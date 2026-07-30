import type { EvidenceEntry } from '../types'

export function addEvidence(
  entries: EvidenceEntry[],
  nextEntry: EvidenceEntry,
): EvidenceEntry[] {
  return entries.some((entry) => entry.id === nextEntry.id)
    ? entries
    : [...entries, nextEntry]
}
