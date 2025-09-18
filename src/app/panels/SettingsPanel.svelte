<script lang="ts">
  import { FontAwesomeIcon as Fa } from '@fortawesome/svelte-fontawesome';
  import { faTimes } from '@fortawesome/free-solid-svg-icons';
  import { onDestroy } from 'svelte';
  import { RenderMode } from '../../features/matrix/config';
  import {
    settings,
    setBeepEnabled,
    setMatrixEnabled,
    updateMatrixConfig,
  } from '../stores/settings';
  import Modal from '../components/Modal.svelte';
  import ThemeToggle from '../components/ThemeToggle.svelte';

  export let open = false;
  export let onClose: () => void = () => {};

  let matrixEnabled = true;
  let beepEnabled = false;
  let reducedMotion = false;
  let renderMode: RenderMode = RenderMode.Canvas;

  const unsubscribe = settings.subscribe((value) => {
    matrixEnabled = value.matrixEnabled;
    beepEnabled = value.beepEnabled;
    reducedMotion = value.matrix.reducedMotion;
    renderMode = value.matrix.renderMode;
  });

  onDestroy(() => {
    unsubscribe();
  });

  function handleMatrixChange(event: Event): void {
    const input = event.currentTarget instanceof HTMLInputElement ? event.currentTarget : null;
    if (!input) return;
    setMatrixEnabled(input.checked);
  }

  function handleBeepChange(event: Event): void {
    const input = event.currentTarget instanceof HTMLInputElement ? event.currentTarget : null;
    if (!input) return;
    setBeepEnabled(input.checked);
  }

  function handleReducedMotionChange(event: Event): void {
    const input = event.currentTarget instanceof HTMLInputElement ? event.currentTarget : null;
    if (!input) return;
    updateMatrixConfig({ reducedMotion: input.checked });
  }

  function handleRenderModeChange(event: Event): void {
    const select = event.currentTarget instanceof HTMLSelectElement ? event.currentTarget : null;
    if (!select) return;
    const value = (select.value as RenderMode) || RenderMode.Canvas;
    updateMatrixConfig({ renderMode: value });
  }
</script>

<Modal open={open} on:close={onClose} labelledBy="settings-title">
  <div class="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
    <h2 id="settings-title" class="text-sm font-semibold uppercase tracking-wide">Settings</h2>
    <button
      type="button"
      class="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      aria-label="Close settings"
      on:click={onClose}
    >
      <Fa icon={faTimes} class="h-4 w-4" />
    </button>
  </div>

  <div class="space-y-6 px-5 py-4 text-sm text-white/80">
    <section class="space-y-3">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-white/60">General</h3>
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3">
        <div>
          <span class="text-sm text-white">Theme</span>
          <p class="text-xs text-white/50">Choose your vibe palette</p>
        </div>
        <ThemeToggle size="sm" />
      </div>
      <label class="flex items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3">
        <span>Visual effects</span>
        <input type="checkbox" checked={matrixEnabled} on:change={handleMatrixChange} />
      </label>
      <label class="flex items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3">
        <span>Sound chime before quotes</span>
        <input type="checkbox" checked={beepEnabled} on:change={handleBeepChange} />
      </label>
    </section>

    <section class="space-y-3">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-white/60">Matrix renderer</h3>
      <label class="flex items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3">
        <span>Reduced motion</span>
        <input type="checkbox" checked={reducedMotion} on:change={handleReducedMotionChange} />
      </label>
      <div class="rounded-2xl bg-white/5 px-4 py-3">
        <label for="matrix-mode" class="block text-xs uppercase tracking-wide text-white/60">Render style</label>
        <select
          id="matrix-mode"
          class="mt-2 w-full rounded-xl bg-slate-900/60 px-3 py-2 text-sm text-white"
          value={renderMode}
          on:change={handleRenderModeChange}
        >
          <option value={RenderMode.Canvas}>Animated canvas</option>
          <option value={RenderMode.Minimal}>Minimal glow</option>
        </select>
      </div>
    </section>
  </div>

  <div class="border-t border-white/10 px-5 py-4 text-xs text-white/50">
    Changes apply instantly and respect your reduced-motion preference.
  </div>
</Modal>
