import { describe, expect, it } from 'vitest'
import {
  completeConclusionText,
  createConclusionFlowState,
} from './conclusionFlow'

describe('conclusion flow', () => {
  it('reveals the action only after all conclusion text completes', () => {
    const initialState = createConclusionFlowState()
    const completedState = completeConclusionText(initialState)

    expect(initialState.textComplete).toBe(false)
    expect(completedState.textComplete).toBe(true)
    expect(completeConclusionText(completedState)).toBe(completedState)
  })
})
