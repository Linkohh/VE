<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { initMatrix, teardownMatrix, updateMatrix } from '../../../features/matrix/engine';
  import { DEFAULTS } from '../../../features/matrix/config';
  import { settings, type AppSettingsState } from '../../stores/settings';

  let initialized = false;
  let mounted = false;
  let state: AppSettingsState = {
    matrixEnabled: true,
    beepEnabled: false,
    matrix: DEFAULTS,
  };

  function applyState(): void {
    if (!mounted) {
      return;
    }

    if (state.matrixEnabled) {
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
