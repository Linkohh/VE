import { Quote, QuoteRating, QuoteRatingMap, RatingDirection } from './types';

const STORAGE_KEY = 'vibeme-ratings';

export function loadRatings(): QuoteRatingMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [key, normalizeRating(value)])
      );
    }
  } catch (err) {
    console.warn('[ratings] failed to parse, resetting', err);
  }
  return {};
}

function normalizeRating(value: any): QuoteRating {
  const up = Number(value?.up ?? 0);
  const down = Number(value?.down ?? 0);
  return { up: Number.isFinite(up) ? up : 0, down: Number.isFinite(down) ? down : 0 };
}

export function persistRatings(map: QuoteRatingMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('[ratings] failed to persist', err);
  }
}

export function quoteKey(quote: Quote): string {
  return `${quote.text.toLowerCase()}|${(quote.author || '').toLowerCase()}`;
}

export function getRating(map: QuoteRatingMap, quote: Quote): QuoteRating {
  const key = quoteKey(quote);
  return map[key] ?? { up: 0, down: 0 };
}

export function bumpRating(
  map: QuoteRatingMap,
  quote: Quote,
  direction: RatingDirection
): QuoteRating {
  const key = quoteKey(quote);
  const current = map[key] ?? { up: 0, down: 0 };
  const next: QuoteRating = {
    up: current.up + (direction === 'up' ? 1 : 0),
    down: current.down + (direction === 'down' ? 1 : 0),
  };
  map[key] = next;
  return next;
}
