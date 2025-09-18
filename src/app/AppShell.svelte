<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import AuraGlow from './components/AuraGlow.svelte';
import MatrixLayer from './features/matrix/MatrixLayer.svelte';
import ControlsBar from './components/ControlsBar.svelte';
import HeaderBar from './components/HeaderBar.svelte';
import QuoteCard from './components/QuoteCard.svelte';
import FavoritesPanel from './panels/FavoritesPanel.svelte';
import SettingsPanel from './panels/SettingsPanel.svelte';
import { currentQuote, ensureInitialQuote, type QuoteViewModel } from './stores/quote';

  let quote: QuoteViewModel | null = null;
let settingsOpen = false;

export let navigateTo: (route: 'home' | 'about') => void = () => {};

  const unsubscribe = currentQuote.subscribe((value) => {
    quote = value;
  });

  onMount(() => {
    document.body.classList.add('has-svelte-app');
    ensureInitialQuote();
  });

  onDestroy(() => {
    document.body.classList.remove('has-svelte-app');
    unsubscribe();
  });

  function openSettings(): void {
    settingsOpen = true;
  }

  function closeSettings(): void {
    settingsOpen = false;
  }
</script>

<AuraGlow />
<MatrixLayer />

<main class="relative z-[100] flex flex-col gap-8 py-14">
  <section class="app-surface">
    <HeaderBar {quote} onOpenSettings={openSettings} />
    <QuoteCard {quote} />
    <ControlsBar {quote} />
  </section>

  <footer class="z-[100] mx-auto flex w-full max-w-3xl justify-center px-4">
    <button
      type="button"
      class="glass-button"
      on:click={() => navigateTo('about')}
    >
      Learn about VibeMe
    </button>
  </footer>
</main>

<FavoritesPanel />
<SettingsPanel open={settingsOpen} onClose={closeSettings} />
