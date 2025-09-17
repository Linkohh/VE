import { get, writable } from 'svelte/store';
import {
  add,
  all,
  clear,
  favoriteId,
  remove,
  subscribe as subscribeToFavorites,
  type FavoriteItem,
} from '../../features/favorites/store';
import type { QuoteViewModel } from './quote';

const itemsStore = writable<FavoriteItem[]>(all());

subscribeToFavorites((items) => {
  itemsStore.set(items);
});

export const favorites = { subscribe: itemsStore.subscribe };

const panelStore = writable<{ open: boolean; opener: HTMLElement | null }>({
  open: false,
  opener: null,
});

export const favoritesPanel = { subscribe: panelStore.subscribe };

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
  return get(itemsStore).some((item) => item.id === target.id);
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
  panelStore.set({ open: true, opener: opener ?? null });
}

export function closeFavorites(): void {
  panelStore.update((state) => ({ ...state, open: false }));
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
  const item = get(itemsStore).find((entry) => entry.id === id);
  if (!item) return;
  await shareFavorite(item);
}

export const __testing__ = { toFavoriteInput };
