import { UI_STRINGS } from '../constants'

interface BgmControlProps {
  isEnabled: boolean
  volume: number
  onToggle: () => void
  onVolumeChange: (volume: number) => void
}

export function BgmControl({
  isEnabled,
  volume,
  onToggle,
  onVolumeChange,
}: BgmControlProps) {
  return (
    <div className="game-audio-control">
      <span className="game-audio-control__label">{UI_STRINGS.bgm}</span>
      <button
        type="button"
        aria-pressed={isEnabled}
        aria-label={UI_STRINGS.bgmToggleLabel}
        onClick={onToggle}
      >
        {isEnabled ? UI_STRINGS.bgmOn : UI_STRINGS.bgmOff}
      </button>
      <label className="game-audio-control__volume">
        <span>VOL</span>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={Math.round(volume * 100)}
          aria-label="배경음악 볼륨"
          disabled={!isEnabled}
          onChange={(event) =>
            onVolumeChange(Number(event.currentTarget.value) / 100)
          }
        />
        <output>{Math.round(volume * 100)}</output>
      </label>
    </div>
  )
}
