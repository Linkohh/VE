<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { initMatrix, teardownMatrix, updateMatrix } from '../../../features/matrix/engine';

  export let enabled = true;

  let initialized = false;

  onMount(() => {
    if (enabled && !initialized) {
      initMatrix();
      initialized = true;
    }
  });

  onDestroy(() => {
    if (initialized) {
      teardownMatrix();
      initialized = false;
    }
  });

  $: if (enabled) {
    if (!initialized) {
      initMatrix();
      initialized = true;
    } else {
      updateMatrix();
    }
  } else if (initialized) {
    teardownMatrix();
    initialized = false;
  }
</script>
