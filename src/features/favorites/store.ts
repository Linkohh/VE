import type { Quote } from '../quotes/types';

export interface FavoriteItem {
  id: string;
  text: string;
  author: string | null;
}

export type FavoriteInput =
  | string
  | Partial<FavoriteItem> & {
      text?: string;
      quote?: string;
      author?: string | null;
    }
  | Quote;

export const FAVORITES_STORAGE_KEYS = ['vibeme-favorites', 'favorites', 'vibemeFavorites'] as const;
export const FAVORITES_PRIMARY_STORAGE_KEY = FAVORITES_STORAGE_KEYS[0];

let favorites: FavoriteItem[] = loadFromStorage();
const subscribers = new Set<(items: FavoriteItem[]) => void>();

function toText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (value == null) return '';
  return String(value).trim();
}

function toAuthor(value: unknown): string | null {
  const text = toText(value);
  return text ? text : null;
}

export function favoriteId(text: string, author: string | null): string {
  return `${text.toLowerCase()}|${(author ?? '').toLowerCase()}`;
}

function normalizeLegacy(value: any): FavoriteItem | null {
  if (typeof value === 'string') {
    const text = toText(value);
    if (!text) return null;
    return { id: favoriteId(text, null), text, author: null };
  }

  if (value && typeof value === 'object') {
    const text = toText(value.text ?? value.quote ?? value.q);
    if (!text) return null;
    const author = toAuthor(value.author ?? value.a ?? null);
    const id = toText((value as FavoriteItem).id) || favoriteId(text, author);
    return { id, text, author };
  }

  return null;
}

function normalizeInput(input: FavoriteInput): FavoriteItem | null {
  if (typeof input === 'string') {
    return favorites.find((item) => item.id === input) ?? null;
  }

  if ('text' in input || 'quote' in input || 'q' in (input as any)) {
    const text = toText((input as any).text ?? (input as any).quote ?? (input as any).q);
    if (!text) return null;
    const author = toAuthor((input as any).author ?? (input as any).a ?? null);
    const id = toText((input as any).id) || favoriteId(text, author);
    return { id, text, author };
  }

  return null;
}

function dedupe(items: FavoriteItem[]): FavoriteItem[] {
  const seen = new Set<string>();
  const result: FavoriteItem[] = [];
  for (const item of items) {
    if (!item.id) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}

function loadFromStorage(): FavoriteItem[] {
  const collected: FavoriteItem[] = [];

  for (const key of FAVORITES_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          const normalized = normalizeLegacy(entry);
          if (normalized) {
            collected.push(normalized);
          }
        }
      }
    } catch (error) {
      console.warn('[favorites] failed to read', key, error);
    }
  }

  return dedupe(collected);
}

function persist(): void {
  try {
    localStorage.setItem(FAVORITES_PRIMARY_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.warn('[favorites] failed to persist', error);
  }
}

function replaceInternal(items: FavoriteItem[]): void {
  favorites = dedupe(items);
  persist();
  emitChanged();
}

function areListsEqual(a: FavoriteItem[], b: FavoriteItem[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];
    if (!left || !right) return false;
    if (left.id !== right.id || left.text !== right.text || left.author !== right.author) {
      return false;
    }
  }
  return true;
}

export function all(): FavoriteItem[] {
  return favorites.map((item) => ({ ...item }));
}

export function get(id: string): FavoriteItem | undefined {
  return favorites.find((item) => item.id === id);
}

export function add(input: FavoriteInput): FavoriteItem | null {
  const normalized = normalizeInput(input);
  if (!normalized) return null;

  const existingIndex = favorites.findIndex((item) => item.id === normalized.id);
  if (existingIndex >= 0) {
    const existing = favorites[existingIndex];
    if (existing.text !== normalized.text || existing.author !== normalized.author) {
      favorites[existingIndex] = normalized;
      persist();
      emitChanged();
    }
    return favorites[existingIndex];
  }

  favorites.push(normalized);
  persist();
  emitChanged();
  return normalized;
}

export function remove(id: string): boolean {
  const index = favorites.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  favorites.splice(index, 1);
  persist();
  emitChanged();
  return true;
}

export function clear(): void {
  if (!favorites.length) return;
  favorites = [];
  persist();
  emitChanged();
}

export function replaceAll(inputs: FavoriteInput[]): void {
  const normalized: FavoriteItem[] = [];
  for (const input of inputs) {
    const item = normalizeLegacy(input) ?? normalizeInput(input);
    if (item) {
      normalized.push(item);
    }
  }
  replaceInternal(normalized);
}

export function reloadFromStorage(): void {
  const loaded = loadFromStorage();
  if (!areListsEqual(loaded, favorites)) {
    favorites = loaded;
    emitChanged();
  }
}

function emitChanged(): void {
  const snapshot = all();
  subscribers.forEach((listener) => {
    listener(snapshot);
  });
}

export function subscribe(listener: (items: FavoriteItem[]) => void): () => void {
  subscribers.add(listener);
  listener(all());
  return () => {
    subscribers.delete(listener);
  };
}
