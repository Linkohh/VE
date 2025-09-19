import { Quote, QuoteCollection, QuoteEntry } from '../types';

const QUOTES_ENDPOINT = '/quotes.json';

function isQuoteEntryArray(value: unknown): value is QuoteEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        'text' in entry &&
        'author' in entry &&
        typeof (entry as QuoteEntry).text === 'string' &&
        typeof (entry as QuoteEntry).author === 'string',
    )
  );
}

function isQuoteCollection(value: unknown): value is QuoteCollection {
  if (typeof value !== 'object' || value === null || !('categories' in value)) {
    return false;
  }

  const categories = (value as { categories: unknown }).categories;
  if (typeof categories !== 'object' || categories === null) {
    return false;
  }

  return Object.values(categories as Record<string, unknown>).every(isQuoteEntryArray);
}

export async function fetchQuotes(): Promise<Quote[]> {
  const response = await fetch(QUOTES_ENDPOINT, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Failed to load quotes: ${response.status} ${response.statusText}`);
  }

  const rawData: unknown = await response.json();
  if (!isQuoteCollection(rawData)) {
    throw new Error('Quotes payload was in an unexpected format.');
  }

  const data: QuoteCollection = rawData;
  const quotes: Quote[] = [];

  Object.entries(data.categories).forEach(([category, items]) => {
    items.forEach((item, index) => {
      quotes.push({
        id: `${category}-${index}`,
        text: item.text,
        author: item.author,
        category,
      });
    });
  });

  return quotes;
}
