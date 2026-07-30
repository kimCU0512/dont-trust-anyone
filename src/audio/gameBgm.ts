import story from '../data/story.json'
import type { GameState } from '../types'

export interface GameBgmScene {
  sceneKey: string
  trackId: string | null
}

export function getGameBgmScene(state: GameState): GameBgmScene {
  switch (state.gamePhase) {
    case 'title':
      return { sceneKey: 'title', trackId: null }
    case 'intro':
      return { sceneKey: 'intro', trackId: story.intro.bgmTrack }
    case 'stage': {
      const stage = story.stages.find(
        (candidate) => candidate.id === state.stageId,
      )

      return {
        sceneKey: `stage-${state.stageId}`,
        trackId: stage?.bgmTrack ?? null,
      }
    }
    case 'reset':
      return { sceneKey: 'reset', trackId: null }
    case 'endingTrue':
      return {
        sceneKey: 'ending-true',
        trackId: story.endings.true.bgmTrack,
      }
    case 'endingBad':
      return {
        sceneKey: 'ending-bad',
        trackId: story.endings.bad.bgmTrack,
      }
  }
}
