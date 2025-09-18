import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/svelte/vitest';
import { render, fireEvent } from '@testing-library/svelte';

type LoadingSubscriber = (value: boolean) => void;

const loadingSubscribers: LoadingSubscriber[] = [];

vi.mock('../stores/quote', () => {
  const mockApplyQuoteFilter = vi.fn(async () => null);
  return {
    applyQuoteFilter: mockApplyQuoteFilter,
    quoteLoading: {
      subscribe(subscriber: LoadingSubscriber) {
        loadingSubscribers.push(subscriber);
        subscriber(false);
        return () => {
          const index = loadingSubscribers.indexOf(subscriber);
          if (index >= 0) {
            loadingSubscribers.splice(index, 1);
          }
        };
      },
    },
    __mockEmitLoading(value: boolean) {
      loadingSubscribers.forEach((subscriber) => subscriber(value));
    },
    __mockApplyQuoteFilter: mockApplyQuoteFilter,
  };
}, { virtual: true });

const quoteStores = (await import('../stores/quote')) as unknown as {
  applyQuoteFilter: ReturnType<typeof vi.fn>;
  __mockEmitLoading: (value: boolean) => void;
  __mockApplyQuoteFilter: ReturnType<typeof vi.fn>;
};

const applyQuoteFilter = quoteStores.__mockApplyQuoteFilter;
const emitLoading = quoteStores.__mockEmitLoading;

import QuoteSearch from './QuoteSearch.svelte';

describe('QuoteSearch', () => {
  beforeEach(() => {
    applyQuoteFilter.mockClear();
    applyQuoteFilter.mockResolvedValue(null);
    emitLoading(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces search input before applying the filter', async () => {
    vi.useFakeTimers();
    const { getByPlaceholderText } = render(QuoteSearch);
    const input = getByPlaceholderText('Search quotes or authors...') as HTMLInputElement;

    expect(input.getAttribute('maxlength')).toBe('100');

    await fireEvent.input(input, { target: { value: '  stoic  ' } });
    expect(applyQuoteFilter).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(280);

    expect(applyQuoteFilter).toHaveBeenCalledTimes(1);
    expect(applyQuoteFilter).toHaveBeenCalledWith({ search: 'stoic' });
  });

  it('clears the query when the clear button is clicked', async () => {
    vi.useFakeTimers();
    const { getByPlaceholderText, getByRole } = render(QuoteSearch);
    const input = getByPlaceholderText('Search quotes or authors...') as HTMLInputElement;

    await fireEvent.input(input, { target: { value: 'zen' } });
    await vi.runAllTimersAsync();

    const clearButton = getByRole('button', { name: /clear search/i });
    await fireEvent.click(clearButton);

    expect(input.value).toBe('');
    expect(applyQuoteFilter).toHaveBeenCalledTimes(2);
    expect(applyQuoteFilter).toHaveBeenLastCalledWith(null);
  });

  it('submits immediately when the form is submitted', async () => {
    vi.useFakeTimers();
    const { getByPlaceholderText, getByRole } = render(QuoteSearch);
    const input = getByPlaceholderText('Search quotes or authors...') as HTMLInputElement;

    await fireEvent.input(input, { target: { value: 'focus' } });
    const form = getByRole('search');
    await fireEvent.submit(form);

    expect(applyQuoteFilter).toHaveBeenCalledTimes(1);
    expect(applyQuoteFilter).toHaveBeenCalledWith({ search: 'focus' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows a visible loading indicator when quotes are loading', async () => {
    const { queryByText } = render(QuoteSearch);

    expect(queryByText('Searching…')).toBeNull();

    emitLoading(true);
    await Promise.resolve();
    expect(queryByText('Searching…')).not.toBeNull();

    emitLoading(false);
    await Promise.resolve();
    expect(queryByText('Searching…')).toBeNull();
  });
});
