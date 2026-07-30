const TODO_CONTENT_PREFIX = /^TODO_CONTENT:\s*/

export function toDisplayText(text: string): string {
  return text.replace(TODO_CONTENT_PREFIX, '').replaceAll('`', '')
}

export function toDisplayParagraphs(paragraphs: string[]): string[] {
  return paragraphs.map(toDisplayText)
}
