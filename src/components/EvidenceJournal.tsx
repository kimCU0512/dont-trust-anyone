import { useEffect, useState } from 'react'
import { resolveAssetUrl } from '../assets/assetUrl'
import { MAX_EVIDENCE_COUNT, UI_STRINGS } from '../constants'
import type { EvidenceEntry, StageId } from '../types'

interface EvidenceJournalProps {
  entries: EvidenceEntry[]
  currentVoiceText: string
  currentStageId: StageId
}

export function EvidenceJournal({
  entries,
  currentVoiceText,
  currentStageId,
}: EvidenceJournalProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    if (!isMobileOpen) {
      return
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isMobileOpen])

  return (
    <>
      <button
        type="button"
        className="evidence-mobile-toggle"
        aria-expanded={isMobileOpen}
        onClick={() => setIsMobileOpen(true)}
      >
        <span aria-hidden="true">▤</span>
        {UI_STRINGS.evidenceJournal}
        <small>
          {entries.length}/{MAX_EVIDENCE_COUNT}
        </small>
      </button>

      <aside
        className={`evidence-panel${isMobileOpen ? ' evidence-panel--open' : ''}`}
        aria-label={UI_STRINGS.evidenceJournal}
      >
        <header className="evidence-panel__header">
          <div>
            <span>CASE LOG / 05:17</span>
            <h2>{UI_STRINGS.evidenceJournal}</h2>
          </div>
          <strong>
            {entries.length} / {MAX_EVIDENCE_COUNT}
          </strong>
          <button type="button" onClick={() => setIsMobileOpen(false)}>
            {UI_STRINGS.evidenceClose}
          </button>
        </header>

        <section className="evidence-signal" aria-label="현재 수신 음성">
          <span>REC · STAGE 0{currentStageId}</span>
          <blockquote>{currentVoiceText}</blockquote>
        </section>

        {entries.length === 0 ? (
          <div className="evidence-panel__empty">
            <span aria-hidden="true">?</span>
            <p>{UI_STRINGS.evidenceEmpty}</p>
          </div>
        ) : (
          <ol className="evidence-log" aria-label={UI_STRINGS.evidenceIndex}>
            {entries
              .map((entry, index) => ({ entry, index }))
              .reverse()
              .map(({ entry, index }) => (
                <li className="evidence-log__entry" key={entry.id}>
                  <div className="evidence-log__meta">
                    <span>
                      05:{17 + index} · STAGE 0{entry.stageId}
                    </span>
                    <small>{entry.stageName}</small>
                  </div>
                  <div className="evidence-log__record">
                    <img src={resolveAssetUrl(entry.imageUrl)} alt="" />
                    <div>
                      <h3>{entry.label}</h3>
                      <p>{entry.clue}</p>
                    </div>
                  </div>
                </li>
              ))}
          </ol>
        )}
      </aside>
    </>
  )
}
