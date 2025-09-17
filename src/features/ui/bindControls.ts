import { bus, EVENTS } from '../../lib/bus';
import { ariaAnnounce } from '../quotes/announce';

function on<K extends keyof HTMLElementEventMap>(
  id: string,
  type: K,
  handler: (ev: HTMLElementEventMap[K]) => void
): () => void {
  const el = document.getElementById(id);
  el?.addEventListener(type, handler as EventListener);
  return () => el?.removeEventListener(type, handler as EventListener);
}

export function bindControls(): () => void {
  const offs: Array<() => void> = [];

  const announceQuote = (payload: { text?: string; quote?: string; author?: string | null }): void => {
    const toText = (value: unknown): string => {
      if (typeof value === 'string') return value;
      if (value == null) return '';
      return String(value);
    };

    const text = toText(payload?.text ?? payload?.quote).trim();
    if (!text) return;

    const author = toText(payload?.author).trim();
    const message = author ? `${text} — ${author}` : text;
    ariaAnnounce(message);
  };

  bus.on(EVENTS.QUOTE_GENERATED, announceQuote);
  offs.push(() => bus.off(EVENTS.QUOTE_GENERATED, announceQuote));

  offs.push(on('dark-mode-toggle', 'click', () => bus.emit(EVENTS.THEME_CHANGED, { action: 'next' })));
  offs.push(
    on('theme-preset', 'change', (e) =>
      bus.emit(EVENTS.THEME_CHANGED, { key: (e.target as HTMLSelectElement).value })
    )
  );
  offs.push(on('generate-btn', 'click', () => bus.emit(EVENTS.GENERATE_QUOTE)));
  offs.push(on('timer-toggle-btn', 'click', () => bus.emit(EVENTS.TIMER_TOGGLE)));
  offs.push(on('copy-quote-btn', 'click', () => bus.emit(EVENTS.COPY_QUOTE)));
  offs.push(on('favorite-quote-btn', 'click', () => bus.emit(EVENTS.FAVORITE_TOGGLE)));
  offs.push(on('shareHubBtn', 'click', () => bus.emit(EVENTS.SHARE_TOGGLE)));
  offs.push(
    on('effects-toggle-checkbox', 'change', (e) =>
      bus.emit(EVENTS.MATRIX_TOGGLE, (e.target as HTMLInputElement).checked)
    )
  );
  offs.push(on('clear-favorites-btn', 'click', () => bus.emit(EVENTS.FAVORITES_CLEAR)));
  offs.push(on('toggle-add-quote-form', 'click', () => bus.emit(EVENTS.QUOTE_FORM_TOGGLE)));
  offs.push(on('submit-quote-btn', 'click', () => bus.emit(EVENTS.QUOTE_SUBMIT)));
  offs.push(
    on('beep-enable-checkbox', 'change', (e) =>
      bus.emit(EVENTS.BEEP_TOGGLE, (e.target as HTMLInputElement).checked)
    )
  );
  offs.push(on('search-toggle', 'click', () => bus.emit(EVENTS.SEARCH_TOGGLE)));
  offs.push(on('search-close-btn', 'click', () => bus.emit(EVENTS.SEARCH_TOGGLE)));
  offs.push(
    on('search-input', 'input', (e) =>
      bus.emit(EVENTS.SEARCH_QUERY, (e.target as HTMLInputElement).value)
    )
  );
  offs.push(
    on('search-overlay', 'click', (e) => {
      if ((e.target as HTMLElement).id === 'search-overlay') {
        bus.emit(EVENTS.SEARCH_TOGGLE);
      }
    })
  );

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      bus.emit(EVENTS.SEARCH_TOGGLE);
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      const active = document.activeElement;
      if (active instanceof HTMLButtonElement) {
        e.preventDefault();
        active.click();
      }
    }
  };
  document.addEventListener('keydown', keyHandler);
  offs.push(() => document.removeEventListener('keydown', keyHandler));

  return () => offs.forEach((off) => off());
}
