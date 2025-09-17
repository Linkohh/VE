export interface Quote {
  text: string;
  author: string;
  category: string;
}

export interface QuoteFilters {
  category: string;
  search?: string;
}

export interface QuoteHistory {
  add(key: string): void;
  last(): string | null;
  list(): string[];
  clear(): void;
}

export interface QuoteStats {
  quotesGenerated: number;
  quotesShared: number;
  dayStreak: number;
  lastVisit: string | null;
}

export interface QuoteRating {
  up: number;
  down: number;
}

export type QuoteRatingMap = Record<string, QuoteRating>;

export type QuoteSource = 'unified-loader' | 'fallback';

export type RatingDirection = 'up' | 'down';
