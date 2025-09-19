<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let label: string;
  export let description: string | null = null;
  export let checked = false;
  export let disabled = false;

  const dispatch = createEventDispatcher<{ change: boolean }>();

  function handleChange(event: Event): void {
    const input = event.currentTarget instanceof HTMLInputElement ? event.currentTarget : null;
    if (!input) return;
    dispatch('change', input.checked);
  }
</script>

<label class="row" class:disabled={disabled}>
  <div class="row__content">
    <span class="row__label">{label}</span>
    {#if description}
      <p class="row__description">{description}</p>
    {/if}
    <slot name="description" />
  </div>
  <input
    class="row__control"
    type="checkbox"
    checked={checked}
    disabled={disabled}
    on:change={handleChange}
  />
</label>

<style>
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 1.1rem;
    border-radius: 1.25rem;
    background: rgba(148, 163, 184, 0.08);
    transition: background 150ms ease;
  }

  .row:not(.disabled):hover {
    background: rgba(148, 163, 184, 0.14);
  }

  .row.disabled {
    opacity: 0.6;
  }

  .row__content {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }

  .row__label {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .row__description {
    font-size: 0.72rem;
    color: rgba(226, 232, 240, 0.7);
    line-height: 1.4;
  }

  .row__control {
    accent-color: rgba(255, 255, 255, 0.9);
    transform: scale(1.05);
  }
</style>
