import { useReducer } from 'react'
import type { Reducer } from 'react'
import {
  INITIAL_DETECTOR_USES,
  INITIAL_HEARTS,
  INITIAL_KEY_FRAGMENTS,
  TOTAL_STAGES,
  TRUE_END_KEY_FRAGMENT_THRESHOLD,
  WRONG_CHOICE_HEART_COST,
} from '../constants'
import story from '../data/story.json'
import { validateStory } from '../data/validateStory'
import type { GameState, Stage, StageId, StoryData } from '../types'

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'COMPLETE_INTRO' }
  | { type: 'SELECT_CHOICE'; choiceId: string }
  | { type: 'RESTART_GAME' }
  | { type: 'RETURN_TO_TITLE' }

export interface UseGameStateResult {
  state: GameState
  startGame: () => void
  completeIntro: () => void
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

  return {
    state,
    startGame: () => dispatch({ type: 'START_GAME' }),
    completeIntro: () => dispatch({ type: 'COMPLETE_INTRO' }),
    selectChoice: (choiceId) =>
      dispatch({ type: 'SELECT_CHOICE', choiceId }),
    restartGame: () => dispatch({ type: 'RESTART_GAME' }),
    returnToTitle: () => dispatch({ type: 'RETURN_TO_TITLE' }),
  }
}
