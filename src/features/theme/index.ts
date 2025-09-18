import { writable, type Readable } from 'svelte/store';

export interface Theme {
  key: string;
  gradient1: string;
  gradient2: string;
  gradient3: string;
  glow: string;
}

const STORAGE_KEY = 'vibeme.theme';

const DEFAULT_THEME: Theme = {
  key: 'synthwave',
  gradient1: 'rgba(56, 189, 248, 0.25)',
  gradient2: 'rgba(129, 140, 248, 0.2)',
  gradient3: 'rgba(236, 72, 153, 0.2)',
  glow: 'rgba(59, 130, 246, 0.25)',
};

export const themes: Theme[] = [
  DEFAULT_THEME,
  {
    key: 'aurora',
    gradient1: 'rgba(16, 185, 129, 0.25)',
    gradient2: 'rgba(6, 182, 212, 0.25)',
    gradient3: 'rgba(250, 204, 21, 0.2)',
    glow: 'rgba(16, 185, 129, 0.25)',
  },
  {
    key: 'nocturne',
    gradient1: 'rgba(99, 102, 241, 0.25)',
    gradient2: 'rgba(168, 85, 247, 0.2)',
    gradient3: 'rgba(59, 130, 246, 0.2)',
    glow: 'rgba(129, 140, 248, 0.3)',
  },
];

function readStoredThemeKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getThemeByKey(key: string): Theme | undefined {
  return themes.find((item) => item.key === key);
}

function loadInitialTheme(): Theme {
  const storedKey = readStoredThemeKey();
  if (storedKey) {
    const storedTheme = getThemeByKey(storedKey);
    if (storedTheme) {
      return storedTheme;
    }
  }
  return DEFAULT_THEME;
}

let currentThemeValue: Theme = loadInitialTheme();

const internalThemeStore = writable<Theme>(currentThemeValue);
export const currentTheme: Readable<Theme> = {
  subscribe: internalThemeStore.subscribe,
};

function persistThemeKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
  } catch {
    /* ignore storage failures */
  }
}

function updateDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--gradient-1', theme.gradient1);
  root.style.setProperty('--gradient-2', theme.gradient2);
  root.style.setProperty('--gradient-3', theme.gradient3);
  root.style.setProperty('--glow-color', theme.glow);
  document.body.dataset.theme = theme.key;
}

export function getCurrentTheme(): Theme {
  return currentThemeValue;
}

export function getCurrentThemeKey(): string {
  return currentThemeValue.key;
}

export function applyTheme(theme: Theme, options: { persist?: boolean } = {}): Theme {
  const { persist = true } = options;
  currentThemeValue = theme;
  internalThemeStore.set(theme);
  if (persist) {
    persistThemeKey(theme.key);
  }
  updateDocument(theme);
  return theme;
}

export function setTheme(theme: Theme): Theme {
  return applyTheme(theme);
}

export function setThemeByKey(key: string): Theme | undefined {
  const theme = getThemeByKey(key);
  if (theme) {
    applyTheme(theme);
  }
  return theme;
}

export function nextTheme(): Theme {
  const currentKey = getCurrentThemeKey();
  const index = themes.findIndex((item) => item.key === currentKey);
  const next = index >= 0 ? themes[(index + 1) % themes.length] : themes[0];
  return applyTheme(next);
}

if (typeof document !== 'undefined') {
  updateDocument(currentThemeValue);
}
