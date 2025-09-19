import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Layout from './Layout';
import quotesData from '../data/quotes.json';

const COUNTDOWN_SECONDS = 30;

function pickRandom(quotes) {
  if (!quotes || quotes.length === 0) {
    return { text: '', author: '', category: '' };
  }
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index];
}

function HomePage({ onNavigateAbout }) {
  const categories = useMemo(() => quotesData.categories ?? {}, []);
  const categoryKeys = useMemo(() => Object.keys(categories), [categories]);
  const allQuotes = useMemo(
    () =>
      categoryKeys.flatMap((category) =>
        (categories[category] || []).map((quote) => ({ ...quote, category }))
      ),
    [categories, categoryKeys]
  );

  const [currentCategory, setCurrentCategory] = useState('all');
  const [quote, setQuote] = useState(() => pickRandom(allQuotes));
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const raw = window.localStorage.getItem('vibeme:favorites');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (error) {
      console.warn('Failed to read favorites from storage', error);
      return [];
    }
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      const stored = window.localStorage.getItem('vibeme:darkMode');
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.warn('Failed to read dark mode preference', error);
      return false;
    }
  });
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      const stored = window.localStorage.getItem('vibeme:autoRefresh');
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.warn('Failed to read auto refresh preference', error);
      return false;
    }
  });
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [statusMessage, setStatusMessage] = useState('');
  const statusTimeoutRef = useRef(null);

  const availableQuotes = useMemo(() => {
    if (currentCategory === 'all') {
      return allQuotes;
    }
    return allQuotes.filter((item) => item.category === currentCategory);
  }, [allQuotes, currentCategory]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', isDarkMode);
    try {
      window.localStorage.setItem('vibeme:darkMode', JSON.stringify(isDarkMode));
    } catch (error) {
      console.warn('Failed to persist dark mode preference', error);
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'vibeme:autoRefresh',
        JSON.stringify(autoRefresh)
      );
    } catch (error) {
      console.warn('Failed to persist auto refresh preference', error);
    }
  }, [autoRefresh]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'vibeme:favorites',
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.warn('Failed to persist favorites', error);
    }
  }, [favorites]);

  useEffect(() => {
    if (!quote.text && allQuotes.length > 0) {
      setQuote(allQuotes[0]);
    }
  }, [allQuotes, quote]);

  const generateNewQuote = useCallback(() => {
    const pool = availableQuotes.length > 0 ? availableQuotes : allQuotes;
    if (pool.length === 0) {
      return;
    }
    const nextQuote = pickRandom(pool);
    setQuote(nextQuote);
    setHistory((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.text === nextQuote.text && item.author === nextQuote.author
      );
      const withoutDuplicate =
        existingIndex >= 0
          ? prev.filter((_, index) => index !== existingIndex)
          : prev;
      return [nextQuote, ...withoutDuplicate].slice(0, 25);
    });
  }, [allQuotes, availableQuotes]);

  useEffect(() => {
    if (!autoRefresh) {
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generateNewQuote();
          return COUNTDOWN_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, generateNewQuote]);

  useEffect(() => {
    if (autoRefresh) {
      setCountdown(COUNTDOWN_SECONDS);
    }
  }, [autoRefresh, quote]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  const showStatus = useCallback((message) => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    setStatusMessage(message);
    statusTimeoutRef.current = setTimeout(() => {
      setStatusMessage('');
    }, 2400);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const normalized = searchQuery.trim().toLowerCase();
    return allQuotes
      .filter(
        (item) =>
          item.text.toLowerCase().includes(normalized) ||
          item.author.toLowerCase().includes(normalized)
      )
      .slice(0, 40);
  }, [allQuotes, searchQuery]);

  const formattedTime = useMemo(
    () =>
      currentTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    [currentTime]
  );

  const formattedDate = useMemo(
    () =>
      currentTime.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    [currentTime]
  );

  const meridiem = useMemo(() => {
    const parts = currentTime
      .toLocaleTimeString([], { hour: 'numeric', hour12: true })
      .split(' ');
    return parts[1] ?? '';
  }, [currentTime]);

  const isFavorite = useMemo(
    () =>
      favorites.some(
        (item) => item.text === quote.text && item.author === quote.author
      ),
    [favorites, quote]
  );

  const handleFavoriteToggle = () => {
    if (!quote.text) {
      return;
    }
    setFavorites((prev) => {
      const exists = prev.some(
        (item) => item.text === quote.text && item.author === quote.author
      );
      if (exists) {
        showStatus('Removed from favorites');
        return prev.filter(
          (item) => item.text !== quote.text || item.author !== quote.author
        );
      }
      showStatus('Saved to favorites');
      return [{ ...quote }, ...prev].slice(0, 50);
    });
  };

  const handleCopyQuote = async () => {
    if (!quote.text) return;
    try {
      await navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
      showStatus('Quote copied to clipboard');
    } catch (error) {
      console.warn('Copy failed', error);
      showStatus('Copy not available');
    }
  };

  const handleShareQuote = async () => {
    if (!quote.text) return;
    const shareData = {
      title: 'VibeMe Quote',
      text: `"${quote.text}" — ${quote.author}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showStatus('Shared successfully');
      } catch (error) {
        console.warn('Share cancelled or failed', error);
      }
    } else {
      handleCopyQuote();
    }
  };

  const handleSpeakQuote = () => {
    if (!speechEnabled || !quote.text) {
      return;
    }

    try {
      const synth = window.speechSynthesis;
      if (!synth) {
        showStatus('Speech synthesis not supported');
        return;
      }
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `${quote.text} — ${quote.author}`
      );
      utterance.rate = 1.05;
      utterance.pitch = 1;
      synth.speak(utterance);
      showStatus('Speaking quote');
    } catch (error) {
      console.warn('Speech failed', error);
      showStatus('Unable to speak quote');
    }
  };

  const handleSearchSelect = (item) => {
    setQuote(item);
    setCurrentCategory(item.category ?? 'all');
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleTabChange = (tabId) => {
    setActiveSettingsTab(tabId);
  };

  return (
    <Layout effectsEnabled={effectsEnabled}>
      <nav
        id="left-rail"
        role="navigation"
        aria-label="VibeMe quick actions"
        data-state="hidden"
        data-size="expanded"
      >
        <ul className="rail-items">
          <li>
            <a
              className="rail-btn"
              href="/about"
              data-action="about"
              title="About VibeMe"
              aria-label="About VibeMe"
              onClick={onNavigateAbout}
            >
              <i className="fas fa-circle-info" aria-hidden="true"></i>
              <span className="label">About</span>
            </a>
          </li>
        </ul>
      </nav>

      <a
        href="#quote-area"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      <span id="sr-meridiem" className="sr-only" aria-live="polite">
        {meridiem}
      </span>

      <div className="fixed top-4 right-4 z-[10001] flex space-x-2">
        <button
          id="dark-mode-toggle"
          type="button"
          className="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
          aria-label="Toggle dark mode"
          title="Toggle dark/light mode"
          onClick={() => setIsDarkMode((prev) => !prev)}
        >
          <i
            className={`${isDarkMode ? 'fas fa-sun' : 'fas fa-moon'} text-white text-lg`}
            aria-hidden="true"
          ></i>
        </button>

        <button
          id="search-toggle"
          type="button"
          className="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
          aria-label="Open search"
          title="Search quotes"
          onClick={() => {
            setSearchOpen(true);
            setSearchQuery('');
          }}
        >
          <i className="fas fa-search text-white text-lg" aria-hidden="true"></i>
        </button>

        <button
          id="settings-toggle"
          type="button"
          className="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
          aria-label="Open settings menu"
          aria-expanded={settingsOpen}
          aria-controls="settings-panel"
          onClick={() => setSettingsOpen((prev) => !prev)}
        >
          <i className="fas fa-cog text-white text-lg" aria-hidden="true"></i>
        </button>
      </div>

      {searchOpen && (
        <div
          id="search-overlay"
          className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[10002] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-title"
        >
          <div className="relative w-full max-w-2xl">
            <h2 id="search-title" className="text-2xl font-bold text-white text-center mb-4">
              Search Quotes
            </h2>
            <input
              type="search"
              id="search-input"
              className="w-full p-3 bg-white/10 text-white border border-white/20 rounded-lg text-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Type to search by quote or author..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoFocus
            />
            <div
              id="search-results"
              className="mt-4 max-h-[60vh] overflow-y-auto space-y-2 text-left"
            >
              {searchResults.length === 0 && (
                <p className="text-white/70 text-sm">
                  Start typing to find inspiration from all categories.
                </p>
              )}
              {searchResults.map((item) => (
                <button
                  key={`${item.text}-${item.author}`}
                  type="button"
                  className="w-full text-left p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={() => handleSearchSelect(item)}
                >
                  <p className="font-semibold text-white">{item.text}</p>
                  <p className="text-white/70 text-sm mt-1">— {item.author}</p>
                  <p className="text-white/60 text-xs mt-1 uppercase tracking-wide">
                    {item.category.replace(/_/g, ' ')}
                  </p>
                </button>
              ))}
            </div>
            <button
              id="search-close-btn"
              className="absolute top-2 right-2 text-white/70 hover:text-white text-2xl"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      <div
        id="settings-panel"
        className={`${settingsOpen ? 'block' : 'hidden'} fixed top-16 right-4 left-4 sm:left-auto sm:w-96 z-[10000] bg-black/70 backdrop-blur-md p-4 rounded-lg shadow-xl text-white flex flex-col max-h-[80vh]`}
        role="dialog"
        aria-labelledby="settings-title"
        aria-hidden={!settingsOpen}
      >
        <h2 id="settings-title" className="text-base sm:text-lg font-semibold mb-3 text-center">
          Settings
        </h2>
        <div className="flex border-b border-gray-600 mb-3">
          <button
            className={`settings-tab ${activeSettingsTab === 'general' ? 'active' : ''}`}
            onClick={() => handleTabChange('general')}
          >
            General
          </button>
          <button
            className={`settings-tab ${activeSettingsTab === 'appearance' ? 'active' : ''}`}
            onClick={() => handleTabChange('appearance')}
          >
            Appearance
          </button>
          <button
            className={`settings-tab ${activeSettingsTab === 'audio' ? 'active' : ''}`}
            onClick={() => handleTabChange('audio')}
          >
            Audio
          </button>
          <button
            className={`settings-tab ${activeSettingsTab === 'content' ? 'active' : ''}`}
            onClick={() => handleTabChange('content')}
          >
            Content
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-1 space-y-4 text-sm">
          <section
            id="tab-general"
            className={activeSettingsTab === 'general' ? 'space-y-3' : 'hidden'}
          >
            <label className="flex items-center cursor-pointer text-sm">
              <input
                type="checkbox"
                className="mr-2 accent-pink-500 h-4 w-4"
                checked={effectsEnabled}
                onChange={(event) => setEffectsEnabled(event.target.checked)}
              />
              <span>Visual Effects</span>
            </label>
            <p className="text-xs text-gray-300">
              Toggle mouse glow and matrix background effects.
            </p>

            <label className="flex items-center cursor-pointer text-sm">
              <input
                type="checkbox"
                className="mr-2 accent-pink-500 h-4 w-4"
                checked={autoRefresh}
                onChange={(event) => setAutoRefresh(event.target.checked)}
              />
              <span>Auto-refresh quotes every {COUNTDOWN_SECONDS} seconds</span>
            </label>

            <div className="space-y-2 mt-4">
              <label htmlFor="category-filter" className="text-xs text-gray-300">
                Quote Category
              </label>
              <select
                id="category-filter"
                className="w-full text-black p-2 rounded text-sm"
                value={currentCategory}
                onChange={(event) => setCurrentCategory(event.target.value)}
              >
                <option value="all">All</option>
                {categoryKeys.map((key) => (
                  <option key={key} value={key}>
                    {key.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section
            id="tab-appearance"
            className={activeSettingsTab === 'appearance' ? 'space-y-3' : 'hidden'}
          >
            <p className="text-sm text-gray-200">
              Toggle dark mode using the moon icon near the top-right corner. VibeMe
              remembers your choice for your next visit.
            </p>
            <p className="text-xs text-gray-400">
              Additional theme customization options will arrive in a future
              update. Let us know what you would like to see!
            </p>
          </section>

          <section
            id="tab-audio"
            className={activeSettingsTab === 'audio' ? 'space-y-3' : 'hidden'}
          >
            <label className="flex items-center cursor-pointer text-sm">
              <input
                type="checkbox"
                className="mr-2 accent-pink-500 h-4 w-4"
                checked={speechEnabled}
                onChange={(event) => setSpeechEnabled(event.target.checked)}
              />
              <span>Enable spoken quotes</span>
            </label>
            <p className="text-xs text-gray-300">
              Uses the browser speech synthesizer when you select "Read Aloud".
            </p>
          </section>

          <section
            id="tab-content"
            className={activeSettingsTab === 'content' ? 'space-y-3' : 'hidden'}
          >
            <div>
              <h3 className="font-semibold text-sm mb-2">Favorites</h3>
              {favorites.length === 0 && (
                <p className="text-xs text-gray-300">
                  Save quotes you love and they will appear here for quick access.
                </p>
              )}
              <ul className="space-y-2">
                {favorites.map((item) => (
                  <li
                    key={`${item.text}-${item.author}`}
                    className="bg-white/10 p-3 rounded-lg"
                  >
                    <button
                      type="button"
                      className="text-left w-full"
                      onClick={() => setQuote(item)}
                    >
                      <p className="font-semibold">{item.text}</p>
                      <p className="text-xs text-white/70 mt-1">— {item.author}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">Recently viewed</h3>
              {history.length === 0 && (
                <p className="text-xs text-gray-300">
                  Newly generated quotes will appear here as a handy history.
                </p>
              )}
              <ul className="space-y-2">
                {history.map((item) => (
                  <li
                    key={`${item.text}-${item.author}-history`}
                    className="bg-white/5 p-2 rounded"
                  >
                    <button
                      type="button"
                      className="text-left w-full"
                      onClick={() => setQuote(item)}
                    >
                      <p className="text-xs font-medium text-white/90 line-clamp-2">
                        {item.text}
                      </p>
                      <p className="text-[11px] text-white/60 mt-1">— {item.author}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>

      <div className="quote-container-outer" id="quote-area">
        <div className="quote-container-inner dynamic-text-secondary">
          <div
            id="app-title-bar"
            className="app-title-bar"
            role="banner"
            aria-label="Application Title"
          >
            <h1 className="vb-logo heading-font" data-title="VibeMe">
              VibeMe
            </h1>
            <span className="logo-underline" aria-hidden="true"></span>
            <div
              id="flip-clock-mount"
              className="flip-clock-mount"
              data-skin="v2"
              aria-label="Current time"
              role="timer"
            >
              <span className="sr-only">Current time</span>
              <span aria-hidden="true" className="text-white text-lg font-mono">
                {formattedTime}
              </span>
            </div>
            <div
              id="date-mount"
              className="fc-date"
              aria-live="off"
              aria-label="Today's date"
            >
              <time id="date-time" dateTime={currentTime.toISOString()}>
                {formattedDate}
              </time>
            </div>
          </div>

          <section className="quote-animation-container mt-8">
            <blockquote className="quote-card">
              <p id="quote-text" className="quote-text-font">
                {quote.text || 'Take a moment to generate your next vibe.'}
              </p>
              <footer className="mt-4">
                <cite id="quote-author" className="author-font">
                  {quote.author ? `— ${quote.author}` : ''}
                </cite>
              </footer>
            </blockquote>
            {quote.category && (
              <p className="quote-category-pill" aria-label="Quote category">
                {quote.category.replace(/_/g, ' ')}
              </p>
            )}
          </section>

          <section className="flex flex-col items-center mt-8">
            <button
              id="generate-btn"
              type="button"
              onClick={generateNewQuote}
              className="generate-btn"
            >
              <i className="fas fa-sync-alt" aria-hidden="true"></i>
              <span className="text-sm">New Vibe</span>
            </button>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 w-full max-w-md">
              <button
                type="button"
                className={`action-btn ${isFavorite ? 'active' : ''}`}
                onClick={handleFavoriteToggle}
              >
                <i className="fas fa-star" aria-hidden="true"></i>
                <span>Favorite</span>
              </button>
              <button type="button" className="action-btn" onClick={handleCopyQuote}>
                <i className="fas fa-copy" aria-hidden="true"></i>
                <span>Copy</span>
              </button>
              <button type="button" className="action-btn" onClick={handleShareQuote}>
                <i className="fas fa-share-nodes" aria-hidden="true"></i>
                <span>Share</span>
              </button>
              <button type="button" className="action-btn" onClick={handleSpeakQuote}>
                <i className="fas fa-volume-high" aria-hidden="true"></i>
                <span>Read Aloud</span>
              </button>
            </div>

            <div className="mt-6 text-center text-white/80">
              <p className="text-xs uppercase tracking-widest">
                Next auto-refresh in
              </p>
              <p className="text-3xl font-semibold" aria-live="polite">
                {autoRefresh ? `${countdown}s` : 'Manual mode'}
              </p>
            </div>

            {statusMessage && (
              <div
                className="mt-6 px-4 py-2 rounded-full bg-white/10 text-white text-sm backdrop-blur"
                role="status"
                aria-live="polite"
              >
                {statusMessage}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default HomePage;
