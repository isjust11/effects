export {
  EFFECT_CATALOG,
  activeEffects,
  getEffect,
  isEffectEnabled,
  listEffects,
} from './catalog';
export type { EffectDefinition, EffectKind, EffectOption, ThemeFlags } from './catalog';

export { AutoScroll } from './AutoScroll';
export {
  AmbientFloaters,
  AMBIENT_PALETTE_BLUSH,
  AMBIENT_PALETTE_GOLD,
  AMBIENT_PALETTE_SAGE,
} from './AmbientFloaters';
export type {
  AmbientFloatersProps,
  AmbientPalette,
  AmbientPalettePreset,
} from './AmbientFloaters';
export { playConfetti, useConfettiPlayer } from './Confetti';
export type { ConfettiFn } from './Confetti';
export { useInviteMusic } from './Music';
/** Lightweight decorative petals for a section overlay (not the fullscreen canvas). */
export { PetalField } from './Petals';
