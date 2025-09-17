import { add, all, clear, favoriteId, remove, replaceAll } from './features/favorites/store.ts';

function toText(value) {
  if (typeof value === 'string') return value.trim();
  if (value == null) return '';
  return String(value).trim();
}

function normalizeQuote(input) {
  if (!input) return null;

  if (typeof input === 'string') {
    const text = toText(input);
    if (!text) return null;
    return { text, author: null };
  }

  const text = toText(input.text ?? input.quote ?? input.q);
  if (!text) return null;

  const authorRaw = input.author ?? input.a ?? null;
  const authorText = toText(authorRaw);
  const author = authorText ? authorText : null;
  return { text, author };
}

function syncLegacyArray(target) {
  if (!Array.isArray(target)) return;
  const snapshot = all().map(({ text, author }) => ({ text, author }));
  target.splice(0, target.length, ...snapshot);
}

export function loadFavorites() {
  return all().map(({ text, author }) => ({ text, author }));
}

export function saveFavorites(favorites) {
  replaceAll(Array.isArray(favorites) ? favorites : []);
  syncLegacyArray(favorites);
}

export function toggleFavorite(favorites, quote) {
  const normalized = normalizeQuote(quote);
  if (!normalized) return false;

  const id = favoriteId(normalized.text, normalized.author);
  if (remove(id)) {
    syncLegacyArray(favorites);
    return false;
  }

  add({ id, text: normalized.text, author: normalized.author });
  syncLegacyArray(favorites);
  return true;
}

export function clearFavorites(favorites) {
  clear();
  syncLegacyArray(favorites);
}

export function initFavoritesPanel() {
  // Legacy initializer retained for compatibility; modern panel wiring handles setup.
}
