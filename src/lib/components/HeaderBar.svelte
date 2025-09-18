<script lang="ts">
    import { settingsStore } from '../stores/settingsStore';
    import { togglePanel } from '../stores/uiStore';

    const handleFavorites = () => togglePanel('favorites');
    const handleSettings = () => togglePanel('settings');

    const toggleMatrix = () => {
        settingsStore.update((value) => ({ ...value, matrixMode: !value.matrixMode }));
    };
</script>

<header class="header-bar">
    <div class="brand">
        <span class="logo-text">VibeMe</span>
        <span class="tagline">Motivational Quote Generator</span>
    </div>
    <nav class="header-actions" aria-label="Primary actions">
        <button type="button" class="header-btn" on:click={handleFavorites}>
            <span class="icon" aria-hidden="true">★</span>
            <span class="label">Favorites</span>
        </button>
        <button type="button" class="header-btn" on:click={toggleMatrix}>
            <span class="icon" aria-hidden="true">⌘</span>
            <span class="label">Matrix</span>
        </button>
        <button type="button" class="header-btn" on:click={handleSettings}>
            <span class="icon" aria-hidden="true">⚙</span>
            <span class="label">Settings</span>
        </button>
    </nav>
</header>

<style>
    .header-bar {
        position: sticky;
        top: 0;
        z-index: var(--z-fixed);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 2rem;
        background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
        color: white;
        border-radius: 0 0 var(--radius-lg) var(--radius-lg);
        box-shadow: var(--shadow-lg);
    }

    .brand {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .logo-text {
        font-family: var(--font-heading);
        font-size: clamp(1.5rem, 3vw, 2.5rem);
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .tagline {
        font-size: 0.875rem;
        opacity: 0.8;
    }

    .header-actions {
        display: flex;
        gap: 0.75rem;
    }

    .header-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(0, 0, 0, 0.15);
        color: inherit;
        font-weight: 600;
        cursor: pointer;
        transition: transform var(--transition-fast), background var(--transition-fast);
    }

    .header-btn:hover,
    .header-btn:focus-visible {
        background: rgba(0, 0, 0, 0.3);
        transform: translateY(-2px);
    }

    .icon {
        font-size: 1rem;
    }

    .label {
        font-size: 0.95rem;
    }

    @media (max-width: 768px) {
        .header-bar {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }

        .header-actions {
            width: 100%;
            justify-content: center;
        }

        .header-btn {
            flex: 1;
            justify-content: center;
        }
    }
</style>
