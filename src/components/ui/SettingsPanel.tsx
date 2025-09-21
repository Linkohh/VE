import { ChangeEvent } from 'react';
import { SettingsTab, useVibeStore } from '../../state/useVibeStore';
import styles from './SettingsPanel.module.scss';

const tabs: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'visuals', label: 'Visual Effects', icon: 'fa-wand-magic-sparkles' },
  { id: 'themes', label: 'Themes', icon: 'fa-palette' },
  { id: 'matrix', label: 'Matrix Rain', icon: 'fa-code' },
  { id: 'audio', label: 'Audio', icon: 'fa-waveform-lines' },
  { id: 'accessibility', label: 'Accessibility', icon: 'fa-universal-access' },
];

const presets = [
  { id: 'aurora', label: 'Aurora Glow' },
  { id: 'nocturne', label: 'Nocturne' },
  { id: 'sunrise', label: 'Sunrise Burst' },
  { id: 'spectrum', label: 'Spectrum' },
];

const glyphOptions = [
  { id: 'classic', label: 'Katakana + Latin' },
  { id: 'extended', label: 'Alphanumeric' },
  { id: 'minimal', label: 'Binary' },
];

export function SettingsPanel() {
  const {
    settingsPanelOpen,
    activeSettingsTab,
    actions,
    visuals,
    theme,
    matrix,
    mouseGlow,
    audio,
  } = useVibeStore((state) => ({
    settingsPanelOpen: state.settingsPanelOpen,
    activeSettingsTab: state.activeSettingsTab,
    actions: state.actions,
    visuals: state.visuals,
    theme: state.theme,
    matrix: state.matrix,
    mouseGlow: state.mouseGlow,
    audio: state.audio,
  }));

  const handleCheckbox = (handler: (value: boolean) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    handler(event.target.checked);
  };

  const handleRange = (handler: (value: number) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    handler(Number(event.target.value));
  };

  const handleSelect = (handler: (value: string) => void) => (event: ChangeEvent<HTMLSelectElement>) => {
    handler(event.target.value);
  };

  const togglePanel = () => {
    actions.toggleSettingsPanel();
  };

  const closePanel = () => {
    actions.closeSettings();
  };

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        onClick={togglePanel}
        aria-expanded={settingsPanelOpen}
        aria-controls="settings-panel"
      >
        <i className="fas fa-gear" aria-hidden="true" />
      </button>
      <aside
        id="settings-panel"
        className={styles.panel}
        data-state={settingsPanelOpen ? 'open' : 'closed'}
        aria-hidden={!settingsPanelOpen}
      >
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>Settings</h2>
            <p className={styles.subtitle}>Fine tune the experience</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={closePanel}>
            <i className="fas fa-times" aria-hidden="true" />
            <span className="sr-only">Close settings</span>
          </button>
        </header>
        <nav className={styles.tablist} aria-label="Settings tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={styles.tab}
              data-active={tab.id === activeSettingsTab}
              onClick={() => actions.setActiveSettingsTab(tab.id)}
              aria-selected={tab.id === activeSettingsTab}
            >
              <i className={`fas ${tab.icon}`} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.content}>
          {activeSettingsTab === 'visuals' && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3>Visual Effects</h3>
                <p>Toggle ambient post-processing enhancements.</p>
              </header>
              <div className={styles.optionRow}>
                <label className={styles.switchLabel}>
                  <span>Enable Visual Effects</span>
                  <input
                    type="checkbox"
                    checked={visuals.visualEffectsEnabled}
                    onChange={handleCheckbox((checked) => actions.updateVisuals({ visualEffectsEnabled: checked }))}
                  />
                  <span className={styles.switch} />
                </label>
              </div>
              <div className={styles.optionGrid}>
                <label className={styles.switchLabel}>
                  <span>Bloom Highlights</span>
                  <input
                    type="checkbox"
                    checked={visuals.bloom}
                    onChange={handleCheckbox((checked) => actions.updateVisuals({ bloom: checked }))}
                  />
                  <span className={styles.switch} />
                </label>
                <label className={styles.switchLabel}>
                  <span>Vignette</span>
                  <input
                    type="checkbox"
                    checked={visuals.vignette}
                    onChange={handleCheckbox((checked) => actions.updateVisuals({ vignette: checked }))}
                  />
                  <span className={styles.switch} />
                </label>
                <label className={styles.switchLabel}>
                  <span>Chromatic Shift</span>
                  <input
                    type="checkbox"
                    checked={visuals.chromaticAberration}
                    onChange={handleCheckbox((checked) => actions.updateVisuals({ chromaticAberration: checked }))}
                  />
                  <span className={styles.switch} />
                </label>
                <label className={styles.switchLabel}>
                  <span>Mouse Glow</span>
                  <input
                    type="checkbox"
                    checked={mouseGlow.enabled}
                    onChange={handleCheckbox((checked) => actions.updateMouseGlow({ enabled: checked }))}
                  />
                  <span className={styles.switch} />
                </label>
              </div>
              <div className={styles.optionRow}>
                <label className={styles.sliderLabel}>
                  <span>Glow Intensity</span>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={mouseGlow.intensity}
                    onChange={handleRange((value) => actions.updateMouseGlow({ intensity: value }))}
                  />
                </label>
                <label className={styles.sliderLabel}>
                  <span>Glow Size</span>
                  <input
                    type="range"
                    min={120}
                    max={420}
                    step={10}
                    value={mouseGlow.size}
                    onChange={handleRange((value) => actions.updateMouseGlow({ size: value }))}
                  />
                </label>
                <label className={styles.sliderLabel}>
                  <span>Glow Color</span>
                  <input
                    type="color"
                    value={mouseGlow.color}
                    onChange={handleSelect((value) => actions.updateMouseGlow({ color: value }))}
                  />
                </label>
              </div>
            </section>
          )}
          {activeSettingsTab === 'themes' && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3>Theme Presets</h3>
                <p>Switch the palette and accent hue.</p>
              </header>
              <div className={styles.optionGrid}>
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={styles.presetCard}
                    data-active={theme.preset === preset.id}
                    onClick={() => actions.updateTheme({ preset: preset.id })}
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
              <div className={styles.optionRow}>
                <label className={styles.sliderLabel}>
                  <span>Accent Hue</span>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={theme.accentHue}
                    onChange={handleRange((value) => actions.updateTheme({ accentHue: value }))}
                  />
                </label>
                <label className={styles.switchLabel}>
                  <span>Glass Mode</span>
                  <select
                    value={theme.glassMode}
                    onChange={handleSelect((value) => actions.updateTheme({ glassMode: value as typeof theme.glassMode }))}
                  >
                    <option value="subtle">Subtle</option>
                    <option value="vibrant">Vibrant</option>
                  </select>
                </label>
                <label className={styles.switchLabel}>
                  <span>Contrast</span>
                  <select
                    value={theme.contrast}
                    onChange={handleSelect((value) => actions.updateTheme({ contrast: value as typeof theme.contrast }))}
                  >
                    <option value="standard">Standard</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>
            </section>
          )}
          {activeSettingsTab === 'matrix' && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3>Matrix Rain</h3>
                <p>Control the intensity of the digital rain background.</p>
              </header>
              <div className={styles.optionRow}>
                <label className={styles.switchLabel}>
                  <span>Enable Matrix Rain</span>
                  <input
                    type="checkbox"
                    checked={matrix.enabled}
                    onChange={handleCheckbox((checked) => actions.updateMatrix({ enabled: checked }))}
                  />
                  <span className={styles.switch} />
                </label>
                <label className={styles.switchLabel}>
                  <span>Render Mode</span>
                  <select
                    value={matrix.renderMode}
                    onChange={handleSelect((value) => actions.updateMatrix({ renderMode: value as typeof matrix.renderMode }))}
                  >
                    <option value="performance">Performance</option>
                    <option value="balanced">Balanced</option>
                    <option value="immersive">Immersive</option>
                  </select>
                </label>
              </div>
              <div className={styles.optionRow}>
                <label className={styles.sliderLabel}>
                  <span>Density</span>
                  <input
                    type="range"
                    min={0.2}
                    max={1}
                    step={0.05}
                    value={matrix.density}
                    onChange={handleRange((value) => actions.updateMatrix({ density: value }))}
                  />
                </label>
                <label className={styles.sliderLabel}>
                  <span>Speed</span>
                  <input
                    type="range"
                    min={0.2}
                    max={1.6}
                    step={0.05}
                    value={matrix.speed}
                    onChange={handleRange((value) => actions.updateMatrix({ speed: value }))}
                  />
                </label>
                <label className={styles.sliderLabel}>
                  <span>Trail Length</span>
                  <input
                    type="range"
                    min={0.3}
                    max={1}
                    step={0.05}
                    value={matrix.trail}
                    onChange={handleRange((value) => actions.updateMatrix({ trail: value }))}
                  />
                </label>
              </div>
              <div className={styles.optionRow}>
                <label className={styles.switchLabel}>
                  <span>Glyph Set</span>
                  <select
                    value={matrix.glyphSet}
                    onChange={handleSelect((value) => actions.updateMatrix({ glyphSet: value as typeof matrix.glyphSet }))}
                  >
                    {glyphOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.sliderLabel}>
                  <span>Matrix Color</span>
                  <input
                    type="color"
                    value={matrix.color}
                    onChange={handleSelect((value) => actions.updateMatrix({ color: value }))}
                  />
                </label>
              </div>
            </section>
          )}
          {activeSettingsTab === 'audio' && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3>Audio & Beeps</h3>
                <p>Control the sonic feedback of the experience.</p>
              </header>
              <div className={styles.optionRow}>
                <label className={styles.switchLabel}>
                  <span>Transition Beep</span>
                  <input
                    type="checkbox"
                    checked={audio.beepEnabled}
                    onChange={handleCheckbox((checked) => actions.updateAudio({ beepEnabled: checked }))}
                  />
                  <span className={styles.switch} />
                </label>
                <label className={styles.sliderLabel}>
                  <span>Beep Volume</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={audio.beepVolume}
                    onChange={handleRange((value) => actions.updateAudio({ beepVolume: value }))}
                  />
                </label>
              </div>
              <div className={styles.optionRow}>
                <label className={styles.switchLabel}>
                  <span>Text to Speech</span>
                  <input
                    type="checkbox"
                    checked={audio.ttsEnabled}
                    onChange={handleCheckbox((checked) => actions.updateAudio({ ttsEnabled: checked }))}
                  />
                  <span className={styles.switch} />
                </label>
                <label className={styles.sliderLabel}>
                  <span>Speech Rate</span>
                  <input
                    type="range"
                    min={0.6}
                    max={1.4}
                    step={0.05}
                    value={audio.ttsRate}
                    onChange={handleRange((value) => actions.updateAudio({ ttsRate: value }))}
                  />
                </label>
                <label className={styles.switchLabel}>
                  <span>Voice</span>
                  <input
                    type="text"
                    value={audio.ttsVoice ?? ''}
                    placeholder="Browser default"
                    onChange={(event) => actions.updateAudio({ ttsVoice: event.target.value || null })}
                  />
                </label>
              </div>
            </section>
          )}
          {activeSettingsTab === 'accessibility' && (
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3>Accessibility</h3>
                <p>Adjust contrast and motion preferences.</p>
              </header>
              <div className={styles.optionRow}>
                <label className={styles.switchLabel}>
                  <span>High Contrast</span>
                  <input
                    type="checkbox"
                    checked={theme.contrast === 'high'}
                    onChange={handleCheckbox((checked) =>
                      actions.updateTheme({ contrast: checked ? 'high' : 'standard' }),
                    )}
                  />
                  <span className={styles.switch} />
                </label>
                <label className={styles.switchLabel}>
                  <span>Reduce Motion</span>
                  <input
                    type="checkbox"
                    checked={!visuals.visualEffectsEnabled}
                    onChange={handleCheckbox((checked) =>
                      actions.updateVisuals({ visualEffectsEnabled: !checked }),
                    )}
                  />
                  <span className={styles.switch} />
                </label>
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}
