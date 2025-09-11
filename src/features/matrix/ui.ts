import { initMatrix, updateMatrix, teardownMatrix } from './engine';
import { store } from '../../lib/store';
import { RenderMode, MatrixConfig } from './config';

function getConfig(): MatrixConfig {
  return store.get('matrix');
}

function setConfig(cfg: MatrixConfig): void {
  store.set('matrix', cfg);
}

export function bindMatrixUI(): void {
  const toggle = document.getElementById('effects-toggle-checkbox') as HTMLInputElement | null;
  const renderModeSel = document.getElementById('matrix-render-mode') as HTMLSelectElement | null;
  const densityRange = document.getElementById('matrix-density') as HTMLInputElement | null;
  const maxFpsRange = document.getElementById('canvas-max-fps') as HTMLInputElement | null;

  let active = toggle?.checked ?? false;
  if (active) {
    initMatrix();
  }

  toggle?.addEventListener('change', () => {
    active = toggle.checked;
    if (active) {
      initMatrix();
    } else {
      teardownMatrix();
    }
  });

  renderModeSel?.addEventListener('change', () => {
    const cfg = getConfig();
    setConfig({ ...cfg, renderMode: renderModeSel.value as RenderMode });
    if (active) updateMatrix();
  });

  densityRange?.addEventListener('input', () => {
    const cfg = getConfig();
    setConfig({ ...cfg, densityMultiplier: parseFloat(densityRange.value) });
    if (active) updateMatrix();
  });

  maxFpsRange?.addEventListener('input', () => {
    const cfg = getConfig();
    setConfig({
      ...cfg,
      canvasConfig: { ...cfg.canvasConfig, maxFPS: parseInt(maxFpsRange.value, 10) }
    });
    if (active) updateMatrix();
  });
}
