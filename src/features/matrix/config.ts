export enum RenderMode {
  DOM = 'dom',
  CANVAS = 'canvas',
  HYBRID = 'hybrid'
}

interface CanvasConfig {
  fontSize: number;
  columnSpacing: number;
  glowIntensity: number;
  shadowBlur: number;
  globalOpacity: number;
  maxFPS: number;
  adaptivePerformance: boolean;
  enableObjectPooling: boolean;
  memoryManagement: boolean;
}

export interface MatrixConfig {
  columnWidth: number;
  updateInterval: number;
  colors: string[];
  densityMultiplier: number;
  isLightBackground: boolean;
  backgroundLuminance: number;
  renderMode: RenderMode;
  bidirectional: boolean;
  trailLength: number;
  trailFadeRate: number;
  characters: string[];
  canvasConfig: CanvasConfig;
}

export const DEFAULTS: MatrixConfig = {
  columnWidth: 16,
  updateInterval: 500,
  colors: ['#CC00FF', '#A104C1', '#4400F6', '#0050FF', '#03A0C5', '#00E5FF'],
  densityMultiplier: 1.5,
  isLightBackground: false,
  backgroundLuminance: 0.2,
  renderMode: RenderMode.DOM,
  bidirectional: true,
  trailLength: 20,
  trailFadeRate: 0.05,
  characters: ['0', '1', '|', '/', '\', '-', '+', '*', '#', '@', '&', '%', '$', '〃', '¦', '｜'],
  canvasConfig: {
    fontSize: 28,
    columnSpacing: 10,
    glowIntensity: 10,
    shadowBlur: 5,
    globalOpacity: 1.0,
    maxFPS: 60,
    adaptivePerformance: true,
    enableObjectPooling: true,
    memoryManagement: true
  }
};
