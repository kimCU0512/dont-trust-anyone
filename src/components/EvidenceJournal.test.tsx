import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MAX_EVIDENCE_COUNT, UI_STRINGS } from '../constants'
import type { EvidenceEntry } from '../types'
import { EvidenceJournal } from './EvidenceJournal'

const evidence: EvidenceEntry = {
  id: 's1-window',
  stageId: 1,
  stageName: '처음의 복도',
  label: '창밖',
  imageUrl: '/images/objects/s1-window.png',
  clue: '창밖에는 탈출로가 없다.',
}

describe('EvidenceJournal', () => {
  it('renders the global evidence count', () => {
    const html = renderToStaticMarkup(<EvidenceJournal entries={[evidence]} />)

    expect(html).toContain(UI_STRINGS.evidenceJournal)
    expect(html).toContain(`1 / ${MAX_EVIDENCE_COUNT}`)
  })
})
