<script lang="ts">
  import { FontAwesomeIcon as Fa } from '@fortawesome/svelte-fontawesome';
  import { faTimes } from '@fortawesome/free-solid-svg-icons';
  import { onDestroy } from 'svelte';
  import { RenderMode } from '../../features/matrix/config';
  import {
    AURA_PALETTE,
    AURA_SIZE_MAX,
    AURA_SIZE_MIN,
    AURA_SIZE_STEP,
    DEFAULT_AURA_SETTINGS,
  } from '../config/aura';
  import {
    settings,
    setAuraColor,
    setAuraSize,
    setBeepEnabled,
    setMatrixEnabled,
    updateMatrixConfig,
  } from '../stores/settings';
  import Modal from '../components/Modal.svelte';

  export let open = false;
  export let onClose: () => void = () => {};

  let matrixEnabled = true;
  let beepEnabled = false;
  let reducedMotion = false;
  let renderMode: RenderMode = RenderMode.Canvas;
  let auraColorKey = DEFAULT_AURA_SETTINGS.colorKey;
  let auraSize = DEFAULT_AURA_SETTINGS.size;

  const unsubscribe = settings.subscribe((value) => {
    matrixEnabled = value.matrixEnabled;
    beepEnabled = value.beepEnabled;
    reducedMotion = value.matrix.reducedMotion;
    renderMode = value.matrix.renderMode;
    auraColorKey = value.aura.colorKey;
    auraSize = value.aura.size;
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

  function handleAuraSizeInput(event: Event): void {
    const input = event.currentTarget instanceof HTMLInputElement ? event.currentTarget : null;
    if (!input) return;
    const next = Number.parseFloat(input.value);
    if (Number.isFinite(next)) {
      setAuraSize(next);
    }
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
      <h3 class="text-xs font-semibold uppercase tracking-wide text-white/60">Aura glow</h3>
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
        {#each AURA_PALETTE as swatch (swatch.key)}
          <button
            type="button"
            class={`group relative overflow-hidden rounded-2xl border bg-slate-900/40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
              auraColorKey === swatch.key
                ? 'border-white/70 ring-2 ring-white/70'
                : 'border-white/10 hover:border-white/30'
            }`}
            style={`background-image: ${swatch.gradient};`}
            aria-pressed={auraColorKey === swatch.key}
            on:click={() => setAuraColor(swatch.key)}
          >
            <span
              class="relative z-10 block px-3 py-4 text-center text-xs font-semibold uppercase tracking-wide text-white drop-shadow"
            >
              {swatch.label}
            </span>
            <span class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40"></span>
          </button>
        {/each}
      </div>

      <div class="rounded-2xl bg-white/5 px-4 py-3">
        <div class="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
          <label for="aura-size">Aura size</label>
          <span class="font-semibold text-white/70">{Math.round(auraSize)}</span>
        </div>
        <input
          id="aura-size"
          type="range"
          class="mt-3 w-full accent-white/80"
          min={AURA_SIZE_MIN}
          max={AURA_SIZE_MAX}
          step={AURA_SIZE_STEP}
          value={auraSize}
          on:input={handleAuraSizeInput}
        />
        <p class="mt-2 text-[0.7rem] text-white/50">Fine-tune the glow radius around the interface.</p>
      </div>
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
