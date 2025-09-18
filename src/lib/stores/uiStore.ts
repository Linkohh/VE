import { writable } from 'svelte/store';

type Panel = 'favorites' | 'settings' | null;

type ViewMode = 'quotes' | 'favorites';

export interface UIState {
    activePanel: Panel;
    viewMode: ViewMode;
}

const defaultState: UIState = {
    activePanel: null,
    viewMode: 'quotes'
};

export const uiState = writable<UIState>({ ...defaultState });

export function openPanel(panel: Panel): void {
    uiState.set({ activePanel: panel, viewMode: panel ? 'quotes' : defaultState.viewMode });
}

export function setViewMode(mode: ViewMode): void {
    uiState.update((state) => ({ ...state, viewMode: mode }));
}

export function togglePanel(panel: Exclude<Panel, null>): void {
    uiState.update((state) => ({
        ...state,
        activePanel: state.activePanel === panel ? null : panel
    }));
}

export function resetUI(): void {
    uiState.set({ ...defaultState });
}
