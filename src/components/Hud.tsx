import {
  MAX_HEARTS,
  MAX_KEY_FRAGMENTS,
  UI_STRINGS,
} from '../constants'

interface HudProps {
  hearts: number
  keyFragments: number
  detectorUses: number
}

function HeartMeter({ hearts }: Pick<HudProps, 'hearts'>) {
  return (
    <span className="hud__hearts" aria-hidden="true">
      {Array.from({ length: MAX_HEARTS }, (_, index) => (
        <span
          className={index < hearts ? 'hud__heart--filled' : undefined}
          key={index}
        >
          {index < hearts ? '♥' : '♡'}
        </span>
      ))}
    </span>
  )
}

export function Hud({ hearts, keyFragments, detectorUses }: HudProps) {
  return (
    <header className="hud" aria-label={UI_STRINGS.hudLabel}>
      <div
        className="hud__resource hud__resource--hearts"
        data-resource="hearts"
        data-value={hearts}
        aria-label={`${UI_STRINGS.hudHearts} ${hearts}`}
      >
        <span className="hud__label">{UI_STRINGS.hudHearts}</span>
        <HeartMeter hearts={hearts} />
        <strong>{hearts}</strong>
        <span className="hud__maximum">/ {MAX_HEARTS}</span>
      </div>

      <div
        className="hud__resource"
        data-resource="key-fragments"
        data-value={keyFragments}
        aria-label={`${UI_STRINGS.hudKeyFragments} ${keyFragments}`}
      >
        <span className="hud__label">{UI_STRINGS.hudKeyFragments}</span>
        <span className="hud__icon" aria-hidden="true">
          🗝
        </span>
        <strong>{keyFragments}</strong>
        <span className="hud__maximum">/ {MAX_KEY_FRAGMENTS}</span>
      </div>

      <div
        className="hud__resource"
        data-resource="detector-uses"
        data-value={detectorUses}
        aria-label={`${UI_STRINGS.hudDetectorUses} ${detectorUses}`}
      >
        <span className="hud__label">{UI_STRINGS.hudDetectorUses}</span>
        <span className="hud__icon hud__icon--detector" aria-hidden="true">
          ⌁
        </span>
        <strong>{detectorUses}</strong>
      </div>
    </header>
  )
}
