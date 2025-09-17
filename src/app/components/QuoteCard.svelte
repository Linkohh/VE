<script lang="ts">
  import type { QuoteViewModel } from '../stores/quote';

  export let quote: QuoteViewModel | null = null;
</script>

<section
  class="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 text-center text-white shadow-2xl backdrop-blur-xl"
  aria-live="polite"
  aria-atomic="true"
>
  <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" aria-hidden="true" />

  <p class="quote-text-font text-2xl leading-relaxed md:text-3xl">
    {#if quote?.text}
      {quote.text}
    {:else}
      Loading your next dose of inspiration…
    {/if}
  </p>

  <footer class="mt-6 text-base italic text-white/80">
    {#if quote?.author}
      — {quote.author}
    {:else if quote?.text}
      — Unknown
    {/if}
  </footer>

  {#if quote?.category}
    <span class="mt-6 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-wider text-white/70">
      {quote.category}
    </span>
  {/if}
</section>
