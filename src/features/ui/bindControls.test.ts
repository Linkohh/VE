import { describe, it, expect } from 'vitest';
import { bindControls } from './bindControls';
import { bus, EVENTS } from '../../lib/bus';

describe('bindControls', () => {
  it('activates focused buttons on Enter or Space and returns unbinder', () => {
    document.body.innerHTML = `<button id="generate-btn"></button>`;

    const events: string[] = [];
    const handler = () => events.push('gen');
    bus.on(EVENTS.GENERATE_QUOTE, handler);

    const unbind = bindControls();

    const btn = document.getElementById('generate-btn') as HTMLButtonElement;
    btn.focus();

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(events).toEqual(['gen', 'gen']);

    unbind();

    btn.focus();
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(events).toEqual(['gen', 'gen']);

    bus.off(EVENTS.GENERATE_QUOTE, handler);
  });
});

