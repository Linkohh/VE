import { bus, EVENTS } from '../../lib/bus';

export function bindControls(): () => void {
  const darkToggle = document.getElementById('dark-mode-toggle');
  const presetSelect = document.getElementById('theme-preset') as HTMLSelectElement | null;
  const generateBtn = document.getElementById('generate-btn');
  const effectsToggle = document.getElementById('effects-toggle-checkbox') as HTMLInputElement | null;
  const favoriteBtn = document.getElementById('favorite-quote-btn');
  const beepToggle = document.getElementById('beep-enable-checkbox') as HTMLInputElement | null;
  const timerToggleBtn = document.getElementById('timer-toggle-btn');

  const darkHandler = () => bus.emit(EVENTS.THEME_CHANGED, { action: 'next' });
  darkToggle?.addEventListener('click', darkHandler);

  const presetHandler = () => {
    if (presetSelect) bus.emit(EVENTS.THEME_CHANGED, { key: presetSelect.value });
  };
  presetSelect?.addEventListener('change', presetHandler);

  const generateHandler = () => bus.emit(EVENTS.GENERATE_QUOTE);
  generateBtn?.addEventListener('click', generateHandler);

  const matrixHandler = () => {
    if (effectsToggle) bus.emit(EVENTS.MATRIX_TOGGLE, effectsToggle.checked);
  };
  effectsToggle?.addEventListener('change', matrixHandler);

  const favoriteHandler = () => bus.emit(EVENTS.FAVORITE_TOGGLE);
  favoriteBtn?.addEventListener('click', favoriteHandler);

  const beepHandler = () => {
    if (beepToggle) bus.emit(EVENTS.BEEP_TOGGLE, beepToggle.checked);
  };
  beepToggle?.addEventListener('change', beepHandler);

  const timerHandler = () => bus.emit(EVENTS.TIMER_TOGGLE);
  timerToggleBtn?.addEventListener('click', timerHandler);

  return () => {
    darkToggle?.removeEventListener('click', darkHandler);
    presetSelect?.removeEventListener('change', presetHandler);
    generateBtn?.removeEventListener('click', generateHandler);
    effectsToggle?.removeEventListener('change', matrixHandler);
    favoriteBtn?.removeEventListener('click', favoriteHandler);
    beepToggle?.removeEventListener('change', beepHandler);
    timerToggleBtn?.removeEventListener('click', timerHandler);
  };
}

