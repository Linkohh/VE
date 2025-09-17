import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme, nextTheme, setThemeByKey, current, themes } from './index';

describe('theme', () => {
  beforeEach(() => {
    // reset to first theme before each test
    setThemeByKey(themes[0].key);
  });

  it('applyTheme updates current theme', () => {
    const theme = {
      key: 'test',
      gradient1: '#111111',
      gradient2: '#222222',
      gradient3: '#333333',
      glow: '#ffffff',
    };
    applyTheme(theme);
    expect(current).toBe(theme);
  });

  it('nextTheme selects next theme and updates current', () => {
    const first = current;
    const second = nextTheme();
    expect(current).toBe(second);
    expect(current).not.toBe(first);

    const third = nextTheme();
    expect(current).toBe(third);
    expect(current).not.toBe(first);

    // cycle back
    const looped = nextTheme();
    expect(current).toBe(looped);
    expect(current).toBe(first);
  });

  it('setThemeByKey selects theme and updates current', () => {
    const target = themes[1];
    setThemeByKey(target.key);
    expect(current).toBe(target);
  });

  it('allows selecting next theme via helper', () => {
    const first = current;
    const next = nextTheme();
    expect(current).toBe(next);
    expect(current).not.toBe(first);

    setThemeByKey(first.key);
    expect(current).toBe(first);
  });
});
