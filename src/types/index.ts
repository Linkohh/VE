export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
}

export interface QuoteEntry {
  text: string;
  author: string;
}

export interface QuoteCollection {
  categories: Record<string, QuoteEntry[]>;
}

export type Theme = 'light' | 'dark';

export interface SettingsState {
  theme: Theme;
  matrixEnabled: boolean;
  mouseGlowEnabled: boolean;
  beepEnabled: boolean;
}
