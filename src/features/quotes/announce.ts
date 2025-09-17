const LIVE_REGION_ID = 'quote-live';

let lastMessage = '';

export function ariaAnnounce(message: string): void {
  const region = document.getElementById(LIVE_REGION_ID);
  if (!region) return;

  const nextMessage = message.trim();
  if (!nextMessage || nextMessage === lastMessage) return;

  lastMessage = nextMessage;
  region.textContent = '';
  region.textContent = nextMessage;
}
