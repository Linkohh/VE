<script lang="ts">
    import { uiState, togglePanel } from '../stores/uiStore';
</script>

{#if $uiState.activePanel === 'favorites'}
    <aside class="panel" aria-label="Favorite quotes">
        <header class="panel-header">
            <h2>Favorites</h2>
            <button type="button" class="close-btn" on:click={() => togglePanel('favorites')} aria-label="Close favorites">
                ×
            </button>
        </header>
        <p class="panel-empty">Your saved quotes will appear here.</p>
    </aside>
{/if}

<style>
    .panel {
        position: fixed;
        top: 5rem;
        right: 2rem;
        width: min(360px, calc(100% - 2rem));
        max-height: calc(100vh - 7rem);
        padding: 1.5rem;
        background: rgba(17, 24, 39, 0.75);
        color: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        overflow-y: auto;
        backdrop-filter: blur(12px);
        z-index: var(--z-modal);
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;
    }

    .panel-header h2 {
        margin: 0;
        font-size: 1.25rem;
    }

    .close-btn {
        border: none;
        background: transparent;
        color: inherit;
        font-size: 1.5rem;
        cursor: pointer;
    }

    .panel-empty {
        margin: 0;
        opacity: 0.8;
        font-size: 0.95rem;
    }
</style>
