import { DEFAULTS, RenderMode, type MatrixConfig } from './config';

interface Drop {
  x: number;
  y: number;
  speed: number;
  glyph: string;
  opacity: number;
}

class MatrixRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private drops: Drop[] = [];
  private raf = 0;
  private config: MatrixConfig = DEFAULTS;
  private running = false;
  private resizeHandler = () => this.reset();

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'matrix-canvas';
    this.canvas.className = 'matrix-canvas';
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to acquire canvas context for matrix renderer');
    }
    this.ctx = ctx;
  }

  mount(): void {
    if (!this.canvas.isConnected) {
      document.body.appendChild(this.canvas);
    }
    window.addEventListener('resize', this.resizeHandler, { passive: true });
  }

  unmount(): void {
    window.removeEventListener('resize', this.resizeHandler);
    cancelAnimationFrame(this.raf);
    this.running = false;
    this.canvas.remove();
  }

  start(config: MatrixConfig): void {
    this.config = config;
    if (config.renderMode !== RenderMode.Canvas) {
      this.stop();
      return;
    }

    this.mount();
    this.resize();
    this.seedDrops();

    if (!this.running) {
      this.running = true;
      this.loop();
    }
  }

  update(config: MatrixConfig): void {
    this.config = config;
    if (!this.running) {
      this.start(config);
      return;
    }

    if (config.renderMode !== RenderMode.Canvas) {
      this.stop();
      return;
    }

    this.seedDrops();
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.style.display = 'none';
  }

  private resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(window.innerWidth * dpr);
    this.canvas.height = Math.floor(window.innerHeight * dpr);
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private reset(): void {
    if (!this.running) return;
    this.resize();
    this.seedDrops();
  }

  private seedDrops(): void {
    const columns = Math.floor((window.innerWidth / 20) * this.config.density);
    this.drops = [];
    const characters = this.config.characters;

    for (let i = 0; i < columns; i += 1) {
      this.drops.push({
        x: (i + Math.random()) * 20,
        y: Math.random() * window.innerHeight,
        speed: 2 + Math.random() * 3 * this.config.speed,
        glyph: characters[Math.floor(Math.random() * characters.length)],
        opacity: Math.random(),
      });
    }
  }

  private loop = (): void => {
    if (!this.running) return;
    if (this.config.renderMode !== RenderMode.Canvas) {
      this.stop();
      return;
    }

    const ctx = this.ctx;
    const { width, height } = this.canvas;
    const { palette, characters, reducedMotion } = this.config;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '18px "Roboto Mono", monospace';

    for (let i = 0; i < this.drops.length; i += 1) {
      const drop = this.drops[i];
      const color = palette[i % palette.length];
      ctx.fillStyle = color;
      ctx.globalAlpha = drop.opacity;
      ctx.fillText(drop.glyph, drop.x, drop.y);
      ctx.globalAlpha = 1;

      const drift = reducedMotion ? 1 : drop.speed;
      drop.y += drift * 4;
      drop.opacity = Math.min(1, drop.opacity + 0.02);

      if (drop.y > height) {
        drop.y = Math.random() * -100;
        drop.opacity = 0;
      }

      drop.glyph = characters[Math.floor(Math.random() * characters.length)];
    }

    this.canvas.style.display = 'block';
    this.raf = requestAnimationFrame(this.loop);
  };
}

let renderer: MatrixRenderer | null = null;
let currentConfig: MatrixConfig = DEFAULTS;

function ensureRenderer(): MatrixRenderer {
  if (!renderer) {
    renderer = new MatrixRenderer();
  }
  return renderer;
}

export function initMatrix(config: MatrixConfig = DEFAULTS): void {
  currentConfig = config;
  ensureRenderer().start(config);
}

export function updateMatrix(config: MatrixConfig): void {
  currentConfig = config;
  if (!renderer) {
    initMatrix(config);
    return;
  }
  renderer.update(config);
}

export function teardownMatrix(): void {
  renderer?.stop();
  renderer?.unmount();
  renderer = null;
}

export function getCurrentMatrixConfig(): MatrixConfig {
  return currentConfig;
}
