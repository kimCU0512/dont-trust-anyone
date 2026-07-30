import { UI_STRINGS } from '../constants'

interface BgmControlProps {
  isEnabled: boolean
  onToggle: () => void
}

export function BgmControl({
  isEnabled,
  onToggle,
}: BgmControlProps) {
  return (
    <div className="game-audio-control">
      <span>{UI_STRINGS.bgm}</span>
      <button
        type="button"
        aria-pressed={isEnabled}
        aria-label={UI_STRINGS.bgmToggleLabel}
        onClick={onToggle}
      >
        {isEnabled ? UI_STRINGS.bgmOn : UI_STRINGS.bgmOff}
      </button>
    </div>
  )
}
