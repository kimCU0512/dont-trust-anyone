export interface TextBoxState {
  paragraphIndex: number
  visibleCharacters: number
}

export function createTextBoxState(): TextBoxState {
  return {
    paragraphIndex: 0,
    visibleCharacters: 0,
  }
}

function getCharacters(paragraph: string): string[] {
  return Array.from(paragraph)
}

export function getParagraphCharacters(paragraph: string): string[] {
  return getCharacters(paragraph)
}

export function revealNextCharacter(
  state: TextBoxState,
  paragraphs: string[],
): TextBoxState {
  const paragraph = paragraphs[state.paragraphIndex]

  if (paragraph === undefined) {
    return state
  }

  const characterCount = getCharacters(paragraph).length

  return {
    ...state,
    visibleCharacters: Math.min(
      state.visibleCharacters + 1,
      characterCount,
    ),
  }
}

export function advanceText(
  state: TextBoxState,
  paragraphs: string[],
): TextBoxState {
  const paragraph = paragraphs[state.paragraphIndex]

  if (paragraph === undefined) {
    return state
  }

  const characterCount = getCharacters(paragraph).length

  if (state.visibleCharacters < characterCount) {
    return {
      ...state,
      visibleCharacters: characterCount,
    }
  }

  if (state.paragraphIndex < paragraphs.length - 1) {
    return {
      paragraphIndex: state.paragraphIndex + 1,
      visibleCharacters: 0,
    }
  }

  return state
}

export function isTextSequenceComplete(
  state: TextBoxState,
  paragraphs: string[],
): boolean {
  if (paragraphs.length === 0) {
    return true
  }

  const isLastParagraph = state.paragraphIndex === paragraphs.length - 1
  const characterCount = getCharacters(
    paragraphs[state.paragraphIndex] ?? '',
  ).length

  return isLastParagraph && state.visibleCharacters >= characterCount
}
