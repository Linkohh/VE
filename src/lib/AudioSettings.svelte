<script>
  import { onMount } from 'svelte';
  import {
    ttsEnabled,
    ttsRate,
    ttsVoiceURI,
    beepEnabled
  } from '../store.js';

  let availableVoices = [];

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
    <label class="flex items-center cursor-pointer text-sm pt-2">
        <input type="checkbox" bind:checked={$beepEnabled} class="mr-2 accent-blue-500 h-4 w-4">
        <span>Audio Beeps</span>
    </label>
</div>