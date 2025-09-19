import React, { useEffect, useRef } from 'react';
import { useQuotesContext, useSettingsContext } from '../App/App';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const settings = useSettingsContext();
  const { favorites } = useQuotesContext();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key and focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the close button when panel opens
      closeButtonRef.current?.focus();

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Handle click outside to close
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  return (
    <aside
      ref={panelRef}
      className={`${styles.panel} ${isOpen ? styles.open : ''}`}
      aria-hidden={!isOpen}
      aria-label="Settings panel"
      role="dialog"
      aria-modal="true">
      <div className={styles.header}>
        <h2>Settings</h2>
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close settings panel"
          title="Close (Esc)"
        >
          ×
        </button>
      </div>

      <section className={styles.section} aria-labelledby="appearance-heading">
        <h3 id="appearance-heading">Appearance</h3>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.theme === 'dark'}
            onChange={settings.toggleTheme}
            aria-label="Toggle dark theme"
          />
          <span>Dark theme</span>
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.matrixEnabled}
            onChange={(event) => settings.setMatrixEnabled(event.target.checked)}
            aria-label="Toggle matrix rain background effect"
          />
          <span>Matrix rain background</span>
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.mouseGlowEnabled}
            onChange={(event) => settings.setMouseGlowEnabled(event.target.checked)}
            aria-label="Toggle mouse glow trail effect"
          />
          <span>Mouse glow trail</span>
        </label>
      </section>

      <section className={styles.section} aria-labelledby="experience-heading">
        <h3 id="experience-heading">Experience</h3>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.beepEnabled}
            onChange={(event) => settings.setBeepEnabled(event.target.checked)}
            aria-label="Toggle sound effects for new quotes"
          />
          <span>Play a chime on new vibes</span>
        </label>
      </section>

      <section className={styles.section} aria-labelledby="favorites-heading">
        <h3 id="favorites-heading">Favorites</h3>
        {favorites.length === 0 ? (
          <p className={styles.empty}>You haven&apos;t favorited a quote yet. Tap the heart to save one.</p>
        ) : (
          <ul className={styles.favoritesList} role="list">
            {favorites.map((favorite) => (
              <li key={favorite.id}>
                <p className={styles.favoriteQuote}>“{favorite.text}”</p>
                <p className={styles.favoriteMeta}>— {favorite.author}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
};

export default SettingsPanel;
