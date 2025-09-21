import { useEffect, useMemo, useState } from 'react';
import { useVibeStore } from '../../state/useVibeStore';
import styles from './QuoteDisplay.module.scss';

const TRANSITION_DURATION = 320;

type Phase = 'idle' | 'fade-out' | 'fade-in';

type DisplayQuote = {
  text: string;
  author: string;
  category: string;
};

export function QuoteDisplay() {
  const { quote, quoteVersion, statusMessage, isFavorite, actions } = useVibeStore((state) => ({
    quote: state.quote,
    quoteVersion: state.quoteVersion,
    statusMessage: state.statusMessage,
    isFavorite: state.isFavorite,
    actions: state.actions,
  }));

  const [phase, setPhase] = useState<Phase>('fade-in');
  const [renderedQuote, setRenderedQuote] = useState<DisplayQuote>({
    text: quote.text,
    author: quote.author,
    category: quote.category,
  });

  useEffect(() => {
    let timeout: number | undefined;
    setPhase('fade-out');
    timeout = window.setTimeout(() => {
      setRenderedQuote({
        text: quote.text,
        author: quote.author,
        category: quote.category,
      });
      setPhase('fade-in');
    }, TRANSITION_DURATION);
    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [quoteVersion, quote.text, quote.author, quote.category]);

  useEffect(() => {
    if (phase === 'fade-in') {
      const timeout = window.setTimeout(() => setPhase('idle'), TRANSITION_DURATION);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [phase]);

  const quoteString = useMemo(
    () => `"${renderedQuote.text}" — ${renderedQuote.author}`,
    [renderedQuote.text, renderedQuote.author],
  );

  return (
    <section className={styles.wrapper} aria-live="polite" aria-atomic="true">
      <blockquote className={styles.blockquote} data-phase={phase}>
        <p className={styles.text} data-testid="quote-text">
          {renderedQuote.text}
        </p>
        <footer className={styles.footer}>
          <cite className={styles.author} data-testid="quote-author">
            — {renderedQuote.author}
          </cite>
        </footer>
      </blockquote>
      <div className={styles.meta}>
        <div className={styles.category}>
          <span className={styles.metaLabel}>Category:</span>
          <span className={styles.metaValue}>{renderedQuote.category}</span>
        </div>
        <button
          type="button"
          className={styles.generateButton}
          onClick={actions.generateQuote}
          aria-label="Generate new quote"
        >
          <i className="fas fa-sync-alt" aria-hidden="true" />
          <span>New Vibe</span>
        </button>
      </div>
      <div className={styles.statusRow}>
        <span className={styles.statusMessage} role="status">
          {statusMessage}
        </span>
        <span
          className={styles.favoriteBadge}
          data-active={isFavorite}
          aria-hidden={!isFavorite}
        >
          <i className="fas fa-star" aria-hidden="true" />
        </span>
      </div>
      <div className={styles.visuallyHidden} aria-hidden="true">
        {quoteString}
      </div>
    </section>
  );
}
