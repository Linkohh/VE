import { MatrixConfig } from './config';

interface CanvasState {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  drops: number[];
  rafId: number;
  lastFrame: number;
  resizeObserver: ResizeObserver | null;
  resizeRaf: number;
  running: boolean;
  config: MatrixConfig | null;
}

const state: CanvasState = {
  canvas: null,
  ctx: null,
  drops: [],
  rafId: 0,
  lastFrame: 0,
  resizeObserver: null,
  resizeRaf: 0,
  running: false,
  config: null,
};

function getDpr(): number {
  const dpr = window.devicePixelRatio || 1;
  const isMobile = /Mobi|Android|iP(ad|hone|od)/.test(navigator.userAgent);
  return isMobile ? Math.min(2, dpr) : dpr;
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
  const columns = Math.floor((canvas.width / cfg.columnSpacing) * state.config.densityMultiplier);
  state.drops = Array(columns).fill(0);
}

function draw(): void {
  if (!state.canvas || !state.ctx || !state.config) return;
  const ctx = state.ctx;
  const canvas = state.canvas;
  const cfg = state.config.canvasConfig;

  ctx.fillStyle = `rgba(0,0,0,${1 - (cfg.globalOpacity ?? 1)})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${cfg.fontSize}px monospace`;
  const step = cfg.columnSpacing;
  for (let i = 0; i < state.drops.length; i++) {
    const text = state.config.characters[Math.floor(Math.random() * state.config.characters.length)];
    const color = state.config.colors[i % state.config.colors.length];
    const x = i * step;
    const y = state.drops[i] * cfg.fontSize;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    if (y > canvas.height && Math.random() > 0.975) {
      state.drops[i] = 0;
    }
    state.drops[i]++;
  }
}

function loop(ts: number): void {
  if (!state.running || !state.config) return;
  const maxFPS = state.config.canvasConfig.maxFPS || 60;
  const minFrame = 1000 / maxFPS;
  if (ts - state.lastFrame >= minFrame) {
    draw();
    state.lastFrame = ts;
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
  state.running = true;
  canvas.style.display = 'block';

  resizeCanvas();
  state.rafId = requestAnimationFrame(loop);

  state.resizeObserver = new ResizeObserver(() => {
    if (state.resizeRaf) cancelAnimationFrame(state.resizeRaf);
    state.resizeRaf = requestAnimationFrame(() => {
      state.resizeRaf = 0;
      resizeCanvas();
    });
  });
  state.resizeObserver.observe(document.body);
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
  state.canvas = null;
  state.ctx = null;
  state.config = null;
}

