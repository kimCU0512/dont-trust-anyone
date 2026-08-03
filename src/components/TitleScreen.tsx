import { useState } from 'react'
import { TITLE_BACKGROUND_URL, UI_STRINGS } from '../constants'
import { resolveAssetUrl } from '../assets/assetUrl'

interface TitleScreenProps {
  onStart: () => void
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  const [hasBackgroundError, setHasBackgroundError] = useState(false)
  const backgroundUrl = resolveAssetUrl(TITLE_BACKGROUND_URL)

  return (
    <section className="screen screen--title" data-screen="P-00">
      <div className="title-backdrop" aria-hidden="true">
        <div className="title-backdrop__fallback" />
        {!hasBackgroundError && (
          <img
            className="title-backdrop__image"
            src={backgroundUrl}
            alt={UI_STRINGS.titleBackgroundAlt}
            onError={() => setHasBackgroundError(true)}
          />
        )}
        <div className="title-backdrop__veil" />
      </div>

      <div className="title-content">
        <div className="title-content__chapter">
          <span>{UI_STRINGS.titleChapterNumber}</span>
          {UI_STRINGS.titleChapter}
        </div>
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
      </div>

      <p className="title-meta">NAN 2026 · TEXT HORROR ADVENTURE</p>
    </section>
  )
}
