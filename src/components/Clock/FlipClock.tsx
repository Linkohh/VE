import React, { useEffect, useState } from 'react';
import styles from './FlipClock.module.css';

type TimeParts = {
  hours: string;
  minutes: string;
  seconds: string;
};

const getTimeParts = (): TimeParts => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return { hours, minutes, seconds };
};

const FlipClock: React.FC = () => {
  const [time, setTime] = useState<TimeParts>(getTimeParts);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(getTimeParts());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className={styles.clock} aria-label="Current time">
      {Object.entries(time).map(([label, value]) => (
        <div key={label} className={styles.segment}>
          <span className={styles.value}>{value}</span>
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default FlipClock;
