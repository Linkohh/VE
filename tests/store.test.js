import { get } from 'svelte/store';
import { favorites } from '../src/lib/store.js';
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
});