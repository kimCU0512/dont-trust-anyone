import { useState } from 'react'
import { UI_STRINGS } from '../constants'
import { toDisplayParagraphs, toDisplayText } from '../data/contentText'
import story from '../data/story.json'
import { ConclusionArtwork } from './ConclusionArtwork'
import { TextBox } from './TextBox'
import {
  completeConclusionText,
  createConclusionFlowState,
} from './conclusionFlow'

interface EndingScreenProps {
  ending: 'true' | 'bad'
  onReturnToTitle: () => void
}

export function EndingScreen({
  ending,
  onReturnToTitle,
}: EndingScreenProps) {
  const isTrueEnding = ending === 'true'
  const endingContent = story.endings[ending]
  const [flow, setFlow] = useState(createConclusionFlowState)

  return (
    <section
      className={`screen screen--ending screen--ending-${ending}`}
      data-screen={isTrueEnding ? 'P-30' : 'P-31'}
    >
      <header className="conclusion-heading">
        <p className="screen__code">
          {isTrueEnding ? 'P-30 / ESCAPED' : 'P-31 / CAPTURED'}
        </p>
        <h1 className="screen__heading">{endingContent.label}</h1>
        <p>
          {isTrueEnding
            ? UI_STRINGS.trueEndingSubheading
            : UI_STRINGS.badEndingSubheading}
        </p>
      </header>

      <ConclusionArtwork
        imageUrl={endingContent.imageUrl}
        alt={
          isTrueEnding
            ? UI_STRINGS.trueEndingImageAlt
            : UI_STRINGS.badEndingImageAlt
        }
        variant={ending}
      />

      <div className="conclusion-copy">
        <TextBox
          paragraphs={toDisplayParagraphs(endingContent.text)}
          speaker="system"
          onComplete={() => setFlow(completeConclusionText)}
        />
      </div>

      {!isTrueEnding && 'hint' in endingContent && (
        <p className="ending-hint">
          <span>{UI_STRINGS.endingHint}</span>
          {toDisplayText(endingContent.hint)}
        </p>
      )}

      {flow.textComplete && (
        <button
          className="screen__action"
          type="button"
          onClick={onReturnToTitle}
        >
          {UI_STRINGS.playAgain}
        </button>
      )}
    </section>
  )
}
