export interface AuraPaletteEntry {
  key: string;
  label: string;
  gradient: string;
}

export interface AuraSettings {
  colorKey: string;
  size: number;
}

export const AURA_SIZE_MIN = 60;
export const AURA_SIZE_MAX = 160;
export const AURA_SIZE_STEP = 5;
export const DEFAULT_AURA_SIZE = 110;

export const AURA_PALETTE: AuraPaletteEntry[] = [
  {
    key: 'celestial-dawn',
    label: 'Celestial Dawn',
    gradient:
      'radial-gradient(circle at center, rgba(56, 189, 248, 0.65), rgba(129, 140, 248, 0.25) 45%, transparent 75%)',
  },
  {
    key: 'aurora-mist',
    label: 'Aurora Mist',
    gradient:
      'radial-gradient(circle at center, rgba(16, 185, 129, 0.6), rgba(6, 182, 212, 0.25) 45%, transparent 75%)',
  },
  {
    key: 'ember-glow',
    label: 'Ember Glow',
    gradient:
      'radial-gradient(circle at center, rgba(248, 113, 113, 0.55), rgba(251, 191, 36, 0.25) 50%, transparent 78%)',
  },
  {
    key: 'violet-dream',
    label: 'Violet Dream',
    gradient:
      'radial-gradient(circle at center, rgba(196, 181, 253, 0.6), rgba(99, 102, 241, 0.25) 50%, transparent 78%)',
  },
  {
    key: 'midnight-tide',
    label: 'Midnight Tide',
    gradient:
      'radial-gradient(circle at center, rgba(14, 165, 233, 0.6), rgba(37, 99, 235, 0.25) 45%, transparent 75%)',
  },
];

export const DEFAULT_AURA = AURA_PALETTE[0];

export const AURA_LOOKUP = new Map<string, AuraPaletteEntry>(
  AURA_PALETTE.map((entry) => [entry.key, entry]),
);

export const DEFAULT_AURA_SETTINGS: AuraSettings = {
  colorKey: DEFAULT_AURA.key,
  size: DEFAULT_AURA_SIZE,
};
