import { describe, expect, it } from 'vitest'
import story from './story.json'
import { validateStory } from './validateStory'

type MutableStory = typeof story

function copyStory(): MutableStory {
  return structuredClone(story)
}

describe('validateStory', () => {
  it('accepts the current story data', () => {
    expect(() => validateStory(story)).not.toThrow()
  })

  it('rejects a missing required field', () => {
    const invalidStory = copyStory()
    invalidStory.stages[0].name = ''

    expect(() => validateStory(invalidStory)).toThrow(/name/)
  })

  it('rejects a story without exactly five stages', () => {
    const invalidStory = copyStory()
    invalidStory.stages.pop()

    expect(() => validateStory(invalidStory)).toThrow(/exactly 5/)
  })

  it('rejects a stage with more than one correct choice', () => {
    const invalidStory = copyStory()
    invalidStory.stages[0].choices[1].isCorrect = true

    expect(() => validateStory(invalidStory)).toThrow(
      /exactly one correct choice/,
    )
  })

  it('rejects a truthful line with a contradiction reference', () => {
    const invalidStory = copyStory()
    invalidStory.stages[0].voiceLines[0].contradictsStage = 1

    expect(() => validateStory(invalidStory)).toThrow(
      /must be null for a truthful line/,
    )
  })

  it('rejects a lie without a contradiction reference', () => {
    const invalidStory = copyStory()
    invalidStory.stages[1].voiceLines[0].contradictsStage = null

    expect(() => validateStory(invalidStory)).toThrow(
      /must reference a valid stage/,
    )
  })
})
