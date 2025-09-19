<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let label: string;
  export let description: string | null = null;
  export let value: string;
  export let options: { value: string; label: string }[] = [];
  export let disabled = false;

  const dispatch = createEventDispatcher<{ change: string }>();

  function handleChange(event: Event): void {
    const select = event.currentTarget instanceof HTMLSelectElement ? event.currentTarget : null;
    if (!select) return;
    dispatch('change', select.value);
  }
</script>

<div class="select" class:disabled={disabled}>
  <div class="select__text">
    <span class="select__label">{label}</span>
    {#if description}
      <p class="select__description">{description}</p>
    {/if}
    <slot name="description" />
  </div>
  <select class="select__control" value={value} disabled={disabled} on:change={handleChange}>
    {#each options as option (option.value)}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>

<style>
  .select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.95rem 1.1rem;
    border-radius: 1.25rem;
    background: rgba(148, 163, 184, 0.08);
    transition: background 150ms ease;
  }

  .select:not(.disabled):hover {
    background: rgba(148, 163, 184, 0.14);
  }

  .select.disabled {
    opacity: 0.6;
  }

  .select__text {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }

  .select__label {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .select__description {
    font-size: 0.72rem;
    color: rgba(226, 232, 240, 0.7);
    line-height: 1.4;
  }

  .select__control {
    flex-shrink: 0;
    min-width: 9.5rem;
    border-radius: 0.85rem;
    border: 1px solid rgba(148, 163, 184, 0.4);
    background: rgba(15, 23, 42, 0.6);
    color: rgba(248, 250, 252, 0.9);
    padding: 0.45rem 0.75rem;
    font-size: 0.75rem;
    letter-spacing: 0.02em;
  }
</style>
