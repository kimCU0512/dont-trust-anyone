import { useEffect, useRef, useState } from 'react'
import { TEXT_TYPING_INTERVAL_MS, UI_STRINGS } from '../constants'
import {
  advanceText,
  createTextBoxState,
  getParagraphCharacters,
  isTextSequenceComplete,
  revealNextCharacter,
} from './textBoxState'
import type { TextBoxState } from './textBoxState'

export type TextBoxSpeaker = 'narration' | 'voice' | 'system'

interface TextBoxProps {
  paragraphs: string[]
  speaker?: TextBoxSpeaker
  typingIntervalMs?: number
  onComplete?: () => void
}

const speakerLabel: Record<TextBoxSpeaker, string> = {
  narration: UI_STRINGS.textBoxNarration,
  voice: UI_STRINGS.textBoxVoice,
  system: UI_STRINGS.textBoxSystem,
}

export function TextBox({
  paragraphs,
  speaker = 'narration',
  typingIntervalMs = TEXT_TYPING_INTERVAL_MS,
  onComplete,
}: TextBoxProps) {
  const [state, setState] = useState<TextBoxState>(createTextBoxState)
  const completionCalledRef = useRef(false)
  const paragraphKey = paragraphs.join('\u0000')
  const currentParagraph = paragraphs[state.paragraphIndex] ?? ''
  const currentCharacters = getParagraphCharacters(currentParagraph)
  const isCurrentParagraphComplete =
    state.visibleCharacters >= currentCharacters.length
  const isComplete = isTextSequenceComplete(state, paragraphs)

  useEffect(() => {
    setState(createTextBoxState())
    completionCalledRef.current = false
  }, [paragraphKey])

  useEffect(() => {
    if (isCurrentParagraphComplete || paragraphs.length === 0) {
      return
    }

    const timer = window.setTimeout(() => {
      setState((currentState) =>
        revealNextCharacter(currentState, paragraphs),
      )
    }, typingIntervalMs)

    return () => window.clearTimeout(timer)
  }, [
    isCurrentParagraphComplete,
    paragraphs,
    state.visibleCharacters,
    typingIntervalMs,
  ])

  const handleAdvance = () => {
    if (isComplete) {
      if (!completionCalledRef.current) {
        completionCalledRef.current = true
        onComplete?.()
      }
      return
    }

    setState((currentState) => advanceText(currentState, paragraphs))
  }

  const visibleText = currentCharacters
    .slice(0, state.visibleCharacters)
    .join('')

  return (
    <button
      className={`text-box text-box--${speaker}`}
      type="button"
      onClick={handleAdvance}
      aria-label={speakerLabel[speaker]}
    >
      <span className="text-box__header">
        <span className="text-box__speaker">{speakerLabel[speaker]}</span>
        {paragraphs.length > 0 && (
          <span className="text-box__progress">
            {state.paragraphIndex + 1} / {paragraphs.length}
          </span>
        )}
      </span>
      <span className="text-box__body" aria-live="polite">
        {visibleText}
        {!isCurrentParagraphComplete && (
          <span className="text-box__cursor" aria-hidden="true" />
        )}
      </span>
      <span className="text-box__hint">
        {isCurrentParagraphComplete
          ? UI_STRINGS.textBoxAdvanceHint
          : UI_STRINGS.textBoxTypingHint}
      </span>
    </button>
  )
}
