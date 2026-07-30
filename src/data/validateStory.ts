import { TOTAL_STAGES } from '../constants'
import type {
  Choice,
  PointOfInterest,
  Stage,
  StageId,
  StoryData,
  VoiceLine,
} from '../types'

const STAGE_IDS: StageId[] = [1, 2, 3, 4, 5]

function fail(message: string): never {
  throw new Error(`Invalid story data: ${message}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  return isRecord(value) ? value : fail(`${path} must be an object`)
}

function requireString(value: unknown, path: string): string {
  return typeof value === 'string' && value.length > 0
    ? value
    : fail(`${path} must be a non-empty string`)
}

function requireBoolean(value: unknown, path: string): boolean {
  return typeof value === 'boolean' ? value : fail(`${path} must be a boolean`)
}

function requireArray(value: unknown, path: string): unknown[] {
  return Array.isArray(value) ? value : fail(`${path} must be an array`)
}

function validateVoiceLine(
  value: unknown,
  path: string,
  stageId: StageId,
): VoiceLine {
  const voiceLine = requireRecord(value, path)
  const isLie = requireBoolean(voiceLine.isLie, `${path}.isLie`)
  const contradictsStage = voiceLine.contradictsStage

  if (isLie) {
    if (!STAGE_IDS.includes(contradictsStage as StageId)) {
      fail(`${path}.contradictsStage must reference a valid stage for a lie`)
    }

    const referencedStage = contradictsStage as StageId
    const stageGap = stageId - referencedStage

    if (stageGap < 0 || stageGap > 2) {
      fail(
        `${path}.contradictsStage must reference the current or one of the previous two stages`,
      )
    }
  } else if (contradictsStage !== null) {
    fail(`${path}.contradictsStage must be null for a truthful line`)
  }

  return {
    id: requireString(voiceLine.id, `${path}.id`),
    text: requireString(voiceLine.text, `${path}.text`),
    isLie,
    contradictsStage: contradictsStage as StageId | null,
  }
}

function requireCoordinate(value: unknown, path: string): number {
  return typeof value === 'number' && value >= 0 && value <= 100
    ? value
    : fail(`${path} must be a number from 0 to 100`)
}

function validatePointOfInterest(
  value: unknown,
  path: string,
): PointOfInterest {
  const object = requireRecord(value, path)
  const position = requireRecord(object.position, `${path}.position`)

  return {
    id: requireString(object.id, `${path}.id`),
    label: requireString(object.label, `${path}.label`),
    imageUrl: requireString(object.imageUrl, `${path}.imageUrl`),
    position: {
      x: requireCoordinate(position.x, `${path}.position.x`),
      y: requireCoordinate(position.y, `${path}.position.y`),
    },
    clue: requireString(object.clue, `${path}.clue`),
    deduction: requireString(object.deduction, `${path}.deduction`),
  }
}

function validateChoice(value: unknown, path: string): Choice {
  const choice = requireRecord(value, path)

  return {
    id: requireString(choice.id, `${path}.id`),
    text: requireString(choice.text, `${path}.text`),
    isCorrect: requireBoolean(choice.isCorrect, `${path}.isCorrect`),
  }
}

function validateStage(value: unknown, index: number): Stage {
  const path = `stages[${index}]`
  const stage = requireRecord(value, path)

  if (!STAGE_IDS.includes(stage.id as StageId)) {
    fail(`${path}.id must be an integer from 1 to ${TOTAL_STAGES}`)
  }

  const id = stage.id as StageId
  const narration = requireArray(stage.narration, `${path}.narration`).map(
    (paragraph, paragraphIndex) =>
      requireString(paragraph, `${path}.narration[${paragraphIndex}]`),
  )
  const voiceLines = requireArray(stage.voiceLines, `${path}.voiceLines`).map(
    (voiceLine, voiceLineIndex) =>
      validateVoiceLine(voiceLine, `${path}.voiceLines[${voiceLineIndex}]`, id),
  )
  const choices = requireArray(stage.choices, `${path}.choices`).map(
    (choice, choiceIndex) =>
      validateChoice(choice, `${path}.choices[${choiceIndex}]`),
  )
  const objects = requireArray(stage.objects, `${path}.objects`).map(
    (object, objectIndex) =>
      validatePointOfInterest(object, `${path}.objects[${objectIndex}]`),
  )
  const objectIds = new Set(objects.map((object) => object.id))

  if (objects.length !== 3 || objectIds.size !== objects.length) {
    fail(`${path}.objects must contain exactly three unique objects`)
  }
  const correctChoiceCount = choices.filter((choice) => choice.isCorrect).length

  if (correctChoiceCount !== 1) {
    fail(`${path}.choices must contain exactly one correct choice`)
  }

  const resultText = requireRecord(stage.resultText, `${path}.resultText`)

  return {
    id,
    name: requireString(stage.name, `${path}.name`),
    imageUrl: requireString(stage.imageUrl, `${path}.imageUrl`),
    bgmTrack: requireString(stage.bgmTrack, `${path}.bgmTrack`),
    narration,
    intrusionText: requireString(stage.intrusionText, `${path}.intrusionText`),
    intrusionHint: requireString(stage.intrusionHint, `${path}.intrusionHint`),
    voiceLines,
    objects,
    choices,
    resultText: {
      correct: requireString(resultText.correct, `${path}.resultText.correct`),
      wrong: requireString(resultText.wrong, `${path}.resultText.wrong`),
    },
  }
}

export function validateStory(data: unknown): asserts data is StoryData {
  const story = requireRecord(data, 'story')
  const rawStages = requireArray(story.stages, 'stages')

  if (rawStages.length !== TOTAL_STAGES) {
    fail(`stages must contain exactly ${TOTAL_STAGES} entries`)
  }

  const stages = rawStages.map(validateStage)
  const stageIds = new Set(stages.map((stage) => stage.id))

  if (stageIds.size !== TOTAL_STAGES) {
    fail('stage ids must be unique')
  }

  for (const stageId of STAGE_IDS) {
    if (!stageIds.has(stageId)) {
      fail(`stage id ${stageId} is missing`)
    }
  }
}
