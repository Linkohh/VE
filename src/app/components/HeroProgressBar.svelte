<script lang="ts">
  export let quoteIndex = 0;
  export let quoteTotal = 0;
  export let autoAdvanceProgress = 0;
  export let message = '';

  function clamp(value: number): number {
    if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  }

  $: normalizedTotal = quoteTotal > 0 ? quoteTotal : 0;
  $: normalizedIndex = normalizedTotal > 0 ? Math.min(Math.max(quoteIndex, 0), normalizedTotal) : Math.max(0, quoteIndex);
  $: progress = normalizedTotal > 0 ? clamp(normalizedIndex / normalizedTotal) : 0;
  $: timerProgress = clamp(autoAdvanceProgress);
  $: progressLabel = normalizedTotal > 0 ? `${Math.max(1, Math.ceil(normalizedIndex || 1))} / ${normalizedTotal}` : `${Math.max(0, normalizedIndex)}`;
</script>

<div class="hero-progress">
  <div class="progress-header">
    <span class="progress-title">Vibe progression</span>
    <span class="progress-count">{progressLabel}</span>
  </div>

  <div
    class="progress-track"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="{normalizedTotal || 1}"
    aria-valuenow={normalizedTotal > 0 ? Math.max(1, Math.ceil(normalizedIndex || 1)) : normalizedIndex}
  >
    <div class="progress-fill" style={`--progress:${progress * 100}%`}></div>
    <div class="progress-timer" style={`--timer:${timerProgress * 100}%`}></div>
    <div class="progress-sheen" aria-hidden="true"></div>
  </div>

  {#if message}
    <p class="progress-message">{message}</p>
  {/if}
</div>

<style>
  .hero-progress {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    max-width: 28rem;
    margin: 0 auto;
    color: white;
  }

  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.7);
  }

  .progress-title {
    font-weight: 600;
  }

  .progress-count {
    font-weight: 700;
  }

  .progress-track {
    position: relative;
    height: 0.85rem;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.08);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.12),
      0 18px 38px rgba(15, 23, 42, 0.45);
  }

  .progress-fill {
    position: absolute;
    inset: 0;
    width: var(--progress, 0%);
    background: linear-gradient(90deg, rgba(56, 189, 248, 0.85), rgba(236, 72, 153, 0.9));
    transition: width 0.6s ease;
  }

  .progress-timer {
    position: absolute;
    inset: 0;
    width: var(--timer, 0%);
    background: linear-gradient(90deg, rgba(96, 165, 250, 0.45), rgba(236, 72, 153, 0.65));
    mix-blend-mode: screen;
    transition: width 0.35s ease;
  }

  .progress-sheen {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0));
    opacity: 0.35;
    pointer-events: none;
  }

  .progress-message {
    margin: 0;
    font-size: 0.85rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.75);
  }

  @media (max-width: 640px) {
    .hero-progress {
      gap: 0.65rem;
    }

    .progress-header {
      font-size: 0.75rem;
      letter-spacing: 0.1em;
    }

    .progress-track {
      height: 0.75rem;
    }
  }
</style>
