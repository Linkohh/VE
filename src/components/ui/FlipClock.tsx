import { useEffect, useMemo, useState } from 'react';
import styles from './FlipClock.module.scss';

type FlipDigitProps = {
  value: string;
  label: string;
};

function FlipDigit({ value, label }: FlipDigitProps) {
  const [previous, setPrevious] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value === previous) return;
    setFlipping(true);
    const timeout = window.setTimeout(() => {
      setFlipping(false);
      setPrevious(value);
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [value, previous]);

  return (
    <div className={styles.digit} data-flipping={flipping} aria-label={label} role="timer">
      <span className={styles.cardTop}>{previous}</span>
      <span className={styles.cardBottom}>{value}</span>
      <span className={styles.flip}
        data-state={flipping ? 'active' : 'idle'}
      >
        <span className={styles.flipFront}>{previous}</span>
        <span className={styles.flipBack}>{value}</span>
      </span>
    </div>
  );
}

const format = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return {
    hours: [hours[0], hours[1]],
    minutes: [minutes[0], minutes[1]],
    seconds: [seconds[0], seconds[1]],
  };
};

export function FlipClock() {
  const [time, setTime] = useState(() => format(new Date()));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(format(new Date()));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const dateLabel = useMemo(() => new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }), []);

  return (
    <div className={styles.clock} aria-label="Current time">
      <div className={styles.timeRow}>
        <FlipDigit value={time.hours[0]} label="hours tens" />
        <FlipDigit value={time.hours[1]} label="hours ones" />
        <span className={styles.separator}>:</span>
        <FlipDigit value={time.minutes[0]} label="minutes tens" />
        <FlipDigit value={time.minutes[1]} label="minutes ones" />
        <span className={styles.separator}>:</span>
        <FlipDigit value={time.seconds[0]} label="seconds tens" />
        <FlipDigit value={time.seconds[1]} label="seconds ones" />
      </div>
      <div className={styles.date} aria-live="polite">
        {dateLabel}
      </div>
    </div>
  );
}
