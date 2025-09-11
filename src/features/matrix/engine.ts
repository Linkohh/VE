import { bus, EVENTS } from '../../lib/bus';
import { store } from '../../lib/store';
import { MatrixConfig, RenderMode } from './config';
import { startDOM, stopDOM } from './dom';
import { startCanvas, stopCanvas } from './canvas';
import { applyMatrixColors } from './colors';

let currentMode: RenderMode | null = null;
let motionQuery: MediaQueryList | null = null;

function handleMotionChange(e: MediaQueryListEvent): void {
  updateMatrix({ reducedMotion: e.matches });
}

function refreshColors(): void {
  applyMatrixColors(getConfig());
}

function getConfig(): MatrixConfig {
  return store.get('matrix');
}

function apply(config: MatrixConfig): void {
  if (currentMode === RenderMode.CANVAS) {
    stopCanvas();
  } else if (currentMode !== null) {
    stopDOM();
  }

  currentMode = config.renderMode;

  if (currentMode === RenderMode.CANVAS) {
    startCanvas(config);
  } else {
    startDOM(config);
  }
}

export function initMatrix(): void {
 
  if (currentMode === RenderMode.CANVAS) {
    stopCanvas();
  } else if (currentMode !== null) {
    stopDOM();
  }
  currentMode = null;
}
