export interface ConclusionFlowState {
  textComplete: boolean
}

export function createConclusionFlowState(): ConclusionFlowState {
  return { textComplete: false }
}

export function completeConclusionText(
  state: ConclusionFlowState,
): ConclusionFlowState {
  return state.textComplete ? state : { textComplete: true }
}
