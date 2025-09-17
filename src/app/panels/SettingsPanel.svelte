<script lang="ts">
  import { bus, EVENTS } from '../../lib/bus';
  import { store } from '../../lib/store';
  import { RenderMode, type MatrixConfig } from '../../features/matrix/config';
  import { updateMatrix } from '../../features/matrix/engine';
  import Modal from '../components/Modal.svelte';

  export let open = false;
  export let onClose: () => void = () => {};

  let matrixEnabled = true;
  let beepEnabled = true;
  let reducedMotion = store.get('matrix').reducedMotion;
  let renderMode: RenderMode = store.get('matrix').renderMode;

  function applyMatrixConfig(next: Partial<MatrixConfig>): void {
    const current = store.get('matrix');
    store.set('matrix', { ...current, ...next });
    updateMatrix();
  }

  function toggleMatrix(): void {
    matrixEnabled = !matrixEnabled;
    bus.emit(EVENTS.MATRIX_TOGGLE, matrixEnabled);
  }

  function toggleBeep(): void {
    beepEnabled = !beepEnabled;
    bus.emit(EVENTS.BEEP_TOGGLE, beepEnabled);
  }

  function toggleReducedMotion(): void {
    reducedMotion = !reducedMotion;
    applyMatrixConfig({ reducedMotion });
  }

  function changeRenderMode(mode: RenderMode): void {
    renderMode = mode;
    applyMatrixConfig({ renderMode: mode });
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
      <i class="fas fa-times" aria-hidden="true" />
    </button>
  </div>

  <div class="space-y-6 px-5 py-4 text-sm text-white/80">
    <section class="space-y-3">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-white/60">General</h3>
      <label class="flex items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3">
        <span>Visual effects</span>
        <input type="checkbox" bind:checked={matrixEnabled} on:change={toggleMatrix} />
      </label>
      <label class="flex items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3">
        <span>Sound chime before quotes</span>
        <input type="checkbox" bind:checked={beepEnabled} on:change={toggleBeep} />
      </label>
    </section>

    <section class="space-y-3">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-white/60">Matrix renderer</h3>
      <label class="flex items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3">
        <span>Reduced motion</span>
        <input type="checkbox" bind:checked={reducedMotion} on:change={toggleReducedMotion} />
      </label>
      <div class="rounded-2xl bg-white/5 px-4 py-3">
        <label for="matrix-mode" class="block text-xs uppercase tracking-wide text-white/60">Render mode</label>
        <select
          id="matrix-mode"
          class="mt-2 w-full rounded-xl bg-slate-900/60 px-3 py-2 text-sm text-white"
          bind:value={renderMode}
          on:change={(event) => changeRenderMode((event.target as HTMLSelectElement).value as RenderMode)}
        >
          <option value={RenderMode.DOM}>DOM</option>
          <option value={RenderMode.CANVAS}>Canvas</option>
          <option value={RenderMode.HYBRID}>Hybrid</option>
        </select>
      </div>
    </section>
  </div>

  <div class="border-t border-white/10 px-5 py-4 text-xs text-white/50">
    Changes apply instantly and respect your reduced-motion preference.
  </div>
</Modal>
