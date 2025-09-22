export interface Quote {
  text: string;
  author: string;
}

export interface QuoteCategory {
  id: string;
  quotes: Quote[];
}
