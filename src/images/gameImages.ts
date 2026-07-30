import { TITLE_BACKGROUND_URL } from '../constants'
import story from '../data/story.json'
import type { GameState } from '../types'

function getStageImageUrls(stageIndex: number): string[] {
  const stage = story.stages[stageIndex]

  if (!stage) {
    return []
  }

  const imageUrls = [stage.imageUrl]

  if (
    'fallbackImageUrl' in stage &&
    typeof stage.fallbackImageUrl === 'string'
  ) {
    imageUrls.push(stage.fallbackImageUrl)
  }

  return imageUrls
}

export function getUpcomingImageUrls(state: GameState): string[] {
  switch (state.gamePhase) {
    case 'title':
      return [story.intro.imageUrl]
    case 'intro':
      return getStageImageUrls(0)
    case 'stage':
      if (state.stageId < 5) {
        return getStageImageUrls(state.stageId)
      }

      return [
        story.reset.imageUrl,
        story.endings.true.imageUrl,
        story.endings.bad.imageUrl,
      ]
    case 'reset':
      return getStageImageUrls(0)
    case 'endingTrue':
    case 'endingBad':
      return [TITLE_BACKGROUND_URL]
  }
}
