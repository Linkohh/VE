<script lang="ts">
  import { onDestroy } from 'svelte';
  import { FontAwesomeIcon as Fa } from '@fortawesome/svelte-fontawesome';
  import { faBookmark } from '@fortawesome/free-solid-svg-icons';
  import {
    favoritesPanel,
    setFavoritesToggleElement,
    toggleFavorites,
  } from '../stores/favorites';

  let open = false;
  let buttonElement: HTMLButtonElement | null = null;

  const unsubscribe = favoritesPanel.subscribe((value) => {
    if (open && !value && buttonElement) {
      buttonElement.focus();
    }
    open = value;
  });

  $: setFavoritesToggleElement(buttonElement);

  function handleClick(): void {
    toggleFavorites();
  }

  onDestroy(() => {
    unsubscribe();
    if (buttonElement) {
      setFavoritesToggleElement(null);
    }
  });
</script>

<button
  type="button"
  class="floating-favorites"
  class:open
  aria-pressed={open}
  aria-label={open ? 'Close favorites' : 'Open favorites'}
  on:click={handleClick}
  bind:this={buttonElement}
>
  <Fa icon={faBookmark} class="h-4 w-4" />
  <span class="label">Favorites</span>
</button>

<style>
  .floating-favorites {
    position: fixed;
    right: 1.25rem;
    bottom: 1.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1.2rem;
    border-radius: 9999px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(15, 23, 42, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 15px 35px rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(16px);
    transition: transform 150ms ease, background 150ms ease, color 150ms ease, box-shadow 150ms ease;
    z-index: 130;
  }

  .floating-favorites:hover,
  .floating-favorites:focus-visible {
    transform: translateY(-2px);
    background: rgba(59, 130, 246, 0.75);
    box-shadow: 0 18px 40px rgba(59, 130, 246, 0.35);
    color: #fff;
    outline: none;
  }

  .floating-favorites.open {
    background: rgba(59, 130, 246, 0.8);
    box-shadow: 0 18px 40px rgba(59, 130, 246, 0.35);
    color: #fff;
  }

  .label {
    font-size: 0.85rem;
    text-transform: uppercase;
  }

  @media (max-width: 640px) {
    .floating-favorites {
      right: 1rem;
      bottom: 1rem;
      padding: 0.6rem 1rem;
    }

    .label {
      font-size: 0.75rem;
    }
  }
</style>
