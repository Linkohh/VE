import { bus, EVENTS } from '../lib/bus';
import { store } from '../lib/store';

type Legacy = Record<string, any>;

type PatchMap = Record<string, string>;

export function bridgeLegacy(): void {
  (window as any).__ve_bus = bus;
  (window as any).__ve_store = store;

  const legacy: Legacy | undefined = (window as any).VibeMe;
  if (!legacy) {
    return;
  }

  // expose legacy state through the shared store
  if (legacy.state) {
    store.state = legacy.state;
  }

  const patches: PatchMap = {
    applyTheme: EVENTS.THEME_CHANGED,
    showRandomQuote: EVENTS.QUOTE_GENERATED,
    toggleBeep: EVENTS.BEEP_TOGGLED,
  };

  Object.entries(patches).forEach(([method, event]) => {
    const fn = legacy[method];
    if (typeof fn !== 'function') {
      return; // method missing; skip
    }
    legacy[method] = function patched(this: any, ...args: any[]) {
      const result = fn.apply(this, args);
      try {
        bus.emit(event, args[0]);
      } catch {
        // ignore
      }
      return result;
    };
  });
}
