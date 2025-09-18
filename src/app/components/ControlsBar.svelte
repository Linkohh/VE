<script lang="ts">
  import { FontAwesomeIcon as Fa } from '@fortawesome/svelte-fontawesome';
  import { writable } from 'svelte/store';
  import {
    faCopy,
    faHeart,
    faHeartCirclePlus,
    faShareNodes,
    faThumbsDown,
    faThumbsUp,
    faWandMagicSparkles,
  } from '@fortawesome/free-solid-svg-icons';
  import type { Quote } from '../../features/quotes/types';
  import { bumpRating, getRating, loadRatings, persistRatings } from '../../features/quotes/rating';
  import { isFavorite, openFavorites, toggleFavorite } from '../stores/favorites';
  import type { QuoteViewModel } from '../stores/quote';
  import { requestNextQuote } from '../stores/quote';

  const ratings = loadRatings();
  const ratingState = writable({ up: 0, down: 0 });

  export let quote: QuoteViewModel | null = null;

  $: ratingState.set(quote ? getRating(ratings, toQuote(quote)) : { up: 0, down: 0 });
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
    requestNextQuote({ reason: 'controls' });
  }

  function rate(direction: 'up' | 'down'): void {
    if (!quote) return;
    const next = bumpRating(ratings, toQuote(quote), direction);
    persistRatings(ratings);
    ratingState.set(next);
  }

  function handleOpenFavorites(event: MouseEvent): void {
    const opener = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    openFavorites(opener ?? undefined);
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
      <Fa icon={faCopy} class="h-4 w-4 text-white/80 group-hover:text-white" />
    </button>

    <button
      type="button"
      class={`group rounded-full p-3 transition ${favoriteActive ? 'bg-pink-500/80' : 'bg-white/10 hover:bg-white/20'}`}
      aria-label={favoriteActive ? 'Remove from favorites' : 'Add to favorites'}
      on:click={handleFavorite}
    >
      <Fa
        icon={favoriteActive ? faHeart : faHeartCirclePlus}
        class={`h-4 w-4 ${favoriteActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}
      />
    </button>

    <button
      type="button"
      class="group rounded-full bg-white/10 p-3 transition hover:bg-white/20"
      aria-label="Share quote"
      on:click={shareQuote}
    >
      <Fa icon={faShareNodes} class="h-4 w-4 text-white/80 group-hover:text-white" />
    </button>

    <button
      type="button"
      class="group rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
      aria-label="Open favorites"
      on:click={handleOpenFavorites}
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
      <Fa icon={faThumbsUp} class="h-4 w-4" />
      <span>{$ratingState.up}</span>
    </button>

    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full bg-rose-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
      aria-label="Rate quote negatively"
      on:click={() => rate('down')}
    >
      <Fa icon={faThumbsDown} class="h-4 w-4" />
      <span>{$ratingState.down}</span>
    </button>
  </div>

  <button
    type="button"
    class="group inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/25"
    on:click={handleGenerate}
  >
    <Fa icon={faWandMagicSparkles} class="h-4 w-4 text-white/80 group-hover:text-white" />
    New Vibe
  </button>
</div>
