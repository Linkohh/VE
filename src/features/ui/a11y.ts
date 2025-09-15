const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

export function trapFocus(container: HTMLElement, onClose?: () => void): () => void {
  const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
  if (focusables.length === 0) return () => {};

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  const onKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
      return;
    }
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', onKeydown);
  return () => container.removeEventListener('keydown', onKeydown);
}

export function returnFocus(el: HTMLElement | null = document.activeElement as HTMLElement | null): () => void {
  return () => {
    el?.focus();
  };
}

let announcer: HTMLElement | null = null;

function getAnnouncer(): HTMLElement {
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }
  return announcer;
}

export function announce(msg: string): void {
  const el = getAnnouncer();
  el.textContent = '';
  // Force text update for screen readers
  el.textContent = msg;
}
