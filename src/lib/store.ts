import { bus, EVENTS } from './bus';

// Ensure the global VibeMe state object exists
function ensureState(): Record<string, any> {
  const w = window as any;
  w.VibeMe = w.VibeMe || {};
  w.VibeMe.state = w.VibeMe.state || {};
  return w.VibeMe.state;
}

export function getState(): Record<string, any> {
  return ensureState();
}

export function patch(partial: Record<string, any>): Record<string, any> {
  const state = ensureState();
  Object.assign(state, partial);
  bus.emit(EVENTS.STATE_CHANGED, { patch: partial, state });
  return state;
}

export function set<T = any>(key: string, value: T): T {
  const state = ensureState();
  const oldValue = state[key];
  state[key] = value;
  bus.emit(EVENTS.STATE_CHANGED, { key, value, oldValue, state });
  return value;
}

export function toggle(key: string): boolean {
  const state = ensureState();
  const oldValue = !!state[key];
  const value = !oldValue;
  state[key] = value;
  bus.emit(EVENTS.STATE_CHANGED, { key, value, oldValue, state });
  return value;
}
