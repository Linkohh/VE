import React from 'react';
import { useQuotesContext } from '../App/App';
import styles from './QuoteDisplay.module.css';

const QuoteDisplay: React.FC = () => {
  const { currentQuote, isLoading, error } = useQuotesContext();

  if (isLoading) {
    return (
      <section className={styles.container} aria-live="polite">
        <p className={styles.status}>Loading inspiring vibes…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.container} aria-live="assertive">
        <p className={styles.error}>We hit a snag loading quotes: {error}</p>
      </section>
    );
  }

  if (!currentQuote) {
    return (
      <section className={styles.container}>
        <p className={styles.status}>No quotes available right now. Please try again soon.</p>
      </section>
    );
  }

  return (
    <section className={styles.container} aria-live="polite" aria-label="Current motivational quote">
      <p className={styles.category} aria-label={`Category: ${currentQuote.category}`}>
        {currentQuote.category}
      </p>
      <blockquote className={styles.quote} cite={currentQuote.author}>
        "{currentQuote.text}"
      </blockquote>
      <p className={styles.author} aria-label={`Author: ${currentQuote.author}`}>
        — {currentQuote.author}
      </p>
    </section>
  );
};

export default QuoteDisplay;
