import { useEffect, useMemo, useState } from 'react'
import { resolveAssetUrl } from '../assets/assetUrl'
import { MAX_EVIDENCE_COUNT, UI_STRINGS } from '../constants'
import type { EvidenceEntry } from '../types'

interface EvidenceJournalProps {
  entries: EvidenceEntry[]
}

export function EvidenceJournal({ entries }: EvidenceJournalProps) {
  const [isOpen, setIsOpen] = useState(false)
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
    if (!isOpen) {
      return
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  const openJournal = () => {
    setSelectedId(entries.at(-1)?.id ?? null)
    setIsOpen(true)
  }

  return (
    <>
      <button
        type="button"
        className="evidence-journal-toggle"
        aria-expanded={isOpen}
        onClick={openJournal}
      >
        <span aria-hidden="true">▤</span>
        <strong>{UI_STRINGS.evidenceJournal}</strong>
        <small>
          {entries.length} / {MAX_EVIDENCE_COUNT}
        </small>
      </button>

      {isOpen && (
        <div
          className="evidence-journal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false)
            }
          }}
        >
          <section
            className="evidence-journal"
            role="dialog"
            aria-modal="true"
            aria-label={UI_STRINGS.evidenceJournal}
          >
            <header className="evidence-journal__header">
              <div>
                <span>CASE FILE / 05:17</span>
                <h2>{UI_STRINGS.evidenceJournal}</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)}>
                {UI_STRINGS.evidenceClose}
              </button>
            </header>

            {entries.length === 0 ? (
              <div className="evidence-journal__empty">
                <span aria-hidden="true">?</span>
                <p>{UI_STRINGS.evidenceEmpty}</p>
              </div>
            ) : (
              <div className="evidence-journal__body">
                <nav
                  className="evidence-journal__index"
                  aria-label={UI_STRINGS.evidenceIndex}
                >
                  {[...groupedEntries.entries()].map(
                    ([stageId, stageEntries]) => (
                      <div key={stageId}>
                        <p>
                          STAGE 0{stageId} · {stageEntries[0].stageName}
                        </p>
                        {stageEntries.map((entry) => (
                          <button
                            type="button"
                            key={entry.id}
                            className={
                              selectedEntry?.id === entry.id
                                ? 'evidence-journal__item--selected'
                                : undefined
                            }
                            onClick={() => setSelectedId(entry.id)}
                          >
                            <span aria-hidden="true">×</span>
                            {entry.label}
                          </button>
                        ))}
                      </div>
                    ),
                  )}
                </nav>

                {selectedEntry && (
                  <article className="evidence-journal__detail">
                    <div className="evidence-journal__photo">
                      <img
                        src={resolveAssetUrl(selectedEntry.imageUrl)}
                        alt=""
                      />
                      <span>0{selectedEntry.stageId}</span>
                    </div>
                    <p className="evidence-journal__location">
                      {selectedEntry.stageName}
                    </p>
                    <h3>{selectedEntry.label}</h3>
                    <p className="evidence-journal__clue">
                      {selectedEntry.clue}
                    </p>
                    <footer>
                      <span>{UI_STRINGS.evidenceVerified}</span>
                      {selectedEntry.id}
                    </footer>
                  </article>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}
