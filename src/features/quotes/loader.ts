import { QUOTES_PROMISE } from '../../quotes.js';
import { dedupeQuotes, mergeCustomQuotes, normalizeQuotes } from './data';
import { Quote, QuoteSource } from './types';

const FALLBACK_QUOTES: Quote[] = [
  { text: "You're not behind—you're just loading.", author: 'Lincoln Ogden', category: 'perseverance' },
  { text: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde', category: 'originality' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'famous_quotes' },
];

export interface QuotesLoadResult {
  quotes: Quote[];
  source: QuoteSource;
}

export async function loadQuotes(customQuotes: Quote[]): Promise<QuotesLoadResult> {
  try {
    const raw = await QUOTES_PROMISE;
    const normalized = normalizeQuotes(raw);
    if (normalized.length > 0) {
      const merged = mergeCustomQuotes(normalized, customQuotes);
      return { quotes: dedupeQuotes(merged), source: 'unified-loader' };
    }
  } catch (err) {
    console.warn('[quotes] unified loader failed', err);
  }

  const mergedFallback = mergeCustomQuotes(FALLBACK_QUOTES, customQuotes);
  return { quotes: dedupeQuotes(mergedFallback), source: 'fallback' };
}
