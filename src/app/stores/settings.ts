import { writable } from 'svelte/store';
import { DEFAULTS, type MatrixConfig } from '../../features/matrix/config';

export interface AppSettingsState {
  matrixEnabled: boolean;
  beepEnabled: boolean;
  matrix: MatrixConfig;
}

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

  const baseState: AppSettingsState = {
    matrixEnabled: true,
    beepEnabled: false,
    matrix: baseMatrix,
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

    return {
      matrixEnabled:
        typeof parsed.matrixEnabled === 'boolean' ? parsed.matrixEnabled : baseState.matrixEnabled,
      beepEnabled: typeof parsed.beepEnabled === 'boolean' ? parsed.beepEnabled : baseState.beepEnabled,
      matrix: {
        ...baseMatrix,
        ...(parsed.matrix && typeof parsed.matrix === 'object' ? parsed.matrix : {}),
      },
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

export function updateMatrixConfig(patch: Partial<MatrixConfig>): void {
  store.update((state) => ({
    ...state,
    matrix: {
      ...state.matrix,
      ...patch,
    },
  }));
}

export const __testing__ = { resolveInitialState };
