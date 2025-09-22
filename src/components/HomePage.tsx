import { usePageSetup } from '../hooks/usePageSetup';

const HomePage = (): JSX.Element => {
  usePageSetup({
    bodyClassName: 'min-h-screen flex items-center justify-center p-0 gradient-bg',
    htmlClassName: '',
    htmlDataTheme: 'light'
  });

  return (
    <>
      <div id="edge-hotzone" aria-hidden="true"></div>
      <nav
        id="left-rail"
        role="navigation"
        aria-label="VibeMe quick actions"
        data-state="hidden"
        data-size="expanded"
      >
        {/*
        <header className="rail-header">
          <button className="rail-pin" aria-pressed="false" title="Pin panel">
            <i className="fas fa-thumbtack" aria-hidden="true"></i>
          </button>
          <button className="rail-collapse" aria-expanded="true" title="Collapse">
            <i className="fas fa-chevron-left" aria-hidden="true"></i>
          </button>
        </header>
        <ul className="rail-items">
          <li>
            <button className="rail-btn" data-action="new" title="New Vibe" aria-label="New Vibe">
              <i className="fas fa-wand-magic-sparkles" aria-hidden="true"></i>
              <span className="label">New Vibe</span>
            </button>
          </li>
          <li>
            <button className="rail-btn" data-action="fav" title="Favorites" aria-label="Favorites">
              <i className="fas fa-star" aria-hidden="true"></i>
              <span className="label">Favorites</span>
            </button>
          </li>
          <li>
            <button className="rail-btn" data-action="bookmarks" title="Bookmarks" aria-label="Bookmarks">
              <i className="fas fa-bookmark" aria-hidden="true"></i>
              <span className="label">Bookmarks</span>
            </button>
          </li>
          <li>
            <button className="rail-btn" data-action="share" title="Share" aria-label="Share">
              <i className="fas fa-share-nodes" aria-hidden="true"></i>
              <span className="label">Share</span>
            </button>
          </li>
          <li>
            <button className="rail-btn" data-action="tts" title="Read Aloud" aria-label="Read Aloud">
              <i className="fas fa-volume-high" aria-hidden="true"></i>
              <span className="label">Read Aloud</span>
            </button>
          </li>
          <li>
            <button className="rail-btn" data-action="theme" title="Theme &amp; Color" aria-label="Theme and Color">
              <i className="fas fa-palette" aria-hidden="true"></i>
              <span className="label">Theme</span>
            </button>
          </li>
          <li className="rail-divider" role="separator"></li>
          <li>
            <button className="rail-btn" data-action="settings" title="Settings" aria-label="Settings">
              <i className="fas fa-gear" aria-hidden="true"></i>
              <span className="label">Settings</span>
            </button>
          </li>
          <li>
            <a className="rail-btn" href="/about" data-action="about" title="About VibeMe" aria-label="About VibeMe">
              <i className="fas fa-circle-info" aria-hidden="true"></i>
              <span className="label">About</span>
            </a>
          </li>
        </ul>
        */}
        <ul className="rail-items">
          <li>
            <a className="rail-btn" href="/about" data-action="about" title="About VibeMe" aria-label="About VibeMe">
              <i className="fas fa-circle-info" aria-hidden="true"></i>
              <span className="label">About</span>
            </a>
          </li>
        </ul>
      </nav>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
      <span id="sr-meridiem" className="sr-only" aria-live="polite"></span>
      <div id="mouse-glow" className="mouse-glow" aria-hidden="true"></div>
      <div id="matrix-bg" className="matrix-bg" aria-hidden="true"></div>
      <canvas id="matrix-canvas" className="matrix-canvas" aria-hidden="true"></canvas>
      <div className="fixed top-4 right-4 z-[10001] flex space-x-2">
        <button
          id="dark-mode-toggle"
          type="button"
          className="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
          aria-label="Toggle dark mode"
          title="Toggle dark/light mode"
        >
          <i className="fas fa-moon text-white text-lg" aria-hidden="true"></i>
        </button>
        <button
          id="search-toggle"
          type="button"
          className="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
          aria-label="Search quotes"
          title="Search quotes"
        >
          <i className="fas fa-search text-white text-lg" aria-hidden="true"></i>
        </button>
      </div>
      <main
        id="main-content"
        className="w-full relative z-10 p-4 sm:p-6 lg:p-8"
        role="main"
        aria-live="polite"
        aria-atomic="true"
      >
        <div id="app-title-bar" className="app-title-bar" role="banner" aria-label="Application Title">
          <h1 className="vb-logo heading-font" data-title="VibeMe">
            VibeMe
          </h1>
          <span className="logo-underline" aria-hidden="true"></span>
          <div id="flip-clock-mount" className="flip-clock-mount" data-skin="v2" aria-label="Current time" role="timer"></div>
          <div id="date-mount" className="fc-date" aria-live="off" aria-label="Today's date">
            <time id="date-time" dateTime=""></time>
          </div>
        </div>
        <div className="quote-container-outer">
          <div className="quote-container-inner">
            <section className="quote-animation-container">
              <blockquote>
                <p id="quote-text" className="quote-text-font">
                  "Your next inspirational quote will appear here"
                </p>
                <footer>
                  <cite id="quote-author" className="author-font">
                    — Unknown Author
                  </cite>
                </footer>
              </blockquote>
            </section>
            <section className="flex flex-col items-center mt-6">
              <button id="generate-btn" className="generate-btn" type="button">
                <i className="fas fa-sync-alt" aria-hidden="true"></i>
                <span className="text-sm">New Vibe</span>
              </button>
              <div className="quote-meta">
                <div className="quote-category" aria-live="polite">
                  <span className="label">Category:</span>
                  <span id="quote-category-value">Inspiration</span>
                </div>
                <div className="quote-actions" role="group" aria-label="Quote actions">
                  <button id="favorite-btn" className="quote-action-btn" type="button" aria-pressed="false">
                    <i className="fas fa-star" aria-hidden="true"></i>
                    <span className="sr-only">Favorite this quote</span>
                  </button>
                  <button id="copy-btn" className="quote-action-btn" type="button">
                    <i className="fas fa-copy" aria-hidden="true"></i>
                    <span className="sr-only">Copy quote</span>
                  </button>
                  <button id="share-btn" className="quote-action-btn" type="button">
                    <i className="fas fa-share-alt" aria-hidden="true"></i>
                    <span className="sr-only">Share quote</span>
                  </button>
                  <button id="tts-btn" className="quote-action-btn" type="button">
                    <i className="fas fa-volume-up" aria-hidden="true"></i>
                    <span className="sr-only">Read quote aloud</span>
                  </button>
                </div>
              </div>
              <div className="countdown-wrapper" role="timer" aria-live="polite">
                <div className="countdown" data-state="paused">
                  <span className="label">Next vibe in</span>
                  <div className="countdown-time">
                    <span id="countdown-minutes">00</span>
                    <span className="separator">:</span>
                    <span id="countdown-seconds">30</span>
                  </div>
                </div>
                <button id="countdown-toggle" className="countdown-toggle" type="button">
                  <i className="fas fa-play" aria-hidden="true"></i>
                  <span className="sr-only">Toggle countdown</span>
                </button>
              </div>
              <div className="quote-status" role="status" aria-live="polite">
                <span id="status-message">Ready for inspiration</span>
              </div>
            </section>
          </div>
        </div>
        <section id="favorites-panel" className="panel" aria-hidden="true">
          <div className="panel-header">
            <h2 className="heading-font">Favorites</h2>
            <button className="panel-close" type="button" aria-label="Close favorites panel">
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <div id="favorites-list" className="panel-content" role="list"></div>
        </section>
        <section id="bookmarks-panel" className="panel" aria-hidden="true">
          <div className="panel-header">
            <h2 className="heading-font">Bookmarks</h2>
            <button className="panel-close" type="button" aria-label="Close bookmarks panel">
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <div id="bookmarks-list" className="panel-content" role="list"></div>
        </section>
        <section id="search-panel" className="search-panel" aria-hidden="true">
          <div className="search-panel-header">
            <h2 className="heading-font">Search Quotes</h2>
            <button className="panel-close" type="button" aria-label="Close search panel">
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <form id="search-form" className="search-form" role="search">
            <label htmlFor="search-input" className="sr-only">
              Search quotes
            </label>
            <div className="search-input-wrapper">
              <input
                id="search-input"
                type="search"
                name="query"
                placeholder="Search quotes, authors, or tags"
                autoComplete="off"
              />
              <button id="search-submit" type="submit" className="search-submit">
                <i className="fas fa-search" aria-hidden="true"></i>
                <span className="sr-only">Submit search</span>
              </button>
            </div>
            <div id="search-results" className="search-results" role="list"></div>
          </form>
        </section>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10 text-center py-2 z-[9999]">
        <div className="container mx-auto px-4">
          <p className="text-sm text-white/70">Copyright © 2025 VibeMe By LHO. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
