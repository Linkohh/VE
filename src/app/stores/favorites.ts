import { get, writable } from 'svelte/store';
import { bus, EVENTS } from '../../lib/bus';
import {
  add,
  all,
  clear,
  favoriteId,
  remove,
  type FavoriteItem,
} from '../../features/favorites/store';
import type { QuoteViewModel } from './quote';

const store = writable<FavoriteItem[]>(all());

function sync(): void {
  store.set(all());
}

bus.on(EVENTS.FAV_CHANGED, sync);

export const favorites = { subscribe: store.subscribe };

function toFavoriteInput(quote: QuoteViewModel | null): FavoriteItem | null {
  if (!quote) return null;
  const text = typeof quote.text === 'string' ? quote.text.trim() : '';
  if (!text) return null;
  const author = typeof quote.author === 'string' && quote.author.trim() ? quote.author.trim() : null;
  return {
    id: favoriteId(text, author),
    text,
    author,
  };
}

export function isFavorite(quote: QuoteViewModel | null): boolean {
  if (!quote) return false;
  const target = toFavoriteInput(quote);
  if (!target) return false;
  return get(store).some((item) => item.id === target.id);
}

export function toggleFavorite(quote: QuoteViewModel | null): void {
  const target = toFavoriteInput(quote);
  if (!target) return;
  if (isFavorite(quote)) {
    remove(target.id);
  } else {
    add({ text: target.text, author: target.author });
  }
}

export function removeFavorite(id: string): void {
  remove(id);
}

export function clearFavorites(): void {
  clear();
}

export function openFavorites(opener?: HTMLElement | null): void {
  bus.emit(EVENTS.FAV_OPEN, { opener: opener ?? null });
}

export function closeFavorites(): void {
  bus.emit(EVENTS.FAV_CLOSE);
}

async function shareText(text: string): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch {
      /* fall through to clipboard */
    }
  }

  try {
    await navigator.clipboard?.writeText(text);
  } catch {
    /* ignore clipboard failures */
  }
}

export async function shareFavorite(item: FavoriteItem): Promise<void> {
  const text = item.author ? `${item.text} — ${item.author}` : item.text;
  await shareText(text);
}

export async function shareFavoriteById(id: string): Promise<void> {
  const item = get(store).find((entry) => entry.id === id);
  if (!item) return;
  await shareFavorite(item);
}
