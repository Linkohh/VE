import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('quotes wiring', () => {
  let bus: typeof import('../../lib/bus')['bus'];
  let EVENTS: typeof import('../../lib/bus')['EVENTS'];
  let nextQuote: Mock;

  beforeEach(async () => {
    vi.resetModules();
    vi.doMock('./engine', () => ({
      nextQuote: vi.fn(),
    }));

    ({ bus, EVENTS } = await import('../../lib/bus'));
    await import('./index');
    ({ nextQuote } = (await import('./engine')) as { nextQuote: Mock });
  });

  afterEach(() => {
    vi.doUnmock('./engine');
  });

  it('emits QUOTE_GENERATED exactly once per request', async () => {
    const quote = { text: 'Hello', author: 'Tester' };
    nextQuote.mockResolvedValue(quote);

    const payloads: unknown[] = [];
    const handler = (payload: unknown) => payloads.push(payload);
    bus.on(EVENTS.QUOTE_GENERATED, handler);

    bus.emit(EVENTS.QUOTE_REQUEST, { reason: 'test' });
    await flush();

    expect(nextQuote).toHaveBeenCalledTimes(1);
    expect(nextQuote).toHaveBeenCalledWith({ reason: 'test' });
    expect(payloads).toEqual([quote]);

    bus.off(EVENTS.QUOTE_GENERATED, handler);
  });

  it('applies filter changes immediately and persists for future requests', async () => {
    nextQuote.mockResolvedValue({ text: 'Hello', author: 'Tester' });

    bus.emit(EVENTS.QUOTE_FILTER, 'love');
    await flush();

    expect(nextQuote).toHaveBeenCalledTimes(1);
    expect(nextQuote).toHaveBeenLastCalledWith({ filter: { category: 'love' } });

    bus.emit(EVENTS.QUOTE_REQUEST, {});
    await flush();

    expect(nextQuote).toHaveBeenCalledTimes(2);
    expect(nextQuote).toHaveBeenLastCalledWith({ filter: { category: 'love' } });
  });

  it('clears filters when requesting the "all" category', async () => {
    nextQuote.mockResolvedValue({ text: 'Hello', author: 'Tester' });

    bus.emit(EVENTS.QUOTE_FILTER, 'all');
    await flush();

    expect(nextQuote).toHaveBeenCalledTimes(1);
    expect(nextQuote).toHaveBeenLastCalledWith({});

    bus.emit(EVENTS.QUOTE_REQUEST, {});
    await flush();

    expect(nextQuote).toHaveBeenCalledTimes(2);
    expect(nextQuote).toHaveBeenLastCalledWith({});
  });
});
