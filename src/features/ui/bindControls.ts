import { bus, EVENTS } from '../../lib/bus';

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

  offs.push(on('dark-mode-toggle', 'click', () => bus.emit(EVENTS.THEME_CHANGED, { action: 'next' })));
  offs.push(
    on('theme-preset', 'change', (e) =>
      bus.emit(EVENTS.THEME_CHANGED, { key: (e.target as HTMLSelectElement).value })
    )
  );
  offs.push(
    on('category-filter', 'change', (e) =>
      bus.emit(EVENTS.QUOTE_FILTER, (e.target as HTMLSelectElement).value)
    )
  );
  offs.push(
    on('generate-btn', 'click', () =>
      bus.emit(EVENTS.QUOTE_REQUEST, { source: 'ui:generate-button' })
    )
  );
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
