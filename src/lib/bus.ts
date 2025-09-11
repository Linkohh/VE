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

export const EVENTS = {
  QUOTE_GENERATED: 'QUOTE_GENERATED',
  THEME_CHANGED: 'THEME_CHANGED',
  FAVORITE_ADDED: 'FAVORITE_ADDED',
  FAVORITE_REMOVED: 'FAVORITE_REMOVED',
 
} as const;

