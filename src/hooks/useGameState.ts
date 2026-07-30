import { useReducer } from 'react'
import type { Reducer } from 'react'
import {
  DETECTOR_HEART_COST,
  INITIAL_DETECTOR_USES,
  INITIAL_HEARTS,
  INITIAL_KEY_FRAGMENTS,
  MIN_HEARTS_FOR_DETECTOR,
  TOTAL_STAGES,
  TRUE_END_KEY_FRAGMENT_THRESHOLD,
  WRONG_CHOICE_HEART_COST,
} from '../constants'
import story from '../data/story.json'
import { validateStory } from '../data/validateStory'
import type {
  DetectorResult,
  GameState,
  Stage,
  StageId,
  StoryData,
} from '../types'

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'COMPLETE_INTRO' }
  | { type: 'USE_DETECTOR' }
  | { type: 'SELECT_CHOICE'; choiceId: string }
  | { type: 'RESTART_GAME' }
  | { type: 'RETURN_TO_TITLE' }

export interface UseGameStateResult {
  state: GameState
  startGame: () => void
  completeIntro: () => void
  canUseDetector: boolean
  detectorResult: DetectorResult | null
  useDetector: () => DetectorResult | null
  selectChoice: (choiceId: string) => void
  restartGame: () => void
  returnToTitle: () => void
}

validateStory(story)
const storyData: StoryData = story

export function createInitialGameState(): GameState {
  return {
    gamePhase: 'title',
    stageId: 1,
    hearts: INITIAL_HEARTS,
    keyFragments: INITIAL_KEY_FRAGMENTS,
    detectorUses: INITIAL_DETECTOR_USES,
    currentVoiceLineId: '',
    detectorUsedThisStage: false,
    textCursor: 0,
  }
}

function getStage(data: StoryData, stageId: StageId): Stage {
  const stage = data.stages.find((candidate) => candidate.id === stageId)

  if (!stage) {
    throw new Error(`Stage ${stageId} does not exist`)
  }

  return stage
}

export function canUseDetector(state: GameState): boolean {
  return (
    state.gamePhase === 'stage' &&
    state.detectorUses >= 1 &&
    state.hearts >= MIN_HEARTS_FOR_DETECTOR &&
    !state.detectorUsedThisStage
  )
}

function resolveDetectorResult(
  state: GameState,
  data: StoryData,
): DetectorResult | null {
  if (state.gamePhase !== 'stage') {
    return null
  }

  const voiceLine = getStage(data, state.stageId).voiceLines.find(
    (candidate) => candidate.id === state.currentVoiceLineId,
  )

  if (!voiceLine) {
    return null
  }

  return voiceLine.isLie ? 'lie' : 'truth'
}

export function getDetectorResult(
  state: GameState,
  data: StoryData,
): DetectorResult | null {
  return state.detectorUsedThisStage
    ? resolveDetectorResult(state, data)
    : null
}

function pickVoiceLineId(stage: Stage, random: () => number): string {
  if (stage.voiceLines.length === 0) {
    throw new Error(`Stage ${stage.id} has no voice lines`)
  }

  const randomIndex = Math.min(
    Math.floor(Math.max(random(), 0) * stage.voiceLines.length),
    stage.voiceLines.length - 1,
  )

  return stage.voiceLines[randomIndex].id
}

function enterStage(
  state: GameState,
  stageId: StageId,
  data: StoryData,
  random: () => number,
): GameState {
  const stage = getStage(data, stageId)

  return {
    ...state,
    gamePhase: 'stage',
    stageId,
    currentVoiceLineId: pickVoiceLineId(stage, random),
    detectorUsedThisStage: false,
    textCursor: 0,
  }
}

export function createGameReducer(
  data: StoryData,
  random: () => number = Math.random,
): Reducer<GameState, GameAction> {
  return (state, action) => {
    switch (action.type) {
      case 'START_GAME':
        return {
          ...createInitialGameState(),
          gamePhase: 'intro',
        }

      case 'COMPLETE_INTRO':
        return state.gamePhase === 'intro'
          ? enterStage(state, 1, data, random)
          : state

      case 'USE_DETECTOR':
        return canUseDetector(state)
          ? {
              ...state,
              hearts: state.hearts - DETECTOR_HEART_COST,
              detectorUses: state.detectorUses - 1,
              detectorUsedThisStage: true,
            }
          : state

      case 'SELECT_CHOICE': {
        if (state.gamePhase !== 'stage') {
          return state
        }

        const stage = getStage(data, state.stageId)
        const choice = stage.choices.find(
          (candidate) => candidate.id === action.choiceId,
        )

        if (!choice) {
          return state
        }

        const hearts = choice.isCorrect
          ? state.hearts
          : Math.max(0, state.hearts - WRONG_CHOICE_HEART_COST)
        const keyFragments = choice.isCorrect
          ? state.keyFragments + 1
          : state.keyFragments

        if (hearts === 0) {
          return {
            ...state,
            gamePhase: 'reset',
            hearts,
            keyFragments,
          }
        }

        if (state.stageId === TOTAL_STAGES) {
          return {
            ...state,
            gamePhase:
              keyFragments >= TRUE_END_KEY_FRAGMENT_THRESHOLD
                ? 'endingTrue'
                : 'endingBad',
            hearts,
            keyFragments,
          }
        }

        const nextStageId = (state.stageId + 1) as StageId

        return enterStage(
          {
            ...state,
            hearts,
            keyFragments,
          },
          nextStageId,
          data,
          random,
        )
      }

      case 'RESTART_GAME':
        return enterStage(createInitialGameState(), 1, data, random)

      case 'RETURN_TO_TITLE':
        return createInitialGameState()
    }
  }
}

const gameReducer = createGameReducer(storyData)

export function useGameState(): UseGameStateResult {
  const [state, dispatch] = useReducer(gameReducer, createInitialGameState())
  const detectorAvailable = canUseDetector(state)
  const detectorResult = getDetectorResult(state, storyData)

  return {
    state,
    startGame: () => dispatch({ type: 'START_GAME' }),
    completeIntro: () => dispatch({ type: 'COMPLETE_INTRO' }),
    canUseDetector: detectorAvailable,
    detectorResult,
    useDetector: () => {
      if (!detectorAvailable) {
        return null
      }

      const result = resolveDetectorResult(state, storyData)
      dispatch({ type: 'USE_DETECTOR' })
      return result
    },
    selectChoice: (choiceId) =>
      dispatch({ type: 'SELECT_CHOICE', choiceId }),
    restartGame: () => dispatch({ type: 'RESTART_GAME' }),
    returnToTitle: () => dispatch({ type: 'RETURN_TO_TITLE' }),
  }
}
