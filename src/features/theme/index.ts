export interface Theme {
  key: string;
  gradient1: string;
  gradient2: string;
  gradient3: string;
  glow: string;
}

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

export let current: Theme = DEFAULT_THEME;

function updateDocument(theme: Theme): void {
  const root = document.documentElement;
  root.style.setProperty('--gradient-1', theme.gradient1);
  root.style.setProperty('--gradient-2', theme.gradient2);
  root.style.setProperty('--gradient-3', theme.gradient3);
  root.style.setProperty('--glow-color', theme.glow);
  document.body.dataset.theme = theme.key;
}

export function applyTheme(theme: Theme): void {
  current = theme;
  updateDocument(theme);
}

export function nextTheme(): Theme {
  const index = themes.findIndex((item) => item.key === current.key);
  const next = themes[(index + 1) % themes.length];
  applyTheme(next);
  return next;
}

export function setThemeByKey(key: string): Theme | undefined {
  const theme = themes.find((item) => item.key === key);
  if (theme) {
    applyTheme(theme);
    return theme;
  }
  return undefined;
}

if (typeof window !== 'undefined') {
  updateDocument(current);
}
