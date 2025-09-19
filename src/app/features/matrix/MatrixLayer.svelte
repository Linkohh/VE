<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { DEFAULTS, RenderMode } from '../../../features/matrix/config';
  import { initMatrix, teardownMatrix, updateMatrix } from '../../../features/matrix/engine';
  import { DEFAULT_AURA_SETTINGS } from '../../config/aura';
  import { settings, type AppSettingsState } from '../../stores/settings';
  import AuraGlow from './AuraGlow.svelte';

  let initialized = false;
  let mounted = false;
  let state: AppSettingsState = {
    general: { matrixEnabled: true, beepEnabled: false, speechEnabled: false },
    content: { autoAdvanceEnabled: false, autoAdvanceInterval: 8, streamDensity: 1, inclusiveLanguage: true },
    matrix: DEFAULTS,
    aura: { ...DEFAULT_AURA_SETTINGS },
    appearance: {
      colorHarmonyPreset: DEFAULT_AURA_SETTINGS.colorKey,
      themePreset: 'synthwave',
      vibrancy: 65,
      warmth: 50,
      accessibilityMode: 'standard',
      mouseGlowIntensity: DEFAULT_AURA_SETTINGS.intensity,
    },
    audio: { chimePreset: 'soft', chimeVolume: 65, voiceStyle: 'ambient', voiceWarmth: 55 },
  };

  function applyDocumentStyles(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.style.setProperty(
      '--matrix-opacity-token',
      state.matrix.visibility.toFixed(2),
    );
    document.body.dataset.matrixBlendMode = state.matrix.blendMode;
  }

  function applyState(): void {
    if (!mounted) {
      return;
    }

    applyDocumentStyles();

    const wantsCanvas = state.general.matrixEnabled && state.matrix.renderMode === RenderMode.Canvas;

    if (wantsCanvas) {
      if (!initialized) {
        initMatrix(state.matrix);
        initialized = true;
      } else {
        updateMatrix(state.matrix);
      }
    } else if (initialized) {
      teardownMatrix();
      initialized = false;
    }
  }

  const unsubscribe = settings.subscribe((value) => {
    state = value;
    applyState();
  });

  onMount(() => {
    mounted = true;
    applyState();
  });

  onDestroy(() => {
    mounted = false;
    if (initialized) {
      teardownMatrix();
      initialized = false;
    }
    if (typeof document !== 'undefined') {
      document.body.dataset.matrixBlendMode = '';
    }
    unsubscribe();
  });
</script>

{#if state.general.matrixEnabled && state.matrix.renderMode === RenderMode.Minimal}
  <AuraGlow />
{/if}
