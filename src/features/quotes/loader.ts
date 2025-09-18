import catalog from '../../../data/quotes.json';
import { dedupeQuotes, mergeCustomQuotes, normalizeQuotes } from './data';
import type { Quote, QuoteSource } from './types';

const FALLBACK_QUOTES: Quote[] = [
  { text: "You're not behind—you're just loading.", author: 'Lincoln Ogden', category: 'perseverance' },
  { text: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde', category: 'originality' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'famous_quotes' },
];

export interface QuotesLoadResult {
  quotes: Quote[];
  source: QuoteSource;
}

const BASE_QUOTES: Quote[] = normalizeQuotes(catalog as unknown);

export async function loadQuotes(customQuotes: Quote[]): Promise<QuotesLoadResult> {
  if (BASE_QUOTES.length > 0) {
    const merged = mergeCustomQuotes(BASE_QUOTES, customQuotes);
    return { quotes: dedupeQuotes(merged), source: 'catalog' };
  }

  const mergedFallback = mergeCustomQuotes(FALLBACK_QUOTES, customQuotes);
  return { quotes: dedupeQuotes(mergedFallback), source: 'fallback' };
}
