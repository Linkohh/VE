import { bus, EVENTS } from '../../lib/bus';
import { store } from '../../lib/store';
import { MatrixConfig, RenderMode } from './config';
import { startCanvas, stopCanvas, teardownCanvas } from './canvas';
import { startDOM, stopDOM, teardownDOM } from './dom';

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

export function updateMatrix(): void {
  apply(getConfig());
}

export function teardownMatrix(): void {
  if (currentMode === RenderMode.CANVAS) {
    stopCanvas();
    teardownCanvas();
  } else if (currentMode !== null) {
    stopDOM();
    teardownDOM();
  }
  currentMode = null;
}

export function initMatrix(): void {
  updateMatrix();
}

bus.on(EVENTS.MATRIX_TOGGLE, (active: boolean) => {
  if (active) {
    updateMatrix();
  } else {
    teardownMatrix();
  }
});

