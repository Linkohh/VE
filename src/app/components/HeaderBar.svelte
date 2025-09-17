<script lang="ts">
  import { bus, EVENTS } from '../../lib/bus';
  import { openFavorites } from '../stores/favorites';
  import type { QuoteViewModel } from '../stores/quote';

  export let quote: QuoteViewModel | null = null;
  export let onOpenSettings: () => void = () => {};

  let favoritesButton: HTMLButtonElement | null = null;

  function handleTheme(): void {
    bus.emit(EVENTS.THEME_CHANGED, { action: 'next' });
  }

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
    <button
      type="button"
      class="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      aria-label="Shuffle theme"
      on:click={handleTheme}
    >
      <i class="fas fa-palette" aria-hidden="true" />
    </button>

    <button
      type="button"
      class="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      aria-label="Open favorites"
      bind:this={favoritesButton}
      on:click={handleFavorites}
    >
      <i class="fas fa-bookmark" aria-hidden="true" />
    </button>

    <button
      type="button"
      class="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      aria-label="Open settings"
      on:click={onOpenSettings}
    >
      <i class="fas fa-gear" aria-hidden="true" />
    </button>
  </div>
</header>
