<script lang="ts">
    import { onMount } from 'svelte';
    import HeaderBar from './lib/components/HeaderBar.svelte';
    import QuoteCard from './lib/components/QuoteCard.svelte';
    import ControlsBar from './lib/components/ControlsBar.svelte';
    import FavoritesPanel from './lib/components/FavoritesPanel.svelte';
    import SettingsPanel from './lib/components/SettingsPanel.svelte';
    import Footer from './lib/components/Footer.svelte';
    import { loadQuotes } from './lib/stores/quoteStore';
    import { settingsStore } from './lib/stores/settingsStore';

    let soundEnabled = false;

    // Subscribe to settings to get sound preference
    const unsubscribe = settingsStore.subscribe(settings => {
        soundEnabled = settings.soundEnabled;
    });

    onMount(() => {
        loadQuotes().catch((error) => console.error('Failed to load quotes', error));

        // Clean up subscription
        return () => {
            unsubscribe();
        };
    });
</script>

<div class="app-shell">
    <HeaderBar />
    <main class="content" id="main-content">
        <QuoteCard />
        <ControlsBar />
    </main>
    <Footer />
    <FavoritesPanel />
    <SettingsPanel />
</div>

{#if soundEnabled}
<audio id="generate" src="/sounds/generate.mp3" preload="auto" data-respect-beep></audio>
<audio id="favorite" src="/sounds/favorite.mp3" preload="auto" data-respect-beep></audio>
<audio id="previous" src="/sounds/previous.mp3" preload="auto" data-respect-beep></audio>
{:else}
<audio id="generate" data-respect-beep></audio>
<audio id="favorite" data-respect-beep></audio>
<audio id="previous" data-respect-beep></audio>
{/if}

<style>
    .app-shell {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: radial-gradient(circle at top, rgba(255, 255, 255, 0.12), transparent),
            linear-gradient(180deg, rgba(0, 0, 0, 0.2), transparent 60%);
        padding-bottom: 4rem;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 4rem 1.5rem 0;
        gap: 2rem;
    }

    @media (max-width: 768px) {
        .content {
            padding-top: 3rem;
        }
    }
</style>
