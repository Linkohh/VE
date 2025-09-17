import { Quote, QuoteFilters, QuoteHistory } from './types';

function sanitizeQuote(raw: any, defaultCategory?: string): Quote {
  const text = String(raw?.text ?? raw?.quote ?? '').trim();
  const authorRaw = raw?.author ?? raw?.a ?? 'Unknown';
  const author = String(authorRaw ?? 'Unknown').trim() || 'Unknown';
  const categoryRaw = raw?.category ?? defaultCategory ?? 'default';
  const category = String(categoryRaw ?? 'default').trim() || 'default';
  return { text, author, category };
}

export function normalizeQuotes(raw: unknown): Quote[] {
  const sanitizeArray = (arr: any[], category?: string): Quote[] =>
    (arr || [])
      .map((item) => sanitizeQuote(item, category))
      .filter((quote) => quote.text.length > 0);

  if (Array.isArray(raw)) {
    return sanitizeArray(raw);
  }

  if (raw && typeof raw === 'object' && Array.isArray((raw as any).quotes)) {
    return sanitizeArray((raw as any).quotes);
  }

  if (raw && typeof raw === 'object' && (raw as any).categories && typeof (raw as any).categories === 'object') {
    const combined: Quote[] = [];
    for (const [category, list] of Object.entries((raw as any).categories)) {
      if (Array.isArray(list)) {
        combined.push(...sanitizeArray(list, category));
      }
    }
    return combined;
  }

  return [];
}

export function mergeCustomQuotes(base: Quote[], custom: Quote[]): Quote[] {
  return [...base, ...custom];
}

export function dedupeQuotes(quotes: Quote[]): Quote[] {
  const seen = new Set<string>();
  return quotes.filter((quote) => {
    const key = `${quote.text.toLowerCase()}|${(quote.author || '').toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function filterQuotes(quotes: Quote[], filters: QuoteFilters): Quote[] {
  const category = filters.category?.toLowerCase() ?? 'all';
  const search = filters.search?.trim().toLowerCase();

  return quotes.filter((quote) => {
    if (category && category !== 'all' && quote.category.toLowerCase() !== category) {
      return false;
    }
    if (search && !quote.text.toLowerCase().includes(search) && !quote.author.toLowerCase().includes(search)) {
      return false;
    }
    return true;
  });
}

export function createHistory(limit: number): QuoteHistory {
  const entries: string[] = [];

  return {
    add(key: string) {
      if (!key) return;
      entries.unshift(key);
      if (entries.length > limit) {
        entries.length = limit;
      }
    },
    last() {
      return entries[0] ?? null;
    },
    list() {
      return [...entries];
    },
    clear() {
      entries.length = 0;
    },
  };
}
