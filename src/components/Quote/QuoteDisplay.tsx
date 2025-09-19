import React, { useMemo } from 'react';
import { useQuotesContext } from '../App/App';
import styles from './QuoteDisplay.module.css';

const QuoteDisplay: React.FC = () => {
  const { currentQuote, isLoading, error, reloadQuotes, storageWarning, clipboardWarning } =
    useQuotesContext();

  const warnings = useMemo(
    () =>
      [storageWarning, clipboardWarning].filter((message): message is string => Boolean(message)),
    [clipboardWarning, storageWarning],
  );

  const handleRetry = () => {
    void reloadQuotes();
  };

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
        <button type="button" className={styles.retryButton} onClick={handleRetry}>
          Try again
        </button>
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
    <section
      className={styles.container}
      aria-live="polite"
      aria-label="Current motivational quote"
    >
      <p className={styles.category} aria-label={`Category: ${currentQuote.category}`}>
        {currentQuote.category}
      </p>
      <blockquote className={styles.quote} cite={currentQuote.author}>
        &ldquo;{currentQuote.text}&rdquo;
      </blockquote>
      <p className={styles.author} aria-label={`Author: ${currentQuote.author}`}>
        — {currentQuote.author}
      </p>
      {warnings.length > 0 && (
        <div className={styles.warning} role="status" aria-live="polite">
          <ul className={styles.warningList}>
            {warnings.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default QuoteDisplay;
