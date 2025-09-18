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

// Track if the current update came from a storage event to prevent loops
let isExternalUpdate = false;

if (browser) {
    // Save to localStorage when settings change locally
    settingsStore.subscribe((value) => {
        if (isExternalUpdate) {
            isExternalUpdate = false;
            return;
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        } catch (error) {
            console.warn('Unable to persist settings.', error);
        }
    });

    // Listen for changes from other tabs/windows
    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
            try {
                const newSettings = JSON.parse(event.newValue) as SettingsState;
                isExternalUpdate = true;
                settingsStore.set(newSettings);
            } catch (error) {
                console.warn('Failed to sync settings from storage event.', error);
            }
        }
    });
}
