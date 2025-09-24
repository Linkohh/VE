import { useEffect } from 'react';
import { useVibeStore } from '../../state/useVibeStore';
import styles from './TimerControls.module.scss';

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
};

export function TimerControls() {
  const { countdown, toggleTimer, tickTimer, resetTimer } = useVibeStore((state) => ({
    countdown: state.countdown,
    toggleTimer: state.actions.toggleTimer,
    tickTimer: state.actions.tickTimer,
    resetTimer: state.actions.resetTimer,
  }));

  useEffect(() => {
    if (!countdown.isRunning) return undefined;
    const interval = window.setInterval(() => {
      tickTimer();
    }, 250);
    return () => window.clearInterval(interval);
  }, [countdown.isRunning, tickTimer]);

  const { minutes, seconds } = formatTime(countdown.remaining);

  return (
    <div className={styles.wrapper}>
      <div className={styles.countdown} data-state={countdown.isRunning ? 'running' : 'paused'}>
        <span className={styles.label}>Next vibe in</span>
        <div className={styles.time}>
          <span className={styles.unit}>{minutes}</span>
          <span className={styles.separator}>:</span>
          <span className={styles.unit}>{seconds}</span>
        </div>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.toggle}
          onClick={toggleTimer}
          aria-pressed={countdown.isRunning}
        >
          <i className={`fas ${countdown.isRunning ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />
          <span className="sr-only">Toggle countdown</span>
        </button>
        <button type="button" className={styles.reset} onClick={resetTimer}>
          <i className="fas fa-undo" aria-hidden="true" />
          <span className="sr-only">Reset countdown</span>
        </button>
      </div>
    </div>
  );
}
