<script lang="ts">
  import type { Quote } from '../../features/quotes/types';
  import { bumpRating, getRating, loadRatings, persistRatings } from '../../features/quotes/rating';
  import { bus, EVENTS } from '../../lib/bus';
  import { isFavorite, openFavorites, toggleFavorite } from '../stores/favorites';
  import type { QuoteViewModel } from '../stores/quote';
  import { requestNextQuote } from '../stores/quote';

  const ratings = loadRatings();

  export let quote: QuoteViewModel | null = null;

  $: currentRating = quote ? getRating(ratings, toQuote(quote)) : { up: 0, down: 0 };
  $: favoriteActive = isFavorite(quote);

  function toQuote(value: QuoteViewModel): Quote {
    return {
      text: value.text,
      author: value.author ?? 'Unknown',
      category: value.category ?? 'default',
    };
  }

  function actionText(): string | null {
    if (!quote || !quote.text?.trim()) return null;
    const text = quote.text.trim();
    const author = quote.author?.trim();
    return author ? `${text} — ${author}` : text;
  }

  async function copyQuote(): Promise<void> {
    const text = actionText();
    if (!text) return;
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      /* ignore clipboard failures */
    }
  }

  async function shareQuote(): Promise<void> {
    const text = actionText();
    if (!text) return;

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        /* fall through */
      }
    }

    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      /* ignore clipboard failures */
    }
  }

  function handleFavorite(): void {
    toggleFavorite(quote);
  }

  function handleGenerate(): void {
    requestNextQuote({ source: 'svelte:controls' });
  }

  function rate(direction: 'up' | 'down'): void {
    if (!quote) return;
    const next = bumpRating(ratings, toQuote(quote), direction);
    persistRatings(ratings);
    currentRating = next;
    bus.emit(EVENTS.QUOTE_RATED, { direction, quote });
  }
</script>

<div class="mt-8 flex flex-col items-center gap-6 text-white">
  <div class="flex items-center justify-center gap-3 text-lg">
    <button
      type="button"
      class="group rounded-full bg-white/10 p-3 transition hover:bg-white/20"
      aria-label="Copy quote"
      on:click={copyQuote}
    >
      <i class="fas fa-copy text-white/80 group-hover:text-white" aria-hidden="true" />
    </button>

    <button
      type="button"
      class={`group rounded-full p-3 transition ${favoriteActive ? 'bg-pink-500/80' : 'bg-white/10 hover:bg-white/20'}`}
      aria-label={favoriteActive ? 'Remove from favorites' : 'Add to favorites'}
      on:click={handleFavorite}
    >
      <i
        class={`fas ${favoriteActive ? 'fa-heart' : 'fa-heart-circle-plus'} text-white`}
        aria-hidden="true"
      />
    </button>

    <button
      type="button"
      class="group rounded-full bg-white/10 p-3 transition hover:bg-white/20"
      aria-label="Share quote"
      on:click={shareQuote}
    >
      <i class="fas fa-share-nodes text-white/80 group-hover:text-white" aria-hidden="true" />
    </button>

    <button
      type="button"
      class="group rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
      aria-label="Open favorites"
      on:click={(event) => openFavorites(event.currentTarget as HTMLElement)}
    >
      Favorites
    </button>
  </div>

  <div class="flex items-center gap-3 text-base text-white/80">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
      aria-label="Rate quote positively"
      on:click={() => rate('up')}
    >
      <i class="fas fa-thumbs-up" aria-hidden="true" />
      <span>{currentRating.up}</span>
    </button>

    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full bg-rose-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
      aria-label="Rate quote negatively"
      on:click={() => rate('down')}
    >
      <i class="fas fa-thumbs-down" aria-hidden="true" />
      <span>{currentRating.down}</span>
    </button>
  </div>

  <button
    type="button"
    class="group inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/25"
    on:click={handleGenerate}
  >
    <i class="fas fa-wand-magic-sparkles text-white/80 group-hover:text-white" aria-hidden="true" />
    New Vibe
  </button>
</div>
