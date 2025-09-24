import React from 'react';
import { QuoteDisplay } from './ui/QuoteDisplay';
import { ActionButtons } from './ui/ActionButtons';
import { TimerControls } from './ui/TimerControls';
import { SettingsPanel } from './ui/SettingsPanel';
import { MatrixRain } from './ui/MatrixRain';
import { MouseGlow } from './ui/MouseGlow';
import { FlipClock } from './ui/FlipClock';
import { useVibeStore } from '../state/useVibeStore';
import { usePageSetup } from './usePageSetup.js';
import styles from './HomePage.module.scss';

function HomePage(): JSX.Element {
  usePageSetup({
    bodyClassName: `${styles.body} gradient-bg`,
    htmlClassName: '',
    htmlDataTheme: 'light',
  });

  const quote = useVibeStore((state) => state.quote);

  return (
    <div className={styles.root}>
      <SettingsPanel />
      <MouseGlow />
      <MatrixRain />
      <main className={styles.main} role="main" aria-live="polite" aria-atomic="false">
        <header className={styles.header} role="banner">
          <div className={styles.branding}>
            <h1 className={styles.logo} data-title="VibeMe">
              VibeMe
            </h1>
            <span className={styles.tagline}>Dynamic motivation delivered</span>
          </div>
          <FlipClock />
        </header>
        <section className={styles.quoteRegion} aria-label="Quote display">
          <QuoteDisplay />
          <ActionButtons />
          <TimerControls />
        </section>
        <footer className={styles.footer}>
          <p className={styles.footerCopy}>
            Currently vibing with <strong>{quote.category}</strong> energy.
          </p>
        </footer>
      </main>
    </div>
  );
}
 

export default HomePage;
