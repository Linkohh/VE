<script lang="ts">
    import { currentQuote } from '../stores/quoteStore';
</script>

<section class="quote-card" aria-live="polite">
    <p class="quote-text">“{$currentQuote.text}”</p>
    <p class="quote-author">— {$currentQuote.author}</p>
    {#if $currentQuote.category}
        <p class="quote-meta">Category: {$currentQuote.category}</p>
    {/if}
</section>

<style>
    .quote-card {
        position: relative;
        padding: 3rem 2.5rem;
        border-radius: var(--card-radius);
        background: var(--container-bg-color);
        color: var(--text-color-main);
        box-shadow: var(--shadow-xl);
        max-width: 680px;
        width: 100%;
        margin: 0 auto;
        text-align: center;
        backdrop-filter: blur(var(--container-blur));
    }

    .quote-text {
        font-family: var(--font-quote);
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        line-height: 1.4;
        margin-bottom: 1.5rem;
        color: var(--text-color-main);
    }

    .quote-author {
        font-family: var(--font-author);
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--theme-primary);
        margin-bottom: 0.5rem;
    }

    .quote-meta {
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-color-secondary);
    }
</style>
