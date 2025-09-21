import { create } from 'zustand';
import { fetchQuotes, Quote } from '../api/quoteService';

type MatrixRenderMode = 'dom' | 'canvas' | 'hybrid';

type MatrixConfig = {
  columnWidth: number;
  updateInterval: number;
  colors: string[];
  densityMultiplier: number;
  bidirectional: boolean;
  trailLength: number;
  trailFadeRate: number;
  renderMode: MatrixRenderMode;
  canvas: {
    fontSize: number;
    columnSpacing: number;
    glowIntensity: number;
    shadowBlur: number;
    globalOpacity: number;
    maxFPS: number;
    adaptivePerformance: boolean;
  };
};

type AudioSettings = {
  beepEnabled: boolean;
  masterVolume: number;
  tts: {
    enabled: boolean;
    rate: number;
    voiceURI: string | null;
  };
};

type ThemeSettings = {
  activeTheme: string;
  availableThemes: string[];
  matrixPreset: string;
};

type TimerSettings = {
  countdownSeconds: number;
  autoAdvance: boolean;
};

type AppSettings = {
  theme: ThemeSettings;
  audio: AudioSettings;
  timer: TimerSettings;
  showClock: boolean;
  reduceMotion: boolean;
};

type AppState = {
  quotes: Quote[];
  quoteCategories: Record<string, Quote[]>;
  currentQuoteIndex: number;
  favorites: Quote[];
  customQuotes: Quote[];
  isPaused: boolean;
  countdown: number;
  effectsEnabled: boolean;
  isDarkMode: boolean;
  matrixConfig: MatrixConfig;
  settings: AppSettings;
  isLoadingQuotes: boolean;
  error?: string;
  actions: {
    loadQuotes: () => Promise<void>;
    setCurrentQuoteIndex: (index: number) => void;
    updateQuote: (quote?: Quote) => void;
    toggleFavorite: (quote: Quote) => void;
    addCustomQuote: (quote: Quote) => void;
    removeCustomQuote: (index: number) => void;
    toggleTimer: () => void;
    setCountdown: (countdown: number) => void;
    resetCountdown: () => void;
    setDarkMode: (isDark: boolean) => void;
    toggleEffects: () => void;
    updateSettings: (settings: Partial<AppSettings>) => void;
    setMatrixConfig: (config: Partial<MatrixConfig>) => void;
  };
};

const defaultMatrixConfig: MatrixConfig = {
  columnWidth: 16,
  updateInterval: 500,
  colors: ['#CC00FF', '#A104C1', '#4400F6', '#0050FF', '#03A0C5', '#00E5FF'],
  densityMultiplier: 1.5,
  bidirectional: true,
  trailLength: 20,
  trailFadeRate: 0.05,
  renderMode: 'dom',
  canvas: {
    fontSize: 28,
    columnSpacing: 10,
    glowIntensity: 10,
    shadowBlur: 5,
    globalOpacity: 1,
    maxFPS: 60,
    adaptivePerformance: true,
  },
};

const defaultSettings: AppSettings = {
  theme: {
    activeTheme: 'default',
    availableThemes: [
      'default',
      'love',
      'perseverance',
      'originality',
      'change',
      'inner_strength',
      'retro_neon',
      'desert_dusk',
      'lavender_glow',
      'midnight_arcade',
      'punchy_reds',
      'synthwave_sunset',
      'cosmic_ocean',
      'forbidden_forest',
      'galactic_grape',
      'belief',
      'perspective',
      'action',
      'growth',
      'wisdom',
    ],
    matrixPreset: 'neon_rain',
  },
  audio: {
    beepEnabled: true,
    masterVolume: 0.8,
    tts: {
      enabled: true,
      rate: 1,
      voiceURI: null,
    },
  },
  timer: {
    countdownSeconds: 30,
    autoAdvance: true,
  },
  showClock: true,
  reduceMotion: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  quotes: [],
  quoteCategories: {},
  currentQuoteIndex: 0,
  favorites: [],
  customQuotes: [],
  isPaused: true,
  countdown: defaultSettings.timer.countdownSeconds,
  effectsEnabled: true,
  isDarkMode: false,
  matrixConfig: defaultMatrixConfig,
  settings: defaultSettings,
  isLoadingQuotes: false,
  error: undefined,
  actions: {
    async loadQuotes() {
      set({ isLoadingQuotes: true, error: undefined });
      try {
        const data = await fetchQuotes();
        set({
          quotes: data.allQuotes,
          quoteCategories: data.categories,
          currentQuoteIndex: 0,
          isLoadingQuotes: false,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load quotes';
        set({
          quotes: [],
          quoteCategories: {},
          isLoadingQuotes: false,
          error: message,
        });
      }
    },
    setCurrentQuoteIndex(index) {
      const { quotes } = get();
      if (!quotes.length) {
        set({ currentQuoteIndex: 0 });
        return;
      }

      const safeIndex = Math.max(0, Math.min(index, quotes.length - 1));
      set({ currentQuoteIndex: safeIndex });
    },
    updateQuote(quote) {
      const { quotes, currentQuoteIndex } = get();
      if (!quotes.length) {
        return;
      }

      if (quote) {
        const index = quotes.findIndex(
          (q) => q.text === quote.text && q.author === quote.author && q.category === quote.category
        );

        set({ currentQuoteIndex: index >= 0 ? index : currentQuoteIndex });
        return;
      }

      const nextIndex = (currentQuoteIndex + 1) % quotes.length;
      set({ currentQuoteIndex: nextIndex });
    },
    toggleFavorite(quote) {
      const { favorites } = get();
      const exists = favorites.some(
        (fav) =>
          fav.text === quote.text && fav.author === quote.author && fav.category === quote.category
      );

      if (exists) {
        set({
          favorites: favorites.filter(
            (fav) =>
              !(
                fav.text === quote.text &&
                fav.author === quote.author &&
                fav.category === quote.category
              )
          ),
        });
      } else {
        set({ favorites: [...favorites, quote] });
      }
    },
    addCustomQuote(quote) {
      set((state) => ({ customQuotes: [...state.customQuotes, quote] }));
    },
    removeCustomQuote(index) {
      set((state) => ({ customQuotes: state.customQuotes.filter((_, i) => i !== index) }));
    },
    toggleTimer() {
      set((state) => ({ isPaused: !state.isPaused }));
    },
    setCountdown(countdown) {
      set({ countdown });
    },
    resetCountdown() {
      const {
        settings: {
          timer: { countdownSeconds },
        },
      } = get();
      set({ countdown: countdownSeconds });
    },
    setDarkMode(isDark) {
      set({ isDarkMode: isDark });
    },
    toggleEffects() {
      set((state) => ({ effectsEnabled: !state.effectsEnabled }));
    },
    updateSettings(partialSettings) {
      set((state) => ({
        settings: {
          ...state.settings,
          ...partialSettings,
          theme: {
            ...state.settings.theme,
            ...(partialSettings.theme ?? {}),
          },
          audio: {
            ...state.settings.audio,
            ...(partialSettings.audio ?? {}),
            tts: {
              ...state.settings.audio.tts,
              ...(partialSettings.audio?.tts ?? {}),
            },
          },
          timer: {
            ...state.settings.timer,
            ...(partialSettings.timer ?? {}),
          },
        },
      }));
    },
    setMatrixConfig(partialConfig) {
      set((state) => ({
        matrixConfig: {
          ...state.matrixConfig,
          ...partialConfig,
          canvas: {
            ...state.matrixConfig.canvas,
            ...(partialConfig.canvas ?? {}),
          },
        },
      }));
    },
  },
}));

export type { AppState };

void useAppStore.getState().actions.loadQuotes();
