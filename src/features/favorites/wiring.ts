import { bus, EVENTS } from '../../lib/bus';
import { FAVORITES_STORAGE_KEYS, all, clear, get, reloadFromStorage, remove } from './store';
import { closePanel, openPanel, renderFavorites } from './panel';

type OpenPayload = { opener?: HTMLElement | null } | undefined;

const PANEL_STATE_STORAGE_KEY = 'favorites:state';

function getToggleButton(): HTMLElement | null {
  return document.getElementById('favorites-toggle');
}

function getPanelElement(): HTMLElement | null {
  return document.getElementById('favorites-panel');
}

function getListElement(): HTMLElement | null {
  return document.getElementById('favorites-list');
}

function updateToggleButton(state: 'open' | 'closed'): void {
  const toggle = getToggleButton();
  if (!toggle) return;

  if (state === 'open') {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close favorites');
    toggle.setAttribute('title', 'Close favorites');
  } else {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open favorites');
    toggle.setAttribute('title', 'Open favorites');
  }
}

function applyPanelState(state: 'open' | 'closed'): void {
  const panel = getPanelElement();
  if (!panel) return;

  panel.dataset.state = state;
  panel.setAttribute('aria-hidden', state === 'open' ? 'false' : 'true');
  panel.setAttribute('aria-modal', state === 'open' ? 'true' : 'false');
}

async function shareFavorite(id: string): Promise<void> {
  const item = get(id);
  if (!item) return;

  const text = item.author ? `${item.text} — ${item.author}` : item.text;

  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch {
      // fall through to clipboard fallback
    }
  }

  try {
    await navigator.clipboard?.writeText(text);
  } catch {
    // no-op: failing to copy shouldn't break the flow
  }
}

function setupFavorites(): () => void {
  renderFavorites(all());
  updateToggleButton('closed');
  applyPanelState('closed');

  const list = getListElement();
  const panel = getPanelElement();
  const toggle = getToggleButton();

  let isOpen = false;
  let releaseFocus: (() => void) | null = null;

  const requestClose = () => {
    bus.emit(EVENTS.FAV_CLOSE);
  };

  const handleOpen = (payload?: OpenPayload) => {
    if (isOpen) return;

    const opener = (payload?.opener ?? toggle) ?? null;
    releaseFocus?.();
    releaseFocus = openPanel(opener, requestClose);
    isOpen = true;
    updateToggleButton('open');
    applyPanelState('open');
    try {
      localStorage.setItem(PANEL_STATE_STORAGE_KEY, 'open');
    } catch {
      /* ignore storage errors */
    }
  };

  const handleClose = () => {
    if (!isOpen) return;

    releaseFocus?.();
    releaseFocus = null;
    closePanel();
    isOpen = false;
    updateToggleButton('closed');
    applyPanelState('closed');
    try {
      localStorage.setItem(PANEL_STATE_STORAGE_KEY, 'closed');
    } catch {
      /* ignore storage errors */
    }
  };

  const handleChanged = () => {
    renderFavorites(all());
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (!isOpen) return;
    const target = event.target as Node | null;
    if (!panel?.contains(target) && target !== toggle) {
      bus.emit(EVENTS.FAV_CLOSE);
    }
  };

  const handleListClick = (event: MouseEvent) => {
    const actionEl = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-action]');
    if (!actionEl || !list?.contains(actionEl)) return;

    const action = actionEl.dataset.action;
    const row = actionEl.closest<HTMLElement>('[data-favorite-id]');
    const id = row?.dataset.favoriteId;
    if (!id) return;

    if (action === 'remove') {
      event.preventDefault();
      remove(id);
      return;
    }

    if (action === 'share') {
      event.preventDefault();
      void shareFavorite(id);
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key && FAVORITES_STORAGE_KEYS.includes(event.key)) {
      reloadFromStorage();
    }
  };

  const handleClear = () => {
    clear();
  };

  bus.on(EVENTS.FAV_OPEN, handleOpen);
  bus.on(EVENTS.FAV_CLOSE, handleClose);
  bus.on(EVENTS.FAV_CHANGED, handleChanged);
  bus.on(EVENTS.FAV_CLEAR, handleClear);

  document.addEventListener('click', handleOutsideClick);
  list?.addEventListener('click', handleListClick);
  window.addEventListener('storage', handleStorage);

  const restore = () => {
    try {
      const saved = localStorage.getItem(PANEL_STATE_STORAGE_KEY);
      if (saved === 'open') {
        bus.emit(EVENTS.FAV_OPEN, { opener: toggle ?? null });
      }
    } catch {
      /* ignore */
    }
  };

  restore();

  return () => {
    bus.off(EVENTS.FAV_OPEN, handleOpen);
    bus.off(EVENTS.FAV_CLOSE, handleClose);
    bus.off(EVENTS.FAV_CHANGED, handleChanged);
    bus.off(EVENTS.FAV_CLEAR, handleClear);

    document.removeEventListener('click', handleOutsideClick);
    list?.removeEventListener('click', handleListClick);
    window.removeEventListener('storage', handleStorage);

    releaseFocus?.();
  };
}

export function initFavorites(): () => void {
  if (document.readyState === 'loading') {
    let teardown: (() => void) | null = null;
    const onReady = () => {
      document.removeEventListener('DOMContentLoaded', onReady);
      teardown = setupFavorites();
    };
    document.addEventListener('DOMContentLoaded', onReady);
    return () => {
      document.removeEventListener('DOMContentLoaded', onReady);
      teardown?.();
      teardown = null;
    };
  }

  return setupFavorites();
}
