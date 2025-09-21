export interface QuoteRecord {
  text: string;
  author: string;
}

export interface Quote {
  text: string;
  author: string;
  category: string;
}

export interface QuoteResponse {
  categories: Record<string, QuoteRecord[]>;
}

export interface QuoteData {
  categories: Record<string, Quote[]>;
  allQuotes: Quote[];
}

export async function fetchQuotes(): Promise<QuoteData> {
  const response = await fetch('/data/quotes.json', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load quotes: ${response.status} ${response.statusText}`);
  }

  const data: QuoteResponse = await response.json();

  const categories: Record<string, Quote[]> = {};
  const allQuotes: Quote[] = [];

  Object.entries(data.categories || {}).forEach(([category, quotes]) => {
    categories[category] = quotes.map((quote) => {
      const enrichedQuote: Quote = {
        ...quote,
        category,
      };

      allQuotes.push(enrichedQuote);
      return enrichedQuote;
    });
  });

  return { categories, allQuotes };
}
