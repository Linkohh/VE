import { writable } from 'svelte/store';
import { bus, EVENTS } from '../../lib/bus';

export interface QuoteViewModel {
  id?: string;
  text: string;
  author: string | null;
  category?: string | null;
  [key: string]: unknown;
}

type QuoteIntent = Record<string, unknown> | undefined;

function toText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (value == null) return '';
  return String(value).trim();
}

function readLegacyQuote(): QuoteViewModel | null {
  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  const text = toText(textEl?.textContent);
  if (!text) return null;
  const rawAuthor = toText(authorEl?.textContent).replace(/^—\s*/, '');
  const author = rawAuthor || null;
  return { text, author };
}

function normalizeQuote(payload: unknown): QuoteViewModel | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const input = payload as Record<string, unknown>;
  const text = toText(input.text ?? input.quote);
  if (!text) return null;

  const author = toText(input.author ?? input.a);
  const category = toText(input.category ?? input.c);
  const id = toText(input.id);

  return {
    ...input,
    id: id || undefined,
    text,
    author: author || null,
    category: category || null,
  };
}

const initialQuote = readLegacyQuote();
let currentValue: QuoteViewModel | null = initialQuote;
const { subscribe, set } = writable<QuoteViewModel | null>(initialQuote);

function commit(value: QuoteViewModel | null): void {
  currentValue = value;
  set(value);
}

const handleQuote = (payload: unknown) => {
  const normalized = normalizeQuote(payload);
  if (normalized) {
    commit(normalized);
  }
};

bus.on(EVENTS.QUOTE_GENERATED, handleQuote);

let requestedInitial = false;

function emitRequest(intent: QuoteIntent): void {
  const base = intent && typeof intent === 'object' ? { ...intent } : {};
  if (!('source' in (base as Record<string, unknown>))) {
    (base as Record<string, unknown>).source = 'svelte:quote-store';
  }
  bus.emit(EVENTS.QUOTE_REQUEST, base);
}

export function requestNextQuote(intent?: QuoteIntent): void {
  emitRequest(intent);
}

export function ensureInitialQuote(): void {
  if (requestedInitial) return;
  requestedInitial = true;
  if (!currentValue) {
    emitRequest({ reason: 'initial-render' });
  }
}

export const currentQuote = { subscribe };
