import { useState } from 'react'
import { getGameBgmScene } from './audio/gameBgm'
import { BgmControl } from './components/BgmControl'
import { EndingScreen } from './components/EndingScreen'
import { IntroScreen } from './components/IntroScreen'
import { ResetScreen } from './components/ResetScreen'
import { StageScreen } from './components/StageScreen'
import { TitleScreen } from './components/TitleScreen'
import { useGameState } from './hooks/useGameState'
import { useBgm } from './hooks/useBgm'
import { useSfx } from './hooks/useSfx'
import story from './data/story.json'
import { getUpcomingImageUrls } from './images/gameImages'
import { useImagePreload } from './hooks/useImagePreload'
import type { DetectorResult, EvidenceEntry, GameState } from './types'
import type { SfxId } from './audio/sfxManager'
import { addEvidence } from './components/evidenceJournalState'

interface GameScreenProps {
  state: GameState
  onStart: () => void
  onContinueIntro: () => void
  detectorAvailable: boolean
  onUseDetector: () => DetectorResult | null
  onSelectChoice: (choiceId: string) => void
  evidenceEntries: EvidenceEntry[]
  bgmEnabled: boolean
  bgmVolume: number
  onToggleBgm: () => void
  onBgmVolumeChange: (volume: number) => void
  sfxEnabled: boolean
  sfxVolume: number
  onToggleSfx: () => void
  onSfxVolumeChange: (volume: number) => void
  onPlaySfx?: (id: SfxId, onEnded?: () => void) => void
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
  evidenceEntries,
  bgmEnabled,
  bgmVolume,
  onToggleBgm,
  onBgmVolumeChange,
  sfxEnabled,
  sfxVolume,
  onToggleSfx,
  onSfxVolumeChange,
  onPlaySfx = () => undefined,
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
          key={`${state.stageId}-${state.wrongChoiceIds.join('-')}`}
          stageId={state.stageId}
          hearts={state.hearts}
          keyFragments={state.keyFragments}
          detectorUses={state.detectorUses}
          currentVoiceLineId={state.currentVoiceLineId}
          currentChoiceIds={state.currentChoiceIds}
          wrongChoiceIds={state.wrongChoiceIds}
          currentIntrusionText={state.currentIntrusionText}
          detectorUsedThisStage={state.detectorUsedThisStage}
          detectorAvailable={detectorAvailable}
          evidenceEntries={evidenceEntries}
          bgmEnabled={bgmEnabled}
          bgmVolume={bgmVolume}
          onToggleBgm={onToggleBgm}
          onBgmVolumeChange={onBgmVolumeChange}
          sfxEnabled={sfxEnabled}
          sfxVolume={sfxVolume}
          onToggleSfx={onToggleSfx}
          onSfxVolumeChange={onSfxVolumeChange}
          onPlaySfx={onPlaySfx}
          onUseDetector={onUseDetector}
          onSelectChoice={onSelectChoice}
          onDiscoverEvidence={onDiscoverEvidence}
          onRestart={onRestart}
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
  const sfx = useSfx()
  useImagePreload(getUpcomingImageUrls(state))

  const startGameWithBgm = () => {
    setEvidenceEntries([])
    sfx.play('start', () => {
      bgm.unlock(story.intro.bgmTrack, 'intro')
    })
    startGame()
  }

  const restartWithEmptyJournal = () => {
    setEvidenceEntries([])
    restartGame()
  }

  const continueIntroWithMovingSfx = () => {
    sfx.play('moving')
    completeIntro()
  }

  const returnToTitleWithEmptyJournal = () => {
    setEvidenceEntries([])
    returnToTitle()
  }

  return (
    <main className="game" aria-label="게임 화면">
      {state.gamePhase !== 'stage' && (
        <BgmControl
          isEnabled={bgm.isEnabled}
          volume={bgm.volume}
          onToggle={bgm.toggle}
          onVolumeChange={bgm.setVolume}
          sfxEnabled={sfx.isEnabled}
          sfxVolume={sfx.volume}
          onToggleSfx={sfx.toggle}
          onSfxVolumeChange={sfx.setVolume}
        />
      )}
      <GameScreen
        state={state}
        onStart={startGameWithBgm}
        onContinueIntro={continueIntroWithMovingSfx}
        detectorAvailable={canUseDetector}
        evidenceEntries={evidenceEntries}
        bgmEnabled={bgm.isEnabled}
        bgmVolume={bgm.volume}
        onToggleBgm={bgm.toggle}
        onBgmVolumeChange={bgm.setVolume}
        sfxEnabled={sfx.isEnabled}
        sfxVolume={sfx.volume}
        onToggleSfx={sfx.toggle}
        onSfxVolumeChange={sfx.setVolume}
        onPlaySfx={sfx.play}
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
