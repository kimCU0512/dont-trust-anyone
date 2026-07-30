import { useEffect, useMemo, useState } from 'react'
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
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedEntry =
    entries.find((entry) => entry.id === selectedId) ?? entries.at(-1) ?? null
  const groupedEntries = useMemo(
    () =>
      entries.reduce<Map<number, EvidenceEntry[]>>((groups, entry) => {
        const stageEntries = groups.get(entry.stageId) ?? []
        groups.set(entry.stageId, [...stageEntries, entry])
        return groups
      }, new Map()),
    [entries],
  )

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

  useEffect(() => {
    if (entries.length > 0) {
      setSelectedId(entries.at(-1)?.id ?? null)
    }
  }, [entries])

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
            <span>CASE FILE / LIVE</span>
            <h2>{UI_STRINGS.evidenceJournal}</h2>
          </div>
          <strong>
            {entries.length} / {MAX_EVIDENCE_COUNT}
          </strong>
          <button type="button" onClick={() => setIsMobileOpen(false)}>
            {UI_STRINGS.evidenceClose}
          </button>
        </header>

        <section className="evidence-signal" aria-label="현재 목소리 대조">
          <span>현재 수신 음성 · STAGE 0{currentStageId}</span>
          <blockquote>{currentVoiceText}</blockquote>
          <p>아래 판별 메모와 이 문장의 장소·숫자·행동을 대조하라.</p>
        </section>

        {entries.length === 0 ? (
          <div className="evidence-panel__empty">
            <span aria-hidden="true">?</span>
            <p>{UI_STRINGS.evidenceEmpty}</p>
            <small>장면의 빛나는 지점을 직접 조사해야 기록됩니다.</small>
          </div>
        ) : (
          <>
            <nav
              className="evidence-panel__index"
              aria-label={UI_STRINGS.evidenceIndex}
            >
              {[...groupedEntries.entries()].map(([stageId, stageEntries]) => (
                <div key={stageId}>
                  <p>STAGE 0{stageId}</p>
                  {stageEntries.map((entry) => (
                    <button
                      type="button"
                      key={entry.id}
                      className={
                        selectedEntry?.id === entry.id
                          ? 'evidence-panel__item--selected'
                          : undefined
                      }
                      onClick={() => setSelectedId(entry.id)}
                    >
                      <span aria-hidden="true">×</span>
                      {entry.label}
                    </button>
                  ))}
                </div>
              ))}
            </nav>

            {selectedEntry && (
              <article className="evidence-panel__detail">
                <div className="evidence-panel__photo">
                  <img src={resolveAssetUrl(selectedEntry.imageUrl)} alt="" />
                  <span>0{selectedEntry.stageId}</span>
                </div>
                <p className="evidence-panel__location">
                  {selectedEntry.stageName} · 직접 확인
                </p>
                <h3>{selectedEntry.label}</h3>
                <p className="evidence-panel__clue">{selectedEntry.clue}</p>
                <div className="evidence-panel__deduction">
                  <span>VOICE CROSS-CHECK / 판별 메모</span>
                  <p>{selectedEntry.deduction}</p>
                </div>
              </article>
            )}
          </>
        )}
      </aside>
    </>
  )
}
