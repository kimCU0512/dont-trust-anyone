import { describe, expect, it } from 'vitest'
import {
  advanceText,
  createTextBoxState,
  isTextSequenceComplete,
  revealNextCharacter,
} from './textBoxState'

const paragraphs = ['첫 번째 문단', '두 번째 문단']

describe('TextBox progression', () => {
  it('starts at the first paragraph with no visible characters', () => {
    expect(createTextBoxState()).toEqual({
      paragraphIndex: 0,
      visibleCharacters: 0,
    })
  })

  it('reveals one Unicode character at a time', () => {
    const result = revealNextCharacter(createTextBoxState(), ['👁학교'])

    expect(result.visibleCharacters).toBe(1)
  })

  it('reveals the entire current paragraph when advanced while typing', () => {
    const result = advanceText(
      { paragraphIndex: 0, visibleCharacters: 2 },
      paragraphs,
    )

    expect(result).toEqual({
      paragraphIndex: 0,
      visibleCharacters: Array.from(paragraphs[0]).length,
    })
  })

  it('moves to the next paragraph only after the current one is visible', () => {
    const result = advanceText(
      {
        paragraphIndex: 0,
        visibleCharacters: Array.from(paragraphs[0]).length,
      },
      paragraphs,
    )

    expect(result).toEqual({
      paragraphIndex: 1,
      visibleCharacters: 0,
    })
  })

  it('reports completion only after the final paragraph is visible', () => {
    expect(
      isTextSequenceComplete(
        {
          paragraphIndex: 1,
          visibleCharacters: Array.from(paragraphs[1]).length - 1,
        },
        paragraphs,
      ),
    ).toBe(false)

    expect(
      isTextSequenceComplete(
        {
          paragraphIndex: 1,
          visibleCharacters: Array.from(paragraphs[1]).length,
        },
        paragraphs,
      ),
    ).toBe(true)
  })
})
