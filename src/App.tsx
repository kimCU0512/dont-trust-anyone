import { EndingScreen } from './components/EndingScreen'
import { IntroScreen } from './components/IntroScreen'
import { ResetScreen } from './components/ResetScreen'
import { StageScreen } from './components/StageScreen'
import { TitleScreen } from './components/TitleScreen'
import { useGameState } from './hooks/useGameState'
import type { GameState } from './types'

interface GameScreenProps {
  state: GameState
  onStart: () => void
  onContinueIntro: () => void
  onSelectChoice: (choiceId: string) => void
  onRestart: () => void
  onReturnToTitle: () => void
}

export function GameScreen({
  state,
  onStart,
  onContinueIntro,
  onSelectChoice,
  onRestart,
  onReturnToTitle,
}: GameScreenProps) {
  switch (state.gamePhase) {
    case 'title':
      return <TitleScreen onStart={onStart} />
    case 'intro':
      return <IntroScreen onContinue={onContinueIntro} />
    case 'stage':
      return (
        <StageScreen
          stageId={state.stageId}
          hearts={state.hearts}
          keyFragments={state.keyFragments}
          detectorUses={state.detectorUses}
          onSelectChoice={onSelectChoice}
        />
      )
    case 'reset':
      return <ResetScreen onRestart={onRestart} />
    case 'endingTrue':
      return (
        <EndingScreen ending="true" onReturnToTitle={onReturnToTitle} />
      )
    case 'endingBad':
      return <EndingScreen ending="bad" onReturnToTitle={onReturnToTitle} />
  }
}

function App() {
  const {
    state,
    startGame,
    completeIntro,
    selectChoice,
    restartGame,
    returnToTitle,
  } = useGameState()

  return (
    <main className="game" aria-label="게임 화면">
      <GameScreen
        state={state}
        onStart={startGame}
        onContinueIntro={completeIntro}
        onSelectChoice={selectChoice}
        onRestart={restartGame}
        onReturnToTitle={returnToTitle}
      />
    </main>
  )
}

export default App
