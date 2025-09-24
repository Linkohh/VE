import { useCallback } from 'react';
import { useVibeStore } from '../../state/useVibeStore';
import styles from './ActionButtons.module.scss';

export function ActionButtons() {
  const { isFavorite, actions } = useVibeStore((state) => ({
    isFavorite: state.isFavorite,
    actions: state.actions,
  }));

  const handleCopy = useCallback(() => {
    void actions.copyQuote();
  }, [actions]);

  const handleShare = useCallback(() => {
    void actions.shareQuote();
  }, [actions]);

  return (
    <div className={styles.wrapper} role="group" aria-label="Quote actions">
      <button
        type="button"
        className={styles.actionButton}
        onClick={handleCopy}
      >
        <span className={styles.iconCircle}>
          <i className="fas fa-copy" aria-hidden="true" />
        </span>
        <span className={styles.label}>Copy</span>
      </button>
      <button
        type="button"
        className={styles.actionButton}
        data-active={isFavorite}
        onClick={actions.toggleFavorite}
        aria-pressed={isFavorite}
      >
        <span className={styles.iconCircle}>
          <i className="fas fa-star" aria-hidden="true" />
        </span>
        <span className={styles.label}>Favorite</span>
      </button>
      <button
        type="button"
        className={styles.actionButton}
        onClick={handleShare}
      >
        <span className={styles.iconCircle}>
          <i className="fas fa-share-alt" aria-hidden="true" />
        </span>
        <span className={styles.label}>Share</span>
      </button>
    </div>
  );
}
