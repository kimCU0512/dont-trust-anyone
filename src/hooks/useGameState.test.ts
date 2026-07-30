import { describe, expect, it } from 'vitest'
import {
  DETECTOR_HEART_COST,
  INITIAL_DETECTOR_USES,
  INITIAL_HEARTS,
  INITIAL_KEY_FRAGMENTS,
} from '../constants'
import story from '../data/story.json'
import { validateStory } from '../data/validateStory'
import type { GameState, StoryData } from '../types'
import {
  canUseDetector,
  createGameReducer,
  createInitialGameState,
  getDetectorResult,
} from './useGameState'

validateStory(story)
const storyData: StoryData = story

function stageState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialGameState(),
    gamePhase: 'stage',
    currentVoiceLineId: 's1-v1',
    ...overrides,
  }
}

describe('useGameState reducer', () => {
  it('creates the specified initial state', () => {
    expect(createInitialGameState()).toEqual({
      gamePhase: 'title',
      stageId: 1,
      hearts: INITIAL_HEARTS,
      keyFragments: INITIAL_KEY_FRAGMENTS,
      detectorUses: INITIAL_DETECTOR_USES,
      currentVoiceLineId: '',
      detectorUsedThisStage: false,
      textCursor: 0,
    })
  })

  it('starts a new game at the intro with reset resources', () => {
    const reducer = createGameReducer(storyData)
    const dirtyState = stageState({
      hearts: 1,
      keyFragments: 4,
      detectorUses: 0,
      stageId: 4,
    })

    expect(reducer(dirtyState, { type: 'START_GAME' })).toEqual({
      ...createInitialGameState(),
      gamePhase: 'intro',
    })
  })

  it('enters stage 1 and selects a voice line after the intro', () => {
    const reducer = createGameReducer(storyData, () => 0)
    const introState = reducer(createInitialGameState(), { type: 'START_GAME' })
    const result = reducer(introState, { type: 'COMPLETE_INTRO' })

    expect(result).toMatchObject({
      gamePhase: 'stage',
      stageId: 1,
      currentVoiceLineId: 's1-v1',
      detectorUsedThisStage: false,
      textCursor: 0,
    })
  })

  it('can randomly select another voice line', () => {
    const reducer = createGameReducer(storyData, () => 0.999)
    const result = reducer(
      { ...createInitialGameState(), gamePhase: 'intro' },
      { type: 'COMPLETE_INTRO' },
    )

    expect(result.currentVoiceLineId).toBe('s1-v2')
  })

  it('adds a key fragment and advances after a correct choice', () => {
    const reducer = createGameReducer(storyData, () => 0)
    const result = reducer(stageState(), {
      type: 'SELECT_CHOICE',
      choiceId: 'A',
    })

    expect(result).toMatchObject({
      gamePhase: 'stage',
      stageId: 2,
      hearts: INITIAL_HEARTS,
      keyFragments: 1,
      currentVoiceLineId: 's2-v1',
    })
  })

  it('removes a heart and advances after a wrong choice', () => {
    const reducer = createGameReducer(storyData, () => 0)
    const result = reducer(stageState(), {
      type: 'SELECT_CHOICE',
      choiceId: 'B',
    })

    expect(result).toMatchObject({
      gamePhase: 'stage',
      stageId: 2,
      hearts: INITIAL_HEARTS - 1,
      keyFragments: 0,
    })
  })

  it('goes to reset when a wrong choice consumes the last heart', () => {
    const reducer = createGameReducer(storyData)
    const result = reducer(stageState({ hearts: 1 }), {
      type: 'SELECT_CHOICE',
      choiceId: 'B',
    })

    expect(result).toMatchObject({
      gamePhase: 'reset',
      hearts: 0,
      stageId: 1,
    })
  })

  it('branches to the true ending with at least three fragments', () => {
    const reducer = createGameReducer(storyData)
    const result = reducer(
      stageState({
        stageId: 5,
        keyFragments: 2,
        currentVoiceLineId: 's5-v1',
      }),
      { type: 'SELECT_CHOICE', choiceId: 'A' },
    )

    expect(result).toMatchObject({
      gamePhase: 'endingTrue',
      keyFragments: 3,
    })
  })

  it('branches to the bad ending with fewer than three fragments', () => {
    const reducer = createGameReducer(storyData)
    const result = reducer(
      stageState({
        stageId: 5,
        keyFragments: 1,
        currentVoiceLineId: 's5-v1',
      }),
      { type: 'SELECT_CHOICE', choiceId: 'A' },
    )

    expect(result).toMatchObject({
      gamePhase: 'endingBad',
      keyFragments: 2,
    })
  })

  it('prioritizes reset over the stage 5 ending branch', () => {
    const reducer = createGameReducer(storyData)
    const result = reducer(
      stageState({
        stageId: 5,
        hearts: 1,
        keyFragments: 4,
        currentVoiceLineId: 's5-v1',
      }),
      { type: 'SELECT_CHOICE', choiceId: 'B' },
    )

    expect(result).toMatchObject({
      gamePhase: 'reset',
      hearts: 0,
      keyFragments: 4,
    })
  })

  it('fully resets resources and draws a new line when restarting', () => {
    const reducer = createGameReducer(storyData, () => 0.999)
    const result = reducer(
      stageState({
        gamePhase: 'reset',
        hearts: 0,
        keyFragments: 3,
        detectorUses: 0,
        stageId: 5,
      }),
      { type: 'RESTART_GAME' },
    )

    expect(result).toEqual({
      ...createInitialGameState(),
      gamePhase: 'stage',
      currentVoiceLineId: 's1-v2',
    })
  })

  it('returns to a fully reset title state from an ending', () => {
    const reducer = createGameReducer(storyData)
    const result = reducer(
      stageState({ gamePhase: 'endingTrue', keyFragments: 5 }),
      { type: 'RETURN_TO_TITLE' },
    )

    expect(result).toEqual(createInitialGameState())
  })

  it('uses the detector by spending one heart and one use', () => {
    const reducer = createGameReducer(storyData)
    const result = reducer(stageState(), { type: 'USE_DETECTOR' })

    expect(result).toMatchObject({
      hearts: INITIAL_HEARTS - DETECTOR_HEART_COST,
      detectorUses: INITIAL_DETECTOR_USES - 1,
      detectorUsedThisStage: true,
    })
    expect(getDetectorResult(result, storyData)).toBe('truth')
  })

  it('returns a lie result for a lying voice line', () => {
    const reducer = createGameReducer(storyData)
    const result = reducer(
      stageState({
        stageId: 2,
        currentVoiceLineId: 's2-v1',
      }),
      { type: 'USE_DETECTOR' },
    )

    expect(getDetectorResult(result, storyData)).toBe('lie')
  })

  it('does not expose a result before the detector is used', () => {
    expect(getDetectorResult(stageState(), storyData)).toBeNull()
  })

  it('disables the detector when only one heart remains', () => {
    const reducer = createGameReducer(storyData)
    const state = stageState({ hearts: 1 })

    expect(canUseDetector(state)).toBe(false)
    expect(reducer(state, { type: 'USE_DETECTOR' })).toBe(state)
  })

  it('disables the detector when no uses remain', () => {
    const reducer = createGameReducer(storyData)
    const state = stageState({ detectorUses: 0 })

    expect(canUseDetector(state)).toBe(false)
    expect(reducer(state, { type: 'USE_DETECTOR' })).toBe(state)
  })

  it('prevents using the detector twice in one stage', () => {
    const reducer = createGameReducer(storyData)
    const firstUse = reducer(stageState(), { type: 'USE_DETECTOR' })
    const secondUse = reducer(firstUse, { type: 'USE_DETECTOR' })

    expect(canUseDetector(firstUse)).toBe(false)
    expect(secondUse).toBe(firstUse)
  })
})
