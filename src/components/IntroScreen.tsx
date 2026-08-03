import { useState } from 'react'
import {
  DETECTOR_LIE_SYMBOL,
  DETECTOR_TRUTH_SYMBOL,
  UI_STRINGS,
} from '../constants'
import { resolveAssetUrl } from '../assets/assetUrl'
import { toDisplayParagraphs } from '../data/contentText'
import story from '../data/story.json'
import { TextBox } from './TextBox'
import { advanceIntroStep, canEnterFirstStage } from './introFlow'
import type { IntroStep } from './introFlow'

interface IntroScreenProps {
  onContinue: () => void
}

export function IntroScreen({ onContinue }: IntroScreenProps) {
  const [step, setStep] = useState<IntroStep>('narration')
  const [hasImageError, setHasImageError] = useState(false)
  const narration = toDisplayParagraphs(story.intro.narration)
  const tutorial = toDisplayParagraphs(story.intro.tutorial)
  const isTutorialVisible = step !== 'narration'
  const isReady = canEnterFirstStage(step)
  const advance = () => setStep((currentStep) => advanceIntroStep(currentStep))
  const skipDialogue = () => setStep('ready')

  return (
    <section className="screen screen--intro" data-screen="P-01">
      <header className="intro-header">
        <div>
          <p className="screen__code">P-01 / INTRO</p>
          <p className="intro-header__location">{UI_STRINGS.introLocation}</p>
        </div>
        <span className="intro-header__step">
          0{step === 'narration' ? 1 : 2} / 02
        </span>
      </header>

      <div className="intro-scene">
        <div
          className="intro-scene__visual"
          role="img"
          aria-label={UI_STRINGS.introImageAlt}
        >
          <div className="intro-scene__fallback" aria-hidden="true">
            <span className="intro-scene__door" />
          </div>
          {!hasImageError && (
            <img
              src={resolveAssetUrl(story.intro.imageUrl)}
              alt=""
              onError={() => setHasImageError(true)}
            />
          )}
          <span className="intro-scene__shade" aria-hidden="true" />
        </div>
        <div className="intro-scene__caption">
          <span>LOCKED</span>
          <h1>{UI_STRINGS.introHeading}</h1>
        </div>
        {!isReady && (
          <button
            type="button"
            className="stage-dialogue-skip intro-dialogue-skip"
            onClick={skipDialogue}
          >
            <span>SKIP</span>
            {UI_STRINGS.stageDialogueSkip}
          </button>
        )}
        <div className="intro-overlay">
          {isTutorialVisible && (
            <aside className="intro-tutorial" aria-label="탐지기 기호 범례">
              <div className="intro-tutorial__heading">
                <span>02.</span>
                {UI_STRINGS.introTutorialHeading}
              </div>
              <div className="intro-tutorial__signals">
                <div>
                  <strong>{DETECTOR_TRUTH_SYMBOL}</strong>
                  <span>{UI_STRINGS.introTutorialTruth}</span>
                </div>
                <div>
                  <strong>{DETECTOR_LIE_SYMBOL}</strong>
                  <span>{UI_STRINGS.introTutorialLie}</span>
                </div>
              </div>
            </aside>
          )}

          {step === 'narration' && (
            <TextBox
              key="intro-narration"
              paragraphs={narration}
              onComplete={advance}
            />
          )}

          {step === 'tutorial' && (
            <TextBox
              key="intro-tutorial"
              paragraphs={tutorial}
              speaker="system"
              onComplete={advance}
            />
          )}

          {isReady && (
            <div className="intro-ready">
              <p>{UI_STRINGS.introReady}</p>
              <button
                className="screen__action"
                type="button"
                onClick={onContinue}
              >
                {UI_STRINGS.enterStageOne}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
