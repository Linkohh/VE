import React from 'react';
import styles from './AboutPage.module.css';

interface AboutPageProps {
  onClose: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onClose }) => (
  <div className={styles.overlay} role="dialog" aria-modal="true">
    <div className={styles.card}>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close about dialog"
      >
        ×
      </button>
      <h2>About VibeMe</h2>
      <p>
        VibeMe is a mindful space for motivational quotes curated to match your mood. Enjoy a blend
        of ambient experiences, from soothing chimes to flowing matrix rain visuals.
      </p>
      <ul>
        <li>Discover a fresh vibe at any moment.</li>
        <li>Save the quotes that resonate most to your favorites list.</li>
        <li>Toggle immersive visual effects and lighting to suit your environment.</li>
        <li>Share inspiration instantly with friends and teammates.</li>
      </ul>
      <p className={styles.footer}>Stay curious, stay kind, and keep the vibes flowing.</p>
    </div>
  </div>
);

export default AboutPage;
