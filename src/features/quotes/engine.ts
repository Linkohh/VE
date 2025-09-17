export interface QuoteData {
  text: string;
  author: string | null;
  category?: string | null;
  [key: string]: unknown;
}

export type QuoteFilter = {
  category?: string | null;
} & Record<string, unknown>;

export type QuoteRequestIntent = {
  filter?: QuoteFilter | null;
} & Record<string, unknown>;

interface LegacyQuote {
  text?: string;
  quote?: string;
  q?: string;
  author?: string | null;
  a?: string | null;
  category?: string | null;
  [key: string]: unknown;
}

declare global {
  interface Window {
    VibeMe?: {
      updateQuote?: () => void;
      getCurrentQuote?: () => LegacyQuote | null | undefined;
      getRandomQuote?: () => LegacyQuote | null | undefined;
      state?: Record<string, unknown>;
      [key: string]: unknown;
    };
  }
}

function normalizeCategory(category: string | null | undefined): string | null {
  if (typeof category !== 'string') return null;
  const trimmed = category.trim();
  if (!trimmed || trimmed.toLowerCase() === 'all') return null;
  return trimmed;
}

function applyFilter(filter: QuoteFilter | null | undefined): void {
  const engine = window.VibeMe;
  if (!engine) return;
  const category = normalizeCategory(filter?.category ?? null);
  const state = (engine.state ||= {});
  if (category) {
    state.categoryFilter = category;
    try {
      localStorage.setItem('vibeme-category-filter', category);
    } catch {
      // ignore storage failures
    }
  } else {
    if ('categoryFilter' in state) {
      delete state.categoryFilter;
    }
    try {
      localStorage.removeItem('vibeme-category-filter');
    } catch {
      // ignore storage failures
    }
  }
}

function toQuoteData(raw: LegacyQuote | null | undefined): QuoteData {
  const text = raw?.text ?? raw?.quote ?? raw?.q ?? '';
  const author = raw?.author ?? raw?.a ?? null;
  const data: QuoteData = {
    text,
    author,
  };
  if (raw && typeof raw.category === 'string') {
    data.category = raw.category;
  } else if (raw && raw.category == null && 'category' in raw) {
    data.category = null;
  }
  return data;
}

export async function nextQuote(intent: QuoteRequestIntent = {}): Promise<QuoteData> {
  applyFilter(intent.filter);

  const engine = window.VibeMe;
  if (!engine) {
    return { text: '', author: null };
  }

  try {
    engine.updateQuote?.();
  } catch {
    // ignore runtime failures from legacy engine
  }

  const current =
    engine.getCurrentQuote?.() ??
    engine.getRandomQuote?.() ??
    null;

  return toQuoteData(current);
}
