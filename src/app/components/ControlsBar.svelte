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
  import { isFavorite, toggleFavorite } from '../stores/favorites';
  import type { QuoteViewModel } from '../stores/quote';

  const ratings = loadRatings();
  const ratingState = writable({ up: 0, down: 0 });

  export let quote: QuoteViewModel | null = null;
  export let secondsRemaining = 0;
  export let autoAdvanceActive = false;
  export let onGenerate: () => void = () => {};

  $: ratingState.set(quote ? getRating(ratings, toQuote(quote)) : { up: 0, down: 0 });
  $: favoriteActive = isFavorite(quote);
  $: formattedSeconds = secondsRemaining.toString().padStart(2, '0');
  $: nextLabel =
    autoAdvanceActive && secondsRemaining > 0
      ? `New quote in ${formattedSeconds} seconds`
      : 'New quote now';

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

  function rate(direction: 'up' | 'down'): void {
    if (!quote) return;
    const next = bumpRating(ratings, toQuote(quote), direction);
    persistRatings(ratings);
    ratingState.set(next);
  }
</script>

<div class="controls-wrapper">
  <div class="orbit">
    <button
      type="button"
      class="orbit-icon"
      aria-label="Copy quote"
      on:click={copyQuote}
      style="--orbit-angle: -90deg"
    >
      <Fa icon={faCopy} class="icon" />
    </button>

    <button
      type="button"
      class={`orbit-icon favorite ${favoriteActive ? 'active' : ''}`}
      aria-label={favoriteActive ? 'Remove from favorites' : 'Add to favorites'}
      on:click={handleFavorite}
      style="--orbit-angle: 150deg"
    >
      <Fa icon={favoriteActive ? faHeart : faHeartCirclePlus} class="icon" />
    </button>

    <button
      type="button"
      class="orbit-icon"
      aria-label="Share quote"
      on:click={shareQuote}
      style="--orbit-angle: 30deg"
    >
      <Fa icon={faShareNodes} class="icon" />
    </button>

    <button type="button" class="core-button" on:click={onGenerate}>
      <Fa icon={faWandMagicSparkles} class="core-icon" />
      <span class="core-label">{nextLabel}</span>
    </button>
  </div>

  <div class="rating-cluster">
    <button type="button" class="rating-button positive" aria-label="Rate quote positively" on:click={() => rate('up')}>
      <Fa icon={faThumbsUp} class="rating-icon" />
      <span>{$ratingState.up}</span>
    </button>

    <div class="rating-divider" aria-hidden="true"></div>

    <button type="button" class="rating-button negative" aria-label="Rate quote negatively" on:click={() => rate('down')}>
      <Fa icon={faThumbsDown} class="rating-icon" />
      <span>{$ratingState.down}</span>
    </button>
  </div>
</div>

<style>
  .controls-wrapper {
    margin-top: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    color: #fff;
  }

  .orbit {
    position: relative;
    width: 14rem;
    height: 14rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .orbit::before {
    content: '';
    position: absolute;
    inset: 1.25rem;
    border-radius: 999px;
    border: 1px dashed rgba(255, 255, 255, 0.18);
    opacity: 0.75;
  }

  .orbit-icon {
    position: absolute;
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(12px);
    box-shadow: 0 12px 18px rgba(15, 23, 42, 0.35);
    transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease;
    transform: translate(-50%, -50%) rotate(var(--orbit-angle)) translateX(6.2rem) rotate(calc(var(--orbit-angle) * -1));
  }

  :global(.orbit-icon svg) {
    width: 1rem;
    height: 1rem;
  }

  .orbit-icon:hover,
  .orbit-icon:focus-visible {
    background: rgba(255, 255, 255, 0.22);
    color: #fff;
    outline: none;
  }

  .orbit-icon.favorite.active {
    background: rgba(236, 72, 153, 0.8);
    color: #fff;
  }

  .core-button {
    width: 9rem;
    height: 9rem;
    border-radius: 999px;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05));
    border: 1px solid rgba(255, 255, 255, 0.18);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: #fff;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0 1.25rem;
    backdrop-filter: blur(16px);
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.35);
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }

  .core-button:hover,
  .core-button:focus-visible {
    transform: translateY(-4px);
    box-shadow: 0 22px 40px rgba(15, 23, 42, 0.45);
    border-color: rgba(255, 255, 255, 0.4);
    outline: none;
  }

  .core-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: rgba(255, 255, 255, 0.85);
  }

  .core-label {
    line-height: 1.2;
    color: rgba(255, 255, 255, 0.9);
  }

  .rating-cluster {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(14px);
  }

  .rating-button {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: background 0.3s ease, color 0.3s ease;
  }

  .rating-button.positive {
    background: rgba(16, 185, 129, 0.18);
    color: rgba(209, 250, 229, 0.95);
  }

  .rating-button.positive:hover,
  .rating-button.positive:focus-visible {
    background: rgba(16, 185, 129, 0.28);
    color: #ecfdf5;
    outline: none;
  }

  .rating-button.negative {
    background: rgba(244, 63, 94, 0.18);
    color: rgba(255, 228, 230, 0.9);
  }

  .rating-button.negative:hover,
  .rating-button.negative:focus-visible {
    background: rgba(244, 63, 94, 0.28);
    color: #ffe4e6;
    outline: none;
  }

  .rating-icon {
    width: 0.9rem;
    height: 0.9rem;
  }

  .rating-divider {
    width: 1px;
    height: 1.75rem;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.35),
      rgba(255, 255, 255, 0)
    );
  }

  @media (max-width: 640px) {
    .controls-wrapper {
      gap: 2rem;
    }

    .orbit {
      width: 12rem;
      height: 12rem;
    }

    .orbit::before {
      inset: 1rem;
    }

    .orbit-icon {
      width: 2.6rem;
      height: 2.6rem;
      transform: translate(-50%, -50%) rotate(var(--orbit-angle)) translateX(5.2rem)
        rotate(calc(var(--orbit-angle) * -1));
    }

    .core-button {
      width: 7.75rem;
      height: 7.75rem;
      font-size: 0.75rem;
    }

    .rating-cluster {
      gap: 0.5rem;
      padding: 0.45rem 0.75rem;
    }

    .rating-divider {
      height: 1.4rem;
    }
  }
</style>
