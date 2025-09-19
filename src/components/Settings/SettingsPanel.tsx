import React from 'react';
import { useQuotesContext, useSettingsContext } from '../App/App';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const settings = useSettingsContext();
  const { favorites } = useQuotesContext();

  return (
    <aside className={`${styles.panel} ${isOpen ? styles.open : ''}`} aria-hidden={!isOpen}>
      <div className={styles.header}>
        <h2>Settings</h2>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close settings">
          ×
        </button>
      </div>

      <section className={styles.section}>
        <h3>Appearance</h3>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.theme === 'dark'}
            onChange={settings.toggleTheme}
          />
          <span>Dark theme</span>
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.matrixEnabled}
            onChange={(event) => settings.setMatrixEnabled(event.target.checked)}
          />
          <span>Matrix rain background</span>
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.mouseGlowEnabled}
            onChange={(event) => settings.setMouseGlowEnabled(event.target.checked)}
          />
          <span>Mouse glow trail</span>
        </label>
      </section>

      <section className={styles.section}>
        <h3>Experience</h3>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.beepEnabled}
            onChange={(event) => settings.setBeepEnabled(event.target.checked)}
          />
          <span>Play a chime on new vibes</span>
        </label>
      </section>

      <section className={styles.section}>
        <h3>Favorites</h3>
        {favorites.length === 0 ? (
          <p className={styles.empty}>You haven&apos;t favorited a quote yet. Tap the heart to save one.</p>
        ) : (
          <ul className={styles.favoritesList}>
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
