import { nextTheme, setThemeByKey } from '../theme/theme';

export function bindControls(): void {
  const darkToggle = document.getElementById('dark-mode-toggle');
  darkToggle?.addEventListener('click', () => {
    nextTheme();
  });

  const presetSelect = document.getElementById('theme-preset') as HTMLSelectElement | null;
  presetSelect?.addEventListener('change', () => {
    setThemeByKey(presetSelect.value);
  });
}
