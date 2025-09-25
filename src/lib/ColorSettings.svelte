<script>
  import { themePreset } from '../store.js';
  import * as themes from '../themes.js';
</script>

<div class="space-y-3 border-t border-gray-600 pt-3">
    <h3 class="text-sm font-semibold text-gray-200">🎨 Theme & Content</h3>
    <label for="theme-preset" class="text-xs">Theme Preset</label>
    <select id="theme-preset" bind:value={$themePreset} class="w-full text-black p-1 rounded text-xs">
        <option value="auto">🎯 Auto (by category)</option>
        {#each Object.entries(themes.colorPalettes) as [key, value]}
          <option value={key}>{key.replace(/_/g, ' ')}</option>
        {/each}
    </select>
</div>