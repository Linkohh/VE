<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { settings, type AppSettingsState } from '../../stores/settings';

  const POINTER_QUERY = '(pointer: coarse)';
  const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

  let auraNode: HTMLDivElement | null = null;
  let unsubscribe: () => void = () => {};
  let pointerMedia: MediaQueryList | null = null;
  let reducedMedia: MediaQueryList | null = null;
  let pointerListener: ((event: MediaQueryListEvent) => void) | null = null;
  let reducedListener: ((event: MediaQueryListEvent) => void) | null = null;

  let pointerMoveAttached = false;
  let frameScheduled = false;
  let rafId = 0;
  let latestX = 0;
  let latestY = 0;
  let hasPointerData = false;

  let reducedMotionFromSettings = false;
  let reducedMotionFromSystem = false;
  let pointerIsCoarse = false;

  function reducedMotionEnabled(): boolean {
    return reducedMotionFromSettings || reducedMotionFromSystem;
  }

  function setStaticGlow(): void {
    if (!auraNode) return;
    auraNode.dataset.state = 'static';
    auraNode.style.background =
      'radial-gradient(circle at 70% 20%, var(--glow-color), transparent 60%)';
  }

  function setDefaultDynamicGlow(): void {
    if (typeof window === 'undefined') return;
    hasPointerData = false;
    latestX = window.innerWidth * 0.65;
    latestY = window.innerHeight * 0.35;
    if (!auraNode) return;
    auraNode.style.background =
      `radial-gradient(circle at ${latestX}px ${latestY}px, var(--glow-color), transparent 60%)`;
  }

  function updateDynamicGlow(): void {
    if (!auraNode) return;
    auraNode.dataset.state = 'dynamic';
    auraNode.style.background =
      `radial-gradient(circle at ${latestX}px ${latestY}px, var(--glow-color), transparent 60%)`;
  }

  function detachPointerListener(): void {
    if (pointerMoveAttached) {
      window.removeEventListener('pointermove', handlePointerMove);
      pointerMoveAttached = false;
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    frameScheduled = false;
  }

  function attachPointerListener(): void {
    if (pointerMoveAttached || typeof window === 'undefined') return;
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    pointerMoveAttached = true;
  }

  function scheduleUpdate(): void {
    if (frameScheduled) return;
    frameScheduled = true;
    rafId = requestAnimationFrame(() => {
      frameScheduled = false;
      if (reducedMotionEnabled() || pointerIsCoarse) {
        return;
      }
      updateDynamicGlow();
    });
  }

  function handlePointerMove(event: PointerEvent): void {
    if (reducedMotionEnabled() || pointerIsCoarse) {
      return;
    }
    hasPointerData = true;
    latestX = event.clientX;
    latestY = event.clientY;
    scheduleUpdate();
  }

  function applyState(): void {
    if (!auraNode) return;

    if (reducedMotionEnabled()) {
      auraNode.dataset.state = 'hidden';
      auraNode.style.opacity = '0';
      auraNode.style.background = 'none';
      detachPointerListener();
      return;
    }

    auraNode.style.opacity = pointerIsCoarse ? '0.45' : '0.8';

    if (pointerIsCoarse) {
      detachPointerListener();
      setStaticGlow();
      return;
    }

    if (!hasPointerData) {
      setDefaultDynamicGlow();
    }
    attachPointerListener();
    updateDynamicGlow();
  }

  function cleanup(): void {
    detachPointerListener();
    if (pointerMedia && pointerListener) {
      pointerMedia.removeEventListener('change', pointerListener);
    }
    if (reducedMedia && reducedListener) {
      reducedMedia.removeEventListener('change', reducedListener);
    }
    unsubscribe();
    auraNode?.remove();
    auraNode = null;
  }

  onMount(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    auraNode = document.createElement('div');
    auraNode.className = 'aura-glow-node';
    auraNode.dataset.state = 'hidden';
    document.body.appendChild(auraNode);

    unsubscribe = settings.subscribe((value: AppSettingsState) => {
      reducedMotionFromSettings = value.matrix.reducedMotion;
      applyState();
    });

    if (typeof window.matchMedia === 'function') {
      try {
        pointerMedia = window.matchMedia(POINTER_QUERY);
        pointerIsCoarse = pointerMedia.matches;
        pointerListener = (event: MediaQueryListEvent) => {
          pointerIsCoarse = event.matches;
          applyState();
        };
        pointerMedia.addEventListener('change', pointerListener);
      } catch {
        pointerMedia = null;
      }

      try {
        reducedMedia = window.matchMedia(REDUCED_MOTION_QUERY);
        reducedMotionFromSystem = reducedMedia.matches;
        reducedListener = (event: MediaQueryListEvent) => {
          reducedMotionFromSystem = event.matches;
          applyState();
        };
        reducedMedia.addEventListener('change', reducedListener);
      } catch {
        reducedMedia = null;
      }
    }

    setDefaultDynamicGlow();
    applyState();
  });

  onDestroy(cleanup);
</script>

<style>
  :global(.aura-glow-node) {
    position: fixed;
    inset: 0;
    z-index: -5;
    pointer-events: none;
    transition: opacity 250ms ease;
    filter: blur(120px);
    opacity: 0;
  }

  :global(.aura-glow-node[data-state='dynamic']) {
    opacity: 0.8;
  }

  :global(.aura-glow-node[data-state='static']) {
    opacity: 0.45;
  }
</style>
