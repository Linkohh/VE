import { bus, EVENTS } from '../../lib/bus';

export interface Theme {
  key: string;
  color1: string;
  color2: string;
  color3: string;
}

export const themes: Theme[] = [
  {
    key: 'synthwave',
    color1: '#FF0080',
    color2: '#00FFD5',
    color3: '#3300FF',
  },
  {
    key: 'ocean',
    color1: '#0011FF',
    color2: '#00FF88',
    color3: '#8800FF',
  },
];

export let current: Theme = themes[0];

export function applyTheme(theme: Theme): void {
  current = theme;
}

export function nextTheme(): Theme {
  const index = themes.indexOf(current);
  const next = themes[(index + 1) % themes.length];
  applyTheme(next);
  return next;
}

export function setThemeByKey(key: string): Theme | undefined {
  const theme = themes.find((t) => t.key === key);
  if (theme) {
    applyTheme(theme);
    return theme;
  }
  return undefined;
}

bus.on(EVENTS.THEME_CHANGED, (payload: { action?: 'next'; key?: string }) => {
  if (payload?.action === 'next') {
    nextTheme();
  } else if (payload?.key) {
    setThemeByKey(payload.key);
  }
});
