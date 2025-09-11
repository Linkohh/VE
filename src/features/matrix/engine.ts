import { bus, EVENTS } from '../../lib/bus';
import { store } from '../../lib/store';
import { MatrixConfig, RenderMode } from './config';
import { startDOM, stopDOM } from './dom';
import { startCanvas, stopCanvas } from './canvas';

let currentMode: RenderMode | null = null;

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
  apply(getConfig());
  bus.on(EVENTS.THEME_CHANGED, updateMatrix);
}

export function updateMatrix(): void {
  apply(getConfig());
}

export function teardownMatrix(): void {
  bus.off(EVENTS.THEME_CHANGED, updateMatrix);
  if (currentMode === RenderMode.CANVAS) {
    stopCanvas();
  } else if (currentMode !== null) {
    stopDOM();
  }
  currentMode = null;
}
