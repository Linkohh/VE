import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchQuotes } from '../api/quoteService';
import { Quote } from '../types';

const FAVORITES_STORAGE_KEY = 'vibeme:favorites';

type StoredFavorites = Quote[];

interface FavoritesInitialization {
  favorites: StoredFavorites;
  warning: string | null;
  storageDisabled: boolean;
}

function initializeFavorites(): FavoritesInitialization {
  if (typeof window === 'undefined') {
    return { favorites: [], warning: null, storageDisabled: false };
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) {
      return { favorites: [], warning: null, storageDisabled: false };
    }
    const parsed = JSON.parse(raw) as StoredFavorites;
    if (!Array.isArray(parsed)) {
      return {
        favorites: [],
        warning: 'Favorites storage was corrupted. Starting with a clean list.',
        storageDisabled: false,
      };
    }
    return { favorites: parsed, warning: null, storageDisabled: false };
  } catch (error) {
    console.warn('Failed to read favorites from storage', error);
    return {
      favorites: [],
      warning: 'We could not access local storage. Favorites will only persist for this session.',
      storageDisabled: true,
    };
  }
}

export interface UseQuotesResult {
  quotes: Quote[];
  currentQuote: Quote | null;
  favorites: Quote[];
  isLoading: boolean;
  error: string | null;
  storageWarning: string | null;
  clipboardWarning: string | null;
  showRandomQuote: () => void;
  toggleFavorite: (quote: Quote) => void;
  isFavorite: (quote: Quote) => boolean;
  copyCurrentQuote: () => Promise<void>;
  shareCurrentQuote: () => Promise<void>;
  reloadQuotes: () => Promise<void>;
  clearError: () => void;
}

export function useQuotes(): UseQuotesResult {
  const favoritesInitialization = useMemo(() => initializeFavorites(), []);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [favorites, setFavorites] = useState<Quote[]>(favoritesInitialization.favorites);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(
    favoritesInitialization.warning,
  );
  const [clipboardWarning, setClipboardWarning] = useState<string | null>(null);
  const storageDisabledRef = useRef<boolean>(favoritesInitialization.storageDisabled);

  const persistFavorites = useCallback((nextFavorites: StoredFavorites) => {
    if (typeof window === 'undefined' || storageDisabledRef.current) {
      return;
    }

    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
      setStorageWarning(null);
    } catch (err) {
      storageDisabledRef.current = true;
      setStorageWarning('Favorites could not be saved. They will reset when you refresh the page.');
      console.warn('Failed to persist favorites', err);
    }
  }, []);

  const loadQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedQuotes = await fetchQuotes();
      setQuotes(loadedQuotes);
      if (loadedQuotes.length) {
        setCurrentQuote((prev) => {
          if (prev && loadedQuotes.some((quote) => quote.id === prev.id)) {
            return prev;
          }
          return loadedQuotes[Math.floor(Math.random() * loadedQuotes.length)];
        });
      } else {
        setCurrentQuote(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error loading quotes';
      setError(message);
      setCurrentQuote(null);
      setQuotes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuotes();
  }, [loadQuotes]);

  useEffect(() => {
    persistFavorites(favorites);
  }, [favorites, persistFavorites]);

  const showRandomQuote = useCallback(() => {
    if (!quotes.length) {
      return;
    }

    setCurrentQuote((prev) => {
      if (quotes.length === 1) {
        return quotes[0];
      }

      let nextQuote = prev;
      while (!nextQuote || nextQuote.id === prev?.id) {
        nextQuote = quotes[Math.floor(Math.random() * quotes.length)];
      }
      return nextQuote;
    });
  }, [quotes]);

  const toggleFavorite = useCallback((quote: Quote) => {
    setFavorites((current) => {
      const exists = current.some((fav) => fav.id === quote.id);
      if (exists) {
        return current.filter((fav) => fav.id !== quote.id);
      }
      return [...current, quote];
    });
  }, []);

  const isFavorite = useCallback(
    (quote: Quote) => favorites.some((fav) => fav.id === quote.id),
    [favorites],
  );

  const quoteText = useMemo(() => {
    if (!currentQuote) {
      return '';
    }
    return `"${currentQuote.text}" — ${currentQuote.author}`;
  }, [currentQuote]);

  const copyCurrentQuote = useCallback(async () => {
    if (!quoteText) {
      return;
    }

    setClipboardWarning(null);

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(quoteText);
        return;
      }
    } catch (err) {
      console.warn('Modern clipboard API failed. Falling back to legacy copy.', err);
    }

    try {
      if (typeof document === 'undefined') {
        throw new Error('Clipboard copy is not supported in this environment.');
      }
      const textarea = document.createElement('textarea');
      textarea.value = quoteText;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (!success) {
        throw new Error('Legacy clipboard command was rejected.');
      }
      setClipboardWarning(
        'Your browser has limited clipboard support. The quote was copied using a legacy method.',
      );
    } catch (err) {
      console.warn('Failed to copy quote using fallback method', err);
      setClipboardWarning(
        'We could not copy the quote automatically. Please copy it manually from the screen.',
      );
    }
  }, [quoteText]);

  const shareCurrentQuote = useCallback(async () => {
    if (!quoteText) {
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'VibeMe Motivation',
          text: quoteText,
        });
        return;
      } catch (error) {
        console.warn('Share cancelled or failed', error);
      }
    }

    await copyCurrentQuote();
  }, [quoteText, copyCurrentQuote]);

  const reloadQuotes = useCallback(() => loadQuotes(), [loadQuotes]);

  const clearError = useCallback(() => setError(null), []);

  return {
    quotes,
    currentQuote,
    favorites,
    isLoading,
    error,
    storageWarning,
    clipboardWarning,
    showRandomQuote,
    toggleFavorite,
    isFavorite,
    copyCurrentQuote,
    shareCurrentQuote,
    reloadQuotes,
    clearError,
  };
}
