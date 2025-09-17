import { Quote } from './types';

let liveRegion: HTMLElement | null = null;

function ensureLiveRegion(): HTMLElement | null {
  if (liveRegion && document.body.contains(liveRegion)) {
    return liveRegion;
  }

  const existing = document.getElementById('quote-live-region');
  if (existing) {
    liveRegion = existing;
    return liveRegion;
  }

  if (!document.body) {
    return null;
  }

  const region = document.createElement('div');
  region.id = 'quote-live-region';
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('role', 'status');
  region.className = 'sr-only';
  region.style.position = 'absolute';
  region.style.width = '1px';
  region.style.height = '1px';
  region.style.margin = '-1px';
  region.style.padding = '0';
  region.style.border = '0';
  region.style.clip = 'rect(0 0 0 0)';
  region.style.overflow = 'hidden';
  document.body.appendChild(region);
  liveRegion = region;
  return liveRegion;
}

export function announceQuote(quote: Quote): void {
  const region = ensureLiveRegion();
  if (!region) return;
  region.textContent = `${quote.text} — ${quote.author}`;
}
