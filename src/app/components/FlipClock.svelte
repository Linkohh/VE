<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  export let use12Hour = true;

  let now = new Date();
  let ticker: ReturnType<typeof setInterval> | null = null;

  function update(): void {
    now = new Date();
  }

  onMount(() => {
    update();
    ticker = setInterval(update, 1000);
  });

  onDestroy(() => {
    if (ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  });

  function toDigits(value: number): [string, string] {
    const padded = value.toString().padStart(2, '0');
    return [padded[0], padded[1]];
  }

  $: hoursRaw = now.getHours();
  $: hours = use12Hour ? ((hoursRaw + 11) % 12) + 1 : hoursRaw;
  $: minutes = now.getMinutes();
  $: seconds = now.getSeconds();
  $: ampm = use12Hour ? (hoursRaw >= 12 ? 'PM' : 'AM') : '';

  $: [hourTens, hourOnes] = toDigits(hours);
  $: [minuteTens, minuteOnes] = toDigits(minutes);
  $: [secondTens, secondOnes] = toDigits(seconds);
</script>

<div class="flip-clock" role="timer" aria-live="polite" aria-atomic="true">
  <div class="flip-group">
    <div class="flip-unit" aria-label={`Hours ${hours}`}>
      <span class="flip-digit">{hourTens}</span>
      <span class="flip-digit">{hourOnes}</span>
    </div>

    <span class="colon" aria-hidden="true">:</span>

    <div class="flip-unit" aria-label={`Minutes ${minutes}`}>
      <span class="flip-digit">{minuteTens}</span>
      <span class="flip-digit">{minuteOnes}</span>
    </div>

    <span class="colon" aria-hidden="true">:</span>

    <div class="flip-unit" aria-label={`Seconds ${seconds}`}>
      <span class="flip-digit">{secondTens}</span>
      <span class="flip-digit">{secondOnes}</span>
    </div>
  </div>

  {#if ampm}
    <span class="ampm" aria-hidden="true">{ampm}</span>
  {/if}
</div>

<style>
  .flip-clock {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    color: white;
  }

  .flip-group {
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
  }

  .flip-unit {
    display: inline-flex;
    align-items: stretch;
    gap: 0.25rem;
  }

  .flip-digit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.75rem;
    height: 3.5rem;
    padding: 0.15rem 0.35rem;
    font-size: 2.25rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    border-radius: 0.65rem;
    position: relative;
    background: radial-gradient(circle at top, rgba(255, 255, 255, 0.12), rgba(15, 23, 42, 0.65));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -2px 12px rgba(56, 189, 248, 0.35),
      0 12px 24px rgba(15, 23, 42, 0.5);
    text-shadow: 0 0 18px rgba(236, 72, 153, 0.65);
  }

  .flip-digit::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.45),
      rgba(255, 255, 255, 0)
    );
    transform: translateY(-50%);
    opacity: 0.8;
  }

  .flip-digit::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      180deg,
      rgba(56, 189, 248, 0.08),
      rgba(236, 72, 153, 0.12)
    );
    opacity: 0.8;
    mix-blend-mode: screen;
  }

  .colon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 2.2rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-shadow: 0 0 12px rgba(56, 189, 248, 0.55);
  }

  .ampm {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.7);
  }

  @media (max-width: 640px) {
    .flip-digit {
      min-width: 2.2rem;
      height: 2.8rem;
      font-size: 1.75rem;
    }

    .colon {
      font-size: 1.8rem;
    }
  }
</style>
