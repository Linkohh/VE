import { MatrixConfig } from './config';

interface Column {
  el: HTMLElement;
  end: number;
}

let running = false;
let rafId = 0;
let cfg: MatrixConfig;
let active: Column[] = [];
let pool: HTMLElement[] = [];

function createElement(): HTMLElement {
  const el = pool.pop() || document.createElement('div');
  el.className = 'binary-column';
  el.classList.add('visible');
  return el;
}

function interpolateColor(c1: string, c2: string, t: number): string {
  const parse = (c: string) => {
    const n = parseInt(c.replace('#', ''), 16);
    return [n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff];
  };
  const [r1, g1, b1] = parse(c1);
  const [r2, g2, b2] = parse(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function applyColors(el: HTMLElement): void {
  if (!cfg.colors || cfg.colors.length === 0) return;
  const rect = el.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, rect.left / Math.max(1, window.innerWidth)));
  const maxIdx = cfg.colors.length - 1;
  const pos = x * maxIdx;
  const base = Math.floor(pos);
  const t = pos - base;
  const c1 = cfg.colors[base];
  const c2 = cfg.colors[Math.min(base + 1, maxIdx)];
  const mixed = interpolateColor(c1, c2, t);
  el.style.color = mixed;
  el.style.textShadow = `0 0 5px ${mixed}`;
}

function generateContent(): string {
  const chars = cfg.characters;
  const maxLength = cfg.trailLength;
  const fadeRate = cfg.trailFadeRate;
  const length = Math.floor(Math.random() * maxLength) + Math.floor(maxLength * 0.3);
  let content = '';
  for (let i = 0; i < length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    let opacity: number;
    if (i === 0) {
      opacity = 1.0;
    } else if (i <= 3) {
      opacity = Math.max(0.7, 1 - i * 0.15);
    } else {
      const fadePosition = (i - 3) / (length - 3);
      opacity = Math.max(0.1, Math.exp(-fadePosition * 3) * 0.7);
    }
    const finalOpacity = Math.max(fadeRate, opacity);
    let cls = 'matrix-char';
    if (i === 0) cls += ' head';
    else if (i <= 5) cls += ` matrix-trail-${Math.min(i, 5)}`;
    content += `<span class="${cls}" style="opacity: ${finalOpacity.toFixed(3)}">${char}</span>`;
  }
  return content;
}

function recycle(col: Column, now: number): void {
  col.el.style.left = `${Math.random() * 100}%`;
  col.el.innerHTML = generateContent();
  applyColors(col.el);
  if (!cfg.reducedMotion) {
    const duration = 12 + Math.random() * 8;
    const delay = Math.random() * 4;
    col.el.dataset.startTime = String(now + delay * 1000);
    col.el.dataset.duration = String(duration * 1000);
    col.el.style.animation = 'none';
    requestAnimationFrame(() => {
      col.el.style.animation = `fall ${duration}s linear ${delay}s`;
    });
    col.end = now + (delay + duration) * 1000;
  } else {
    col.el.style.animation = 'none';
    col.end = Infinity;
  }
}

function loop(now: number): void {
  if (!running) return;
  const reduction = cfg.reducedMotion ? 0.25 : 1;
  const count = Math.floor((window.innerWidth / cfg.columnWidth) * cfg.densityMultiplier * reduction);
  if (active.length < count) {
    for (let i = active.length; i < count; i++) {
      const el = createElement();
      document.body.appendChild(el);
      const col: Column = { el, end: 0 };
      active.push(col);
    }
  } else if (active.length > count) {
    for (let i = active.length - 1; i >= count; i--) {
      const col = active.pop()!;
      col.el.remove();
      pool.push(col.el);
    }
  }

  active.forEach((col) => {
    if (now >= col.end) {
      recycle(col, now);
    }
  });

  if (!cfg.reducedMotion) {
    rafId = requestAnimationFrame(loop);
  } else {
    running = false;
  }
}

export function startDOM(config: MatrixConfig): void {
  if (running) return;
  cfg = config;
  running = true;
  if (cfg.reducedMotion) {
    loop(performance.now());
  } else {
    rafId = requestAnimationFrame(loop);
  }
}

export function stopDOM(): void {
  running = false;
  cancelAnimationFrame(rafId);
  active.forEach((col) => {
    col.el.remove();
    pool.push(col.el);
  });
  active = [];
}

