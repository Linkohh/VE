import { bus, EVENTS } from '../../lib/bus';

export interface Theme {
  color1: string;
  color2: string;
  color3: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) return null;
  const num = parseInt(sanitized, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const toLinear = (c: number): number => {
    const channel = c / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function updateThemeColorMeta(color: string): void {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  meta?.setAttribute('content', color);
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.style.setProperty('--color1', theme.color1);
  root.style.setProperty('--color2', theme.color2);
  root.style.setProperty('--color3', theme.color3);

  const background = theme.color1;
  const lumColor = theme.color2 || background;
  const luminance = getRelativeLuminance(lumColor);
  root.dataset.theme = luminance < 0.5 ? 'dark' : 'light';

  updateThemeColorMeta(background);

  bus.emit(EVENTS.THEME_CHANGED, theme);
}
