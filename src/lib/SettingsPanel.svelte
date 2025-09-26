<script>
  import {
    effectsEnabled,
    isDarkMode,
    beepEnabled,
    favorites,
    categoryFilter,
    isSettingsOpen,
    quotes
  } from './store.js';
  import { get } from 'svelte/store';
  import ColorSettings from './ColorSettings.svelte';
  import MatrixSettings from './MatrixSettings.svelte';
  import AudioSettings from './AudioSettings.svelte';
  import AddQuoteForm from './AddQuoteForm.svelte';

  function clearFavorites() {
    if (confirm('Are you sure you want to clear all favorites? This cannot be undone.')) {
      favorites.set([]);
      document.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Favorites cleared', type: 'info' } }));
    }
  }
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
    </div>

    <AudioSettings />
    <ColorSettings />
    <MatrixSettings />

    <!-- Content Settings -->
    <div class="space-y-3 border-t border-gray-600 pt-3">
        <h3 class="text-sm font-semibold text-gray-200">Content</h3>
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
        <AddQuoteForm />
        <button on:click={clearFavorites} class="w-full text-sm bg-red-500/80 hover:bg-red-600/80 px-2 py-1.5 rounded transition-colors">Clear All Favorites</button>
    </div>
</div>
{/if}

<style>
  #settings-panel {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
</style>