interface Quote {
  text: string;
  author: string;
  category?: string;
}

interface QuotesMetadata {
  totalQuotes: number;
  categories: number;
  lastUpdated: string;
  version: string;
}

interface QuotesData {
  categories: Record<string, Quote[]>;
  metadata?: QuotesMetadata;
}

interface Window {
    quotesData: QuotesData;
    __QUOTES_JS_PROMISE?: Promise<boolean>;
    __QUOTES_SOURCE?: string;
    VIBE_QUOTES_PROMISE?: Promise<QuotesData>;
  }

