<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import AuraGlow from './components/AuraGlow.svelte';
import MatrixLayer from './features/matrix/MatrixLayer.svelte';
import ControlsBar from './components/ControlsBar.svelte';
import HeaderBar from './components/HeaderBar.svelte';
import QuoteCard from './components/QuoteCard.svelte';
import QuoteSearch from './components/QuoteSearch.svelte';
import FavoritesPanel from './panels/FavoritesPanel.svelte';
import SettingsPanel from './panels/SettingsPanel.svelte';
import { currentQuote, ensureInitialQuote, requestNextQuote, type QuoteViewModel } from './stores/quote';
import { settings, setSpeechEnabled } from './stores/settings';

const currentYear = new Date().getFullYear();

  let quote: QuoteViewModel | null = null;
let settingsOpen = false;
let autoAdvanceEnabled = false;
let autoAdvanceInterval = 8;
let speechEnabled = false;
let mounted = false;
let speechSupported = false;
let lastSpeechEnabled = false;
let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
let autoAdvanceTicker: ReturnType<typeof setInterval> | null = null;
let autoAdvanceStart = 0;
let autoAdvanceDuration = 0;
let autoAdvanceProgress = 0;

function stopAutoAdvanceTicker(): void {
  if (autoAdvanceTicker) {
    clearInterval(autoAdvanceTicker);
    autoAdvanceTicker = null;
  }
}

function updateAutoAdvanceProgress(): void {
  if (!autoAdvanceDuration) {
    autoAdvanceProgress = 0;
    return;
  }

  const elapsed = Date.now() - autoAdvanceStart;
  const ratio = Math.min(1, Math.max(0, elapsed / autoAdvanceDuration));
  autoAdvanceProgress = Number.isFinite(ratio) ? ratio : 0;
}

function clearAutoAdvanceTimer(options: { resetProgress?: boolean } = {}): void {
  const { resetProgress = true } = options;

  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }

  stopAutoAdvanceTicker();

  if (resetProgress) {
    autoAdvanceProgress = 0;
    autoAdvanceStart = 0;
    autoAdvanceDuration = 0;
  }
}

function startAutoAdvanceTicker(): void {
  stopAutoAdvanceTicker();
  autoAdvanceTicker = setInterval(() => {
    updateAutoAdvanceProgress();
  }, 1000);
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
    clearAutoAdvanceTimer();
    return;
  }

  clearAutoAdvanceTimer();

  if (!quote?.text?.trim()) {
    return;
  }

  const delay = Math.max(5, Math.min(60, autoAdvanceInterval)) * 1000;

  autoAdvanceStart = Date.now();
  autoAdvanceDuration = delay;
  updateAutoAdvanceProgress();
  startAutoAdvanceTicker();

  autoAdvanceTimer = setTimeout(() => {
    clearAutoAdvanceTimer({ resetProgress: false });
    autoAdvanceProgress = 1;
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

  function handleOpenSearch(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const input = document.querySelector<HTMLInputElement>('input[name="quote-search"]');
    input?.focus();
  }
</script>

<div class="app-shell">
  <AuraGlow />
  <MatrixLayer />

  <main class="relative z-[100] flex flex-1 flex-col gap-8 py-14">
    <section class="app-surface">
      <HeaderBar
        {quote}
        quoteIndex={quote?.index ?? 0}
        quoteTotal={quote?.total ?? 0}
        autoAdvanceProgress={autoAdvanceProgress}
        on:openSettings={openSettings}
        on:openSearch={handleOpenSearch}
      />
      <QuoteSearch />
      <QuoteCard {quote} />
      <ControlsBar {quote} />
    </section>

    <div class="z-[100] mx-auto flex w-full max-w-3xl justify-center px-4">
      <button
        type="button"
        class="glass-button cta-button"
        on:click={() => navigateTo('about')}
      >
        Learn about VibeMe
      </button>
    </div>
  </main>

  <footer class="app-footer">
    <p>&copy; {currentYear} Vibe Me. All Rights Reserved.</p>
  </footer>
</div>

<FavoritesPanel />
<SettingsPanel open={settingsOpen} onClose={closeSettings} />

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .cta-button {
    position: relative;
    padding-inline: 2.75rem;
    letter-spacing: 0.2em;
    box-shadow:
      0 0 0 rgba(0, 255, 255, 0.25),
      0 0 0 rgba(255, 0, 255, 0.15);
    animation: ctaPulse 4s ease-in-out infinite;
  }

  .cta-button::after {
    content: '';
    position: absolute;
    left: 22%;
    right: 22%;
    bottom: 0.4rem;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, #ff00ff, #00ffff);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.4s ease;
  }

  .cta-button:hover::after,
  .cta-button:focus-visible::after {
    transform: scaleX(1);
  }

  .cta-button:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.4);
    outline-offset: 3px;
  }

  @keyframes ctaPulse {
    0%,
    100% {
      box-shadow:
        0 0 18px rgba(0, 255, 255, 0.25),
        0 0 36px rgba(255, 0, 255, 0.18);
    }

    50% {
      box-shadow:
        0 0 26px rgba(0, 255, 255, 0.32),
        0 0 48px rgba(255, 0, 255, 0.24);
    }
  }

  .app-footer {
    text-align: center;
    padding: 1.5rem;
    margin-top: auto;
    font-size: 0.875rem;
    color: #888;
    opacity: 0;
    transform: translateY(12px);
    animation: footerFadeIn 0.8s ease-out 0.2s forwards;
  }

  @keyframes footerFadeIn {
    from {
      opacity: 0;
      transform: translateY(12px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta-button {
      animation: none;
      box-shadow: 0 0 18px rgba(0, 255, 255, 0.25);
    }

    .cta-button::after {
      transition: none;
    }

    .app-footer {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
</style>
