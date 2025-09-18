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

export async function loadQuotes(): Promise<void> {
    try {
        const response = await fetch('/data/quotes.json', { cache: 'no-cache' });
        if (!response.ok) throw new Error('Network response was not ok');
        const quotes: Quote[] = await response.json();
        if (Array.isArray(quotes)) {
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
                resolve();
            };
            script.onerror = () => resolve();
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
