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
    <h1 class="text-3xl font-semibold tracking-tight heading-font">VibeMe</h1>
    {#if quote?.category}
      <p class="text-sm text-white/70">Exploring {quote.category} vibes</p>
    {/if}
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
