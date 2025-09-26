import { writable, derived } from 'svelte/store';
import quotesData from '../../data/quotes.json';

// Helper to safely get items from localStorage
const fromLocalStorage = (key, defaultValue) => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return defaultValue;
  }
  const value = localStorage.getItem(key);
  try {
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.warn(`Could not parse localStorage key "${key}":`, e);
    return defaultValue;
  }
};

// Helper to create a writable store that syncs with localStorage
const createPersistentStore = (key, defaultValue) => {
  const { subscribe, set, update } = writable(fromLocalStorage(key, defaultValue));
  return {
    subscribe,
    set: (value) => {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
      set(value);
    },
    update,
  };
};

// --- Core State ---
export const quotes = writable(quotesData.categories || {});
export const customQuotes = createPersistentStore('vibeme-custom-quotes', []);
export const allQuotes = derived([quotes, customQuotes], ([$quotes, $customQuotes]) => {
    const baseQuotes = Object.values($quotes).flat();
    return [...baseQuotes, ...$customQuotes];
});
export const currentQuoteIndex = writable(0);

// --- UI & Timer State ---
export const isPaused = writable(false);
export const countdown = writable(10);
export const isSettingsOpen = writable(false);
export const isFavoritesOpen = writable(false);

// --- Settings State (Persisted) ---
export const effectsEnabled = createPersistentStore('vibeme-effects', true);
export const isDarkMode = createPersistentStore('vibeme-dark-mode', false);
export const beepEnabled = createPersistentStore('vibeme-beep-enabled', true);

// TTS Settings
export const ttsEnabled = createPersistentStore('vibeme-tts-enabled', true);
export const ttsRate = createPersistentStore('vibeme-tts-rate', 1.0);
export const ttsVoiceURI = createPersistentStore('vibeme-tts-voice-uri', null);

// Theme & Color Settings
export const themePreset = createPersistentStore('vibeme-theme-preset', 'auto');
export const harmonyType = createPersistentStore('vibeme-harmony-type', 'auto');
export const vibrancy = createPersistentStore('vibeme-vibrancy', 70);
export const warmth = createPersistentStore('vibeme-warmth', 50);
export const baseColor = createPersistentStore('vibeme-base-color', null);
export const accessibilityMode = createPersistentStore('vibeme-accessibility-mode', true);

// Matrix Settings
export const matrixPreset = createPersistentStore('vibeme-matrix-preset', 'auto');
export const matrixOpacity = createPersistentStore('vibeme-matrix-opacity', 80);
export const matrixIntensity = createPersistentStore('vibeme-matrix-intensity', 100);
export const matrixSpeed = createPersistentStore('vibeme-matrix-speed', 1.0);
export const matrixHighContrast = createPersistentStore('vibeme-matrix-high-contrast', false);
export const matrixBlendMode = createPersistentStore('vibeme-matrix-blend-mode', 'auto');
export const matrixDensity = createPersistentStore('vibeme-matrix-density', 1.5);
export const matrixRenderMode = createPersistentStore('vibeme-matrix-render-mode', 'dom');

// Canvas Performance Settings
export const canvasMaxFps = createPersistentStore('vibeme-canvas-max-fps', 60);
export const canvasAdaptivePerformance = createPersistentStore('vibeme-canvas-adaptive-performance', true);
export const canvasMemoryManagement = createPersistentStore('vibeme-canvas-memory-management', true);

// Mouse Glow Settings
export const glowIntensity = createPersistentStore('vibeme-glow-intensity', 90);
export const glowSize = createPersistentStore('vibeme-glow-size', 100);
export const glowTracking = createPersistentStore('vibeme-glow-tracking', true);


// --- User Data (Persisted) ---
export const favorites = createPersistentStore('vibeme-favorites', []);
export const quoteRatings = createPersistentStore('vibeme-ratings', {});
export const stats = createPersistentStore('vibeme-stats', {
  quotesGenerated: 0,
  quotesShared: 0,
  dayStreak: 0,
  lastVisit: null,
});
export const categoryFilter = createPersistentStore('vibeme-category-filter', 'all');


// --- Dynamic Theme State ---
export const themeColors = writable({
  color1: '#6366f1',
  color2: '#8b5cf6',
  color3: '#a855f7',
});

// --- Actions ---
// This allows components to update the theme without needing to know the implementation
export function applyTheme(newColors) {
  themeColors.set(newColors);
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--color1', newColors.color1);
    root.style.setProperty('--color2', newColors.color2);
    root.style.setProperty('--color3', newColors.color3);
  }
}