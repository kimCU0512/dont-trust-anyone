import { describe, expect, it } from 'vitest'
import { TITLE_BACKGROUND_URL } from '../constants'
import story from '../data/story.json'
import { createInitialGameState } from '../hooks/useGameState'
import { getUpcomingImageUrls } from './gameImages'

describe('upcoming game images', () => {
  it('preloads stage 1 during the intro', () => {
    expect(
      getUpcomingImageUrls({
        ...createInitialGameState(),
        gamePhase: 'intro',
      }),
    ).toEqual([story.stages[0].imageUrl])
  })

  it('preloads the next stage and its optional fallback', () => {
    expect(
      getUpcomingImageUrls({
        ...createInitialGameState(),
        gamePhase: 'stage',
        stageId: 4,
      }),
    ).toEqual([
      story.stages[4].imageUrl,
      story.stages[4].fallbackImageUrl,
    ])
  })

  it('preloads every possible destination while playing stage 5', () => {
    expect(
      getUpcomingImageUrls({
        ...createInitialGameState(),
        gamePhase: 'stage',
        stageId: 5,
      }),
    ).toEqual([
      story.reset.imageUrl,
      story.endings.true.imageUrl,
      story.endings.bad.imageUrl,
    ])
  })

  it('preloads replay and title destinations', () => {
    expect(
      getUpcomingImageUrls({
        ...createInitialGameState(),
        gamePhase: 'reset',
      }),
    ).toEqual([story.stages[0].imageUrl])

    expect(
      getUpcomingImageUrls({
        ...createInitialGameState(),
        gamePhase: 'endingTrue',
      }),
    ).toEqual([TITLE_BACKGROUND_URL])
  })
})
