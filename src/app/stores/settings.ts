import { writable } from 'svelte/store';
import {
  DEFAULTS,
  DEFAULT_MATRIX_PRESET,
  MATRIX_PRESET_LOOKUP,
  RenderMode,
  type MatrixBlendMode,
  type MatrixConfig,
} from '../../features/matrix/config';
import { getCurrentThemeKey, setThemeByKey } from '../../features/theme';
import {
  AURA_LOOKUP,
  AURA_SIZE_MAX,
  AURA_SIZE_MIN,
  DEFAULT_AURA_SETTINGS,
  type AuraSettings,
} from '../config/aura';

export type AccessibilityMode = 'standard' | 'contrast' | 'calm';
export type AudioChimePreset = 'soft' | 'bright' | 'mute';
export type VoiceStyle = 'ambient' | 'storyteller';

export interface GeneralSettings {
  matrixEnabled: boolean;
  beepEnabled: boolean;
  speechEnabled: boolean;
}

export interface AppearanceSettings {
  colorHarmonyPreset: string;
  themePreset: string;
  vibrancy: number;
  warmth: number;
  accessibilityMode: AccessibilityMode;
  mouseGlowIntensity: number;
}

export interface AudioSettings {
  chimePreset: AudioChimePreset;
  chimeVolume: number;
  voiceStyle: VoiceStyle;
  voiceWarmth: number;
}

export interface ContentSettings {
  autoAdvanceEnabled: boolean;
  autoAdvanceInterval: number;
  streamDensity: number;
  inclusiveLanguage: boolean;
}

export interface AppSettingsState {
  general: GeneralSettings;
  matrix: MatrixConfig;
  aura: AuraSettings;
  appearance: AppearanceSettings;
  audio: AudioSettings;
  content: ContentSettings;
}

const AUTO_ADVANCE_INTERVAL_MIN = 5;
const AUTO_ADVANCE_INTERVAL_MAX = 60;
const DEFAULT_AUTO_ADVANCE_INTERVAL = 8;
const MATRIX_DENSITY_MIN = 0.5;
const MATRIX_DENSITY_MAX = 1.5;
const MATRIX_SPEED_MIN = 0.4;
const MATRIX_SPEED_MAX = 2;
const PERCENT_MIN = 0;
const PERCENT_MAX = 100;
const FRACTION_MIN = 0;
const FRACTION_MAX = 1;

const STORAGE_KEY = 'vibeme:settings:v2';

const DEFAULT_GENERAL: GeneralSettings = {
  matrixEnabled: true,
  beepEnabled: false,
  speechEnabled: false,
};

const DEFAULT_CONTENT: ContentSettings = {
  autoAdvanceEnabled: false,
  autoAdvanceInterval: DEFAULT_AUTO_ADVANCE_INTERVAL,
  streamDensity: 1,
  inclusiveLanguage: true,
};

const DEFAULT_APPEARANCE_BASE: Omit<AppearanceSettings, 'themePreset'> = {
  colorHarmonyPreset: DEFAULT_AURA_SETTINGS.colorKey,
  vibrancy: 65,
  warmth: 50,
  accessibilityMode: 'standard',
  mouseGlowIntensity: DEFAULT_AURA_SETTINGS.intensity,
};

const DEFAULT_AUDIO: AudioSettings = {
  chimePreset: 'soft',
  chimeVolume: 65,
  voiceStyle: 'ambient',
  voiceWarmth: 55,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampPercent(value: number): number {
  return clamp(value, PERCENT_MIN, PERCENT_MAX);
}

function clampFraction(value: number): number {
  return clamp(value, FRACTION_MIN, FRACTION_MAX);
}

function clampDensity(value: number): number {
  return clamp(value, MATRIX_DENSITY_MIN, MATRIX_DENSITY_MAX);
}

function clampSpeed(value: number): number {
  return clamp(value, MATRIX_SPEED_MIN, MATRIX_SPEED_MAX);
}

function resolveReducedMotion(defaultValue: boolean): boolean {
  if (typeof window === 'undefined') return defaultValue;
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

function createGeneral(): GeneralSettings {
  return { ...DEFAULT_GENERAL };
}

function createContent(): ContentSettings {
  return { ...DEFAULT_CONTENT };
}

function createAppearance(): AppearanceSettings {
  return {
    ...DEFAULT_APPEARANCE_BASE,
    themePreset: getCurrentThemeKey(),
  };
}

function createAudio(): AudioSettings {
  return { ...DEFAULT_AUDIO };
}

function createAura(): AuraSettings {
  return { ...DEFAULT_AURA_SETTINGS };
}

function createMatrix(): MatrixConfig {
  return {
    ...DEFAULTS,
    reducedMotion: resolveReducedMotion(DEFAULTS.reducedMotion),
  };
}

function createBaseState(): AppSettingsState {
  return {
    general: createGeneral(),
    matrix: createMatrix(),
    aura: createAura(),
    appearance: createAppearance(),
    audio: createAudio(),
    content: createContent(),
  };
}

function resolveInitialState(): AppSettingsState {
  const baseState = createBaseState();

  if (typeof window === 'undefined') {
    return baseState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return baseState;
    }

    const parsed = JSON.parse(raw) as Partial<AppSettingsState> | null;
    if (!parsed || typeof parsed !== 'object') {
      return baseState;
    }

    const parsedGeneral =
      (parsed.general && typeof parsed.general === 'object' ? parsed.general : {}) as Partial<GeneralSettings>;
    const parsedContent =
      (parsed.content && typeof parsed.content === 'object' ? parsed.content : {}) as Partial<ContentSettings>;
    const parsedAppearance =
      (parsed.appearance && typeof parsed.appearance === 'object' ? parsed.appearance : {}) as Partial<AppearanceSettings>;
    const parsedAudio =
      (parsed.audio && typeof parsed.audio === 'object' ? parsed.audio : {}) as Partial<AudioSettings>;
    const parsedMatrix =
      (parsed.matrix && typeof parsed.matrix === 'object' ? parsed.matrix : {}) as Partial<MatrixConfig>;
    const parsedAura =
      (parsed.aura && typeof parsed.aura === 'object' ? parsed.aura : {}) as Partial<AuraSettings>;

    const nextGeneral: GeneralSettings = {
      matrixEnabled:
        typeof parsedGeneral.matrixEnabled === 'boolean'
          ? parsedGeneral.matrixEnabled
          : baseState.general.matrixEnabled,
      beepEnabled:
        typeof parsedGeneral.beepEnabled === 'boolean'
          ? parsedGeneral.beepEnabled
          : baseState.general.beepEnabled,
      speechEnabled:
        typeof parsedGeneral.speechEnabled === 'boolean'
          ? parsedGeneral.speechEnabled
          : baseState.general.speechEnabled,
    };

    const parsedInterval =
      typeof parsedContent.autoAdvanceInterval === 'number' && Number.isFinite(parsedContent.autoAdvanceInterval)
        ? clamp(parsedContent.autoAdvanceInterval, AUTO_ADVANCE_INTERVAL_MIN, AUTO_ADVANCE_INTERVAL_MAX)
        : baseState.content.autoAdvanceInterval;

    const parsedStreamDensity =
      typeof parsedContent.streamDensity === 'number' && Number.isFinite(parsedContent.streamDensity)
        ? clampDensity(parsedContent.streamDensity)
        : baseState.content.streamDensity;

    const nextContent: ContentSettings = {
      autoAdvanceEnabled:
        typeof parsedContent.autoAdvanceEnabled === 'boolean'
          ? parsedContent.autoAdvanceEnabled
          : baseState.content.autoAdvanceEnabled,
      autoAdvanceInterval: parsedInterval,
      streamDensity: parsedStreamDensity,
      inclusiveLanguage:
        typeof parsedContent.inclusiveLanguage === 'boolean'
          ? parsedContent.inclusiveLanguage
          : baseState.content.inclusiveLanguage,
    };

    const parsedHarmony =
      typeof parsedAppearance.colorHarmonyPreset === 'string' ? parsedAppearance.colorHarmonyPreset : undefined;
    const harmonyKey = parsedHarmony && AURA_LOOKUP.has(parsedHarmony)
      ? parsedHarmony
      : baseState.appearance.colorHarmonyPreset;

    const parsedAccessibility =
      parsedAppearance.accessibilityMode === 'contrast' || parsedAppearance.accessibilityMode === 'calm'
        ? parsedAppearance.accessibilityMode
        : 'standard';

    const nextAppearance: AppearanceSettings = {
      colorHarmonyPreset: harmonyKey,
      themePreset:
        typeof parsedAppearance.themePreset === 'string'
          ? parsedAppearance.themePreset
          : baseState.appearance.themePreset,
      vibrancy:
        typeof parsedAppearance.vibrancy === 'number' && Number.isFinite(parsedAppearance.vibrancy)
          ? clampPercent(parsedAppearance.vibrancy)
          : baseState.appearance.vibrancy,
      warmth:
        typeof parsedAppearance.warmth === 'number' && Number.isFinite(parsedAppearance.warmth)
          ? clampPercent(parsedAppearance.warmth)
          : baseState.appearance.warmth,
      accessibilityMode: parsedAccessibility,
      mouseGlowIntensity:
        typeof parsedAppearance.mouseGlowIntensity === 'number' && Number.isFinite(parsedAppearance.mouseGlowIntensity)
          ? clampPercent(parsedAppearance.mouseGlowIntensity)
          : baseState.appearance.mouseGlowIntensity,
    };

    const nextAudio: AudioSettings = {
      chimePreset:
        parsedAudio.chimePreset === 'bright' || parsedAudio.chimePreset === 'mute'
          ? parsedAudio.chimePreset
          : baseState.audio.chimePreset,
      chimeVolume:
        typeof parsedAudio.chimeVolume === 'number' && Number.isFinite(parsedAudio.chimeVolume)
          ? clampPercent(parsedAudio.chimeVolume)
          : baseState.audio.chimeVolume,
      voiceStyle:
        parsedAudio.voiceStyle === 'storyteller'
          ? parsedAudio.voiceStyle
          : baseState.audio.voiceStyle,
      voiceWarmth:
        typeof parsedAudio.voiceWarmth === 'number' && Number.isFinite(parsedAudio.voiceWarmth)
          ? clampPercent(parsedAudio.voiceWarmth)
          : baseState.audio.voiceWarmth,
    };

    const presetKey =
      typeof parsedMatrix.preset === 'string' && MATRIX_PRESET_LOOKUP.has(parsedMatrix.preset)
        ? parsedMatrix.preset
        : baseState.matrix.preset;
    const preset = MATRIX_PRESET_LOOKUP.get(presetKey) ?? DEFAULT_MATRIX_PRESET;

    const nextMatrix: MatrixConfig = {
      ...baseState.matrix,
      ...parsedMatrix,
      preset: preset.key,
      palette: Array.isArray(parsedMatrix.palette) && parsedMatrix.palette.length > 0
        ? [...parsedMatrix.palette]
        : [...preset.palette],
      characters: Array.isArray(parsedMatrix.characters) && parsedMatrix.characters.length > 0
        ? [...parsedMatrix.characters]
        : [...preset.characters],
      density:
        typeof parsedMatrix.density === 'number' && Number.isFinite(parsedMatrix.density)
          ? clampDensity(parsedMatrix.density)
          : clampDensity(nextContent.streamDensity),
      speed:
        typeof parsedMatrix.speed === 'number' && Number.isFinite(parsedMatrix.speed)
          ? clampSpeed(parsedMatrix.speed)
          : baseState.matrix.speed,
      visibility:
        typeof parsedMatrix.visibility === 'number' && Number.isFinite(parsedMatrix.visibility)
          ? clampFraction(parsedMatrix.visibility)
          : baseState.matrix.visibility,
      intensity:
        typeof parsedMatrix.intensity === 'number' && Number.isFinite(parsedMatrix.intensity)
          ? clampFraction(parsedMatrix.intensity)
          : baseState.matrix.intensity,
      blendMode:
        parsedMatrix.blendMode === 'lighten' || parsedMatrix.blendMode === 'difference'
          ? parsedMatrix.blendMode
          : 'screen',
      renderMode:
        parsedMatrix.renderMode === RenderMode.Minimal ? RenderMode.Minimal : RenderMode.Canvas,
      reducedMotion:
        typeof parsedMatrix.reducedMotion === 'boolean'
          ? parsedMatrix.reducedMotion
          : baseState.matrix.reducedMotion,
    };

    const nextAura: AuraSettings = {
      colorKey: harmonyKey,
      size:
        typeof parsedAura.size === 'number' && Number.isFinite(parsedAura.size)
          ? clamp(parsedAura.size, AURA_SIZE_MIN, AURA_SIZE_MAX)
          : baseState.aura.size,
      intensity:
        typeof parsedAura.intensity === 'number' && Number.isFinite(parsedAura.intensity)
          ? clampPercent(parsedAura.intensity)
          : baseState.aura.intensity,
    };

    return {
      general: nextGeneral,
      matrix: nextMatrix,
      aura: nextAura,
      appearance: nextAppearance,
      audio: nextAudio,
      content: nextContent,
    };
  } catch (error) {
    console.warn('[settings] failed to load persisted settings', error);
    return baseState;
  }
}

const store = writable<AppSettingsState>(resolveInitialState());

if (typeof window !== 'undefined') {
  store.subscribe((value) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      if (typeof document !== 'undefined') {
        document.body.dataset.accessibilityMode = value.appearance.accessibilityMode;
      }
    } catch (error) {
      console.warn('[settings] failed to persist settings', error);
    }
  });
}

export const settings = {
  subscribe: store.subscribe,
};

export function setMatrixEnabled(enabled: boolean): void {
  store.update((state) => ({
    ...state,
    general: { ...state.general, matrixEnabled: enabled },
  }));
}

export function toggleMatrixEnabled(): void {
  store.update((state) => ({
    ...state,
    general: { ...state.general, matrixEnabled: !state.general.matrixEnabled },
  }));
}

export function setBeepEnabled(enabled: boolean): void {
  store.update((state) => ({
    ...state,
    general: { ...state.general, beepEnabled: enabled },
  }));
}

export function toggleBeepEnabled(): void {
  store.update((state) => ({
    ...state,
    general: { ...state.general, beepEnabled: !state.general.beepEnabled },
  }));
}

export function setSpeechEnabled(enabled: boolean): void {
  store.update((state) => ({
    ...state,
    general: { ...state.general, speechEnabled: enabled },
  }));
}

export function setAutoAdvanceEnabled(enabled: boolean): void {
  store.update((state) => ({
    ...state,
    content: { ...state.content, autoAdvanceEnabled: enabled },
  }));
}

export function setAutoAdvanceInterval(seconds: number): void {
  if (!Number.isFinite(seconds)) {
    return;
  }

  const clamped = clamp(seconds, AUTO_ADVANCE_INTERVAL_MIN, AUTO_ADVANCE_INTERVAL_MAX);

  store.update((state) => {
    if (state.content.autoAdvanceInterval === clamped) {
      return state;
    }

    return {
      ...state,
      content: { ...state.content, autoAdvanceInterval: clamped },
    };
  });
}

export function updateContentSettings(patch: Partial<ContentSettings>): void {
  store.update((state) => {
    const nextStream =
      patch.streamDensity !== undefined && Number.isFinite(patch.streamDensity)
        ? clampDensity(patch.streamDensity)
        : state.content.streamDensity;

    const nextContent: ContentSettings = {
      ...state.content,
      ...patch,
      streamDensity: nextStream,
    };

    return {
      ...state,
      content: nextContent,
      matrix: { ...state.matrix, density: nextStream },
    };
  });
}

export function updateMatrixConfig(patch: Partial<MatrixConfig>): void {
  store.update((state) => {
    const nextDensity =
      patch.density !== undefined && Number.isFinite(patch.density)
        ? clampDensity(patch.density)
        : state.matrix.density;
    const nextSpeed =
      patch.speed !== undefined && Number.isFinite(patch.speed) ? clampSpeed(patch.speed) : state.matrix.speed;
    const nextVisibility =
      patch.visibility !== undefined && Number.isFinite(patch.visibility)
        ? clampFraction(patch.visibility)
        : state.matrix.visibility;
    const nextIntensity =
      patch.intensity !== undefined && Number.isFinite(patch.intensity)
        ? clampFraction(patch.intensity)
        : state.matrix.intensity;
    const nextBlend: MatrixBlendMode =
      patch.blendMode === 'lighten' || patch.blendMode === 'difference' ? patch.blendMode : state.matrix.blendMode;
    const nextRenderMode =
      patch.renderMode === RenderMode.Minimal
        ? RenderMode.Minimal
        : patch.renderMode === RenderMode.Canvas
        ? RenderMode.Canvas
        : state.matrix.renderMode;
    const nextReducedMotion =
      typeof patch.reducedMotion === 'boolean' ? patch.reducedMotion : state.matrix.reducedMotion;

    let nextPresetKey = state.matrix.preset;
    let nextPalette = [...state.matrix.palette];
    let nextCharacters = [...state.matrix.characters];

    if (patch.preset && MATRIX_PRESET_LOOKUP.has(patch.preset)) {
      const preset = MATRIX_PRESET_LOOKUP.get(patch.preset) ?? DEFAULT_MATRIX_PRESET;
      nextPresetKey = preset.key;
      nextPalette = [...preset.palette];
      nextCharacters = [...preset.characters];
    } else {
      if (patch.palette && Array.isArray(patch.palette) && patch.palette.length > 0) {
        nextPalette = [...patch.palette];
      }
      if (patch.characters && Array.isArray(patch.characters) && patch.characters.length > 0) {
        nextCharacters = [...patch.characters];
      }
    }

    return {
      ...state,
      matrix: {
        ...state.matrix,
        density: nextDensity,
        speed: nextSpeed,
        visibility: nextVisibility,
        intensity: nextIntensity,
        blendMode: nextBlend,
        renderMode: nextRenderMode,
        reducedMotion: nextReducedMotion,
        preset: nextPresetKey,
        palette: nextPalette,
        characters: nextCharacters,
      },
      content: { ...state.content, streamDensity: nextDensity },
    };
  });
}

export function setMatrixPreset(key: string): void {
  updateMatrixConfig({ preset: key });
}

export function setAuraColor(colorKey: string): void {
  store.update((state) => {
    const nextKey = AURA_LOOKUP.has(colorKey) ? colorKey : state.aura.colorKey;
    if (state.aura.colorKey === nextKey && state.appearance.colorHarmonyPreset === nextKey) {
      return state;
    }

    return {
      ...state,
      aura: {
        ...state.aura,
        colorKey: nextKey,
      },
      appearance: {
        ...state.appearance,
        colorHarmonyPreset: nextKey,
      },
    };
  });
}

export function setAuraSize(size: number): void {
  if (!Number.isFinite(size)) {
    return;
  }

  const clamped = clamp(size, AURA_SIZE_MIN, AURA_SIZE_MAX);

  store.update((state) => {
    if (state.aura.size === clamped) {
      return state;
    }

    return {
      ...state,
      aura: {
        ...state.aura,
        size: clamped,
      },
    };
  });
}

export function setAuraIntensity(intensity: number): void {
  if (!Number.isFinite(intensity)) {
    return;
  }

  const clamped = clampPercent(intensity);

  store.update((state) => {
    if (state.aura.intensity === clamped) {
      return state;
    }

    return {
      ...state,
      aura: {
        ...state.aura,
        intensity: clamped,
      },
    };
  });
}

export function updateAppearanceSettings(patch: Partial<AppearanceSettings>): void {
  store.update((state) => {
    const nextHarmony =
      patch.colorHarmonyPreset && AURA_LOOKUP.has(patch.colorHarmonyPreset)
        ? patch.colorHarmonyPreset
        : state.appearance.colorHarmonyPreset;

    const nextAppearance: AppearanceSettings = {
      ...state.appearance,
      ...patch,
      colorHarmonyPreset: nextHarmony,
      vibrancy:
        patch.vibrancy !== undefined && Number.isFinite(patch.vibrancy)
          ? clampPercent(patch.vibrancy)
          : state.appearance.vibrancy,
      warmth:
        patch.warmth !== undefined && Number.isFinite(patch.warmth)
          ? clampPercent(patch.warmth)
          : state.appearance.warmth,
      mouseGlowIntensity:
        patch.mouseGlowIntensity !== undefined && Number.isFinite(patch.mouseGlowIntensity)
          ? clampPercent(patch.mouseGlowIntensity)
          : state.appearance.mouseGlowIntensity,
      accessibilityMode:
        patch.accessibilityMode === 'contrast' || patch.accessibilityMode === 'calm'
          ? patch.accessibilityMode
          : patch.accessibilityMode === 'standard'
          ? 'standard'
          : state.appearance.accessibilityMode,
    };

    return {
      ...state,
      appearance: nextAppearance,
      aura: {
        ...state.aura,
        colorKey: nextHarmony,
      },
    };
  });
}

export function updateAudioSettings(patch: Partial<AudioSettings>): void {
  store.update((state) => {
    const nextAudio: AudioSettings = {
      ...state.audio,
      ...patch,
      chimeVolume:
        patch.chimeVolume !== undefined && Number.isFinite(patch.chimeVolume)
          ? clampPercent(patch.chimeVolume)
          : state.audio.chimeVolume,
      voiceWarmth:
        patch.voiceWarmth !== undefined && Number.isFinite(patch.voiceWarmth)
          ? clampPercent(patch.voiceWarmth)
          : state.audio.voiceWarmth,
      chimePreset:
        patch.chimePreset === 'bright' || patch.chimePreset === 'mute'
          ? patch.chimePreset
          : patch.chimePreset === 'soft'
          ? 'soft'
          : state.audio.chimePreset,
      voiceStyle:
        patch.voiceStyle === 'storyteller' ? 'storyteller' : patch.voiceStyle === 'ambient' ? 'ambient' : state.audio.voiceStyle,
    };

    return {
      ...state,
      audio: nextAudio,
    };
  });
}

export function setThemePreset(key: string): void {
  const theme = setThemeByKey(key);
  if (!theme) {
    return;
  }

  store.update((state) => ({
    ...state,
    appearance: {
      ...state.appearance,
      themePreset: theme.key,
    },
  }));
}

export function setAccessibilityMode(mode: AccessibilityMode): void {
  updateAppearanceSettings({ accessibilityMode: mode });
}

export const __testing__ = { resolveInitialState };
