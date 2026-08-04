import { describe, expect, it } from 'vitest'
import { createInitialGameState } from '../hooks/useGameState'
import type { GamePhase } from '../types'
import { getGameBgmScene } from './gameBgm'

describe('game BGM scene selection', () => {
  it.each([
    ['title', null],
    ['intro', 'main'],
    ['reset', 'bad_E'],
    ['endingTrue', 'true_E'],
    ['endingBad', 'bad_E'],
  ] as const)('maps %s to its story track', (gamePhase, trackId) => {
    expect(
      getGameBgmScene({
        ...createInitialGameState(),
        gamePhase: gamePhase as GamePhase,
      }).trackId,
    ).toBe(trackId)
  })

  it('uses each stage track ID from story data', () => {
    expect(
      getGameBgmScene({
        ...createInitialGameState(),
        gamePhase: 'stage',
        stageId: 1,
      }),
    ).toEqual({ sceneKey: 'stage-1', trackId: 'main' })

    expect(
      getGameBgmScene({
        ...createInitialGameState(),
        gamePhase: 'stage',
        stageId: 5,
      }),
    ).toEqual({ sceneKey: 'stage-5', trackId: 'main' })
  })
})
