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
    matrixEnabled: true,
    beepEnabled: false,
    speechEnabled: false,
    autoAdvanceEnabled: false,
    autoAdvanceInterval: 8,
    matrix: DEFAULTS,
    aura: { ...DEFAULT_AURA_SETTINGS },
  };

  function applyState(): void {
    if (!mounted) {
      return;
    }

    const wantsCanvas = state.matrixEnabled && state.matrix.renderMode === RenderMode.Canvas;

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
    unsubscribe();
  });
</script>

{#if state.matrixEnabled && state.matrix.renderMode === RenderMode.Minimal}
  <AuraGlow />
{/if}
