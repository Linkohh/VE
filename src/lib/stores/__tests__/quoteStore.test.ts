import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { allQuotes, currentQuote, currentQuoteIndex, loadQuotes, nextQuote, previousQuote, setQuoteByIndex } from '../quoteStore';

// Mock the fetch function
global.fetch = vi.fn();

describe('Quote Store', () => {
    beforeEach(() => {
        // Reset stores
        allQuotes.set([]);
        currentQuoteIndex.set(0);
        // Clear mock calls
        vi.clearAllMocks();
    });

    describe('loadQuotes', () => {
        it('should load quotes from flat array structure', async () => {
            const mockQuotes = [
                { text: 'Quote 1', author: 'Author 1' },
                { text: 'Quote 2', author: 'Author 2' }
            ];

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockQuotes
            });

            await loadQuotes();

            const quotes = get(allQuotes);
            expect(quotes).toEqual(mockQuotes);
        });

        it('should load quotes from categorized structure', async () => {
            const mockData = {
                categories: {
                    love: [
                        { text: 'Love Quote 1', author: 'Author 1' },
                        { text: 'Love Quote 2', author: 'Author 2' }
                    ],
                    wisdom: [
                        { text: 'Wisdom Quote', author: 'Author 3' }
                    ]
                }
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            await loadQuotes();

            const quotes = get(allQuotes);
            expect(quotes).toHaveLength(3);
            expect(quotes[0]).toEqual({ text: 'Love Quote 1', author: 'Author 1', category: 'love' });
            expect(quotes[2]).toEqual({ text: 'Wisdom Quote', author: 'Author 3', category: 'wisdom' });
        });

        it('should retry on failure before giving up', async () => {
            // Fail twice, then succeed
            (global.fetch as any)
                .mockResolvedValueOnce({ ok: false })
                .mockResolvedValueOnce({ ok: false })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => [{ text: 'Success', author: 'Author' }]
                });

            await loadQuotes();

            expect(global.fetch).toHaveBeenCalledTimes(3);
            const quotes = get(allQuotes);
            expect(quotes).toHaveLength(1);
        });
    });

    describe('Quote Navigation', () => {
        beforeEach(() => {
            allQuotes.set([
                { text: 'Quote 1', author: 'Author 1' },
                { text: 'Quote 2', author: 'Author 2' },
                { text: 'Quote 3', author: 'Author 3' }
            ]);
        });

        it('should get current quote based on index', () => {
            const quote = get(currentQuote);
            expect(quote.text).toBe('Quote 1');

            currentQuoteIndex.set(1);
            const quote2 = get(currentQuote);
            expect(quote2.text).toBe('Quote 2');
        });

        it('should navigate to next quote', () => {
            nextQuote();
            expect(get(currentQuoteIndex)).toBe(1);
            expect(get(currentQuote).text).toBe('Quote 2');
        });

        it('should navigate to previous quote', () => {
            currentQuoteIndex.set(2);
            previousQuote();
            expect(get(currentQuoteIndex)).toBe(1);
            expect(get(currentQuote).text).toBe('Quote 2');
        });

        it('should not go below zero on previous', () => {
            currentQuoteIndex.set(0);
            previousQuote();
            expect(get(currentQuoteIndex)).toBe(0);
        });

        it('should set quote by specific index', () => {
            setQuoteByIndex(2);
            expect(get(currentQuoteIndex)).toBe(2);
            expect(get(currentQuote).text).toBe('Quote 3');
        });

        it('should handle negative index gracefully', () => {
            setQuoteByIndex(-1);
            expect(get(currentQuoteIndex)).toBe(0);
        });
    });

    describe('Empty State', () => {
        it('should show loading message when no quotes loaded', () => {
            const quote = get(currentQuote);
            expect(quote.text).toBe('Loading inspiration…');
            expect(quote.author).toBe('VibeMe');
        });
    });
});