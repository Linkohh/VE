import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useQuotes, UseQuotesResult } from '../../hooks/useQuotes';
import { SettingsState, Theme } from '../../types';
import QuoteDisplay from '../Quote/QuoteDisplay';
import ActionButton from '../UI/ActionButton';
import SettingsPanel from '../Settings/SettingsPanel';
import MatrixRain from '../Effects/MatrixRain';
import MouseGlow from '../Effects/MouseGlow';
import FlipClock from '../Clock/FlipClock';
import AboutPage from '../About/AboutPage';
import styles from './App.module.css';

interface SettingsContextValue extends SettingsState {
  toggleTheme: () => void;
  setMatrixEnabled: (value: boolean) => void;
  setMouseGlowEnabled: (value: boolean) => void;
  setBeepEnabled: (value: boolean) => void;
}

const defaultSettings: SettingsContextValue = {
  theme: 'dark',
  matrixEnabled: true,
  mouseGlowEnabled: true,
  beepEnabled: true,
  toggleTheme: () => undefined,
  setMatrixEnabled: () => undefined,
  setMouseGlowEnabled: () => undefined,
  setBeepEnabled: () => undefined,
};

export const SettingsContext = createContext<SettingsContextValue>(defaultSettings);
export const QuotesContext = createContext<UseQuotesResult | null>(null);

export function useSettingsContext(): SettingsContextValue {
  return useContext(SettingsContext);
}

export function useQuotesContext(): UseQuotesResult {
  const context = useContext(QuotesContext);
  if (!context) {
    throw new Error('useQuotesContext must be used within a QuotesContext provider');
  }
  return context;
}

const App: React.FC = () => {
  const quotes = useQuotes();
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'dark',
    matrixEnabled: true,
    mouseGlowEnabled: true,
    beepEnabled: true,
  });
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const ensureAudioContext = useCallback(async () => {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!audioContextRef.current) {
      const audioCtor =
        window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!audioCtor) {
        return null;
      }
      audioContextRef.current = new audioCtor();
    }

    const context = audioContextRef.current;
    if (context.state === 'suspended') {
      await context.resume();
    }
    return context;
  }, []);

  const playBeep = useCallback(async () => {
    if (!settings.beepEnabled) {
      return;
    }

    const context = await ensureAudioContext();
    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 880;
    gain.gain.value = 0.15;
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      gain.disconnect();
    });
  }, [ensureAudioContext, settings.beepEnabled]);

  const handleNewVibe = useCallback(() => {
    quotes.showRandomQuote();
    void playBeep();
  }, [quotes, playBeep]);

  const settingsValue = useMemo<SettingsContextValue>(() => {
    const setTheme = (theme: Theme) => setSettings((prev) => ({ ...prev, theme }));
    return {
      ...settings,
      toggleTheme: () => setTheme(settings.theme === 'dark' ? 'light' : 'dark'),
      setMatrixEnabled: (value: boolean) => setSettings((prev) => ({ ...prev, matrixEnabled: value })),
      setMouseGlowEnabled: (value: boolean) => setSettings((prev) => ({ ...prev, mouseGlowEnabled: value })),
      setBeepEnabled: (value: boolean) => setSettings((prev) => ({ ...prev, beepEnabled: value })),
    };
  }, [settings]);

  const handleToggleFavorite = useCallback(() => {
    if (!quotes.currentQuote) {
      return;
    }
    quotes.toggleFavorite(quotes.currentQuote);
  }, [quotes]);

  const favoriteLabel = quotes.currentQuote && quotes.isFavorite(quotes.currentQuote) ? 'Unfavorite' : 'Favorite';
  const themeClassName = settings.theme === 'dark' ? styles.dark : styles.light;
  const globalThemeClass = settings.theme === 'dark' ? 'dark' : 'light';

  return (
    <SettingsContext.Provider value={settingsValue}>
      <QuotesContext.Provider value={quotes}>
        <div className={`${styles.app} ${themeClassName} ${globalThemeClass}`}>
          <MatrixRain active={settings.matrixEnabled} />
          {settings.mouseGlowEnabled && <MouseGlow />}
          <div className={styles.overlay}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.title}>VibeMe</h1>
                <p className={styles.subtitle}>Your daily stream of mindful motivation.</p>
              </div>
              <div className={styles.headerButtons}>
                <button type="button" className={styles.linkButton} onClick={() => setShowAbout(true)}>
                  About
                </button>
                <button type="button" className={styles.linkButton} onClick={() => setSettingsOpen(true)}>
                  Settings
                </button>
              </div>
            </header>
            <main className={styles.main}>
              <QuoteDisplay />
              <div className={styles.actions}>
                <ActionButton label="New Vibe" onClick={handleNewVibe} />
                <ActionButton label="Copy" onClick={() => void quotes.copyCurrentQuote()} />
                <ActionButton
                  label={favoriteLabel}
                  onClick={handleToggleFavorite}
                  disabled={!quotes.currentQuote}
                />
                <ActionButton label="Share" onClick={() => void quotes.shareCurrentQuote()} />
              </div>
              <FlipClock />
            </main>
            <footer className={styles.footer}>
              <span>{quotes.favorites.length} favorites saved</span>
              <span className={styles.attribution}>Crafted with positivity by VibeMe</span>
            </footer>
          </div>
          <SettingsPanel isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
          {showAbout && <AboutPage onClose={() => setShowAbout(false)} />}
        </div>
      </QuotesContext.Provider>
    </SettingsContext.Provider>
  );
};

export default App;
