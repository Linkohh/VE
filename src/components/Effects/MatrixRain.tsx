import React, { useEffect, useRef } from 'react';
import styles from './MatrixRain.module.css';

interface MatrixRainProps {
  active: boolean;
}

const MatrixRain: React.FC<MatrixRainProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return undefined;
    }

    if (!active) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return undefined;
    }

    const characters = 'アイウエオカキクケコサシスセソ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const fontSize = 16;
    let columns = Math.floor(window.innerWidth / fontSize);
    const drops = new Array(columns).fill(1);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops.length = columns;
      drops.fill(1);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      context.fillStyle = 'rgba(2, 6, 23, 0.2)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#22d3ee';
      context.font = `${fontSize}px monospace`;

      drops.forEach((drop, index) => {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = index * fontSize;
        const y = drop * fontSize;
        context.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[index] = 0;
        }
        drops[index] += 1;
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resize);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
};

export default MatrixRain;
