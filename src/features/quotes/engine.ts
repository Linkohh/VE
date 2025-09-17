import { createHistory, filterQuotes } from './data';
import { loadQuotes } from './loader';
import type { Quote, QuoteFilters, QuoteSource } from './types';

export interface QuoteFilter {
  category?: string;
  search?: string;
}

export interface QuoteRequestIntent {
  filter?: QuoteFilter;
  reason?: string;
  avoidRepeat?: boolean;
}

export interface QuoteData extends Quote {
  id: string;
  source: QuoteSource;
  index: number;
  total: number;
}

export interface QuoteEngineAPI {
  nextQuote(intent?: QuoteRequestIntent): Promise<QuoteData>;
  allQuotes(): Promise<Quote[]>;
}

interface EngineState {
  quotes: Quote[];
  source: QuoteSource;
}

let state: EngineState | null = null;
let inflight: Promise<EngineState> | null = null;
const history = createHistory(32);

function keyForQuote(quote: Quote): string {
  const author = quote.author?.toLowerCase() ?? '';
  return `${quote.text.toLowerCase()}|${author}|${quote.category.toLowerCase()}`;
}

function toFilters(filter?: QuoteFilter): QuoteFilters {
  return {
    category: filter?.category?.trim() || 'all',
    search: filter?.search?.trim() || undefined,
  };
}

async function ensureState(): Promise<EngineState> {
  if (state) {
    return state;
  }
  if (!inflight) {
    inflight = loadQuotes([]).then((result) => {
      state = { quotes: result.quotes, source: result.source };
      return state;
    });
  }
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

function pickQuote(pool: Quote[], avoidRepeat: boolean): Quote {
  if (pool.length === 0) {
    throw new Error('No quotes available for the requested filter.');
  }

  const avoidKey = avoidRepeat ? history.last() : null;
  let candidate = pool[Math.floor(Math.random() * pool.length)];
  let candidateKey = keyForQuote(candidate);

  if (avoidRepeat && avoidKey && pool.length > 1) {
    let attempts = 0;
    while (candidateKey === avoidKey && attempts < pool.length * 2) {
      candidate = pool[Math.floor(Math.random() * pool.length)];
      candidateKey = keyForQuote(candidate);
      attempts += 1;
    }
  }

  history.add(candidateKey);
  return candidate;
}

export async function nextQuote(intent?: QuoteRequestIntent): Promise<QuoteData> {
  const { quotes, source } = await ensureState();
  const filters = toFilters(intent?.filter);
  const pool = filterQuotes(quotes, filters);
  const avoidRepeat = intent?.avoidRepeat ?? true;
  const quote = pickQuote(pool, avoidRepeat);
  const id = keyForQuote(quote);
  const index = pool.findIndex((item) => keyForQuote(item) === id);

  return {
    ...quote,
    id,
    source,
    index: index >= 0 ? index + 1 : 1,
    total: pool.length,
  };
}

export async function allQuotes(): Promise<Quote[]> {
  const { quotes } = await ensureState();
  return [...quotes];
}

export async function initQuoteEngine(): Promise<QuoteEngineAPI> {
  await ensureState();
  return { nextQuote, allQuotes };
}
