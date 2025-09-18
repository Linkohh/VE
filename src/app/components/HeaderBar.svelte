<script lang="ts">
  import { FontAwesomeIcon as Fa } from '@fortawesome/svelte-fontawesome';
  import { faBookmark, faGear } from '@fortawesome/free-solid-svg-icons';
  import ThemeToggle from './ThemeToggle.svelte';
  import { openFavorites } from '../stores/favorites';
  import type { QuoteViewModel } from '../stores/quote';

  export let quote: QuoteViewModel | null = null;
  export let onOpenSettings: () => void = () => {};

  let favoritesButton: HTMLButtonElement | null = null;

  function handleFavorites(): void {
    openFavorites(favoritesButton ?? undefined);
  }
</script>

<header class="flex flex-wrap items-center justify-between gap-4 text-white">
  <div>
    <div class="header-title-container">
      <h1 class="title-vibe">Vibe</h1>
      <h1 class="title-me">Me</h1>
    </div>
    <p class="tagline">
      {quote ? 'Tune into your next vibe.' : 'Preparing your first vibe...'}
    </p>
  </div>

  <div class="flex items-center gap-2">
    <ThemeToggle />

    <button
      type="button"
      class="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      aria-label="Open favorites"
      bind:this={favoritesButton}
      on:click={handleFavorites}
    >
      <Fa icon={faBookmark} class="h-4 w-4" />
    </button>

    <button
      type="button"
      class="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      aria-label="Open settings"
      on:click={onOpenSettings}
    >
      <Fa icon={faGear} class="h-4 w-4" />
    </button>
  </div>
</header>

<style>
  .header-title-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem 0;
  }

  .title-vibe,
  .title-me {
    font-family: 'Courier New', Courier, monospace;
    font-size: 3rem;
    font-weight: bold;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }

  .title-vibe {
    color: #ff00ff;
  }

  .title-me {
    color: #00ffff;
  }

  .tagline {
    margin: 0;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
  }
</style>
