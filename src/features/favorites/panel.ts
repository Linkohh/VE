import type { FavoriteItem } from './store';

type CloseRequester = () => void;

let openerElement: HTMLElement | null = null;
let teardownFocusTrap: (() => void) | null = null;
let requestCloseRef: CloseRequester | null = null;

function getPanel(): HTMLElement | null {
  return document.getElementById('favorites-panel');
}

function getCountBadge(): HTMLElement | null {
  return document.getElementById('favorites-count');
}

function getEmptyState(): HTMLElement | null {
  return document.getElementById('favorites-empty');
}

function getListContainer(): HTMLElement | null {
  return document.getElementById('favorites-list');
}

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  return Array.from(root.querySelectorAll<HTMLElement>(selectors.join(','))).filter((el) => {
    if (el.hasAttribute('inert')) return false;
    const ariaHidden = el.getAttribute('aria-hidden');
    if (ariaHidden && ariaHidden.toLowerCase() === 'true') return false;
    return true;
  });
}

function focusFirstElement(panel: HTMLElement): void {
  const focusable = getFocusableElements(panel);
  const target = focusable[0] ?? panel;
  if (panel.tabIndex < 0) {
    panel.tabIndex = -1;
  }
  target.focus({ preventScroll: true });
}

function handleKeydown(event: KeyboardEvent, panel: HTMLElement): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    requestCloseRef?.();
    return;
  }

  if (event.key !== 'Tab') {
    return;
  }

  const focusable = getFocusableElements(panel);
  if (!focusable.length) {
    event.preventDefault();
    panel.focus({ preventScroll: true });
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (active === first || !panel.contains(active)) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    }
    return;
  }

  if (active === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

export function openPanel(opener: HTMLElement | null, requestClose: CloseRequester): () => void {
  const panel = getPanel();
  if (!panel) {
    return () => {};
  }

  openerElement = opener ?? (document.activeElement as HTMLElement | null);
  requestCloseRef = requestClose;

  panel.dataset.state = 'open';
  panel.setAttribute('aria-hidden', 'false');
  panel.setAttribute('aria-modal', 'true');
  if (!panel.hasAttribute('tabindex')) {
    panel.tabIndex = -1;
  }

  const keyHandler = (event: KeyboardEvent) => handleKeydown(event, panel);
  panel.addEventListener('keydown', keyHandler, true);
  focusFirstElement(panel);

  teardownFocusTrap = () => {
    panel.removeEventListener('keydown', keyHandler, true);
  };

  return teardownFocusTrap;
}

export function closePanel(): void {
  const panel = getPanel();
  if (!panel) {
    return;
  }

  panel.dataset.state = 'closed';
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('aria-modal', 'false');

  teardownFocusTrap?.();
  teardownFocusTrap = null;
  requestCloseRef = null;

  const returnFocusTarget = openerElement;
  openerElement = null;
  if (returnFocusTarget && typeof returnFocusTarget.focus === 'function') {
    returnFocusTarget.focus({ preventScroll: true });
  }
}

export function renderFavorites(items: FavoriteItem[]): void {
  const list = getListContainer();
  const emptyState = getEmptyState();
  const badge = getCountBadge();

  const count = items.length;

  if (badge) {
    badge.textContent = String(count);
  }

  if (!list) return;

  list.innerHTML = '';

  if (!count) {
    if (emptyState) {
      emptyState.style.display = '';
    }
    return;
  }

  if (emptyState) {
    emptyState.style.display = 'none';
  }

  const fragment = document.createDocumentFragment();

  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'fav-item';
    row.dataset.favoriteId = item.id;

    const textWrap = document.createElement('div');
    textWrap.className = 'fav-text-wrap';

    const quoteEl = document.createElement('div');
    quoteEl.className = 'fav-quote';
    quoteEl.textContent = `"${item.text}"`;
    textWrap.appendChild(quoteEl);

    if (item.author) {
      const authorEl = document.createElement('div');
      authorEl.className = 'fav-author';
      authorEl.textContent = `— ${item.author}`;
      textWrap.appendChild(authorEl);
    }

    const actions = document.createElement('div');
    actions.className = 'fav-actions';

    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'fav-share';
    shareBtn.dataset.action = 'share';
    shareBtn.title = 'Share quote';
    shareBtn.setAttribute('aria-label', 'Share quote');
    shareBtn.innerHTML = '<i class="fas fa-share"></i>';
    actions.appendChild(shareBtn);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'fav-remove';
    removeBtn.dataset.action = 'remove';
    removeBtn.title = 'Remove from favorites';
    removeBtn.setAttribute('aria-label', 'Remove from favorites');
    removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
    actions.appendChild(removeBtn);

    row.appendChild(textWrap);
    row.appendChild(actions);

    fragment.appendChild(row);
  }

  list.appendChild(fragment);
}
