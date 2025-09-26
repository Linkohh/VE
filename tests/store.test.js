import { get } from 'svelte/store';
import { favorites, customQuotes, isDarkMode, effectsEnabled } from '../src/lib/store.js';
import { describe, it, expect, beforeEach } from 'vitest';

describe('favorites store', () => {
  beforeEach(() => {
    favorites.set([]);
  });

  it('should start with an empty array', () => {
    expect(get(favorites)).toEqual([]);
  });

  it('should add a favorite quote', () => {
    const quote = { text: 'Test quote', author: 'Test author' };
    favorites.update(favs => [...favs, quote]);
    expect(get(favorites)).toEqual([quote]);
  });

  it('should remove a favorite quote', () => {
    const quote1 = { text: 'Test quote 1', author: 'Test author 1' };
    const quote2 = { text: 'Test quote 2', author: 'Test author 2' };
    favorites.set([quote1, quote2]);

    favorites.update(favs => favs.filter(fav => fav.text !== quote1.text));
    expect(get(favorites)).toEqual([quote2]);
  });

  it('should not throw an error when removing a non-existent favorite', () => {
    const quote1 = { text: 'Test quote 1', author: 'Test author 1' };
    favorites.set([quote1]);

    favorites.update(favs => favs.filter(fav => fav.text !== 'non-existent'));
    expect(get(favorites)).toEqual([quote1]);
  });
});

describe('customQuotes store', () => {
  beforeEach(() => {
    customQuotes.set([]);
  });

  it('should add a custom quote', () => {
    const quote = { text: 'My custom quote', author: 'Me' };
    customQuotes.update(quotes => [...quotes, quote]);
    expect(get(customQuotes)).toEqual([quote]);
  });
});

describe('settings stores', () => {
  it('should toggle dark mode', () => {
    isDarkMode.set(false);
    expect(get(isDarkMode)).toBe(false);
    isDarkMode.update(v => !v);
    expect(get(isDarkMode)).toBe(true);
  });

  it('should toggle effects enabled', () => {
    effectsEnabled.set(true);
    expect(get(effectsEnabled)).toBe(true);
    effectsEnabled.set(false);
    expect(get(effectsEnabled)).toBe(false);
  });
});