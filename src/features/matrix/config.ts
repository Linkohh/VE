export enum RenderMode {
  Canvas = 'canvas',
  Minimal = 'minimal',
}

export interface MatrixConfig {
  renderMode: RenderMode;
  reducedMotion: boolean;
  density: number;
  speed: number;
  palette: string[];
  characters: string[];
}

export const DEFAULTS: MatrixConfig = {
  renderMode: RenderMode.Canvas,
  reducedMotion: false,
  density: 1,
  speed: 1,
  palette: ['#22d3ee', '#6366f1', '#f472b6', '#38bdf8'],
  characters: ['0', '1', 'あ', 'カ', 'ツ', 'ミ', 'ナ', 'シ', 'ホ', 'ネ'],
};
