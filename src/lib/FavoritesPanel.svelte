<script>
  import { onMount } from 'svelte';
  import { writable }s from 'svelte/store';

  // State
  const favorites = writable([]);
  const isPanelOpen = writable(false);

  // Load favorites from localStorage
  onMount(() => {
    const savedFavorites = localStorage.getItem('vibeme-favorites');
    if (savedFavorites) {
      favorites.set(JSON.parse(savedFavorites));
    }

    const favoritesToggle = document.getElementById('favorites-toggle');
    if (favoritesToggle) {
      favoritesToggle.addEventListener('click', () => {
        isPanelOpen.update(n => !n);
      });
    }

    const favoritesClose = document.getElementById('favorites-close');
    if (favoritesClose) {
      favoritesClose.addEventListener('click', () => {
        isPanelOpen.set(false);
      });
    }

    // Listen for changes from other tabs/windows
    window.addEventListener('storage', (event) => {
      if (event.key === 'vibeme-favorites') {
        favorites.set(JSON.parse(event.newValue || '[]'));
      }
    });

    // Listen for custom event from main app logic
    document.addEventListener('vibeme:favorites:changed', () => {
        const saved = localStorage.getItem('vibeme-favorites');
        if (saved) {
            favorites.set(JSON.parse(saved));
        }
    });
  });

  // Actions
  function copyQuote(quote) {
    const textToCopy = `"${quote.text}" — ${quote.author}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        document.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Copied to clipboard!', type: 'success' } }));
    }).catch(err => {
        console.error('Failed to copy: ', err);
        document.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to copy', type: 'error' } }));
    });
  }

  function removeFavorite(quoteToRemove) {
    favorites.update(items => {
      const newItems = items.filter(item => item.text !== quoteToRemove.text || item.author !== quoteToRemove.author);
      localStorage.setItem('vibeme-favorites', JSON.stringify(newItems));
      document.dispatchEvent(new CustomEvent('vibeme:favorites:changed'));
      return newItems;
    });
  }
</script>

<div class="favorites-container">
  <button id="favorites-toggle" class="action-button" aria-label="Toggle favorites panel" aria-expanded={$isPanelOpen}>
    <i class="fas fa-heart"></i>
    <span id="favorites-count" class="favorites-count-badge">{$favorites.length}</span>
  </button>

  <div id="favorites-panel" class="favorites-panel" data-state={$isPanelOpen ? 'open' : 'closed'} role="dialog" aria-modal="true" aria-labelledby="favorites-heading">
    <div class="favorites-header">
      <h2 id="favorites-heading" class="heading-font dynamic-text-main">Favorites</h2>
      <button id="favorites-close" class="favorites-icon-btn" aria-label="Close favorites panel">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="favorites-body">
      <div id="favorites-list" class="favorites-list">
        {#if $favorites.length === 0}
          <div class="favorites-empty">
            <i class="fas fa-inbox favorites-empty-icon"></i>
            <p class="favorites-empty-text">No favorites yet.</p>
            <p class="favorites-empty-hint">Click the heart on a quote to save it here.</p>
          </div>
        {:else}
          {#each $favorites as quote, i (quote.text + quote.author)}
            <div class="fav-item">
              <div class="fav-text-wrap">
                <p class="fav-quote">"{quote.text}"</p>
                {#if quote.author}
                  <p class="fav-author">— {quote.author}</p>
                {/if}
              </div>
              <div class="fav-actions">
                <button on:click={() => copyQuote(quote)} class="fav-copy favorites-icon-btn" title="Copy">
                  <i class="fas fa-copy"></i>
                </button>
                <button on:click={() => removeFavorite(quote)} class="fav-remove favorites-icon-btn" title="Remove">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .favorites-container {
    position: fixed;
    top: 1rem;
    right: 5rem; /* Positioned next to settings */
    z-index: var(--z-popover);
  }

  #favorites-toggle {
    position: relative;
  }

  .favorites-count-badge {
    position: absolute;
    top: -5px;
    right: -8px;
    background: linear-gradient(135deg, var(--color2), var(--color3));
    color: #0b1220;
    font-weight: 700;
    border-radius: var(--radius-full);
    width: 22px;
    height: 22px;
    font-size: 11px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 8px rgba(0,0,0,0.15);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }

  .favorites-panel {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    width: 320px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;

    /* Glassmorphism from css/style.css */
    background: linear-gradient(135deg, rgba(15,23,42,0.75), rgba(31,41,55,0.62));
    backdrop-filter: blur(16px) saturate(160%);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow:
      0 8px 30px rgba(0,0,0,0.35),
      0 0 0 1px rgba(255,255,255,0.05) inset;
    transition: transform var(--transition-medium), opacity var(--transition-medium), max-height var(--transition-medium);
  }

  .favorites-panel[data-state="open"] {
    max-height: 80vh;
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
  .favorites-panel[data-state="closed"] {
    max-height: 0;
    opacity: 0;
    pointer-events: none;
    transform: translateY(8px);
  }

  .favorites-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
    border-bottom: 1px solid rgba(255,255,255,0.10);
  }

  .favorites-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .favorites-icon-btn {
    padding: 5px 8px;
    font-size: 12px;
    border-radius: 8px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--text-color-secondary);
    cursor: pointer;
  }
  .favorites-icon-btn:hover {
    background: rgba(255,255,255,0.12);
  }


  .favorites-body {
    flex-grow: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    color: var(--text-color-secondary);
  }

  .favorites-list {
    flex-grow: 1;
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .fav-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
  }

  .fav-text-wrap {
    flex: 1;
    min-width: 0;
  }
  .fav-quote {
    font-size: 12px;
    color: var(--text-color-main);
    line-height: 1.3;
    word-break: break-word;
  }
  .fav-author {
    font-size: 11px;
    color: var(--text-color-secondary);
    margin-top: 2px;
  }
  .fav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
  }
  .fav-actions button {
    background: none;
    border: none;
    color: var(--text-color-secondary);
    cursor: pointer;
    padding: 0;
    font-size: 1rem;
  }
  .fav-actions button:hover {
    color: var(--text-color-main);
  }
  .favorites-empty {
      text-align: center;
      padding: 2rem 1rem;
  }
  .favorites-empty-icon {
      font-size: 2rem;
      opacity: 0.3;
      margin-bottom: 0.75rem;
      display: block;
  }
  .favorites-empty-text {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
      opacity: 0.7;
  }
  .favorites-empty-hint {
      font-size: 0.75rem;
      opacity: 0.5;
  }

  /* Scrollbar */
  .favorites-list::-webkit-scrollbar { width: 8px; }
  .favorites-list::-webkit-scrollbar-track { background: rgba(255,255,255,0.06); border-radius: 6px; }
  .favorites-list::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--color1), var(--color2)); border-radius: 6px; }

</style>