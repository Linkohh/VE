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

const panelStore = writable(false);

let panelElement: HTMLElement | null = null;
let toggleElement: HTMLElement | null = null;
let listenersAttached = false;

function isEventInside(target: EventTarget | null): boolean {
  if (!(target instanceof Node)) return false;
  const withinPanel = panelElement?.contains(target) ?? false;
  const withinToggle = toggleElement?.contains(target) ?? false;
  return withinPanel || withinToggle;
}

function handlePointerDown(event: PointerEvent): void {
  if (!get(panelStore)) return;
  if (isEventInside(event.target)) return;
  closeFavorites();
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && get(panelStore)) {
    event.stopPropagation();
    closeFavorites();
  }
}

function attachListeners(): void {
  if (listenersAttached || typeof document === 'undefined') return;
  document.addEventListener('pointerdown', handlePointerDown, true);
  document.addEventListener('keydown', handleKeydown);
  listenersAttached = true;
}

function detachListeners(): void {
  if (!listenersAttached || typeof document === 'undefined') return;
  document.removeEventListener('pointerdown', handlePointerDown, true);
  document.removeEventListener('keydown', handleKeydown);
  listenersAttached = false;
}

panelStore.subscribe((open) => {
  if (open) {
    attachListeners();
  } else {
    detachListeners();
  }
});

export const favoritesPanel = { subscribe: panelStore.subscribe };

export function setFavoritesPanelElement(node: HTMLElement | null): void {
  panelElement = node;
}

export function setFavoritesToggleElement(node: HTMLElement | null): void {
  toggleElement = node;
}

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

export function openFavorites(): void {
  panelStore.set(true);
}

export function closeFavorites(): void {
  panelStore.set(false);
}

export function toggleFavorites(): void {
  panelStore.update((state) => !state);
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
