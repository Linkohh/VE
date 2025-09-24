import { useEffect, useRef } from 'react';
import { useVibeStore } from '../../state/useVibeStore';
import styles from './MatrixRain.module.scss';

const GLYPHS: Record<string, string> = {
  classic: 'アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  extended: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-<>=',
  minimal: '01',
};

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { enabled, density, speed, trail, glyphSet, color, renderMode } = useVibeStore((state) => state.matrix);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let rafActive = true;
    let resizeObserver: ResizeObserver | null = null;

    const glyphs = (GLYPHS[glyphSet] || GLYPHS.classic).split('');
    const backgroundAlpha = renderMode === 'performance' ? 0.2 : renderMode === 'immersive' ? 0.12 : 0.16;
    const columnWidth = 20;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      columns = Math.floor((innerWidth / columnWidth) * density);
      drops = new Array(columns).fill(0);
      context.font = `${columnWidth - 4}px 'Share Tech Mono', 'Courier New', monospace`;
    };

    resize();
    window.addEventListener('resize', resize);

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }

    const loop = () => {
      if (!rafActive) return;
      animationFrame = window.requestAnimationFrame(loop);
      if (!enabled) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      context.fillStyle = `rgba(0, 0, 0, ${backgroundAlpha})`;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = 12 * trail;

      for (let i = 0; i < drops.length; i += 1) {
        const text = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * columnWidth;
        const y = drops[i] * columnWidth;
        context.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975 - speed * 0.2) {
          drops[i] = 0;
        } else {
          drops[i] += speed * 0.9 + Math.random() * 0.5;
        }
      }
    };

    animationFrame = window.requestAnimationFrame(loop);

    return () => {
      rafActive = false;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      resizeObserver?.disconnect();
    };
  }, [enabled, density, speed, trail, glyphSet, color, renderMode]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
