<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';

  const FOCUSABLE = '[tabindex]:not([tabindex="-1"]),a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled])';

  export let open = false;
  export let labelledBy: string | undefined;
  export let describedBy: string | undefined;
  export let returnFocus: HTMLElement | null = null;
  export let closeOnBackdrop = true;

  const dispatch = createEventDispatcher<{ close: void }>();

  let dialog: HTMLDivElement | null = null;
  let previouslyFocused: Element | null = null;

  function getFocusable(): HTMLElement[] {
    if (!dialog) return [];
    return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute('disabled'));
  }

  function focusFirst(): void {
    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      dialog?.focus();
    }
  }

  function trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !dialog) return;
    const focusable = getFocusable();
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (active === first || active === dialog) {
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

  function handleBackdrop(event: MouseEvent): void {
    if (!closeOnBackdrop) return;
    if (event.target === event.currentTarget) {
      dispatch('close');
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown, true);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown, true);
  });

  $: if (open) {
    previouslyFocused = document.activeElement;
    tick().then(() => {
      focusFirst();
    });
  } else if (!open && previouslyFocused instanceof HTMLElement) {
    (returnFocus ?? previouslyFocused).focus?.();
    previouslyFocused = null;
  }
</script>

{#if open}
  <svelte:teleport to="body">
    <div
      class="fixed inset-0 z-[10050] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="presentation"
      on:click={handleBackdrop}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        class="w-full max-w-xl rounded-2xl bg-slate-900/90 text-slate-100 shadow-2xl border border-white/10"
        tabindex="-1"
        bind:this={dialog}
      >
        <slot />
      </div>
    </div>
  </svelte:teleport>
{/if}
