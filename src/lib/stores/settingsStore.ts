import { writable } from 'svelte/store';

export interface SettingsState {
    soundEnabled: boolean;
    auraEnabled: boolean;
    matrixMode: boolean;
    currentView: 'quotes' | 'favorites';
}

const defaultSettings: SettingsState = {
    soundEnabled: true,
    auraEnabled: true,
    matrixMode: false,
    currentView: 'quotes'
};

const browser = typeof window !== 'undefined';
const STORAGE_KEY = 'vibeme:settings';

function initializeSettings(): SettingsState {
    if (!browser) return defaultSettings;
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as Partial<SettingsState>;
            return { ...defaultSettings, ...parsed };
        }
    } catch (error) {
        console.warn('Failed to parse stored settings.', error);
    }
    return defaultSettings;
}

export const settingsStore = writable<SettingsState>(initializeSettings());

if (browser) {
    settingsStore.subscribe((value) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        } catch (error) {
            console.warn('Unable to persist settings.', error);
        }
    });
}
