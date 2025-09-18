<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import AuraGlow from './components/AuraGlow.svelte';
import MatrixLayer from './features/matrix/MatrixLayer.svelte';
import ControlsBar from './components/ControlsBar.svelte';
import HeaderBar from './components/HeaderBar.svelte';
import QuoteCard from './components/QuoteCard.svelte';
import FavoritesPanel from './panels/FavoritesPanel.svelte';
import SettingsPanel from './panels/SettingsPanel.svelte';
import { currentQuote, ensureInitialQuote, requestNextQuote, type QuoteViewModel } from './stores/quote';
import { settings, setSpeechEnabled } from './stores/settings';

  let quote: QuoteViewModel | null = null;
let settingsOpen = false;
let autoAdvanceEnabled = false;
let autoAdvanceInterval = 8;
let speechEnabled = false;
let mounted = false;
let speechSupported = false;
let lastSpeechEnabled = false;
let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

function clearAutoAdvanceTimer(): void {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
}

function cancelSpeech(): void {
  if (!speechSupported || typeof window === 'undefined') {
    return;
  }

  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore speech cancellation failures */
  }
}

function speakQuote(value: QuoteViewModel | null): void {
  if (!speechSupported || !speechEnabled || !value?.text?.trim() || typeof window === 'undefined') {
    return;
  }

  const text = value.text.trim();
  const author = value.author?.trim();
  const payload = author ? `${text} — ${author}` : text;

  cancelSpeech();

  try {
    const utterance = new SpeechSynthesisUtterance(payload);
    window.speechSynthesis?.speak(utterance);
  } catch {
    /* ignore speech synthesis failures */
  }
}

function scheduleAutoAdvance(): void {
  if (!mounted || !autoAdvanceEnabled) {
    return;
  }

  clearAutoAdvanceTimer();

  if (!quote?.text?.trim()) {
    return;
  }

  const delay = Math.max(5, Math.min(60, autoAdvanceInterval)) * 1000;

  autoAdvanceTimer = setTimeout(() => {
    autoAdvanceTimer = null;
    requestNextQuote({ reason: 'auto-advance' });
  }, delay);
}

export let navigateTo: (route: 'home' | 'about') => void = () => {};

  const unsubscribeQuote = currentQuote.subscribe((value) => {
    quote = value;

    if (!mounted) {
      return;
    }

    scheduleAutoAdvance();

    if (speechEnabled) {
      speakQuote(value);
    }
  });

  const unsubscribeSettings = settings.subscribe((value) => {
    autoAdvanceEnabled = value.autoAdvanceEnabled;
    autoAdvanceInterval = value.autoAdvanceInterval;
    speechEnabled = value.speechEnabled;

    if (!mounted) {
      lastSpeechEnabled = speechEnabled;
      return;
    }

    if (!speechEnabled && lastSpeechEnabled) {
      cancelSpeech();
    } else if (speechEnabled && !lastSpeechEnabled && quote) {
      speakQuote(quote);
    }

    lastSpeechEnabled = speechEnabled;

    if (!autoAdvanceEnabled) {
      clearAutoAdvanceTimer();
    } else {
      scheduleAutoAdvance();
    }
  });

  onMount(() => {
    document.body.classList.add('has-svelte-app');
    mounted = true;
    speechSupported =
      typeof window !== 'undefined' &&
      typeof window.speechSynthesis !== 'undefined' &&
      typeof SpeechSynthesisUtterance !== 'undefined';
    if (!speechSupported) {
      if (speechEnabled) {
        setSpeechEnabled(false);
      }
      speechEnabled = false;
    } else if (speechEnabled && quote) {
      speakQuote(quote);
    }
    ensureInitialQuote();
    scheduleAutoAdvance();
  });

  onDestroy(() => {
    document.body.classList.remove('has-svelte-app');
    mounted = false;
    clearAutoAdvanceTimer();
    cancelSpeech();
    unsubscribeQuote();
    unsubscribeSettings();
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
