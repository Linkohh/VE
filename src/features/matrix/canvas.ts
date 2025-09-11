import { MatrixConfig } from './config';

interface Drop {
  x: number;
  y: number;
  speed: number;
  glyphIndex: number;
  opacity: number;
}

interface CanvasState {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  drops: Drop[];
  pool: Drop[];
  rafId: number;
  lastFrame: number;
  resizeObserver: ResizeObserver | null;
  resizeRaf: number;
  running: boolean;
  config: MatrixConfig | null;
  avgFrameTime: number;
  baseDensityMultiplier: number;
  baseMaxFPS: number;
}

const state: CanvasState = {
  canvas: null,
  ctx: null,
  drops: [],
  pool: [],
  rafId: 0,
  lastFrame: 0,
  resizeObserver: null,
  resizeRaf: 0,
  running: false,
  config: null,
  avgFrameTime: 0,
  baseDensityMultiplier: 1,
  baseMaxFPS: 60,
};

 
}

function resizeCanvas(): void {
  if (!state.canvas || !state.ctx || !state.config) return;
  const dpr = getDpr();
  const canvas = state.canvas;

  // CSS size
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';

  // Backing store size
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cfg = state.config.canvasConfig;
 
}

function draw(): void {
  if (!state.canvas || !state.ctx || !state.config) return;
  const ctx = state.ctx;
  const canvas = state.canvas;
  const cfg = state.config.canvasConfig;

  ctx.fillStyle = `rgba(0,0,0,${1 - (cfg.globalOpacity ?? 1)})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${cfg.fontSize}px monospace`;
  const chars = state.config.characters;
  const colors = state.config.colors;
  for (let i = 0; i < state.drops.length; i++) {
    const drop = state.drops[i];
    const text = chars[drop.glyphIndex];
    const color = colors[i % colors.length];
    ctx.fillStyle = color;
    ctx.globalAlpha = drop.opacity * (cfg.globalOpacity ?? 1);
    ctx.fillText(text, drop.x, drop.y);
    ctx.globalAlpha = 1;

    drop.y += cfg.fontSize * drop.speed;
    drop.opacity = Math.min(1, drop.opacity + 0.05);
    drop.glyphIndex = Math.floor(Math.random() * chars.length);

    if (drop.y > canvas.height && Math.random() > 0.975) {
      resetDrop(drop, drop.x);
    }
  }
}

function adjustPerformance(): void {
  if (!state.config) return;
  const avg = state.avgFrameTime;
  const cfg = state.config.canvasConfig;

  if (avg > 22) {
    if (state.config.densityMultiplier > state.baseDensityMultiplier * 0.5) {
      state.config.densityMultiplier *= 0.9;
      resizeCanvas();
    } else if (cfg.maxFPS > state.baseMaxFPS * 0.5) {
      cfg.maxFPS = Math.max(15, cfg.maxFPS - 5);
    }
  } else if (avg < 18) {
    if (cfg.maxFPS < state.baseMaxFPS) {
      cfg.maxFPS = Math.min(state.baseMaxFPS, cfg.maxFPS + 5);
    } else if (state.config.densityMultiplier < state.baseDensityMultiplier) {
      state.config.densityMultiplier = Math.min(state.baseDensityMultiplier, state.config.densityMultiplier * 1.1);
      resizeCanvas();
    }
  }
}

function loop(ts: number): void {
  if (!state.running || !state.config) return;
  const maxFPS = state.config.canvasConfig.maxFPS || 60;
  const minFrame = 1000 / maxFPS;
  const dt = ts - state.lastFrame;
  if (dt >= minFrame) {
    draw();
    state.lastFrame = ts;
    state.avgFrameTime = state.avgFrameTime * 0.9 + dt * 0.1;
    if (state.config.canvasConfig.adaptivePerformance) {
      adjustPerformance();
    }
  }
  state.rafId = requestAnimationFrame(loop);
}

export function startCanvas(config: MatrixConfig): void {
  if (state.running) return;
  const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  state.canvas = canvas;
  state.ctx = ctx;
  state.config = config;
 
  canvas.style.display = 'block';

  resizeCanvas();

 
}

export function stopCanvas(): void {
  if (!state.running) return;
  state.running = false;
  cancelAnimationFrame(state.rafId);
  if (state.resizeObserver) {
    state.resizeObserver.disconnect();
    state.resizeObserver = null;
  }
  if (state.resizeRaf) {
    cancelAnimationFrame(state.resizeRaf);
    state.resizeRaf = 0;
  }
  if (state.ctx && state.canvas) {
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
  }
  if (state.canvas) {
    state.canvas.style.display = 'none';
  }
  state.drops = [];
  state.pool = [];
  state.canvas = null;
  state.ctx = null;
  state.config = null;
 
}

