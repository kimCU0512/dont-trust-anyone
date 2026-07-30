import { describe, expect, it } from 'vitest'
import type { EvidenceEntry } from '../types'
import { addEvidence } from './evidenceJournalState'

const evidence: EvidenceEntry = {
  id: 's1-window',
  stageId: 1,
  stageName: '처음의 복도',
  label: '창밖',
  imageUrl: '/images/objects/s1-window.png',
  clue: '창밖에는 탈출로가 없다.',
}

describe('evidence journal state', () => {
  it('adds newly discovered evidence', () => {
    expect(addEvidence([], evidence)).toEqual([evidence])
  })

  it('does not add the same evidence twice', () => {
    const entries = [evidence]

    expect(addEvidence(entries, evidence)).toBe(entries)
  })
})
