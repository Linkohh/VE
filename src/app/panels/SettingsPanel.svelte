<script lang="ts">
  import { FontAwesomeIcon as Fa } from '@fortawesome/svelte-fontawesome';
  import { faTimes } from '@fortawesome/free-solid-svg-icons';
  import { onDestroy, onMount } from 'svelte';
  import Popover from '../components/Popover.svelte';
  import ThemeToggle from '../components/ThemeToggle.svelte';
  import ToggleRow from '../components/settings/ToggleRow.svelte';
  import SliderRow from '../components/settings/SliderRow.svelte';
  import SelectRow from '../components/settings/SelectRow.svelte';
  import {
    AURA_PALETTE,
    AURA_SIZE_MAX,
    AURA_SIZE_MIN,
    AURA_SIZE_STEP,
    DEFAULT_AURA_SETTINGS,
  } from '../config/aura';
  import {
    settings,
    setMatrixEnabled,
    setBeepEnabled,
    setSpeechEnabled,
    setAutoAdvanceEnabled,
    setAutoAdvanceInterval,
    setAuraColor,
    setAuraSize,
    setAuraIntensity,
    updateAppearanceSettings,
    updateAudioSettings,
    updateContentSettings,
    updateMatrixConfig,
    setMatrixPreset,
    setThemePreset,
    setAccessibilityMode,
    type AppSettingsState,
  } from '../stores/settings';
  import { DEFAULTS, MATRIX_PRESETS, RenderMode } from '../../features/matrix/config';
  import { themes } from '../../features/theme';

  export let open = false;
  export let anchor: HTMLElement | null = null;
  export let onClose: () => void = () => {};

  type TabKey = 'general' | 'appearance' | 'audio' | 'content';

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'audio', label: 'Audio' },
    { key: 'content', label: 'Content' },
  ];

  const MATRIX_SPEED_MIN = 0.4;
  const MATRIX_SPEED_MAX = 2;
  const MATRIX_DENSITY_MIN = 0.5;
  const MATRIX_DENSITY_MAX = 1.5;
  const AUTO_ADVANCE_INTERVAL_MIN = 5;
  const AUTO_ADVANCE_INTERVAL_MAX = 60;

  let activeTab: TabKey = 'general';
  let speechAvailable = false;

  let state: AppSettingsState = {
    general: { matrixEnabled: true, beepEnabled: false, speechEnabled: false },
    content: { autoAdvanceEnabled: false, autoAdvanceInterval: 8, streamDensity: 1, inclusiveLanguage: true },
    matrix: {
      ...DEFAULTS,
      palette: [...DEFAULTS.palette],
      characters: [...DEFAULTS.characters],
    },
    aura: { ...DEFAULT_AURA_SETTINGS },
    appearance: {
      colorHarmonyPreset: DEFAULT_AURA_SETTINGS.colorKey,
      themePreset: themes[0]?.key ?? 'synthwave',
      vibrancy: 65,
      warmth: 50,
      accessibilityMode: 'standard',
      mouseGlowIntensity: DEFAULT_AURA_SETTINGS.intensity,
    },
    audio: { chimePreset: 'soft', chimeVolume: 65, voiceStyle: 'ambient', voiceWarmth: 55 },
  };

  let tabRefs: Array<HTMLButtonElement | null> = [];

  const unsubscribe = settings.subscribe((value) => {
    state = value;
  });

  onDestroy(() => {
    unsubscribe();
  });

  onMount(() => {
    speechAvailable =
      typeof window !== 'undefined' &&
      typeof window.speechSynthesis !== 'undefined' &&
      typeof SpeechSynthesisUtterance !== 'undefined';
  });

  function handleClose(): void {
    onClose();
  }

  function selectTab(key: TabKey): void {
    activeTab = key;
  }

  function focusTab(index: number): void {
    tabRefs[index]?.focus();
  }

  function handleTabKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      selectTab(tabs[nextIndex].key);
      focusTab(nextIndex);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      selectTab(tabs[prevIndex].key);
      focusTab(prevIndex);
    }
  }

  function toPercent(value: number, min: number, max: number): number {
    const percent = ((value - min) / (max - min)) * 100;
    return Math.round(Math.max(0, Math.min(100, percent)));
  }

  function fromPercent(percent: number, min: number, max: number): number {
    const ratio = Math.max(0, Math.min(100, percent)) / 100;
    return min + ratio * (max - min);
  }

  type Option = { value: string; label: string };

  const harmonyOptions: Option[] = AURA_PALETTE.map((swatch) => ({
    value: swatch.key,
    label: swatch.label,
  }));

  const themeOptions: Option[] = themes.map((theme) => ({
    value: theme.key,
    label: theme.key
      .split('-')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' '),
  }));

  const matrixPresetOptions: Option[] = MATRIX_PRESETS.map((preset) => ({
    value: preset.key,
    label: preset.label,
  }));

  const blendModeOptions: Option[] = [
    { value: 'screen', label: 'Screen glow' },
    { value: 'lighten', label: 'Lighten blend' },
    { value: 'difference', label: 'High contrast' },
  ];

  const renderModeOptions: Option[] = [
    { value: RenderMode.Canvas, label: 'Animated canvas' },
    { value: RenderMode.Minimal, label: 'Minimal glow' },
  ];

  const accessibilityOptions: Option[] = [
    { value: 'standard', label: 'Standard' },
    { value: 'contrast', label: 'Contrast boost' },
    { value: 'calm', label: 'Calm mode' },
  ];

  const chimePresetOptions: Option[] = [
    { value: 'soft', label: 'Soft shimmer' },
    { value: 'bright', label: 'Bright pulse' },
    { value: 'mute', label: 'Muted' },
  ];

  const voiceStyleOptions: Option[] = [
    { value: 'ambient', label: 'Ambient' },
    { value: 'storyteller', label: 'Storyteller' },
  ];
</script>

<Popover
  {open}
  {anchor}
  labelledBy="settings-title"
  on:close={handleClose}
  returnFocus={anchor}
>
  <div class="settings-panel">
    <header class="settings-header">
      <div class="settings-title">
        <h2 id="settings-title">Settings</h2>
        <p>Fine-tune your atmosphere and flow.</p>
      </div>
      <button
        type="button"
        class="close-button"
        aria-label="Close settings"
        on:click={handleClose}
      >
        <Fa icon={faTimes} class="h-4 w-4" />
      </button>
    </header>

    <div class="tablist" role="tablist" aria-label="Settings sections">
      {#each tabs as tab, index (tab.key)}
        <button
          id={`tab-${tab.key}`}
          type="button"
          class={`tab ${tab.key === activeTab ? 'is-active' : ''}`}
          role="tab"
          aria-selected={tab.key === activeTab}
          aria-controls={`panel-${tab.key}`}
          tabindex={tab.key === activeTab ? 0 : -1}
          on:click={() => selectTab(tab.key)}
          on:keydown={(event) => handleTabKeydown(event, index)}
          bind:this={tabRefs[index]}
        >
          {tab.label}
        </button>
      {/each}
    </div>

    <div
      class="tab-panel"
      role="tabpanel"
      id={`panel-${activeTab}`}
      aria-labelledby={`tab-${activeTab}`}
    >
      {#if activeTab === 'general'}
        <div class="section-grid">
          <div class="card card--horizontal">
            <div>
              <h3>Theme preset</h3>
              <p>Choose the global gradient blend.</p>
            </div>
            <ThemeToggle size="sm" />
          </div>

          <ToggleRow
            label="Visual effects"
            description="Show the animated matrix layer across the interface."
            checked={state.general.matrixEnabled}
            on:change={(event) => setMatrixEnabled(event.detail)}
          />

          <SelectRow
            label="Rendering engine"
            description="Switch between the immersive canvas and minimal glow backdrops."
            value={state.matrix.renderMode}
            options={renderModeOptions}
            on:change={(event) => updateMatrixConfig({ renderMode: event.detail as RenderMode })}
          />

          <SelectRow
            label="Accessibility mode"
            description="Adjust contrast and interface motion cues."
            value={state.appearance.accessibilityMode}
            options={accessibilityOptions}
            on:change={(event) => setAccessibilityMode(event.detail as typeof state.appearance.accessibilityMode)}
          />
        </div>
      {:else if activeTab === 'appearance'}
        <div class="section-grid">
          <SelectRow
            label="Color harmony"
            description="Align the glow palette with your current mood."
            value={state.appearance.colorHarmonyPreset}
            options={harmonyOptions}
            on:change={(event) => setAuraColor(event.detail)}
          />

          <SelectRow
            label="Theme preset"
            description="Sync the surface gradients with your chosen palette."
            value={state.appearance.themePreset}
            options={themeOptions}
            on:change={(event) => setThemePreset(event.detail)}
          />

          <SliderRow
            label="Glow vibrancy"
            description="Intensify the aura saturation and presence."
            value={state.appearance.vibrancy}
            min={0}
            max={100}
            step={1}
            on:input={(event) => updateAppearanceSettings({ vibrancy: event.detail })}
          />

          <SliderRow
            label="Glow warmth"
            description="Shift the aura temperature toward cool or warm hues."
            value={state.appearance.warmth}
            min={0}
            max={100}
            step={1}
            on:input={(event) => updateAppearanceSettings({ warmth: event.detail })}
          />

          <SliderRow
            label="Mouse glow intensity"
            description="Control how bright the halo responds to cursor movement."
            value={state.appearance.mouseGlowIntensity}
            min={0}
            max={100}
            step={1}
            on:input={(event) => updateAppearanceSettings({ mouseGlowIntensity: event.detail })}
          />

          <SliderRow
            label="Aura size"
            description="Adjust the radius of the ambient glow."
            value={state.aura.size}
            min={AURA_SIZE_MIN}
            max={AURA_SIZE_MAX}
            step={AURA_SIZE_STEP}
            formatValue={(val) => `${Math.round(val)}`}
            on:input={(event) => setAuraSize(event.detail)}
          />

          <SliderRow
            label="Aura intensity"
            description="Boost the glow opacity for a stronger presence."
            value={state.aura.intensity}
            min={0}
            max={100}
            step={1}
            on:input={(event) => setAuraIntensity(event.detail)}
          />

          <SelectRow
            label="Matrix preset"
            description="Swap between curated palettes and glyph sets."
            value={state.matrix.preset}
            options={matrixPresetOptions}
            on:change={(event) => setMatrixPreset(event.detail)}
          />

          <SelectRow
            label="Blend mode"
            description="How the matrix glow interacts with the interface."
            value={state.matrix.blendMode}
            options={blendModeOptions}
            on:change={(event) => updateMatrixConfig({ blendMode: event.detail as typeof state.matrix.blendMode })}
          />

          <SliderRow
            label="Matrix visibility"
            description="Set the overall opacity of the matrix canvas."
            value={Math.round(state.matrix.visibility * 100)}
            min={0}
            max={100}
            step={1}
            formatValue={(val) => `${val}%`}
            on:input={(event) => updateMatrixConfig({ visibility: event.detail / 100 })}
          />

          <SliderRow
            label="Matrix intensity"
            description="Amplify the brightness of individual glyphs."
            value={Math.round(state.matrix.intensity * 100)}
            min={0}
            max={100}
            step={1}
            formatValue={(val) => `${val}%`}
            on:input={(event) => updateMatrixConfig({ intensity: event.detail / 100 })}
          />

          <SliderRow
            label="Stream speed"
            description="Control how quickly glyphs cascade."
            value={toPercent(state.matrix.speed, MATRIX_SPEED_MIN, MATRIX_SPEED_MAX)}
            min={0}
            max={100}
            step={1}
            formatValue={(val) => `${Math.round(fromPercent(val, MATRIX_SPEED_MIN, MATRIX_SPEED_MAX) * 10) / 10}x`}
            on:input={(event) => updateMatrixConfig({ speed: fromPercent(event.detail, MATRIX_SPEED_MIN, MATRIX_SPEED_MAX) })}
          />

          <SliderRow
            label="Stream density"
            description="Adjust how many glyph columns appear on screen."
            value={toPercent(state.matrix.density, MATRIX_DENSITY_MIN, MATRIX_DENSITY_MAX)}
            min={0}
            max={100}
            step={1}
            formatValue={(val) => `${fromPercent(val, MATRIX_DENSITY_MIN, MATRIX_DENSITY_MAX).toFixed(2)}x`}
            on:input={(event) => updateMatrixConfig({ density: fromPercent(event.detail, MATRIX_DENSITY_MIN, MATRIX_DENSITY_MAX) })}
          />
        </div>
      {:else if activeTab === 'audio'}
        <div class="section-grid">
          <ToggleRow
            label="Sound chime"
            description="Play a subtle tone before each quote."
            checked={state.general.beepEnabled}
            on:change={(event) => setBeepEnabled(event.detail)}
          />

          <ToggleRow
            label="Read quotes aloud"
            description={speechAvailable
              ? 'Enable a narrated voiceover for each quote.'
              : 'Voice playback requires a browser with speech synthesis support.'}
            checked={state.general.speechEnabled && speechAvailable}
            disabled={!speechAvailable}
            on:change={(event) => setSpeechEnabled(event.detail)}
          />

          <SelectRow
            label="Chime preset"
            description="Choose the tone profile for the quote cue."
            value={state.audio.chimePreset}
            options={chimePresetOptions}
            on:change={(event) => updateAudioSettings({ chimePreset: event.detail as typeof state.audio.chimePreset })}
          />

          <SliderRow
            label="Chime volume"
            description="Set the loudness of notification sounds."
            value={state.audio.chimeVolume}
            min={0}
            max={100}
            step={1}
            formatValue={(val) => `${val}%`}
            on:input={(event) => updateAudioSettings({ chimeVolume: event.detail })}
          />

          <SelectRow
            label="Voice style"
            description="Choose the narration personality."
            value={state.audio.voiceStyle}
            options={voiceStyleOptions}
            on:change={(event) => updateAudioSettings({ voiceStyle: event.detail as typeof state.audio.voiceStyle })}
          />

          <SliderRow
            label="Voice warmth"
            description="Blend between airy and rich vocal tones."
            value={state.audio.voiceWarmth}
            min={0}
            max={100}
            step={1}
            formatValue={(val) => `${val}%`}
            on:input={(event) => updateAudioSettings({ voiceWarmth: event.detail })}
          />
        </div>
      {:else if activeTab === 'content'}
        <div class="section-grid">
          <ToggleRow
            label="Auto-refresh quotes"
            description="Rotate to a new quote automatically after a delay."
            checked={state.content.autoAdvanceEnabled}
            on:change={(event) => setAutoAdvanceEnabled(event.detail)}
          />

          <SliderRow
            label="Refresh cadence"
            description="How often a new quote appears when auto-refresh is enabled."
            value={state.content.autoAdvanceInterval}
            min={AUTO_ADVANCE_INTERVAL_MIN}
            max={AUTO_ADVANCE_INTERVAL_MAX}
            step={1}
            formatValue={(val) => `${Math.round(val)}s`}
            disabled={!state.content.autoAdvanceEnabled}
            on:input={(event) => setAutoAdvanceInterval(event.detail)}
          />

          <SliderRow
            label="Stream density"
            description="Control how rich each quote batch feels."
            value={toPercent(state.content.streamDensity, MATRIX_DENSITY_MIN, MATRIX_DENSITY_MAX)}
            min={0}
            max={100}
            step={1}
            formatValue={(val) => `${fromPercent(val, MATRIX_DENSITY_MIN, MATRIX_DENSITY_MAX).toFixed(2)}x`}
            on:input={(event) => updateContentSettings({ streamDensity: fromPercent(event.detail, MATRIX_DENSITY_MIN, MATRIX_DENSITY_MAX) })}
          />

          <ToggleRow
            label="Inclusive language"
            description="Favor quotes with inclusive, uplifting language."
            checked={state.content.inclusiveLanguage}
            on:change={(event) => updateContentSettings({ inclusiveLanguage: event.detail })}
          />
        </div>
      {/if}
    </div>

    <footer class="settings-footer">
      Changes apply instantly and respect your reduced-motion preference.
    </footer>
  </div>
</Popover>

<style>
  .settings-panel {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.4rem 1.5rem 1.6rem;
    min-width: 320px;
  }

  .settings-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .settings-title h2 {
    font-size: 1rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .settings-title p {
    margin-top: 0.35rem;
    font-size: 0.78rem;
    color: rgba(226, 232, 240, 0.7);
  }

  .close-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.16);
    color: rgba(248, 250, 252, 0.85);
    transition: background 150ms ease;
  }

  .close-button:hover,
  .close-button:focus-visible {
    background: rgba(148, 163, 184, 0.32);
  }

  .tablist {
    display: flex;
    gap: 0.4rem;
    background: rgba(148, 163, 184, 0.12);
    padding: 0.35rem;
    border-radius: 999px;
  }

  .tab {
    flex: 1;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    transition: background 150ms ease, color 150ms ease;
    color: rgba(226, 232, 240, 0.7);
  }

  .tab.is-active {
    background: rgba(248, 250, 252, 0.16);
    color: rgba(248, 250, 252, 0.95);
  }

  .tab-panel {
    display: flex;
    flex-direction: column;
  }

  .section-grid {
    display: grid;
    gap: 0.75rem;
  }

  .card {
    padding: 1rem 1.1rem;
    border-radius: 1.25rem;
    background: rgba(148, 163, 184, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .card--horizontal {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .card h3 {
    font-size: 0.85rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 600;
  }

  .card p {
    font-size: 0.72rem;
    color: rgba(226, 232, 240, 0.7);
  }

  .settings-footer {
    font-size: 0.72rem;
    color: rgba(226, 232, 240, 0.65);
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    padding-top: 0.75rem;
  }
</style>
