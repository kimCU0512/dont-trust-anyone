import { useState } from 'react'
import { UI_STRINGS } from '../constants'

const TITLE_BACKGROUND_URL = '/images/title_abandoned_school.png'

interface TitleScreenProps {
  onStart: () => void
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  const [isBgmEnabled, setIsBgmEnabled] = useState(true)
  const [hasBackgroundError, setHasBackgroundError] = useState(false)

  return (
    <section className="screen screen--title" data-screen="P-00">
      <div className="title-backdrop" aria-hidden="true">
        <div className="title-backdrop__fallback" />
        {!hasBackgroundError && (
          <img
            className="title-backdrop__image"
            src={TITLE_BACKGROUND_URL}
            alt={UI_STRINGS.titleBackgroundAlt}
            onError={() => setHasBackgroundError(true)}
          />
        )}
        <div className="title-backdrop__veil" />
      </div>

      <div className="title-controls">
        <span className="title-controls__label">{UI_STRINGS.bgm}</span>
        <button
          className="title-controls__toggle"
          type="button"
          aria-pressed={isBgmEnabled}
          onClick={() => setIsBgmEnabled((enabled) => !enabled)}
        >
          {isBgmEnabled ? UI_STRINGS.bgmOn : UI_STRINGS.bgmOff}
        </button>
      </div>

      <div className="title-content">
        <div className="title-content__chapter">
          <span>{UI_STRINGS.titleChapterNumber}</span>
          {UI_STRINGS.titleChapter}
        </div>
        <p className="screen__eyebrow">{UI_STRINGS.titleEnglish}</p>
        <h1 className="screen__title">{UI_STRINGS.title}</h1>
        <span className="title-content__rule" aria-hidden="true" />
        <p className="title-content__tagline">{UI_STRINGS.titleTagline}</p>
        <button
          className="screen__action title-content__start"
          type="button"
          onClick={onStart}
        >
          {UI_STRINGS.start}
        </button>
        <div className="title-content__facts" aria-label="게임 정보">
          <span>{UI_STRINGS.titleStageCount}</span>
          <span>{UI_STRINGS.titleEndingCount}</span>
          <span>{UI_STRINGS.titlePlayTime}</span>
        </div>
      </div>

      <p className="title-meta">NAN 2026 · TEXT HORROR ADVENTURE</p>
    </section>
  )
}
