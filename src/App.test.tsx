import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createInitialGameState } from './hooks/useGameState'
import type { GamePhase } from './types'
import { GameScreen } from './App'

const expectedScreenByPhase: Record<GamePhase, string> = {
  title: 'P-00',
  intro: 'P-01',
  stage: 'P-10',
  reset: 'P-20',
  endingTrue: 'P-30',
  endingBad: 'P-31',
}

describe('GameScreen', () => {
  it.each(Object.entries(expectedScreenByPhase))(
    'renders the %s phase as %s',
    (phase, screenId) => {
      const html = renderToStaticMarkup(
        <GameScreen
          state={{
            ...createInitialGameState(),
            gamePhase: phase as GamePhase,
          }}
          onStart={() => undefined}
          onContinueIntro={() => undefined}
          detectorAvailable={false}
          evidenceEntries={[]}
          bgmEnabled
          bgmVolume={0.45}
          onToggleBgm={() => undefined}
          onBgmVolumeChange={() => undefined}
          onUseDetector={() => null}
          onSelectChoice={() => undefined}
          onDiscoverEvidence={() => undefined}
          onRestart={() => undefined}
          onReturnToTitle={() => undefined}
        />,
      )

      expect(html).toContain(`data-screen="${screenId}"`)
    },
  )
})
