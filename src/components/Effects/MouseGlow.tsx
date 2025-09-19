import React, { useEffect, useRef } from 'react';
import styles from './MouseGlow.module.css';

const MouseGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) {
      return undefined;
    }

    const handleMove = (event: PointerEvent) => {
      glow.style.transform = `translate(${event.clientX - 150}px, ${event.clientY - 150}px)`;
    };

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return <div ref={glowRef} className={styles.glow} aria-hidden="true" />;
};

export default MouseGlow;
