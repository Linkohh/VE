import { get, writable } from 'svelte/store';
import type { QuoteData, QuoteFilter, QuoteRequestIntent } from '../../features/quotes/engine';
import { nextQuote } from '../../features/quotes/engine';

export interface QuoteViewModel {
  id?: string;
  text: string;
  author: string | null;
  category?: string | null;
  source?: string;
  index?: number;
  total?: number;
  [key: string]: unknown;
}

type QuoteIntent = QuoteRequestIntent | undefined;
type QuoteFilterEventPayload = QuoteFilter | string | null | undefined;

function toText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (value == null) return '';
  return String(value).trim();
}

function normalizeQuote(payload: QuoteData | null | undefined): QuoteViewModel | null {
  if (!payload) return null;
  const text = toText(payload.text);
  if (!text) return null;

  const author = toText(payload.author);
  const category = toText(payload.category);
  const source = toText(payload.source);

  return {
    ...payload,
    id: payload.id || undefined,
    text,
    author: author || null,
    category: category || null,
    source: source || undefined,
  };
}

function cloneFilter(filter: QuoteFilter | null | undefined): QuoteFilter | undefined {
  if (!filter) return undefined;
  return { ...filter };
}

function normalizeFilter(payload: QuoteFilterEventPayload): QuoteFilter | null {
  if (payload == null) return null;
  if (typeof payload === 'string') {
    const value = payload.trim();
    if (!value || value.toLowerCase() === 'all') return null;
    return { category: value };
  }
  if (typeof payload === 'object') {
    const filter: QuoteFilter = { ...(payload as QuoteFilter) };
    if ('category' in filter) {
      const category = filter.category;
      if (typeof category === 'string') {
        const trimmed = category.trim();
        if (!trimmed || trimmed.toLowerCase() === 'all') {
          delete filter.category;
        } else {
          filter.category = trimmed;
        }
      } else if (category == null) {
        delete filter.category;
      }
    }
    return Object.keys(filter).length ? filter : null;
  }
  return null;
}

const quoteStore = writable<QuoteViewModel | null>(null);
const loadingStore = writable(false);

let currentFilter: QuoteFilter | null = null;
let requestedInitial = false;
let inflight: Promise<QuoteViewModel | null> | null = null;

function commit(value: QuoteViewModel | null): void {
  quoteStore.set(value);
}

function composeIntent(intent?: QuoteRequestIntent): QuoteRequestIntent {
  const base: QuoteRequestIntent = { ...(intent ?? {}) };
  if ('filter' in base) {
    const normalized = normalizeFilter(base.filter as QuoteFilterEventPayload);
    if (normalized) {
      base.filter = normalized;
    } else {
      delete base.filter;
    }
  } else if (currentFilter) {
    base.filter = cloneFilter(currentFilter);
  }
  return base;
}

async function fulfill(intent?: QuoteRequestIntent): Promise<QuoteViewModel | null> {
  const request = composeIntent(intent);
  loadingStore.set(true);
  try {
    const quote = await nextQuote(request);
    const normalized = normalizeQuote(quote);
    if (normalized) {
      commit(normalized);
    }
    return normalized;
  } catch (error) {
    console.warn('[quotes] failed to load quote', error);
    return null;
  } finally {
    loadingStore.set(false);
  }
}

function queueRequest(intent?: QuoteRequestIntent): Promise<QuoteViewModel | null> {
  const task = () => fulfill(intent);

  if (!inflight) {
    inflight = task();
  } else {
    inflight = inflight.then(() => task());
  }

  return inflight.finally(() => {
    inflight = null;
  });
}

export function requestNextQuote(intent?: QuoteIntent): Promise<QuoteViewModel | null> {
  return queueRequest(intent);
}

export function ensureInitialQuote(): Promise<QuoteViewModel | null> {
  if (requestedInitial) {
    if (inflight) {
      return inflight;
    }
    return Promise.resolve(get(quoteStore));
  }
  requestedInitial = true;
  return requestNextQuote({ reason: 'initial-render' });
}

export function applyQuoteFilter(payload: QuoteFilterEventPayload): Promise<QuoteViewModel | null> {
  currentFilter = normalizeFilter(payload);
  if (currentFilter) {
    return requestNextQuote({ filter: cloneFilter(currentFilter) });
  }
  return requestNextQuote({});
}

export function clearQuoteFilter(): Promise<QuoteViewModel | null> {
  currentFilter = null;
  return requestNextQuote({});
}

export const currentQuote = { subscribe: quoteStore.subscribe };
export const quoteLoading = { subscribe: loadingStore.subscribe };

export const __testing__ = {
  normalizeQuote,
  normalizeFilter,
  cloneFilter,
  clearState(): void {
    currentFilter = null;
    requestedInitial = false;
    inflight = null;
    commit(null);
    loadingStore.set(false);
  },
};
