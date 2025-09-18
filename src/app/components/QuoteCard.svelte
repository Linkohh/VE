<script lang="ts">
import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintIn, quintOut } from 'svelte/easing';
  import type { QuoteViewModel } from '../stores/quote';
  import { quoteLoading } from '../stores/quote';

  export let quote: QuoteViewModel | null = null;

let reduceMotion = false;
let transitionDepth = 0;
let isTransitioning = false;

function motion(duration: number): number {
  return reduceMotion ? 0 : duration;
}

function markTransitionStart(): void {
  transitionDepth += 1;
  isTransitioning = transitionDepth > 0;
}

function markTransitionEnd(): void {
  transitionDepth = Math.max(0, transitionDepth - 1);
  isTransitioning = transitionDepth > 0;
}

  onMount(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      reduceMotion = media.matches;
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });
</script>

<section
  class:loading={$quoteLoading}
  class="panel-surface relative overflow-hidden p-6 text-center text-white"
  aria-live="polite"
  aria-atomic="true"
>
  <div
    class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"
    aria-hidden="true"
  ></div>

  {#key quote?.id ?? quote?.text ?? 'loading'}
    <div
      class="quote-animator"
      class:is-transitioning={isTransitioning}
      in:fly={{ y: 36, duration: motion(420), easing: quintOut }}
      out:fly={{ y: -28, duration: motion(320), easing: quintIn }}
      on:introstart={markTransitionStart}
      on:outrostart={markTransitionStart}
      on:introend={markTransitionEnd}
      on:outroend={markTransitionEnd}
    >
      <div
        class="quote-animator-shell"
        class:is-transitioning={isTransitioning}
        in:scale={{ start: 0.92, duration: motion(420), easing: quintOut }}
        out:scale={{ start: 0.92, duration: motion(260), easing: quintIn }}
      >
        <div
          class="quote-animator-body"
          class:is-transitioning={isTransitioning}
          in:fade={{ duration: motion(360) }}
          out:fade={{ duration: motion(220) }}
        >
          <p class="quote-text-font text-2xl leading-relaxed md:text-3xl">
            {#if quote?.text}
              {quote.text}
            {:else}
              Loading your next dose of inspiration…
            {/if}
          </p>

          <footer class="quote-author">
            {#if quote?.author}
              — {quote.author}
            {:else if quote?.text}
              — Unknown
            {/if}
          </footer>
        </div>
      </div>
    </div>
  {/key}
</section>

<style>
  .quote-animator {
    display: flex;
    justify-content: center;
    position: relative;
  }

  .quote-animator.is-transitioning,
  .quote-animator-shell.is-transitioning,
  .quote-animator-body.is-transitioning {
    will-change: transform, opacity;
  }

  .quote-animator-shell {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .quote-animator-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .quote-author {
    margin-top: 0.5rem;
    font-size: 1rem;
    font-style: italic;
    color: rgba(255, 255, 255, 0.75);
  }

  section.loading::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, rgba(255, 255, 255, 0.08), transparent 45%, transparent 55%, rgba(0, 255, 255, 0.08));
    opacity: 0;
    animation: shimmer 1.4s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes shimmer {
    0%,
    100% {
      opacity: 0;
      transform: translateX(-10%);
    }

    40% {
      opacity: 0.6;
    }

    50% {
      opacity: 0.7;
      transform: translateX(10%);
    }

    60% {
      opacity: 0.6;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    section.loading::after {
      animation: none;
      opacity: 0;
    }
  }
</style>
