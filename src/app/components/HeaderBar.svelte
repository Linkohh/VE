<script lang="ts">
  import { FontAwesomeIcon as Fa } from '@fortawesome/svelte-fontawesome';
  import { faBookmark, faGear } from '@fortawesome/free-solid-svg-icons';
  import ThemeToggle from './ThemeToggle.svelte';
  import { openFavorites } from '../stores/favorites';
  import type { QuoteViewModel } from '../stores/quote';

  export let quote: QuoteViewModel | null = null;
  export let onOpenSettings: () => void = () => {};
  export let autoAdvanceFraction = 0;
  export let secondsRemaining = 0;
  export let autoAdvanceActive = false;

  let favoritesButton: HTMLButtonElement | null = null;

  function handleFavorites(): void {
    openFavorites(favoritesButton ?? undefined);
  }

  $: progressValue = Math.min(100, Math.max(0, Math.round(autoAdvanceFraction * 100)));
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

    {#if autoAdvanceActive}
      <div class="timing" aria-live="polite">
        <span class="timing-label">Next vibe in {secondsRemaining}s</span>
        <div
          class="progress-track"
          role="progressbar"
          aria-label="Time until next quote"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progressValue}
        >
          <div class="progress-fill" style={`width: ${progressValue}%`}></div>
        </div>
      </div>
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

  .timing {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .timing-label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.65);
  }

  .progress-track {
    position: relative;
    width: 12rem;
    max-width: 100%;
    height: 0.35rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, rgba(255, 0, 255, 0.6), rgba(0, 255, 255, 0.6));
    transform-origin: left;
    transition: width 0.2s ease;
  }
</style>
