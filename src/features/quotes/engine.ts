import { loadFavorites, toggleFavorite as toggleFavoriteData, clearFavorites as clearFavoritesData } from '../../favorites.js';
import { bus, EVENTS } from '../../lib/bus';
import { announceQuote } from './announce';
import { createHistory, filterQuotes } from './data';
import { loadQuotes } from './loader';
import { bumpRating, loadRatings, persistRatings, quoteKey } from './rating';
import {
  Quote,
  QuoteFilters,
  QuoteHistory,
  QuoteRating,
  QuoteRatingMap,
  QuoteSource,
  QuoteStats,
  RatingDirection,
} from './types';

const CUSTOM_QUOTES_KEY = 'vibeme-custom-quotes';
const CATEGORY_FILTER_KEY = 'vibeme-category-filter';
const STATS_KEY = 'vibeme-stats';
const HISTORY_LIMIT = 64;

interface LegacyBridge {
  invokeUpdate?: () => void;
  updateFavoriteButton?: (quote: Quote) => void;
  updateRatingDisplay?: () => void;
  initTts?: () => void;
  busEmit?: (event: string, payload: any) => void;
}

interface EngineState {
  ready: boolean;
  quotes: Quote[];
  customQuotes: Quote[];
  pending: Quote | null;
  current: Quote | null;
  filter: QuoteFilters;
  history: QuoteHistory;
  ratings: QuoteRatingMap;
  stats: QuoteStats;
  favorites: Quote[];
  source: QuoteSource | null;
}

const state: EngineState = {
  ready: false,
  quotes: [],
  customQuotes: [],
  pending: null,
  current: null,
  filter: { category: loadCategoryFilter(), search: '' },
  history: createHistory(HISTORY_LIMIT),
  ratings: loadRatings(),
  stats: loadStats(),
  favorites: loadFavorites(),
  source: null,
};

let legacyBridge: LegacyBridge | null = null;
let legacyRef: any = null;
let initialized = false;
let listenersBound = false;
let resolveReady: (() => void) | null = null;
const readyPromise = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

function loadCategoryFilter(): string {
  try {
    return localStorage.getItem(CATEGORY_FILTER_KEY) || 'all';
  } catch {
    return 'all';
  }
}

function saveCategoryFilter(value: string): void {
  try {
    localStorage.setItem(CATEGORY_FILTER_KEY, value);
  } catch {
    /* noop */
  }
}

function loadCustomQuotes(): Quote[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CUSTOM_QUOTES_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => ({
        text: String(item?.text ?? item?.quote ?? '').trim(),
        author: String(item?.author ?? item?.a ?? 'Unknown').trim() || 'Unknown',
        category: String(item?.category ?? 'custom').trim() || 'custom',
      }))
      .filter((quote) => quote.text.length > 0);
  } catch {
    return [];
  }
}

function loadStats(): QuoteStats {
  try {
    const raw = JSON.parse(localStorage.getItem(STATS_KEY) || 'null');
    if (raw && typeof raw === 'object') {
      return {
        quotesGenerated: Number.isFinite(raw.quotesGenerated) ? raw.quotesGenerated : 0,
        quotesShared: Number.isFinite(raw.quotesShared) ? raw.quotesShared : 0,
        dayStreak: Number.isFinite(raw.dayStreak) ? raw.dayStreak : 0,
        lastVisit: typeof raw.lastVisit === 'string' ? raw.lastVisit : null,
      };
    }
  } catch (err) {
    console.warn('[stats] failed to parse, resetting', err);
  }
  return { quotesGenerated: 0, quotesShared: 0, dayStreak: 0, lastVisit: null };
}

function saveStats(stats: QuoteStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('[stats] failed to persist', err);
  }
}

function touchVisit(stats: QuoteStats): void {
  const now = new Date();
  const lastVisit = stats.lastVisit ? new Date(stats.lastVisit) : null;
  if (lastVisit) {
    const diffDays = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      stats.dayStreak += 1;
    } else if (diffDays > 1) {
      stats.dayStreak = 1;
    }
  } else {
    stats.dayStreak = 1;
  }
  stats.lastVisit = now.toISOString();
  saveStats(stats);
}

function getFilteredQuotes(): Quote[] {
  const filtered = filterQuotes(state.quotes, state.filter);
  if (filtered.length > 0) return filtered;
  return state.quotes;
}

function pickRandomQuote(): Quote | null {
  const pool = getFilteredQuotes();
  if (!pool.length) return null;

  let candidate = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length === 1) {
    return candidate;
  }

  const lastKey = state.history.last();
  let attempts = 0;
  while (quoteKey(candidate) === lastKey && attempts < 8) {
    candidate = pool[Math.floor(Math.random() * pool.length)];
    attempts += 1;
  }

  return candidate;
}

function renderQuote(quote: Quote): void {
  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  if (textEl) {
    textEl.textContent = quote.text;
  }
  if (authorEl) {
    authorEl.textContent = `— ${quote.author}`;
  }
}

function emitStats(): void {
  bus.emit(EVENTS.QUOTE_STATS_UPDATED, { stats: { ...state.stats } });
}

function emitQuoteChanged(quote: Quote): void {
  const detail = { quote: quote.text, author: quote.author, category: quote.category };
  bus.emit(EVENTS.QUOTE_GENERATED, { quote, stats: { ...state.stats } });
  document.dispatchEvent(new CustomEvent(EVENTS.QUOTE_GENERATED, { detail }));
  legacyBridge?.busEmit?.('quote:generated', detail);

  window.setTimeout(() => {
    const payload = {
      quote: (document.getElementById('quote-text')?.textContent || quote.text).trim(),
      author: (document.getElementById('quote-author')?.textContent || `— ${quote.author}`).replace(/^—\s*/, ''),
    };
    document.dispatchEvent(new CustomEvent('quote:changed', { detail: payload }));
    document.dispatchEvent(new CustomEvent('vibeme:quote:changed', { detail: payload }));
  }, 450);
}

function finalizeQuoteDisplay(quote: Quote, viaLegacy: boolean): Quote {
  state.pending = null;
  state.current = quote;
  state.history.add(quoteKey(quote));
  state.stats.quotesGenerated += 1;
  saveStats(state.stats);
  announceQuote(quote);
  emitStats();
  emitQuoteChanged(quote);
  legacyBridge?.initTts?.();
  legacyBridge?.updateFavoriteButton?.(quote);
  legacyBridge?.updateRatingDisplay?.();
  if (!viaLegacy) {
    renderQuote(quote);
  }
  return quote;
}

function prepareNext(): Quote {
  if (!state.ready) {
    if (state.current) return state.current;
    const fallback = state.quotes[0] ?? pickRandomQuote();
    if (!fallback) {
      throw new Error('No quotes available');
    }
    state.pending = fallback;
    return fallback;
  }

  const candidate = pickRandomQuote();
  if (!candidate) {
    throw new Error('No quotes available');
  }
  state.pending = candidate;
  return candidate;
}

function commitDisplay(options: { viaLegacy?: boolean } = {}): Quote | null {
  const quote = state.pending ?? state.current ?? state.quotes[0] ?? null;
  if (!quote) return null;
  finalizeQuoteDisplay(quote, Boolean(options.viaLegacy));
  return quote;
}

function present(): Quote | null {
  if (legacyBridge?.invokeUpdate) {
    legacyBridge.invokeUpdate();
    return state.current;
  }
  prepareNext();
  return commitDisplay();
}

function setCategoryFilter(category: string): void {
  state.filter.category = category;
  saveCategoryFilter(category);
  if (legacyRef?.state) {
    legacyRef.state.categoryFilter = category;
  }
  bus.emit(EVENTS.QUOTE_CATEGORY_CHANGED, category);
}

function toggleFavoriteCurrent(): void {
  const quote = state.current;
  if (!quote) return;
  const added = toggleFavoriteData(state.favorites, quote);
  legacyBridge?.updateFavoriteButton?.(quote);
  bus.emit(added ? EVENTS.FAVORITE_ADDED : EVENTS.FAVORITE_REMOVED, quote);
}

function clearFavorites(): void {
  clearFavoritesData(state.favorites);
  if (state.current) {
    legacyBridge?.updateFavoriteButton?.(state.current);
  }
}

function rate(direction: RatingDirection): QuoteRating | null {
  const quote = state.current;
  if (!quote) return null;
  const next = bumpRating(state.ratings, quote, direction);
  persistRatings(state.ratings);
  legacyBridge?.updateRatingDisplay?.();
  bus.emit(EVENTS.QUOTE_RATED, { quote, rating: next, direction });
  return next;
}

function attachLegacy(legacy: any): void {
  legacyRef = legacy;
  const originalUpdate = legacy.updateQuote?.bind(legacy);
  const originalGetRandom = legacy.getRandomQuote?.bind(legacy);
  const originalGetCurrent = legacy.getCurrentQuote?.bind(legacy);
  const originalRate = legacy.rateQuote?.bind(legacy);

  legacy.getRandomQuote = () => {
    const quote = prepareNext();
    if (!state.ready && originalGetRandom) {
      state.pending = quote;
    }
    return quote;
  };

  legacy.getCurrentQuote = () => state.current ?? originalGetCurrent?.();

  legacy.updateQuote = () => {
    const before = state.stats.quotesGenerated;
    const result = originalUpdate?.();
    state.stats.quotesGenerated = before;
    commitDisplay({ viaLegacy: true });
    return result;
  };

  legacy.rateQuote = (dir: string) => {
    const direction: RatingDirection = dir === 'down' ? 'down' : 'up';
    rate(direction);
    legacy.playSound?.('click');
    legacy.triggerHapticFeedback?.('light');
  };

  legacy.loadQuotes = async () => {
    await readyPromise;
    return state.quotes;
  };

  legacy.state = legacy.state || {};
  legacy.state.favorites = state.favorites;
  legacy.state.quoteRatings = state.ratings;
  legacy.state.customQuotes = state.customQuotes;
  legacy.state.categoryFilter = state.filter.category;
  legacy.state.stats = state.stats;
  legacy.quotes = state.quotes;

  if (originalGetRandom && !state.ready) {
    // Preserve ability to fall back if initialization fails.
    state.pending = originalGetRandom();
  }

  legacyBridge = {
    invokeUpdate: () => legacy.updateQuote(),
    updateFavoriteButton: legacy.updateFavoriteButton?.bind(legacy),
    updateRatingDisplay: legacy.updateRatingDisplay?.bind(legacy),
    initTts: legacy.tts?.init ? () => legacy.tts.init() : undefined,
    busEmit: legacy.bus?.emit ? (event: string, payload: any) => legacy.bus.emit(event, payload) : undefined,
  };
}

function ensureListeners(): void {
  if (listenersBound) return;
  listenersBound = true;

  bus.on(EVENTS.GENERATE_QUOTE, () => {
    present();
  });

  bus.on(EVENTS.FAVORITE_TOGGLE, () => {
    toggleFavoriteCurrent();
  });

  bus.on(EVENTS.FAVORITES_CLEAR, () => {
    clearFavorites();
  });
}

async function bootstrapQuotes(): Promise<void> {
  state.customQuotes = loadCustomQuotes();
  const { quotes, source } = await loadQuotes(state.customQuotes);
  state.quotes = quotes;
  state.source = source;
  state.ready = true;
  legacyRef && (legacyRef.quotes = quotes);
  if (legacyRef?.state) {
    legacyRef.state.customQuotes = state.customQuotes;
    legacyRef.state.quoteRatings = state.ratings;
    legacyRef.state.favorites = state.favorites;
    legacyRef.state.categoryFilter = state.filter.category;
    legacyRef.state.stats = state.stats;
  }
  if (legacyRef?.onQuotesReady) {
    try {
      legacyRef.onQuotesReady(source);
    } catch (err) {
      console.warn('[quotes] legacy onQuotesReady failed', err);
    }
  }
  const detail = { source, count: quotes.length };
  bus.emit(EVENTS.QUOTES_READY, detail);
  document.dispatchEvent(new CustomEvent('vibeme:quotes:ready', { detail }));
  resolveReady?.();
}

export interface QuoteEngineAPI {
  ready: Promise<void>;
  present: () => Quote | null;
  getCurrentQuote: () => Quote | null;
  rate: (direction: RatingDirection) => QuoteRating | null;
  setCategoryFilter: (category: string) => void;
  getCategoryFilter: () => string;
  getStats: () => QuoteStats;
  getRatings: () => QuoteRatingMap;
  getHistory: () => string[];
}

const api: QuoteEngineAPI = {
  ready: readyPromise,
  present,
  getCurrentQuote: () => state.current,
  rate,
  setCategoryFilter,
  getCategoryFilter: () => state.filter.category,
  getStats: () => state.stats,
  getRatings: () => state.ratings,
  getHistory: () => state.history.list(),
};

export async function initQuoteEngine(legacy?: any): Promise<QuoteEngineAPI> {
  if (legacy) {
    attachLegacy(legacy);
  }

  if (!initialized) {
    initialized = true;
    ensureListeners();
    touchVisit(state.stats);
    await bootstrapQuotes();
  }

  return api;
}
