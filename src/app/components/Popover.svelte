<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';

  const FOCUSABLE =
    '[tabindex]:not([tabindex="-1"]),a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled])';

  export let open = false;
  export let anchor: HTMLElement | null = null;
  export let labelledBy: string | undefined = undefined;
  export let describedBy: string | undefined = undefined;
  export let returnFocus: HTMLElement | null = null;

  const dispatch = createEventDispatcher<{ close: void }>();

  let panel: HTMLDivElement | null = null;
  let lastFocused: Element | null = null;
  let listenersAttached = false;

  interface PositionState {
    top: number;
    left: number;
    originX: 'left' | 'right';
    originY: 'top' | 'bottom';
  }

  let position: PositionState = { top: 0, left: 0, originX: 'right', originY: 'top' };

  function attachListeners(): void {
    if (listenersAttached) return;
    document.addEventListener('keydown', handleKeydown, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('resize', handleViewportChange, true);
    window.addEventListener('scroll', handleViewportChange, true);
    listenersAttached = true;
  }

  function detachListeners(): void {
    if (!listenersAttached) return;
    document.removeEventListener('keydown', handleKeydown, true);
    document.removeEventListener('pointerdown', handlePointerDown, true);
    window.removeEventListener('resize', handleViewportChange, true);
    window.removeEventListener('scroll', handleViewportChange, true);
    listenersAttached = false;
  }

  function getFocusable(): HTMLElement[] {
    if (!panel) return [];
    return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute('disabled'));
  }

  function focusFirst(): void {
    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      panel?.focus();
    }
  }

  function trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !panel) return;
    const focusable = getFocusable();
    if (!focusable.length) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (active === first || active === panel) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      dispatch('close');
      return;
    }
    trapFocus(event);
  }

  function handlePointerDown(event: PointerEvent): void {
    if (!open || !panel) return;
    const target = event.target as Node | null;
    if (target && (panel.contains(target) || anchor?.contains(target))) {
      return;
    }
    dispatch('close');
  }

  function handleViewportChange(): void {
    updatePosition();
  }

  function updatePosition(): void {
    if (!open || !panel) return;

    const gap = 12;
    const padding = 16;
    const panelRect = panel.getBoundingClientRect();

    if (!anchor) {
      const top = Math.max(padding, (window.innerHeight - panelRect.height) / 2);
      const left = Math.max(padding, window.innerWidth - panelRect.width - padding);
      position = { top, left, originX: 'right', originY: 'top' };
      return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    let top = anchorRect.bottom + gap;
    let originY: 'top' | 'bottom' = 'top';

    if (top + panelRect.height > window.innerHeight - padding) {
      top = Math.max(padding, anchorRect.top - gap - panelRect.height);
      originY = 'bottom';
    }

    let left = anchorRect.right - panelRect.width;
    let originX: 'left' | 'right' = 'right';

    if (left < padding) {
      left = padding;
      originX = 'left';
    }

    const maxLeft = window.innerWidth - panelRect.width - padding;
    if (left > maxLeft) {
      left = maxLeft;
      originX = 'right';
    }

    position = { top, left, originX, originY };
  }

  onMount(() => {
    if (open) {
      tick().then(() => {
        updatePosition();
      });
    }
  });

  onDestroy(() => {
    detachListeners();
  });

  $: {
    if (open) {
      attachListeners();
      lastFocused = document.activeElement;
      tick().then(() => {
        updatePosition();
        focusFirst();
      });
    } else {
      detachListeners();
      if (lastFocused instanceof HTMLElement) {
        (returnFocus ?? lastFocused).focus?.();
      }
      lastFocused = null;
    }
  }

  $: if (open) {
    const currentAnchor = anchor;
    tick().then(() => {
      if (!open) return;
      if (currentAnchor !== anchor) {
        updatePosition();
        return;
      }
      updatePosition();
    });
  }
</script>

{#if open}
  <div class="popover-layer" role="presentation">
    <div
      class="popover-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      tabindex="-1"
      bind:this={panel}
      style={`top: ${Math.round(position.top)}px; left: ${Math.round(position.left)}px; transform-origin: ${position.originY} ${position.originX};`}
    >
      <slot />
    </div>
  </div>
{/if}

<style>
  .popover-layer {
    position: fixed;
    inset: 0;
    z-index: 10060;
    pointer-events: none;
  }

  .popover-panel {
    position: absolute;
    min-width: 320px;
    max-width: min(380px, calc(100vw - 2rem));
    background: rgba(15, 23, 42, 0.92);
    backdrop-filter: blur(20px);
    border-radius: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 30px 60px -25px rgba(15, 23, 42, 0.7);
    color: white;
    pointer-events: auto;
    outline: none;
  }
</style>
