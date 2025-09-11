import { bus, EVENTS } from '../../lib/bus';
import { store } from '../../lib/store';
import { MatrixConfig, RenderMode } from './config';
import { startDOM, stopDOM } from './dom';
import { startCanvas, stopCanvas } from './canvas';

let currentMode: RenderMode | null = null;
let motionQuery: MediaQueryList | null = null;

function handleMotionChange(e: MediaQueryListEvent): void {
  updateMatrix({ reducedMotion: e.matches });
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
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  updateMatrix({ reducedMotion: motionQuery.matches });
  motionQuery.addEventListener('change', handleMotionChange);
  bus.on(EVENTS.THEME_CHANGED, updateMatrix);
}

export function updateMatrix(partial?: Partial<MatrixConfig>): void {
  if (partial) {
    const cfg = { ...getConfig(), ...partial };
    store.set('matrix', cfg);
  }
  apply(getConfig());
}

export function teardownMatrix(): void {
  bus.off(EVENTS.THEME_CHANGED, updateMatrix);
  if (motionQuery) {
    motionQuery.removeEventListener('change', handleMotionChange);
    motionQuery = null;
  }
  if (currentMode === RenderMode.CANVAS) {
    stopCanvas();
  } else if (currentMode !== null) {
    stopDOM();
  }
  currentMode = null;
}
