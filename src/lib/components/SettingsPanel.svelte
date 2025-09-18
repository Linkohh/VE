<script lang="ts">
    import { settingsStore } from '../stores/settingsStore';
    import { togglePanel, uiState } from '../stores/uiStore';
</script>

{#if $uiState.activePanel === 'settings'}
    <div class="panel" role="dialog" aria-modal="true" aria-label="Settings">
        <header class="panel-header">
            <h2>Settings</h2>
            <button type="button" class="close-btn" on:click={() => togglePanel('settings')} aria-label="Close settings">
                ×
            </button>
        </header>

        <section class="settings-group" aria-labelledby="audio-settings">
            <h3 id="audio-settings">Audio</h3>
            <label class="toggle">
                <input type="checkbox" bind:checked={$settingsStore.soundEnabled} />
                <span>Enable sounds</span>
            </label>
        </section>

        <section class="settings-group" aria-labelledby="visual-settings">
            <h3 id="visual-settings">Visual Effects</h3>
            <label class="toggle">
                <input type="checkbox" bind:checked={$settingsStore.auraEnabled} />
                <span>Enable aura glow</span>
            </label>
            <label class="toggle">
                <input type="checkbox" bind:checked={$settingsStore.matrixMode} />
                <span>Enable matrix background</span>
            </label>
        </section>
    </div>
{/if}

<style>
    .panel {
        position: fixed;
        top: 5rem;
        right: 2rem;
        width: min(360px, calc(100% - 2rem));
        max-height: calc(100vh - 7rem);
        padding: 1.5rem;
        background: rgba(17, 24, 39, 0.9);
        color: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        overflow-y: auto;
        backdrop-filter: blur(16px);
        z-index: var(--z-modal);
        display: grid;
        gap: 1.5rem;
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .panel-header h2 {
        margin: 0;
    }

    .close-btn {
        border: none;
        background: transparent;
        color: inherit;
        font-size: 1.5rem;
        cursor: pointer;
    }

    .settings-group {
        display: grid;
        gap: 0.75rem;
    }

    .settings-group h3 {
        margin: 0;
        font-size: 1rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        opacity: 0.7;
    }

    .toggle {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-md);
    }

    input[type='checkbox'] {
        width: 1.25rem;
        height: 1.25rem;
    }
</style>
