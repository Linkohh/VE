<script>
  import { matrixPreset } from '../store.js';
  import * as themes from '../themes.js';
</script>

<div class="space-y-3 border-t border-gray-600 pt-3">
    <h3 class="text-sm font-semibold text-gray-200">🔮 Advanced Matrix</h3>
    <label for="matrix-preset" class="text-xs">Matrix Preset</label>
    <select id="matrix-preset" bind:value={$matrixPreset} class="w-full text-black p-1 rounded text-xs">
        <option value="auto">🎯 Auto (by category)</option>
        {#each Object.keys(themes.matrixPresets) as preset}
          <option value={preset}>{preset.replace(/_/g, ' ')}</option>
        {/each}
    </select>
</div>