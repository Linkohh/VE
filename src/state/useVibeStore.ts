import { create } from 'zustand';

export type Quote = {
  id: string;
  text: string;
  author: string;
  category: string;
};

export type SettingsTab = 'visuals' | 'themes' | 'matrix' | 'audio' | 'accessibility';

export type TimerState = {
  duration: number;
  remaining: number;
  isRunning: boolean;
  lastTick: number | null;
};

export type VisualSettings = {
  visualEffectsEnabled: boolean;
  bloom: boolean;
  vignette: boolean;
  chromaticAberration: boolean;
};

export type ThemeSettings = {
  preset: string;
  accentHue: number;
  glassMode: 'subtle' | 'vibrant';
  contrast: 'standard' | 'high';
};

export type MatrixSettings = {
  enabled: boolean;
  density: number;
  speed: number;
  trail: number;
  glyphSet: 'classic' | 'extended' | 'minimal';
  color: string;
  renderMode: 'balanced' | 'performance' | 'immersive';
};

export type MouseGlowSettings = {
  enabled: boolean;
  size: number;
  intensity: number;
  color: string;
};

export type AudioSettings = {
  beepEnabled: boolean;
  beepVolume: number;
  ttsEnabled: boolean;
  ttsRate: number;
  ttsVoice: string | null;
};

export type VibeState = {
  quote: Quote;
  quoteVersion: number;
  quoteHistory: Quote[];
  isFavorite: boolean;
  statusMessage: string;
  countdown: TimerState;
  settingsPanelOpen: boolean;
  activeSettingsTab: SettingsTab;
  visuals: VisualSettings;
  theme: ThemeSettings;
  matrix: MatrixSettings;
  mouseGlow: MouseGlowSettings;
  audio: AudioSettings;
  actions: {
    generateQuote: () => void;
    copyQuote: () => Promise<void>;
    shareQuote: () => Promise<void>;
    toggleFavorite: () => void;
    setStatus: (message: string) => void;
    tickTimer: () => void;
    toggleTimer: () => void;
    resetTimer: () => void;
    openSettings: (tab?: SettingsTab) => void;
    closeSettings: () => void;
    toggleSettingsPanel: () => void;
    setActiveSettingsTab: (tab: SettingsTab) => void;
    updateVisuals: (partial: Partial<VisualSettings>) => void;
    updateTheme: (partial: Partial<ThemeSettings>) => void;
    updateMatrix: (partial: Partial<MatrixSettings>) => void;
    updateMouseGlow: (partial: Partial<MouseGlowSettings>) => void;
    updateAudio: (partial: Partial<AudioSettings>) => void;
  };
};

const sampleQuotes: Quote[] = [
  {
    id: '1',
    text: 'Your next inspirational quote will appear here.',
    author: 'VibeMe',
    category: 'Inspiration',
  },
  {
    id: '2',
    text: 'Believe you can and you are halfway there.',
    author: 'Theodore Roosevelt',
    category: 'Motivation',
  },
  {
    id: '3',
    text: 'Great things never come from comfort zones.',
    author: 'Unknown',
    category: 'Growth',
  },
];

const randomQuote = (excludeId: string | null) => {
  const pool = excludeId ? sampleQuotes.filter((q) => q.id !== excludeId) : sampleQuotes;
  if (!pool.length) return sampleQuotes[0];
  return pool[Math.floor(Math.random() * pool.length)];
};

export const useVibeStore = create<VibeState>((set, get) => ({
  quote: sampleQuotes[0],
  quoteVersion: 0,
  quoteHistory: [sampleQuotes[0]],
  isFavorite: false,
  statusMessage: 'Ready for inspiration',
  countdown: {
    duration: 30,
    remaining: 30,
    isRunning: false,
    lastTick: null,
  },
  settingsPanelOpen: false,
  activeSettingsTab: 'visuals',
  visuals: {
    visualEffectsEnabled: true,
    bloom: true,
    vignette: false,
    chromaticAberration: false,
  },
  theme: {
    preset: 'aurora',
    accentHue: 190,
    glassMode: 'subtle',
    contrast: 'standard',
  },
  matrix: {
    enabled: true,
    density: 0.55,
    speed: 0.9,
    trail: 0.75,
    glyphSet: 'classic',
    color: '#00ff9c',
    renderMode: 'balanced',
  },
  mouseGlow: {
    enabled: true,
    size: 240,
    intensity: 0.45,
    color: '#24c1ff',
  },
  audio: {
    beepEnabled: true,
    beepVolume: 0.18,
    ttsEnabled: false,
    ttsRate: 1.0,
    ttsVoice: null,
  },
  actions: {
    generateQuote: () => {
      const { quote } = get();
      const next = randomQuote(quote?.id ?? null);
      set((state) => ({
        quote: next,
        quoteVersion: state.quoteVersion + 1,
        quoteHistory: [...state.quoteHistory, next].slice(-20),
        isFavorite: false,
        statusMessage: 'New vibe unlocked',
      }));
    },
    copyQuote: async () => {
      const { quote } = get();
      const text = `"${quote.text}" — ${quote.author}`;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        get().actions.setStatus('Copied to clipboard');
      } catch (error) {
        console.error('[copy] failed', error);
        get().actions.setStatus('Copy failed');
      }
    },
    shareQuote: async () => {
      const { quote } = get();
      const text = `"${quote.text}" — ${quote.author}`;
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'VibeMe Quote',
            text,
          });
        } else {
          await get().actions.copyQuote();
        }
        get().actions.setStatus('Shared successfully');
      } catch (error) {
        console.warn('[share] canceled or unsupported', error);
        get().actions.setStatus('Share unavailable');
      }
    },
    toggleFavorite: () => {
      set((state) => ({
        isFavorite: !state.isFavorite,
        statusMessage: !state.isFavorite ? 'Added to favorites' : 'Removed from favorites',
      }));
    },
    setStatus: (message: string) => {
      set({ statusMessage: message });
    },
    tickTimer: () => {
      const { countdown } = get();
      if (!countdown.isRunning) return;
      const now = performance.now();
      const last = countdown.lastTick ?? now;
      const delta = Math.floor((now - last) / 1000);
      if (delta <= 0) {
        set({
          countdown: {
            ...countdown,
            lastTick: now,
          },
        });
        return;
      }
      const nextRemaining = Math.max(0, countdown.remaining - delta);
      set({
        countdown: {
          ...countdown,
          remaining: nextRemaining,
          isRunning: nextRemaining > 0,
          lastTick: now,
        },
      });
      if (nextRemaining === 0) {
        get().actions.generateQuote();
        set({
          countdown: {
            ...countdown,
            remaining: countdown.duration,
            isRunning: false,
            lastTick: null,
          },
        });
      }
    },
    toggleTimer: () => {
      set((state) => ({
        countdown: {
          ...state.countdown,
          isRunning: !state.countdown.isRunning,
          lastTick: performance.now(),
        },
      }));
    },
    resetTimer: () => {
      set((state) => ({
        countdown: {
          ...state.countdown,
          remaining: state.countdown.duration,
          isRunning: false,
          lastTick: null,
        },
      }));
    },
    openSettings: (tab) => {
      set((state) => ({
        settingsPanelOpen: true,
        activeSettingsTab: tab ?? state.activeSettingsTab,
      }));
    },
    closeSettings: () => {
      set({ settingsPanelOpen: false });
    },
    toggleSettingsPanel: () => {
      set((state) => ({ settingsPanelOpen: !state.settingsPanelOpen }));
    },
    setActiveSettingsTab: (tab) => {
      set({ activeSettingsTab: tab });
    },
    updateVisuals: (partial) => {
      set((state) => ({ visuals: { ...state.visuals, ...partial } }));
    },
    updateTheme: (partial) => {
      set((state) => ({ theme: { ...state.theme, ...partial } }));
    },
    updateMatrix: (partial) => {
      set((state) => ({ matrix: { ...state.matrix, ...partial } }));
    },
    updateMouseGlow: (partial) => {
      set((state) => ({ mouseGlow: { ...state.mouseGlow, ...partial } }));
    },
    updateAudio: (partial) => {
      set((state) => ({ audio: { ...state.audio, ...partial } }));
    },
  },
}));
