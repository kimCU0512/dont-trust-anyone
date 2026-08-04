import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DETECTOR_LIE_SYMBOL, DETECTOR_TRUTH_SYMBOL } from '../constants'
import { DetectorResult, DetectorScanning } from './DetectorResult'
import {
  getDetectorAnimation,
  getVisibleDetectorSymbol,
} from './detectorAnimation'

describe('DetectorResult', () => {
  it('uses an even rhythm and the truth symbol for truthful lines', () => {
    const animation = getDetectorAnimation('truth')

    expect(animation.symbol).toBe(DETECTOR_TRUTH_SYMBOL)
    expect(new Set(animation.delays.slice(1)).size).toBe(1)
  })

  it('uses an irregular rhythm and the lie symbol for lying lines', () => {
    const animation = getDetectorAnimation('lie')

    expect(animation.symbol).toBe(DETECTOR_LIE_SYMBOL)
    expect(new Set(animation.delays).size).toBeGreaterThan(1)
  })

  it('reveals the detector symbol incrementally', () => {
    expect(getVisibleDetectorSymbol('truth', 3)).toBe('...')
    expect(getVisibleDetectorSymbol('lie', 4)).toBe('.|.|')
  })

  it('renders distinct result variants', () => {
    const truthHtml = renderToStaticMarkup(
      <DetectorResult result="truth" onComplete={() => undefined} />,
    )
    const lieHtml = renderToStaticMarkup(
      <DetectorResult result="lie" onComplete={() => undefined} />,
    )

    expect(truthHtml).toContain('data-result="truth"')
    expect(lieHtml).toContain('data-result="lie"')
  })

  it('renders a neutral scanning panel before the result is known', () => {
    const html = renderToStaticMarkup(<DetectorScanning />)

    expect(html).toContain('detector-result--scanning')
    expect(html).toContain('음성 파형 분석 중')
    expect(html).not.toContain('data-result=')
  })
})
