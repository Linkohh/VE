<script lang="ts">
  import { onDestroy } from 'svelte';
  import { FontAwesomeIcon as Fa } from '@fortawesome/svelte-fontawesome';
  import { faCircleXmark, faSearch } from '@fortawesome/free-solid-svg-icons';
  import { applyQuoteFilter, quoteLoading } from '../stores/quote';

  const SEARCH_DELAY = 280;

  let query = '';
  let lastApplied: string | null = null;
  let debounceHandle: ReturnType<typeof setTimeout> | null = null;
  let isLoading = false;

  $: isLoading = $quoteLoading;

  function clearDebounce(): void {
    if (debounceHandle) {
      clearTimeout(debounceHandle);
      debounceHandle = null;
    }
  }

  async function runSearch(rawValue: string): Promise<void> {
    const normalized = rawValue.trim();

    if (lastApplied === normalized) {
      return;
    }

    lastApplied = normalized;

    try {
      if (normalized) {
        await applyQuoteFilter({ search: normalized });
      } else {
        await applyQuoteFilter(null);
      }
    } catch (error) {
      console.warn('[quotes] search failed', error);
    }
  }

  function scheduleSearch(value: string): void {
    clearDebounce();
    debounceHandle = setTimeout(() => {
      debounceHandle = null;
      void runSearch(value);
    }, SEARCH_DELAY);
  }

  function handleInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement | null;
    const value = target?.value ?? '';
    query = value;
    scheduleSearch(value);
  }

  function handleSubmit(event: Event): void {
    event.preventDefault();
    clearDebounce();
    void runSearch(query);
  }

  function handleClear(): void {
    query = '';
    clearDebounce();
    void runSearch('');
  }

  onDestroy(() => {
    clearDebounce();
  });
</script>

<form class="quote-search" role="search" aria-label="Search quotes" on:submit={handleSubmit}>
  <div class="search-shell" class:is-loading={isLoading}>
    <span class="search-icon" aria-hidden="true">
      <Fa icon={faSearch} class="h-4 w-4 flex-shrink-0 text-white/50" />
    </span>

    <input
      class="search-input"
      type="search"
      name="quote-search"
      placeholder="Search quotes or authors..."
      autocomplete="off"
      spellcheck="false"
      enterkeyhint="search"
      bind:value={query}
      on:input={handleInput}
    />

    {#if query}
      <button
        type="button"
        class="clear-button"
        aria-label="Clear search"
        on:click={handleClear}
      >
        <Fa icon={faCircleXmark} class="h-4 w-4" />
      </button>
    {/if}
  </div>

  <p class="search-hint">Search matches quote text or authors from the full VibeMe archive.</p>
</form>

<style>
  .quote-search {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
    text-align: left;
    color: rgba(255, 255, 255, 0.75);
  }

  .search-shell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1.1rem;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      inset 0 0 0 rgba(255, 255, 255, 0.08),
      0 8px 24px rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(18px);
    position: relative;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .search-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .search-shell:focus-within {
    border-color: rgba(0, 255, 255, 0.6);
    box-shadow:
      inset 0 0 0 rgba(255, 255, 255, 0.1),
      0 10px 28px rgba(56, 189, 248, 0.25);
  }

  .search-shell.is-loading::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.4), rgba(255, 0, 255, 0.4));
    opacity: 0;
    animation: pulse-border 1.4s ease-in-out infinite;
    pointer-events: none;
  }

  .search-input {
    flex: 1 1 auto;
    border: none;
    background: transparent;
    color: white;
    font-size: 1rem;
    outline: none;
    min-width: 0;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .clear-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 1.75rem;
    width: 1.75rem;
    border-radius: 999px;
    border: none;
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
  }

  .clear-button:hover,
  .clear-button:focus-visible {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .clear-button:focus-visible {
    outline: 2px solid rgba(0, 255, 255, 0.4);
    outline-offset: 2px;
  }

  .search-hint {
    margin: 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.55);
  }

  @keyframes pulse-border {
    0%,
    100% {
      opacity: 0;
      transform: scale(0.99);
    }

    40%,
    60% {
      opacity: 0.7;
      transform: scale(1);
    }
  }

  @media (max-width: 640px) {
    .search-hint {
      text-align: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .search-shell,
    .clear-button {
      transition: none;
    }

    .search-shell.is-loading::after {
      animation: none;
      opacity: 0;
    }
  }
</style>
