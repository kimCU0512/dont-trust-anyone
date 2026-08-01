import { UI_STRINGS } from '../constants'

interface BgmControlProps {
  isEnabled: boolean
  volume: number
  onToggle: () => void
  onVolumeChange: (volume: number) => void
  sfxEnabled: boolean
  sfxVolume: number
  onToggleSfx: () => void
  onSfxVolumeChange: (volume: number) => void
}

export function BgmControl({
  isEnabled,
  volume,
  onToggle,
  onVolumeChange,
  sfxEnabled,
  sfxVolume,
  onToggleSfx,
  onSfxVolumeChange,
}: BgmControlProps) {
  return (
    <div className="game-audio-control">
      {[
        {
          label: UI_STRINGS.bgm,
          enabled: isEnabled,
          volume,
          toggleLabel: UI_STRINGS.bgmToggleLabel,
          volumeLabel: '배경음악 볼륨',
          onToggle,
          onVolumeChange,
        },
        {
          label: UI_STRINGS.sfx,
          enabled: sfxEnabled,
          volume: sfxVolume,
          toggleLabel: UI_STRINGS.sfxToggleLabel,
          volumeLabel: '효과음 볼륨',
          onToggle: onToggleSfx,
          onVolumeChange: onSfxVolumeChange,
        },
      ].map((control) => (
        <div className="game-audio-control__row" key={control.label}>
          <span className="game-audio-control__label">{control.label}</span>
          <button
            type="button"
            aria-pressed={control.enabled}
            aria-label={control.toggleLabel}
            onClick={control.onToggle}
          >
            {control.enabled ? UI_STRINGS.bgmOn : UI_STRINGS.bgmOff}
          </button>
          <label className="game-audio-control__volume">
            <span>VOL</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={Math.round(control.volume * 100)}
              aria-label={control.volumeLabel}
              disabled={!control.enabled}
              onChange={(event) =>
                control.onVolumeChange(
                  Number(event.currentTarget.value) / 100,
                )
              }
            />
            <output>{Math.round(control.volume * 100)}</output>
          </label>
        </div>
      ))}
    </div>
  )
}
