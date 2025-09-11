import { MatrixConfig, DEFAULTS } from '../features/matrix/config';

interface State {
  matrix: MatrixConfig;
}

const state: State = {
  matrix: DEFAULTS,
};

export const store = {
  get<K extends keyof State>(key: K): State[K] {
    return state[key];
  },
  set<K extends keyof State>(key: K, value: State[K]): void {
    state[key] = value;
  },
};

export type Store = typeof store;
