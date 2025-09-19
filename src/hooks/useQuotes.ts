import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchQuotes } from '../api/quoteService';
import { Quote } from '../types';

const FAVORITES_STORAGE_KEY = 'vibeme:favorites';

type StoredFavorites = Quote[];

function getStoredFavorites(): StoredFavorites {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as StoredFavorites;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to read favorites from storage', error);
    return [];
  }
}

function storeFavorites(favorites: StoredFavorites) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.warn('Failed to persist favorites', error);
  }
}

export interface UseQuotesResult {
  quotes: Quote[];
  currentQuote: Quote | null;
  favorites: Quote[];
  isLoading: boolean;
  error: string | null;
  showRandomQuote: () => void;
  toggleFavorite: (quote: Quote) => void;
  isFavorite: (quote: Quote) => boolean;
  copyCurrentQuote: () => Promise<void>;
  shareCurrentQuote: () => Promise<void>;
}

export function useQuotes(): UseQuotesResult {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [favorites, setFavorites] = useState<Quote[]>(() => getStoredFavorites());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loadedQuotes = await fetchQuotes();
        if (!mounted) return;
        setQuotes(loadedQuotes);
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Unexpected error loading quotes';
        setError(message);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (quotes.length && !currentQuote) {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }
  }, [quotes, currentQuote]);

  useEffect(() => {
    storeFavorites(favorites);
  }, [favorites]);

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

  const toggleFavorite = useCallback(
    (quote: Quote) => {
      setFavorites((current) => {
        const exists = current.some((fav) => fav.id === quote.id);
        if (exists) {
          return current.filter((fav) => fav.id !== quote.id);
        }
        return [...current, quote];
      });
    },
    []
  );

  const isFavorite = useCallback(
    (quote: Quote) => favorites.some((fav) => fav.id === quote.id),
    [favorites]
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

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(quoteText);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = quoteText;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }, [quoteText]);

  const shareCurrentQuote = useCallback(async () => {
    if (!quoteText) {
      return;
    }

    if (navigator.share) {
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

  return {
    quotes,
    currentQuote,
    favorites,
    isLoading,
    error,
    showRandomQuote,
    toggleFavorite,
    isFavorite,
    copyCurrentQuote,
    shareCurrentQuote,
  };
}
