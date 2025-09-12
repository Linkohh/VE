export interface FlipClockTokens {
  '--fc-card-bg': string;
  '--fc-top-bg': string;
  '--fc-bot-bg': string;
  '--fc-top-fg': string;
  '--fc-bot-fg': string;
  '--fc-divider': string;
}

export function getFlipClockTokens(root: HTMLElement = document.documentElement): FlipClockTokens {
  const styles = getComputedStyle(root);
  return {
    '--fc-card-bg': styles.getPropertyValue('--fc-card-bg').trim(),
    '--fc-top-bg': styles.getPropertyValue('--fc-top-bg').trim(),
    '--fc-bot-bg': styles.getPropertyValue('--fc-bot-bg').trim(),
    '--fc-top-fg': styles.getPropertyValue('--fc-top-fg').trim(),
    '--fc-bot-fg': styles.getPropertyValue('--fc-bot-fg').trim(),
    '--fc-divider': styles.getPropertyValue('--fc-divider').trim(),
  };
}
