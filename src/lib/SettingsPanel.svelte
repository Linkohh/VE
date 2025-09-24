<script>
  import { onMount } from 'svelte';
  import {
    effectsEnabled,
    isDarkMode,
    ttsEnabled,
    ttsRate,
    ttsVoiceURI,
    beepEnabled,
    favorites,
    customQuotes,
    themePreset,
    matrixPreset,
    categoryFilter,
    isSettingsOpen
  } from '../store.js';
  import * as themes from '../themes.js';

  let newQuoteText = '';
  let newQuoteAuthor = '';
  let addQuoteFormVisible = false;
  let availableVoices = [];

  function clearFavorites() {
    if (confirm('Are you sure you want to clear all favorites? This cannot be undone.')) {
      favorites.set([]);
      document.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Favorites cleared', type: 'info' } }));
    }
  }

  function submitQuote() {
    if (newQuoteText.trim()) {
      const newQuote = { text: newQuoteText.trim(), author: newQuoteAuthor.trim() || 'Anonymous', category: 'custom' };
      customQuotes.update(quotes => [...quotes, newQuote]);
      newQuoteText = '';
      newQuoteAuthor = '';
      addQuoteFormVisible = false;
      document.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Custom quote added!', type: 'success' } }));
    }
  }

  function populateVoices() {
      if (typeof window.speechSynthesis === 'undefined') return;
      availableVoices = window.speechSynthesis.getVoices();
  }

  function previewVoice() {
      if (typeof window.speechSynthesis === 'undefined') return;
      const utterance = new SpeechSynthesisUtterance("This is a preview of the selected voice.");
      const voiceURI = $ttsVoiceURI;
      if (voiceURI) {
          utterance.voice = availableVoices.find(v => v.voiceURI === voiceURI);
      }
      utterance.rate = $ttsRate;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
  }

  onMount(() => {
    populateVoices();
    if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  });
</script>

{#if $isSettingsOpen}
<div id="settings-panel" class="fixed top-16 right-4 z-[10000] bg-black/70 backdrop-blur-md p-4 rounded-lg shadow-xl text-white space-y-4 w-72 max-h-[85vh] overflow-y-auto" role="dialog" aria-labelledby="settings-title">
    <div class="flex justify-between items-center">
        <h2 id="settings-title" class="text-lg font-semibold">Settings</h2>
        <button on:click={() => isSettingsOpen.set(false)} class="p-1 rounded-full hover:bg-white/20">
            <i class="fas fa-times"></i>
        </button>
    </div>

    <!-- General Settings -->
    <div class="space-y-2 border-t border-gray-600 pt-3">
        <label class="flex items-center cursor-pointer text-sm">
            <input type="checkbox" bind:checked={$isDarkMode} class="mr-2 accent-pink-500 h-4 w-4">
            <span>Dark Mode</span>
        </label>
        <label class="flex items-center cursor-pointer text-sm">
            <input type="checkbox" bind:checked={$effectsEnabled} class="mr-2 accent-pink-500 h-4 w-4">
            <span>Visual Effects</span>
        </label>
        <label class="flex items-center cursor-pointer text-sm">
            <input type="checkbox" bind:checked={$beepEnabled} class="mr-2 accent-blue-500 h-4 w-4">
            <span>Audio Beeps</span>
        </label>
    </div>

    <!-- TTS Settings -->
    <div class="space-y-2 border-t border-gray-600 pt-3">
        <h3 class="text-sm font-semibold text-gray-200">🗣️ Text-to-Speech</h3>
        <label class="flex items-center cursor-pointer text-sm">
            <input type="checkbox" bind:checked={$ttsEnabled} class="mr-2 accent-green-500 h-4 w-4">
            <span>Read Quotes Aloud</span>
        </label>
        <label class="flex items-center justify-between text-xs">
            <span>Speech Speed</span>
            <span>{$ttsRate.toFixed(1)}x</span>
        </label>
        <input type="range" bind:value={$ttsRate} min="0.5" max="2" step="0.1" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500">
        <label for="tts-voice" class="text-xs">Voice</label>
        <select id="tts-voice" bind:value={$ttsVoiceURI} class="w-full text-black p-1 rounded text-xs">
            <option value={null}>System Default</option>
            {#each availableVoices as voice}
                <option value={voice.voiceURI}>{voice.name} ({voice.lang})</option>
            {/each}
        </select>
        <button on:click={previewVoice} class="w-full text-xs bg-blue-500/80 hover:bg-blue-600/80 px-2 py-1 rounded transition-colors">Preview Voice</button>
    </div>

    <!-- Theme & Content Settings -->
    <div class="space-y-3 border-t border-gray-600 pt-3">
        <h3 class="text-sm font-semibold text-gray-200">🎨 Theme & Content</h3>
        <label for="theme-preset" class="text-xs">Theme Preset</label>
        <select id="theme-preset" bind:value={$themePreset} class="w-full text-black p-1 rounded text-xs">
            <option value="auto">🎯 Auto (by category)</option>
            {#each Object.entries(themes.colorPalettes) as [key, value]}
              <option value={key}>{key.replace(/_/g, ' ')}</option>
            {/each}
        </select>

        <label for="matrix-preset" class="text-xs">Matrix Preset</label>
        <select id="matrix-preset" bind:value={$matrixPreset} class="w-full text-black p-1 rounded text-xs">
            <option value="auto">🎯 Auto (by category)</option>
            {#each Object.keys(themes.matrixPresets) as preset}
              <option value={preset}>{preset.replace(/_/g, ' ')}</option>
            {/each}
        </select>

        <label for="category-filter" class="text-xs">Quote Category</label>
        <select id="category-filter" bind:value={$categoryFilter} class="w-full text-black p-1 rounded text-xs">
            <option value="all">All Categories</option>
            {#each Object.keys(get(quotes)) as category}
              <option value={category}>{category.replace(/_/g, ' ')}</option>
            {/each}
        </select>
    </div>

    <!-- Data Management -->
    <div class="space-y-2 border-t border-gray-600 pt-3">
        <h3 class="text-sm font-semibold text-gray-200">💾 My Data</h3>
        <button on:click={() => addQuoteFormVisible = !addQuoteFormVisible} class="w-full text-sm bg-green-500/80 hover:bg-green-600/80 px-2 py-1.5 rounded transition-colors">
            {addQuoteFormVisible ? 'Cancel' : 'Add Custom Quote'}
        </button>
        {#if addQuoteFormVisible}
        <div class="mt-2 space-y-2 p-2 bg-black/20 rounded">
            <textarea bind:value={newQuoteText} rows="3" class="w-full text-black p-2 rounded resize-none" placeholder="Your inspirational quote..."></textarea>
            <input bind:value={newQuoteAuthor} type="text" class="w-full text-black p-1 rounded" placeholder="Author (optional)">
            <button on:click={submitQuote} disabled={!newQuoteText.trim()} class="w-full text-sm bg-blue-500/80 hover:bg-blue-600/80 px-2 py-1.5 rounded transition-colors disabled:opacity-50">Add Quote</button>
        </div>
        {/if}
        <button on:click={clearFavorites} class="w-full text-sm bg-red-500/80 hover:bg-red-600/80 px-2 py-1.5 rounded transition-colors">Clear All Favorites</button>
    </div>
</div>
{/if}

<style>
  /* Scoped styles can remain minimal as we use utility classes from app.css */
</style>