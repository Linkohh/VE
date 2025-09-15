import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme, nextTheme, setThemeByKey, current, themes } from './index';
import { bus, EVENTS } from '../../lib/bus';

describe('theme', () => {
  beforeEach(() => {
    // reset to first theme before each test
    setThemeByKey(themes[0].key);
  });

  it('applyTheme updates current theme', () => {
    const theme = { key: 'test', color1: '#111111', color2: '#222222', color3: '#333333' };
    applyTheme(theme);
    expect(current).toBe(theme);
  });

  it('nextTheme selects next theme and updates current', () => {
    const first = current;
    const second = nextTheme();
    expect(current).toBe(second);
    expect(current).not.toBe(first);

    // cycle back
    const again = nextTheme();
    expect(current).toBe(again);
    expect(current).toBe(first);
  });

  it('setThemeByKey selects theme and updates current', () => {
    const target = themes[1];
    setThemeByKey(target.key);
    expect(current).toBe(target);
  });

  it('responds to THEME_CHANGED events', () => {
    bus.emit(EVENTS.THEME_CHANGED, { action: 'next' });
    expect(current).toBe(themes[1]);

    bus.emit(EVENTS.THEME_CHANGED, { key: themes[0].key });
    expect(current).toBe(themes[0]);
  });
});
