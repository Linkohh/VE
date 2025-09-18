import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  applyTheme,
  currentTheme,
  getCurrentTheme,
  nextTheme,
  setThemeByKey,
  themes,
} from './index';

describe('theme', () => {
  beforeEach(() => {
    setThemeByKey(themes[0].key);
  });

  it('applyTheme updates current theme and store', () => {
    const theme = {
      key: 'test',
      gradient1: '#111111',
      gradient2: '#222222',
      gradient3: '#333333',
      glow: '#ffffff',
    };
    applyTheme(theme, { persist: false });
    expect(getCurrentTheme()).toBe(theme);
    expect(get(currentTheme)).toBe(theme);
  });

  it('nextTheme selects next theme and updates current', () => {
    const first = getCurrentTheme();
    const second = nextTheme();
    expect(getCurrentTheme()).toBe(second);
    expect(getCurrentTheme()).not.toBe(first);

    const third = nextTheme();
    expect(getCurrentTheme()).toBe(third);
    expect(getCurrentTheme()).not.toBe(first);

    const looped = nextTheme();
    expect(getCurrentTheme()).toBe(looped);
    expect(getCurrentTheme()).toBe(first);
  });

  it('setThemeByKey selects theme and updates current', () => {
    const target = themes[1];
    setThemeByKey(target.key);
    expect(getCurrentTheme()).toBe(target);
    expect(get(currentTheme)).toBe(target);
  });

  it('resets to a specific theme after cycling', () => {
    const first = getCurrentTheme();
    const next = nextTheme();
    expect(getCurrentTheme()).toBe(next);
    expect(getCurrentTheme()).not.toBe(first);

    setThemeByKey(first.key);
    expect(getCurrentTheme()).toBe(first);
  });
});
