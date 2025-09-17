import { describe, it, expect } from 'vitest';
import { bindControls } from './bindControls';
import { bus, EVENTS } from '../../lib/bus';

describe('bindControls', () => {
  it('activates focused buttons on Enter or Space and returns unbinder', () => {
    document.body.innerHTML = `<button id="generate-btn"></button>`;

    const payloads: Array<Record<string, unknown>> = [];
    const handler = (payload: Record<string, unknown>) => payloads.push(payload);
    bus.on(EVENTS.QUOTE_REQUEST, handler);

    const unbind = bindControls();

    const btn = document.getElementById('generate-btn') as HTMLButtonElement;
    btn.focus();

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(payloads).toEqual([
      { source: 'ui:generate-button' },
      { source: 'ui:generate-button' },
    ]);

    unbind();

    btn.focus();
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(payloads).toEqual([
      { source: 'ui:generate-button' },
      { source: 'ui:generate-button' },
    ]);

    bus.off(EVENTS.QUOTE_REQUEST, handler);
  });
});

