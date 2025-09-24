import React from 'react';
 
import styles from './HomePage.module.scss';
import { usePageSetup } from './usePageSetup';

const HomePage: React.FC = () => {
  usePageSetup({
    bodyClassName: styles.body,
 
    htmlClassName: '',
    htmlDataTheme: 'light',
  });

 
  return (
    <div className={styles.page}>
      <div id="edge-hotzone" aria-hidden="true" />
      <nav
        id="left-rail"
        className={styles.leftRail}
        role="navigation"
        aria-label="VibeMe quick actions"
        data-state="hidden"
        data-size="expanded"
      >
        <ul className={styles.railItems}>
          <li>
            <a
              className={styles.railButton}
              href="/about"
              data-action="about"
              title="About VibeMe"
              aria-label="About VibeMe"
            >
              <i className="fas fa-circle-info" aria-hidden="true" />
              <span>About</span>
            </a>
          </li>
        </ul>
      </nav>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <span id="sr-meridiem" className={styles.screenReaderOnly} aria-live="polite" />
      <div id="mouse-glow" className={styles.mouseGlow} aria-hidden="true" />
      <div id="matrix-bg" className={styles.matrixBackground} aria-hidden="true" />
      <canvas id="matrix-canvas" className={styles.matrixCanvas} aria-hidden="true" />
      <div className={styles.topControls}>
        <button
          id="dark-mode-toggle"
          type="button"
          className={styles.circleButton}
          aria-label="Toggle dark mode"
          title="Toggle dark/light mode"
        >
          <i className="fas fa-moon" aria-hidden="true" />
        </button>
        <button
          id="search-toggle"
          type="button"
          className={styles.circleButton}
          aria-label="Search quotes"
          title="Search quotes"
        >
          <i className="fas fa-search" aria-hidden="true" />
        </button>
      </div>
      <main
        id="main-content"
        className={styles.main}
        role="main"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          id="app-title-bar"
          className={styles.titleBar}
          role="banner"
          aria-label="Application Title"
        >
          <h1 className={styles.logo} data-title="VibeMe">
            VibeMe
          </h1>
          <span className={styles.logoUnderline} aria-hidden="true" />
          <div
            id="flip-clock-mount"
            className={styles.flipClockMount}
            data-skin="v2"
            aria-label="Current time"
            role="timer"
          />
          <div
            id="date-mount"
            className={styles.dateMount}
            aria-live="off"
            aria-label="Today's date"
          >
            <time id="date-time" dateTime="" />
          </div>
        </div>
        <div className={styles.quoteContainerOuter}>
          <div className={styles.quoteContainerInner}>
            <section className={styles.quoteAnimationContainer}>
              <blockquote>
                <p id="quote-text" className={styles.quoteText}>
                  &ldquo;Your next inspirational quote will appear here&rdquo;
                </p>
                <footer>
                  <cite id="quote-author" className={styles.quoteAuthor}>
                    — Unknown Author
                  </cite>
                </footer>
              </blockquote>
            </section>
            <section className={styles.controls}>
              <button id="generate-btn" className={styles.generateButton} type="button">
                <i className="fas fa-sync-alt" aria-hidden="true" />
                <span>New Vibe</span>
              </button>
              <div className={styles.quoteMeta}>
                <div className={styles.quoteCategory} aria-live="polite">
                  <span>Category:</span>
                  <span id="quote-category-value">Inspiration</span>
                </div>
                <div className={styles.quoteActions} role="group" aria-label="Quote actions">
                  <button
                    id="favorite-btn"
                    className={styles.quoteActionButton}
                    type="button"
                    aria-pressed="false"
                  >
                    <i className="fas fa-star" aria-hidden="true" />
                    <span className={styles.screenReaderOnly}>Favorite this quote</span>
                  </button>
                  <button id="copy-btn" className={styles.quoteActionButton} type="button">
                    <i className="fas fa-copy" aria-hidden="true" />
                    <span className={styles.screenReaderOnly}>Copy quote</span>
                  </button>
                  <button id="share-btn" className={styles.quoteActionButton} type="button">
                    <i className="fas fa-share-alt" aria-hidden="true" />
                    <span className={styles.screenReaderOnly}>Share quote</span>
                  </button>
                  <button id="tts-btn" className={styles.quoteActionButton} type="button">
                    <i className="fas fa-volume-up" aria-hidden="true" />
                    <span className={styles.screenReaderOnly}>Read quote aloud</span>
                  </button>
                </div>
              </div>
              <div className={styles.countdownWrapper} role="timer" aria-live="polite">
                <div className={styles.countdown} data-state="paused">
                  <span>Next vibe in</span>
                  <div className={styles.countdownTime}>
                    <span id="countdown-minutes">00</span>
                    <span>:</span>
                    <span id="countdown-seconds">30</span>
                  </div>
                </div>
                <button id="countdown-toggle" className={styles.countdownToggle} type="button">
                  <i className="fas fa-play" aria-hidden="true" />
                  <span className={styles.screenReaderOnly}>Toggle countdown</span>
                </button>
              </div>
              <div className={styles.statusMessage} role="status" aria-live="polite">
                <span id="status-message">Ready for inspiration</span>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
 

export default HomePage;
