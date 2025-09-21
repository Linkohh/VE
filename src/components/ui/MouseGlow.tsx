import { useEffect, useRef } from 'react';
import { useVibeStore } from '../../state/useVibeStore';
import styles from './MouseGlow.module.scss';

export function MouseGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const { enabled, size, intensity, color } = useVibeStore((state) => state.mouseGlow);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow || !enabled) return undefined;

    const handleMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      glow.style.setProperty('--mouse-x', `${clientX}px`);
      glow.style.setProperty('--mouse-y', `${clientY}px`);
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, [enabled]);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;
    glow.style.setProperty('--glow-size', `${size}px`);
    glow.style.setProperty('--glow-intensity', `${intensity}`);
    glow.style.setProperty('--glow-color', color);
  }, [size, intensity, color]);

  return <div ref={glowRef} className={styles.glow} data-enabled={enabled} aria-hidden="true" />;
}
