import { render, fireEvent, screen } from '@testing-library/svelte';
import TopControls from '../src/lib/TopControls.svelte';
import { isDarkMode } from '../src/lib/store.js';
import { describe, it, expect, afterEach } from 'vitest';
import { get } from 'svelte/store';

describe('TopControls component', () => {
  afterEach(() => {
    isDarkMode.set(false);
  });

  it('should toggle dark mode when the button is clicked', async () => {
    render(TopControls);
    const darkModeButton = screen.getByLabelText('Toggle dark mode');

    expect(get(isDarkMode)).toBe(false);

    await fireEvent.click(darkModeButton);
    expect(get(isDarkMode)).toBe(true);

    await fireEvent.click(darkModeButton);
    expect(get(isDarkMode)).toBe(false);
  });
});