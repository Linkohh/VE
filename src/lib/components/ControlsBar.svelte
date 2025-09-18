<script lang="ts">
    import { nextQuote, previousQuote } from '../stores/quoteStore';
    import { playSound } from '../utils/sound';
    import { settingsStore } from '../stores/settingsStore';
    import { get } from 'svelte/store';

    const trigger = (soundId: string, callback: () => void) => {
        callback();
        if (get(settingsStore).soundEnabled) {
            playSound(soundId);
        }
    };
</script>

<div class="controls-bar" role="group" aria-label="Quote controls">
    <button type="button" class="control-btn" on:click={() => trigger('previous', previousQuote)}>
        ← Previous
    </button>
    <button type="button" class="control-btn primary" on:click={() => trigger('generate', nextQuote)}>
        Generate
    </button>
    <button type="button" class="control-btn" on:click={() => trigger('favorite', () => {})}>
        ☆ Favorite
    </button>
</div>

<style>
    .controls-bar {
        margin: 2.5rem auto 0;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .control-btn {
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-md);
        border: 1px solid rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.6);
        color: var(--text-color-main);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        box-shadow: var(--shadow-sm);
    }

    .control-btn:hover,
    .control-btn:focus-visible {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }

    .control-btn.primary {
        background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
        color: white;
        border: none;
    }
</style>
