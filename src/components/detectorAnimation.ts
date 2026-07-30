import {
  DETECTOR_LIE_SYMBOL,
  DETECTOR_TRUTH_SYMBOL,
} from '../constants'
import type { DetectorResult } from '../types'

export interface DetectorAnimation {
  symbol: string
  delays: readonly number[]
}

const detectorAnimations: Record<DetectorResult, DetectorAnimation> = {
  truth: {
    symbol: DETECTOR_TRUTH_SYMBOL,
    delays: [120, 220, 220, 220, 220],
  },
  lie: {
    symbol: DETECTOR_LIE_SYMBOL,
    delays: [80, 245, 95, 185, 70, 265, 115],
  },
}

export function getDetectorAnimation(
  result: DetectorResult,
): DetectorAnimation {
  return detectorAnimations[result]
}

export function getVisibleDetectorSymbol(
  result: DetectorResult,
  visibleCharacters: number,
): string {
  return Array.from(getDetectorAnimation(result).symbol)
    .slice(0, visibleCharacters)
    .join('')
}
