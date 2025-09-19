<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  let now = new Date();
  let ticker: ReturnType<typeof setInterval> | null = null;

  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  function update(): void {
    now = new Date();
  }

  onMount(() => {
    update();
    ticker = setInterval(update, 1000);
  });

  onDestroy(() => {
    if (ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  });

  $: formatted = formatter.format(now);
</script>

<div class="date-stamp" aria-live="polite" aria-atomic="true">
  <span class="weekday">{formatted}</span>
</div>

<style>
  .date-stamp {
    display: inline-flex;
    flex-direction: column;
    gap: 0.25rem;
    color: rgba(255, 255, 255, 0.86);
    font-size: 0.95rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .weekday {
    font-weight: 600;
    text-shadow: 0 0 12px rgba(56, 189, 248, 0.45);
  }

  @media (max-width: 640px) {
    .date-stamp {
      font-size: 0.8rem;
      letter-spacing: 0.05em;
    }
  }
</style>
