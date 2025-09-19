<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import {
    AURA_LOOKUP,
    DEFAULT_AURA,
    DEFAULT_AURA_SETTINGS,
    type AuraPaletteEntry,
  } from '../config/aura';
  import { settings } from '../stores/settings';

  let gradient: AuraPaletteEntry['gradient'] = DEFAULT_AURA.gradient;
  let size = DEFAULT_AURA_SETTINGS.size;
  let reducedMotion = false;
  let auraIntensity = DEFAULT_AURA_SETTINGS.intensity;
  let vibrancy = 65;
  let warmth = 50;
  let mouseGlowIntensity = DEFAULT_AURA_SETTINGS.intensity;

  let auraHalo: HTMLDivElement | null = null;
  let mounted = false;
  let pointerTracking = false;
  let isCoarsePointer = false;
  let pointerFrame: number | null = null;
  let pendingPointer: { x: number; y: number } | null = null;
  let removePointerPreferenceListener: (() => void) | null = null;

  const unsubscribe = settings.subscribe((value) => {
    const palette = AURA_LOOKUP.get(value.aura.colorKey) ?? DEFAULT_AURA;
    gradient = palette.gradient;
    size = value.aura.size;
    auraIntensity = value.aura.intensity;

    vibrancy = value.appearance.vibrancy;
    warmth = value.appearance.warmth;
    mouseGlowIntensity = value.appearance.mouseGlowIntensity;

    const nextReducedMotion = value.matrix.reducedMotion;
    const motionChanged = nextReducedMotion !== reducedMotion;
    reducedMotion = nextReducedMotion;

    if (motionChanged && mounted) {
      evaluatePointerTracking();
    }
  });

  function resetPointerPosition(): void {
    if (!auraHalo) return;
    auraHalo.style.setProperty('--pointer-x', '50vw');
    auraHalo.style.setProperty('--pointer-y', '50vh');
  }

  function applyPendingPointer(): void {
    pointerFrame = null;
    if (!pendingPointer || !auraHalo) return;

    const { x, y } = pendingPointer;
    auraHalo.style.setProperty('--pointer-x', `${x}px`);
    auraHalo.style.setProperty('--pointer-y', `${y}px`);
  }

  function handlePointerMove(event: PointerEvent): void {
    if (!pointerTracking || !event.isPrimary || event.pointerType === 'touch') {
      return;
    }

    pendingPointer = { x: event.clientX, y: event.clientY };
    if (pointerFrame === null) {
      pointerFrame = requestAnimationFrame(applyPendingPointer);
    }
  }

  function startPointerTracking(): void {
    if (pointerTracking || typeof window === 'undefined') {
      return;
    }

    pointerTracking = true;
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
  }

  function stopPointerTracking({ reset = true }: { reset?: boolean } = {}): void {
    if (!pointerTracking || typeof window === 'undefined') {
      pointerTracking = false;
      return;
    }

    window.removeEventListener('pointermove', handlePointerMove);
    pointerTracking = false;

    if (pointerFrame !== null) {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = null;
    }

    pendingPointer = null;

    if (reset) {
      resetPointerPosition();
    }
  }

  function evaluatePointerTracking(): void {
    if (!mounted) return;

    const shouldTrack = !reducedMotion && !isCoarsePointer;
    if (shouldTrack) {
      startPointerTracking();
    } else {
      stopPointerTracking({ reset: true });
    }
  }

  function setupPointerPreferenceListener(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const query = window.matchMedia('(pointer: coarse)');
    isCoarsePointer = query.matches;

    const handleChange = (event: MediaQueryListEvent) => {
      isCoarsePointer = event.matches;
      evaluatePointerTracking();
    };

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handleChange);
      removePointerPreferenceListener = () => {
        query.removeEventListener('change', handleChange);
      };
    } else if (typeof query.addListener === 'function') {
      query.addListener(handleChange);
      removePointerPreferenceListener = () => {
        query.removeListener(handleChange);
      };
    }
  }

  onMount(() => {
    mounted = true;
    resetPointerPosition();
    setupPointerPreferenceListener();
    evaluatePointerTracking();

    return () => {
      stopPointerTracking({ reset: false });
      if (removePointerPreferenceListener) {
        removePointerPreferenceListener();
        removePointerPreferenceListener = null;
      }
    };
  });

  onDestroy(() => {
    unsubscribe();
    stopPointerTracking({ reset: false });
    if (removePointerPreferenceListener) {
      removePointerPreferenceListener();
      removePointerPreferenceListener = null;
    }
  });

  $: auraSize = `${size}vmin`;
  $: auraSaturation = 0.6 + vibrancy / 100;
  $: auraWarmth = (warmth - 50) * 1.4;
  $: auraOpacity = Math.max(
    0.2,
    Math.min(1, (reducedMotion ? 0.42 : 0.78) * (mouseGlowIntensity / 100) * (auraIntensity / 100)),
  );
</script>

<div
  class="aura-glow"
  aria-hidden="true"
  style={`--aura-gradient: ${gradient}; --aura-size: ${auraSize}; --aura-opacity: ${auraOpacity}; --aura-saturation: ${auraSaturation}; --aura-warmth: ${auraWarmth}deg;`}
>
  <div class="aura-glow__halo" bind:this={auraHalo}></div>
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
    filter: blur(120px) saturate(var(--aura-saturation, 1)) hue-rotate(var(--aura-warmth, 0deg));
    opacity: var(--aura-opacity, 0.78);
    transform: translate3d(
      calc(var(--pointer-x, 50vw) - 50%),
      calc(var(--pointer-y, 50vh) - 50%),
      0
    );
    will-change: transform;
    transition:
      background 0.6s ease,
      width 0.6s ease,
      height 0.6s ease,
      opacity 0.6s ease,
      transform 0.45s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .aura-glow,
    .aura-glow__halo {
      transition-duration: 0.01ms;
      transition-delay: 0.01ms;
    }
  }
</style>
