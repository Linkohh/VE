 import React from 'react';
import styles from './AboutPage.module.scss';
import { usePageSetup } from './usePageSetup';

const AboutPage: React.FC = () => {
  usePageSetup({
    bodyClassName: styles.body,
    htmlClassName: 'about-page',
    htmlDataTheme: 'light',
  });

  return (
    <div className={styles.page}>
      <div id="mouse-glow" className={styles.mouseGlow} aria-hidden="true" />
      <div id="matrix-bg" className={styles.matrixBackground} aria-hidden="true" />
      <canvas id="matrix-canvas" className={styles.matrixCanvas} aria-hidden="true" />
      <main id="main-content" className={styles.content}>
        <nav className={styles.nav}>
          <a href="/" className={styles.backLink} data-action="home">
            <i className="fas fa-arrow-left" aria-hidden="true" />
            <span>Home</span>
          </a>
        </nav>
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
        </div>
        <div className={styles.quoteContainerOuter}>
          <div className={styles.quoteContainerInner}>
            <h1 className={styles.aboutTitle}>About This Space</h1>
            <div id="about-content-placeholder" className={styles.aboutSections}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon} aria-hidden="true">
                    🎯
                  </span>
                  <span>Our Mission</span>
                </h2>
                <p className={styles.sectionText}>
                  Our mission is to provide a sanctuary for original thought and authentic
                  expression. In a world saturated with familiar voices, we celebrate the unique
                  perspectives that come from individual walks of life. This platform is dedicated
                  to fostering diversity, equity, and inclusion by empowering everyone to share
                  their own motivational quotes, ideas, and experiences. We believe that your voice
                  matters and that your originality is a source of inspiration.
                </p>
              </section>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon} aria-hidden="true">
                    📖
                  </span>
                  <span>Our Story</span>
                </h2>
                <p className={styles.sectionText}>
                  <em>
                    (This is where you can share the story behind the application. Talk about the
                    creator, what inspired them, and the journey of bringing this idea to life. Your
                    users will appreciate knowing the &lsquo;why&rsquo; behind the project!)
                  </em>
                </p>
              </section>
              <section className={`${styles.section} ${styles.contact}`}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon} aria-hidden="true">
                    ✉️
                  </span>
                  <span>Contact Us</span>
                </h2>
                <p className={styles.sectionText}>
                  We&rsquo;d love to hear from you! Whether you have a question, feedback, or a
                  story to share, please reach out.
                </p>
                <div className={styles.sectionText}>
 
                  <p>
                    <strong>Email:</strong>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
 
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>Copyright © 2025 VibeMe By LHO. All rights reserved.</p>
        </div>
      </footer>
    </div>
 
  );
};

export default AboutPage;
