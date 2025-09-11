declare global {
  interface Window {
    VibeMe?: {
      init?: () => void;
    };
  }
}

export function bootstrap(): void {
  window.VibeMe?.init?.();
}
