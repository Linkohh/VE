<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let label: string;
  export let description: string | null = null;
  export let value = 0;
  export let min = 0;
  export let max = 100;
  export let step = 1;
  export let disabled = false;
  export let formatValue: (value: number) => string = (v) => `${Math.round(v)}`;

  const dispatch = createEventDispatcher<{ input: number; change: number }>();

  function parseValue(target: EventTarget | null): number | null {
    const element = target instanceof HTMLInputElement ? target : null;
    if (!element) return null;
    const next = Number.parseFloat(element.value);
    return Number.isFinite(next) ? next : null;
  }

  function handleInput(event: Event): void {
    const next = parseValue(event.currentTarget);
    if (next === null) return;
    dispatch('input', next);
  }

  function handleChange(event: Event): void {
    const next = parseValue(event.currentTarget);
    if (next === null) return;
    dispatch('change', next);
  }
</script>

<div class="slider" class:disabled={disabled}>
  <div class="slider__header">
    <div class="slider__text">
      <span class="slider__label">{label}</span>
      {#if description}
        <p class="slider__description">{description}</p>
      {/if}
      <slot name="description" />
    </div>
    <span class="slider__value">{formatValue(value)}</span>
  </div>
  <input
    class="slider__control"
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    disabled={disabled}
    on:input={handleInput}
    on:change={handleChange}
  />
</div>

<style>
  .slider {
    padding: 1rem 1.1rem 1.15rem;
    border-radius: 1.25rem;
    background: rgba(148, 163, 184, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    transition: background 150ms ease;
  }

  .slider:not(.disabled):hover {
    background: rgba(148, 163, 184, 0.14);
  }

  .slider.disabled {
    opacity: 0.6;
  }

  .slider__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .slider__text {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .slider__label {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .slider__description {
    font-size: 0.72rem;
    color: rgba(226, 232, 240, 0.7);
    line-height: 1.4;
  }

  .slider__value {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(248, 250, 252, 0.85);
    min-width: 3rem;
    text-align: right;
  }

  .slider__control {
    width: 100%;
    accent-color: rgba(255, 255, 255, 0.85);
  }
</style>
