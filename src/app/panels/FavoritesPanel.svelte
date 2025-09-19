<script lang="ts">
  import { FontAwesomeIcon as Fa } from '@fortawesome/svelte-fontawesome';
  import { faBookmark, faShareNodes, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
  import { onDestroy } from 'svelte';
  import type { FavoriteItem } from '../../features/favorites/store';
  import { fly } from 'svelte/transition';
  import {
    clearFavorites,
    closeFavorites,
    favorites,
    favoritesPanel,
    removeFavorite,
    setFavoritesPanelElement,
    shareFavoriteById,
  } from '../stores/favorites';

  let open = false;
  let panelElement: HTMLElement | null = null;
  let items: FavoriteItem[] = [];

  const unsubscribeFavorites = favorites.subscribe((value) => {
    items = value;
  });

  const unsubscribePanel = favoritesPanel.subscribe((value) => {
    open = value;
  });

  onDestroy(() => {
    unsubscribeFavorites();
    unsubscribePanel();
    setFavoritesPanelElement(null);
  });

  $: setFavoritesPanelElement(panelElement);

  function onRequestClose(): void {
    closeFavorites();
  }

  async function onShare(id: string): Promise<void> {
    await shareFavoriteById(id);
  }

  function onRemove(id: string): void {
    removeFavorite(id);
  }

  function onClear(): void {
    clearFavorites();
  }
</script>

{#if open}
  <aside
    bind:this={panelElement}
    class="favorites-panel"
    aria-labelledby="favorites-title"
    transition:fly={{ x: 40, y: 40, duration: 200 }}
  >
    <div class="flex items-center justify-between border-b border-white/10 px-5 py-4">
      <div class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80">
        <Fa icon={faBookmark} class="h-3.5 w-3.5" />
        <span id="favorites-title">Favorites</span>
        <span class="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/70">{items.length}</span>
      </div>
      <button
        type="button"
        class="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        aria-label="Close favorites"
        on:click={onRequestClose}
      >
        <Fa icon={faTimes} class="h-4 w-4" />
      </button>
    </div>

    <div class="max-h-[60vh] overflow-y-auto px-5 py-4 text-white/90">
      {#if items.length === 0}
        <p class="text-sm text-white/60">Your saved inspiration will appear here.</p>
      {:else}
        <ul class="space-y-3">
          {#each items as item (item.id)}
            <li class="rounded-2xl bg-white/5 p-4 shadow-inner">
              <p class="text-base text-white">{item.text}</p>
              {#if item.author}
                <p class="mt-1 text-sm text-white/70">— {item.author}</p>
              {/if}

              <div class="mt-3 flex items-center gap-2 text-xs">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 transition hover:bg-white/20"
                  on:click={() => onShare(item.id)}
                >
                  <Fa icon={faShareNodes} class="h-3.5 w-3.5" /> Share
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 transition hover:bg-rose-500/80 hover:text-white"
                  on:click={() => onRemove(item.id)}
                >
                  <Fa icon={faTrash} class="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div class="flex items-center justify-between border-t border-white/10 px-5 py-4 text-sm text-white/70">
      <button
        type="button"
        class="rounded-full bg-white/10 px-4 py-2 font-medium transition hover:bg-white/20"
        on:click={onClear}
        disabled={items.length === 0}
      >
        Clear all
      </button>
      <span>{items.length} {items.length === 1 ? 'favorite' : 'favorites'}</span>
    </div>
  </aside>
{/if}

<style>
  .favorites-panel {
    position: fixed;
    right: 1.5rem;
    bottom: 6rem;
    z-index: 120;
    width: min(22rem, calc(100vw - 2rem));
    border-radius: 1.5rem;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(18px);
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.12);
    overflow: hidden;
  }

  @media (max-width: 640px) {
    .favorites-panel {
      right: 1rem;
      bottom: 5.5rem;
      width: calc(100vw - 2rem);
    }
  }
</style>
