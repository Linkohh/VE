<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import MatrixLayer from './features/matrix/MatrixLayer.svelte';
  import ControlsBar from './components/ControlsBar.svelte';
  import HeaderBar from './components/HeaderBar.svelte';
  import QuoteCard from './components/QuoteCard.svelte';
  import FavoritesPanel from './panels/FavoritesPanel.svelte';
  import SettingsPanel from './panels/SettingsPanel.svelte';
  import { currentQuote, ensureInitialQuote, type QuoteViewModel } from './stores/quote';

  let quote: QuoteViewModel | null = null;
  let settingsOpen = false;

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

<MatrixLayer />

<div class="relative z-[100] mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
  <HeaderBar {quote} onOpenSettings={openSettings} />
  <QuoteCard {quote} />
  <ControlsBar {quote} />
</div>

<FavoritesPanel />
<SettingsPanel open={settingsOpen} onClose={closeSettings} />
