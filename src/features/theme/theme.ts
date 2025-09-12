export function nextTheme(): void {
  // Use legacy global if available
  (window as any).VibeMe?.applyRandomTheme?.();
}

export function setThemeByKey(key: string): void {
  (window as any).VibeMe?.setThemeByKey?.(key);
}
