<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import QuoteSearch from './QuoteSearch.svelte';

  export let open = false;

  const dispatch = createEventDispatcher<{ close: void }>();

  let searchInput: HTMLInputElement | null = null;
  let previouslyFocused: HTMLElement | null = null;
  let focusCaptured = false;

  function recordFocusOrigin(): void {
    if (focusCaptured || typeof document === 'undefined') {
      return;
    }

    const activeElement = document.activeElement;
    previouslyFocused = activeElement instanceof HTMLElement ? activeElement : null;
    focusCaptured = true;
  }

  function restoreFocus(): void {
    if (typeof document === 'undefined') {
      previouslyFocused = null;
      focusCaptured = false;
      return;
    }

    const target = previouslyFocused;
    previouslyFocused = null;
    focusCaptured = false;

    if (target) {
      tick().then(() => {
        target.focus();
      });
    }
  }

  $: if (open) {
    recordFocusOrigin();
    tick().then(() => {
      if (!open) return;
      searchInput?.focus();
      searchInput?.select();
    });
  } else if (focusCaptured) {
    restoreFocus();
  }

  function emitClose(): void {
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      emitClose();
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      emitClose();
    }
  }

  function handleSubmit(): void {
    emitClose();
  }

  function handleClear(): void {
    emitClose();
  }
</script>

{#if open}
  <div
    class="quote-search-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Search quotes"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    tabindex="-1"
  >
    <div class="quote-search-dialog">
      <QuoteSearch bind:inputElement={searchInput} on:submit={handleSubmit} on:clear={handleClear} />
    </div>
  </div>
{/if}

<style>
  .quote-search-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    background: rgba(15, 23, 42, 0.82);
    backdrop-filter: blur(12px);
  }

  .quote-search-dialog {
    width: min(40rem, 100%);
    border-radius: 1.5rem;
    padding: 2.5rem 2rem;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow:
      0 32px 72px rgba(15, 23, 42, 0.55),
      0 0 0 1px rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 640px) {
    .quote-search-dialog {
      padding: 2rem 1.5rem;
      border-radius: 1rem;
    }
  }
</style>
