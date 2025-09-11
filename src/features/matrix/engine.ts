import { bus, EVENTS } from '../../lib/bus';
import { store } from '../../lib/store';
import { MatrixConfig, RenderMode } from './config';
import { startDOM, stopDOM } from './dom';
import { startCanvas, stopCanvas } from './canvas';

interface MatrixStats {
  fps: number;
  avgFrameMs: number;
  density: number;
  drops: number;
}

let currentMode: RenderMode | null = null;
const stats: MatrixStats = { fps: 0, avgFrameMs: 0, density: 0, drops: 0 };
let statsRaf = 0;
let lastStatsTs = 0;
const frameSamples: number[] = [];
let overlayEl: HTMLDivElement | null = null;

const env = (globalThis as any).process?.env ?? {};
const SHOW_OVERLAY = env.NODE_ENV !== 'production' && !!env.MATRIX_STATS;

function getConfig(): MatrixConfig {
  return store.get('matrix');
}

function computeDrops(cfg: MatrixConfig): number {
  if (currentMode === RenderMode.CANVAS) {
    const width = window.innerWidth * (window.devicePixelRatio || 1);
    return Math.floor((width / cfg.canvasConfig.columnSpacing) * cfg.densityMultiplier);
  }
  return Math.floor((window.innerWidth / cfg.columnWidth) * cfg.densityMultiplier);
}

function updateStats(ts: number): void {
  const delta = ts - lastStatsTs;
  lastStatsTs = ts;
  frameSamples.push(delta);
  if (frameSamples.length > 60) frameSamples.shift();
  const total = frameSamples.reduce((a, b) => a + b, 0);
  stats.avgFrameMs = total / frameSamples.length;
  stats.fps = 1000 / stats.avgFrameMs || 0;

  const cfg = getConfig();
  stats.density = cfg.densityMultiplier;
  stats.drops = computeDrops(cfg);

  if (overlayEl) {
    overlayEl.textContent = `fps: ${stats.fps.toFixed(1)} | ${stats.avgFrameMs.toFixed(1)}ms`;
  }

  statsRaf = requestAnimationFrame(updateStats);
}

function startStats(): void {
  if (statsRaf) return;
  lastStatsTs = performance.now();
  statsRaf = requestAnimationFrame(updateStats);
  if (SHOW_OVERLAY && !overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.style.position = 'fixed';
    overlayEl.style.left = '0';
    overlayEl.style.top = '0';
    overlayEl.style.padding = '2px 4px';
    overlayEl.style.background = 'rgba(0,0,0,0.7)';
    overlayEl.style.color = '#0f0';
    overlayEl.style.font = '12px monospace';
    overlayEl.style.zIndex = '10000';
    document.body.appendChild(overlayEl);
  }
}

function stopStats(): void {
  if (statsRaf) {
    cancelAnimationFrame(statsRaf);
    statsRaf = 0;
    frameSamples.length = 0;
  }
  if (overlayEl) {
    overlayEl.remove();
    overlayEl = null;
  }
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
  startStats();
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
  stopStats();
}

export function getStats(): MatrixStats {
  return { ...stats };
}
