import { writable } from 'svelte/store';
import { localStore } from './localStore.js';
import quotesData from '../../data/quotes.json';

export const currentQuoteIndex = writable(0);
export const countdown = writable(10);
export const isPaused = writable(false);
export const quotes = writable(quotesData.categories);

export const isDarkMode = localStore('vibeme-dark-mode', false);
export const favorites = localStore('vibeme-favorites', []);
export const customQuotes = localStore('vibeme-custom-quotes', []);
export const quoteRatings = localStore('vibeme-ratings', {});
export const stats = localStore('vibeme-stats', {
    quotesGenerated: 0,
    quotesShared: 0,
    dayStreak: 0,
    lastVisit: null
});
export const beepEnabled = localStore('vibeme-beep-enabled', true);
export const effectsEnabled = localStore('vibeme-effects', true);

// Mouse Glow Settings
export const glowIntensity = localStore('vibeme-glow-intensity', 90);
export const glowSize = localStore('vibeme-glow-size', 100);
export const glowTracking = localStore('vibeme-glow-tracking', true);

// TTS Settings
export const ttsEnabled = localStore('vibeme-tts-enabled', false);
export const ttsRate = localStore('vibeme-tts-rate', 1.0);
export const ttsVoice = localStore('vibeme-tts-voice', null);

// Color Settings
export const harmonyType = localStore('vibeme-harmony-type', 'auto');
export const themePreset = localStore('vibeme-theme-preset', 'auto');
export const vibrancy = localStore('vibeme-vibrancy', 70);
export const warmth = localStore('vibeme-warmth', 50);
export const baseColor = localStore('vibeme-base-color', null);
export const accessibilityMode = localStore('vibeme-accessibility-mode', true);

// Matrix Settings
export const matrixOpacity = localStore('vibeme-matrix-opacity', 80);
export const matrixIntensity = localStore('vibeme-matrix-intensity', 100);
export const matrixSpeed = localStore('vibeme-matrix-speed', 1.0);
export const matrixHighContrast = localStore('vibeme-matrix-high-contrast', false);
export const matrixBlendMode = localStore('vibeme-matrix-blend-mode', 'auto');
export const matrixDensity = localStore('vibeme-matrix-density', 1.5);
export const matrixRenderMode = localStore('vibeme-matrix-render-mode', 'dom');
export const matrixPreset = localStore('vibeme-matrix-preset', 'auto');

// Canvas Performance Settings
export const canvasMaxFps = localStore('vibeme-canvas-max-fps', 60);
export const canvasAdaptivePerformance = localStore('vibeme-canvas-adaptive-performance', true);
export const canvasMemoryManagement = localStore('vibeme-canvas-memory-management', true);

// Category Filter
export const categoryFilter = localStore('vibeme-category-filter', 'all');
