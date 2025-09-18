import { writable } from 'svelte/store';
import { DEFAULTS, type MatrixConfig } from '../../features/matrix/config';
import {
  AURA_LOOKUP,
  AURA_SIZE_MAX,
  AURA_SIZE_MIN,
  DEFAULT_AURA,
  DEFAULT_AURA_SETTINGS,
  type AuraSettings,
} from '../config/aura';

export interface AppSettingsState {
  matrixEnabled: boolean;
  beepEnabled: boolean;
  speechEnabled: boolean;
  autoAdvanceEnabled: boolean;
  autoAdvanceInterval: number;
  matrix: MatrixConfig;
  aura: AuraSettings;
}

const AUTO_ADVANCE_INTERVAL_MIN = 5;
const AUTO_ADVANCE_INTERVAL_MAX = 60;
const DEFAULT_AUTO_ADVANCE_INTERVAL = 8;

const STORAGE_KEY = 'vibeme:settings:v1';

function resolveReducedMotion(defaultValue: boolean): boolean {
  if (typeof window === 'undefined') return defaultValue;
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

function resolveInitialState(): AppSettingsState {
  const baseMatrix: MatrixConfig = {
    ...DEFAULTS,
    reducedMotion: resolveReducedMotion(DEFAULTS.reducedMotion),
  };

  const baseAura: AuraSettings = {
    ...DEFAULT_AURA_SETTINGS,
  };

  const baseState: AppSettingsState = {
    matrixEnabled: true,
    beepEnabled: false,
    speechEnabled: false,
    autoAdvanceEnabled: false,
    autoAdvanceInterval: DEFAULT_AUTO_ADVANCE_INTERVAL,
    matrix: baseMatrix,
    aura: baseAura,
  };

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

    const parsedAura =
      parsed.aura && typeof parsed.aura === 'object'
        ? (parsed.aura as Partial<AuraSettings>)
        : null;

    const persistedAuraKey =
      parsedAura && typeof parsedAura.colorKey === 'string' ? parsedAura.colorKey : baseAura.colorKey;
    const auraColorKey = AURA_LOOKUP.has(persistedAuraKey) ? persistedAuraKey : baseAura.colorKey;

    const persistedAuraSize =
      parsedAura && typeof parsedAura.size === 'number' && Number.isFinite(parsedAura.size)
        ? clamp(parsedAura.size, AURA_SIZE_MIN, AURA_SIZE_MAX)
        : baseAura.size;

    const persistedInterval =
      typeof parsed.autoAdvanceInterval === 'number' && Number.isFinite(parsed.autoAdvanceInterval)
        ? clamp(parsed.autoAdvanceInterval, AUTO_ADVANCE_INTERVAL_MIN, AUTO_ADVANCE_INTERVAL_MAX)
        : baseState.autoAdvanceInterval;

    return {
      matrixEnabled:
        typeof parsed.matrixEnabled === 'boolean' ? parsed.matrixEnabled : baseState.matrixEnabled,
      beepEnabled: typeof parsed.beepEnabled === 'boolean' ? parsed.beepEnabled : baseState.beepEnabled,
      speechEnabled:
        typeof parsed.speechEnabled === 'boolean' ? parsed.speechEnabled : baseState.speechEnabled,
      autoAdvanceEnabled:
        typeof parsed.autoAdvanceEnabled === 'boolean'
          ? parsed.autoAdvanceEnabled
          : baseState.autoAdvanceEnabled,
      autoAdvanceInterval: persistedInterval,
      matrix: {
        ...baseMatrix,
        ...(parsed.matrix && typeof parsed.matrix === 'object' ? parsed.matrix : {}),
      },
      aura: {
        colorKey: auraColorKey,
        size: persistedAuraSize,
      },
    };
  } catch (error) {
    console.warn('[settings] failed to load persisted settings', error);
    return baseState;
  }
}

const store = writable<AppSettingsState>(resolveInitialState());

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

if (typeof window !== 'undefined') {
  store.subscribe((value) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.warn('[settings] failed to persist settings', error);
    }
  });
}

export const settings = {
  subscribe: store.subscribe,
};

export function setMatrixEnabled(enabled: boolean): void {
  store.update((state) => ({ ...state, matrixEnabled: enabled }));
}

export function toggleMatrixEnabled(): void {
  store.update((state) => ({ ...state, matrixEnabled: !state.matrixEnabled }));
}

export function setBeepEnabled(enabled: boolean): void {
  store.update((state) => ({ ...state, beepEnabled: enabled }));
}

export function toggleBeepEnabled(): void {
  store.update((state) => ({ ...state, beepEnabled: !state.beepEnabled }));
}

export function setSpeechEnabled(enabled: boolean): void {
  store.update((state) => ({ ...state, speechEnabled: enabled }));
}

export function setAutoAdvanceEnabled(enabled: boolean): void {
  store.update((state) => ({ ...state, autoAdvanceEnabled: enabled }));
}

export function setAutoAdvanceInterval(seconds: number): void {
  if (!Number.isFinite(seconds)) {
    return;
  }

  const clamped = clamp(seconds, AUTO_ADVANCE_INTERVAL_MIN, AUTO_ADVANCE_INTERVAL_MAX);

  store.update((state) => {
    if (state.autoAdvanceInterval === clamped) {
      return state;
    }

    return {
      ...state,
      autoAdvanceInterval: clamped,
    };
  });
}

export function updateMatrixConfig(patch: Partial<MatrixConfig>): void {
  store.update((state) => ({
    ...state,
    matrix: {
      ...state.matrix,
      ...patch,
    },
  }));
}

export function setAuraColor(colorKey: string): void {
  store.update((state) => {
    const nextKey = AURA_LOOKUP.has(colorKey) ? colorKey : state.aura.colorKey ?? DEFAULT_AURA.key;
    if (state.aura.colorKey === nextKey) {
      return state;
    }

    return {
      ...state,
      aura: {
        ...state.aura,
        colorKey: nextKey,
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

export const __testing__ = { resolveInitialState };
