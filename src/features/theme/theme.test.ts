import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applyTheme, nextTheme, setThemeByKey, current, themes } from './index';
import { bus, EVENTS } from '../../lib/bus';

describe('theme', () => {
  beforeEach(() => {
    // reset to first theme before each test
    setThemeByKey(themes[0].key);
    vi.restoreAllMocks();
  });

  it('applyTheme sets CSS variables and emits THEME_CHANGED', () => {
    const emitSpy = vi.spyOn(bus, 'emit');
    const theme = { key: 'test', color1: '#111111', color2: '#222222', color3: '#333333' };

    applyTheme(theme);

    const style = getComputedStyle(document.documentElement);
    expect(style.getPropertyValue('--color1').trim()).toBe('#111111');
    expect(style.getPropertyValue('--color2').trim()).toBe('#222222');
    expect(style.getPropertyValue('--color3').trim()).toBe('#333333');
    expect(emitSpy).toHaveBeenCalledWith(EVENTS.THEME_CHANGED, theme);
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
});
