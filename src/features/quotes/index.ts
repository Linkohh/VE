import { bus, EVENTS } from '../../lib/bus';
import { nextQuote } from './engine';
import type { QuoteFilter, QuoteRequestIntent, QuoteData } from './engine';

type QuoteFilterEventPayload = QuoteFilter | string | null | undefined;

let currentFilter: QuoteFilter | null = null;

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

function composeIntent(intent?: QuoteRequestIntent): QuoteRequestIntent {
  const base: QuoteRequestIntent = { ...(intent ?? {}) };
  if ('filter' in base) {
    const normalized = normalizeFilter(base.filter as QuoteFilter | null | undefined);
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

async function fulfill(intent?: QuoteRequestIntent): Promise<void> {
  const request = composeIntent(intent);
  try {
    const quote = await nextQuote(request);
    bus.emit<QuoteData>(EVENTS.QUOTE_GENERATED, quote);
  } catch (error) {
    // Swallow errors for now; logging can be added when error handling is defined.
  }
}

bus.on<QuoteRequestIntent | undefined>(EVENTS.QUOTE_REQUEST, (intent) => {
  void fulfill(intent);
});

bus.on<QuoteFilterEventPayload>(EVENTS.QUOTE_FILTER, (payload) => {
  currentFilter = normalizeFilter(payload);
  if (currentFilter) {
    void fulfill({ filter: cloneFilter(currentFilter) });
  } else {
    void fulfill({});
  }
});
