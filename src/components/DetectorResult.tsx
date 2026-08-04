import { useEffect, useRef, useState } from 'react'
import { UI_STRINGS } from '../constants'
import type { DetectorResult as DetectorResultType } from '../types'
import {
  getDetectorAnimation,
  getVisibleDetectorSymbol,
} from './detectorAnimation'

const RESULT_HOLD_MS = 420

interface DetectorResultProps {
  result: DetectorResultType
  onComplete: () => void
}

export function DetectorScanning() {
  return (
    <div
      className="detector-result detector-result--scanning"
      role="status"
      aria-label={UI_STRINGS.detectorScanning}
    >
      <div className="detector-result__header">
        <span>{UI_STRINGS.detectorScanning}</span>
        <span className="detector-result__status-light" aria-hidden="true" />
      </div>
      <div
        className="detector-result__display detector-result__display--scanning"
        aria-hidden="true"
      >
        {Array.from({ length: 7 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <div
        className="detector-result__meter detector-result__meter--scanning"
        aria-hidden="true"
      >
        <span />
      </div>
    </div>
  )
}

export function DetectorResult({ result, onComplete }: DetectorResultProps) {
  const [visibleCharacters, setVisibleCharacters] = useState(0)
  const completionCalledRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  const animation = getDetectorAnimation(result)
  const characters = Array.from(animation.symbol)
  const isComplete = visibleCharacters >= characters.length

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!isComplete) {
      const delay = animation.delays[visibleCharacters] ?? 200
      const timer = window.setTimeout(() => {
        setVisibleCharacters((count) => Math.min(count + 1, characters.length))
      }, delay)

      return () => window.clearTimeout(timer)
    }

    if (completionCalledRef.current) {
      return
    }

    const timer = window.setTimeout(() => {
      completionCalledRef.current = true
      onCompleteRef.current()
    }, RESULT_HOLD_MS)

    return () => window.clearTimeout(timer)
  }, [animation.delays, characters.length, isComplete, visibleCharacters])

  const visibleSymbol = getVisibleDetectorSymbol(result, visibleCharacters)

  return (
    <div
      className={`detector-result detector-result--${result}`}
      role="status"
      aria-label={UI_STRINGS.detectorResultLabel}
      data-result={result}
      data-complete={isComplete}
    >
      <div className="detector-result__header">
        <span>
          {isComplete
            ? UI_STRINGS.detectorSignalLocked
            : UI_STRINGS.detectorScanning}
        </span>
        <span className="detector-result__status-light" aria-hidden="true" />
      </div>
      <div className="detector-result__display" aria-hidden="true">
        {Array.from(visibleSymbol).map((character, index) => (
          <span
            className={
              character === '|'
                ? 'detector-result__bar'
                : 'detector-result__dot'
            }
            key={`${character}-${index}`}
          >
            {character}
          </span>
        ))}
      </div>
      <span className="visually-hidden" aria-live="polite">
        {visibleSymbol}
      </span>
      <div className="detector-result__meter" aria-hidden="true">
        <span
          style={{
            width: `${(visibleCharacters / characters.length) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
