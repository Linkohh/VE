<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { bus, EVENTS } from '../../lib/bus';
  import type { FavoriteItem } from '../../features/favorites/store';
  import Modal from '../components/Modal.svelte';
  import {
    clearFavorites,
    closeFavorites,
    favorites,
    removeFavorite,
    shareFavoriteById,
  } from '../stores/favorites';

  let open = false;
  let opener: HTMLElement | null = null;
  let items: FavoriteItem[] = [];

  const unsubscribe = favorites.subscribe((value) => {
    items = value;
  });

  function handleOpen(payload?: { opener?: HTMLElement | null }): void {
    open = true;
    opener = payload?.opener ?? null;
  }

  function handleClose(): void {
    open = false;
  }

  onMount(() => {
    bus.on(EVENTS.FAV_OPEN, handleOpen);
    bus.on(EVENTS.FAV_CLOSE, handleClose);
  });

  onDestroy(() => {
    bus.off(EVENTS.FAV_OPEN, handleOpen);
    bus.off(EVENTS.FAV_CLOSE, handleClose);
    unsubscribe();
  });

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

<Modal open={open} on:close={onRequestClose} labelledBy="favorites-title" returnFocus={opener}>
  <div class="flex items-center justify-between border-b border-white/10 px-5 py-4">
    <div class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80">
      <i class="fas fa-bookmark text-xs" aria-hidden="true" />
      <span id="favorites-title">Favorites</span>
      <span class="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/70">{items.length}</span>
    </div>
    <button
      type="button"
      class="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      aria-label="Close favorites"
      on:click={onRequestClose}
    >
      <i class="fas fa-times" aria-hidden="true" />
    </button>
  </div>

  <div class="max-h-[60vh] overflow-y-auto px-5 py-4 text-white/90">
    {#if items.length === 0}
      <p class="text-sm text-white/60">Your saved inspiration will appear here.</p>
    {:else}
      <ul class="space-y-3">
        {#each items as item}
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
                <i class="fas fa-share-nodes" aria-hidden="true" /> Share
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 transition hover:bg-rose-500/80 hover:text-white"
                on:click={() => onRemove(item.id)}
              >
                <i class="fas fa-trash" aria-hidden="true" /> Remove
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
</Modal>
