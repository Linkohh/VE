import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import {
  applyQuoteFilter,
  clearQuoteFilter,
  currentQuote,
  ensureInitialQuote,
  requestNextQuote,
  __testing__,
} from './quote';

const { clearState } = __testing__;

describe('quote store', () => {
  beforeEach(() => {
    clearState();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads an initial quote only once', async () => {
    const first = await ensureInitialQuote();
    expect(first).toBeTruthy();

    const second = await ensureInitialQuote();
    expect(second).toEqual(first);
    expect(get(currentQuote)).toEqual(first);
  });

  it('returns a new quote on demand', async () => {
    await ensureInitialQuote();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const next = await requestNextQuote({ reason: 'manual' });
    expect(next).toBeTruthy();
    expect(get(currentQuote)).toEqual(next);
  });

  it('applies and clears category filters', async () => {
    await ensureInitialQuote();
    const filtered = await applyQuoteFilter('productivity');
    expect(filtered).toBeTruthy();
    expect(filtered?.category?.toLowerCase()).toBe('productivity');

    const cleared = await clearQuoteFilter();
    expect(cleared).toBeTruthy();
    if (cleared?.category) {
      expect(cleared.category.toLowerCase()).not.toBe('productivity');
    }
  });
});
