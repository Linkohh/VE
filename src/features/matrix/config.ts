export enum RenderMode {
  Canvas = 'canvas',
  Minimal = 'minimal',
}

export type MatrixBlendMode = 'screen' | 'lighten' | 'difference';

export interface MatrixPreset {
  key: string;
  label: string;
  palette: string[];
  characters: string[];
}

export interface MatrixConfig {
  renderMode: RenderMode;
  reducedMotion: boolean;
  density: number;
  speed: number;
  palette: string[];
  characters: string[];
  visibility: number;
  intensity: number;
  blendMode: MatrixBlendMode;
  preset: string;
}

export const MATRIX_PRESETS: MatrixPreset[] = [
  {
    key: 'aurora-trail',
    label: 'Aurora trail',
    palette: ['#22d3ee', '#6366f1', '#f472b6', '#38bdf8'],
    characters: ['0', '1', 'あ', 'カ', 'ツ', 'ミ', 'ナ', 'シ', 'ホ', 'ネ'],
  },
  {
    key: 'midnight-sonata',
    label: 'Midnight sonata',
    palette: ['#818cf8', '#a855f7', '#22d3ee'],
    characters: ['✦', '✧', '✺', '✽', '✾', '❉', '❋', '❖'],
  },
  {
    key: 'amber-rush',
    label: 'Amber rush',
    palette: ['#fb923c', '#f97316', '#facc15'],
    characters: ['A', 'B', 'C', 'Δ', 'Ξ', 'Ω', 'λ', 'ψ'],
  },
];

export const MATRIX_PRESET_LOOKUP = new Map<string, MatrixPreset>(
  MATRIX_PRESETS.map((preset) => [preset.key, preset]),
);

export const DEFAULT_MATRIX_PRESET = MATRIX_PRESETS[0];

export const DEFAULTS: MatrixConfig = {
  renderMode: RenderMode.Canvas,
  reducedMotion: false,
  density: 1,
  speed: 1,
  palette: DEFAULT_MATRIX_PRESET.palette,
  characters: DEFAULT_MATRIX_PRESET.characters,
  visibility: 0.75,
  intensity: 0.65,
  blendMode: 'screen',
  preset: DEFAULT_MATRIX_PRESET.key,
};
