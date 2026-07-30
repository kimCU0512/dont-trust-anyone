import { useState } from 'react'
import { getGameBgmScene } from './audio/gameBgm'
import { BgmControl } from './components/BgmControl'
import { EvidenceJournal } from './components/EvidenceJournal'
import { EndingScreen } from './components/EndingScreen'
import { IntroScreen } from './components/IntroScreen'
import { ResetScreen } from './components/ResetScreen'
import { StageScreen } from './components/StageScreen'
import { TitleScreen } from './components/TitleScreen'
import { useGameState } from './hooks/useGameState'
import { useBgm } from './hooks/useBgm'
import story from './data/story.json'
import { getUpcomingImageUrls } from './images/gameImages'
import { useImagePreload } from './hooks/useImagePreload'
import type { DetectorResult, EvidenceEntry, GameState } from './types'
import { addEvidence } from './components/evidenceJournalState'

interface GameScreenProps {
  state: GameState
  onStart: () => void
  onContinueIntro: () => void
  detectorAvailable: boolean
  onUseDetector: () => DetectorResult | null
  onSelectChoice: (choiceId: string) => void
  onDiscoverEvidence: (entry: EvidenceEntry) => void
  onRestart: () => void
  onReturnToTitle: () => void
}

export function GameScreen({
  state,
  onStart,
  onContinueIntro,
  detectorAvailable,
  onUseDetector,
  onSelectChoice,
  onDiscoverEvidence,
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
          key={state.stageId}
          stageId={state.stageId}
          hearts={state.hearts}
          keyFragments={state.keyFragments}
          detectorUses={state.detectorUses}
          currentVoiceLineId={state.currentVoiceLineId}
          detectorUsedThisStage={state.detectorUsedThisStage}
          detectorAvailable={detectorAvailable}
          onUseDetector={onUseDetector}
          onSelectChoice={onSelectChoice}
          onDiscoverEvidence={onDiscoverEvidence}
        />
      )
    case 'reset':
      return <ResetScreen onRestart={onRestart} />
    case 'endingTrue':
      return <EndingScreen ending="true" onReturnToTitle={onReturnToTitle} />
    case 'endingBad':
      return <EndingScreen ending="bad" onReturnToTitle={onReturnToTitle} />
  }
}

function App() {
  const [evidenceEntries, setEvidenceEntries] = useState<EvidenceEntry[]>([])
  const {
    state,
    startGame,
    completeIntro,
    canUseDetector,
    useDetector,
    selectChoice,
    restartGame,
    returnToTitle,
  } = useGameState()
  const bgmScene = getGameBgmScene(state)
  const bgm = useBgm(bgmScene.trackId, bgmScene.sceneKey)
  useImagePreload(getUpcomingImageUrls(state))

  const startGameWithBgm = () => {
    setEvidenceEntries([])
    bgm.unlock(story.intro.bgmTrack, 'intro')
    startGame()
  }

  const restartWithEmptyJournal = () => {
    setEvidenceEntries([])
    restartGame()
  }

  const returnToTitleWithEmptyJournal = () => {
    setEvidenceEntries([])
    returnToTitle()
  }

  return (
    <main className="game" aria-label="게임 화면">
      <BgmControl isEnabled={bgm.isEnabled} onToggle={bgm.toggle} />
      {(state.gamePhase === 'stage' ||
        state.gamePhase === 'endingTrue' ||
        state.gamePhase === 'endingBad') && (
        <EvidenceJournal entries={evidenceEntries} />
      )}
      <GameScreen
        state={state}
        onStart={startGameWithBgm}
        onContinueIntro={completeIntro}
        detectorAvailable={canUseDetector}
        onUseDetector={useDetector}
        onSelectChoice={selectChoice}
        onDiscoverEvidence={(entry) =>
          setEvidenceEntries((currentEntries) =>
            addEvidence(currentEntries, entry),
          )
        }
        onRestart={restartWithEmptyJournal}
        onReturnToTitle={returnToTitleWithEmptyJournal}
      />
    </main>
  )
}

export default App
