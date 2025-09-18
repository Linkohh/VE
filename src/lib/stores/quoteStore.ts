import { derived, writable } from 'svelte/store';

export interface Quote {
    text: string;
    author: string;
    category?: string;
}

const browser = typeof window !== 'undefined';

export const allQuotes = writable<Quote[]>([]);
export const currentQuoteIndex = writable(0);

export const currentQuote = derived([allQuotes, currentQuoteIndex], ([$allQuotes, $index]) => {
    if ($allQuotes.length === 0) {
        return { text: 'Loading inspiration…', author: 'VibeMe' } satisfies Quote;
    }
    const normalizedIndex = Math.max(0, Math.min($allQuotes.length - 1, $index));
    return $allQuotes[normalizedIndex];
});

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response.ok) return response;
            if (i === retries - 1) throw new Error('Network response was not ok');
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        }
    }
    throw new Error('Failed to fetch after retries');
}

export async function loadQuotes(): Promise<void> {
    try {
        const response = await fetchWithRetry('/data/quotes.json');
        const data = await response.json();

        // Handle both flat array and categorized structure
        let quotes: Quote[] = [];
        if (Array.isArray(data)) {
            quotes = data;
        } else if (data.categories && typeof data.categories === 'object') {
            // Flatten categories into a single array, adding category to each quote
            for (const [category, categoryQuotes] of Object.entries(data.categories)) {
                if (Array.isArray(categoryQuotes)) {
                    quotes.push(...categoryQuotes.map((q: Quote) => ({ ...q, category })));
                }
            }
        }

        if (quotes.length > 0) {
            allQuotes.set(quotes);
            return;
        }
    } catch (error) {
        console.warn('Failed to fetch quotes.json, falling back to local script.', error);
        if (!browser) return;
        await new Promise<void>((resolve) => {
            const script = document.createElement('script');
            script.src = '/js/quotes.js';
            script.async = true;
            script.onload = () => {
                const fallback = (window as typeof window & { localQuotes?: Quote[] }).localQuotes;
                if (fallback) {
                    allQuotes.set(fallback);
                }
                // Clean up the script element to prevent memory leak
                document.head.removeChild(script);
                resolve();
            };
            script.onerror = () => {
                // Clean up the script element even on error
                document.head.removeChild(script);
                resolve();
            };
            document.head.appendChild(script);
        });
    }
}

export function nextQuote(): void {
    currentQuoteIndex.update((index) => index + 1);
}

export function previousQuote(): void {
    currentQuoteIndex.update((index) => Math.max(0, index - 1));
}

export function setQuoteByIndex(index: number): void {
    currentQuoteIndex.set(Math.max(0, index));
}
