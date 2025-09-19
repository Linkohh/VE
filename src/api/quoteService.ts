import { Quote, QuoteCollection } from '../types';

const QUOTES_ENDPOINT = '/quotes.json';

export async function fetchQuotes(): Promise<Quote[]> {
  const response = await fetch(QUOTES_ENDPOINT, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Failed to load quotes: ${response.status} ${response.statusText}`);
  }

  const data: QuoteCollection = await response.json();
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
