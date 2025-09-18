<script lang="ts">
  import { onDestroy } from 'svelte';
  import {
    AURA_LOOKUP,
    DEFAULT_AURA,
    DEFAULT_AURA_SETTINGS,
    type AuraPaletteEntry,
  } from '../config/aura';
  import { settings } from '../stores/settings';

  let gradient: AuraPaletteEntry['gradient'] = DEFAULT_AURA.gradient;
  let size = DEFAULT_AURA_SETTINGS.size;

  const unsubscribe = settings.subscribe((value) => {
    const palette = AURA_LOOKUP.get(value.aura.colorKey) ?? DEFAULT_AURA;
    gradient = palette.gradient;
    size = value.aura.size;
  });

  onDestroy(() => {
    unsubscribe();
  });

  $: auraSize = `${size}vmin`;
</script>

<div
  class="aura-glow"
  aria-hidden="true"
  style={`--aura-gradient: ${gradient}; --aura-size: ${auraSize};`}
>
  <div class="aura-glow__halo"></div>
</div>

<style>
  .aura-glow {
    position: fixed;
    inset: 0;
    z-index: -5;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.6s ease;
  }

  .aura-glow__halo {
    width: var(--aura-size, 110vmin);
    height: var(--aura-size, 110vmin);
    background: var(--aura-gradient);
    border-radius: 9999px;
    filter: blur(120px);
    opacity: 0.78;
    transition:
      background 0.6s ease,
      width 0.6s ease,
      height 0.6s ease,
      opacity 0.6s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .aura-glow,
    .aura-glow__halo {
      transition-duration: 0.01ms;
      transition-delay: 0.01ms;
    }
  }
</style>
