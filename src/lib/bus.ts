export type Handler<T = any> = (payload: T) => void;

export class EventBus {
  private listeners = new Map<string, Set<Handler>>();

  on<T = any>(event: string, handler: Handler<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as Handler);
  }

  off<T = any>(event: string, handler: Handler<T>): void {
    this.listeners.get(event)?.delete(handler as Handler);
  }

  emit<T = any>(event: string, payload: T): void {
    this.listeners.get(event)?.forEach((handler) => handler(payload));
  }
}

export const bus = new EventBus();

export const QUOTE_GENERATED = 'QUOTE_GENERATED';
export const THEME_CHANGED = 'THEME_CHANGED';
export const FAVORITE_ADDED = 'FAVORITE_ADDED';
export const FAVORITE_REMOVED = 'FAVORITE_REMOVED';
export const GENERATE_QUOTE = 'GENERATE_QUOTE';
export const MATRIX_TOGGLE = 'MATRIX_TOGGLE';
export const FAVORITE_TOGGLE = 'FAVORITE_TOGGLE';
export const FAVORITES_CHANGED = 'FAVORITES_CHANGED';
export const BEEP_TOGGLE = 'BEEP_TOGGLE';
export const TIMER_TOGGLE = 'TIMER_TOGGLE';
export const COPY_QUOTE = 'COPY_QUOTE';
export const SHARE_TOGGLE = 'SHARE_TOGGLE';
export const FAVORITES_CLEAR = 'FAVORITES_CLEAR';
export const QUOTE_FORM_TOGGLE = 'QUOTE_FORM_TOGGLE';
export const QUOTE_SUBMIT = 'QUOTE_SUBMIT';
export const SEARCH_TOGGLE = 'SEARCH_TOGGLE';
export const SEARCH_QUERY = 'SEARCH_QUERY';
export const QUOTES_READY = 'QUOTES_READY';
export const QUOTE_STATS_UPDATED = 'QUOTE_STATS_UPDATED';
export const QUOTE_RATED = 'QUOTE_RATED';
export const QUOTE_CATEGORY_CHANGED = 'QUOTE_CATEGORY_CHANGED';

export const EVENTS = {
  QUOTE_GENERATED,
  THEME_CHANGED,
  FAVORITE_ADDED,
  FAVORITE_REMOVED,
  GENERATE_QUOTE,
  MATRIX_TOGGLE,
  FAVORITE_TOGGLE,
  FAVORITES_CHANGED,
  BEEP_TOGGLE,
  TIMER_TOGGLE,
  COPY_QUOTE,
  SHARE_TOGGLE,
  FAVORITES_CLEAR,
  QUOTE_FORM_TOGGLE,
  QUOTE_SUBMIT,
  SEARCH_TOGGLE,
  SEARCH_QUERY,
  QUOTES_READY,
  QUOTE_STATS_UPDATED,
  QUOTE_RATED,
  QUOTE_CATEGORY_CHANGED,
} as const;

