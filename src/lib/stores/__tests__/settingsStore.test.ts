import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// Import after mocking
import { settingsStore, type SettingsState } from '../settingsStore';

describe('Settings Store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    it('should initialize with default settings', () => {
        const settings = get(settingsStore);
        expect(settings).toEqual({
            soundEnabled: true,
            auraEnabled: true,
            matrixMode: false,
            currentView: 'quotes'
        });
    });

    it('should load settings from localStorage if available', () => {
        const savedSettings: SettingsState = {
            soundEnabled: false,
            auraEnabled: false,
            matrixMode: true,
            currentView: 'favorites'
        };

        localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

        // Re-import to trigger initialization
        vi.resetModules();
        import('../settingsStore').then(module => {
            const settings = get(module.settingsStore);
            expect(settings).toEqual(savedSettings);
        });
    });

    it('should persist settings to localStorage on change', () => {
        settingsStore.update(s => ({ ...s, soundEnabled: false }));

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'vibeme:settings',
            expect.stringContaining('"soundEnabled":false')
        );
    });

    it('should handle localStorage errors gracefully', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        localStorageMock.setItem.mockImplementation(() => {
            throw new Error('Storage quota exceeded');
        });

        settingsStore.update(s => ({ ...s, soundEnabled: false }));

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Unable to persist settings.',
            expect.any(Error)
        );

        consoleWarnSpy.mockRestore();
    });

    it('should sync settings across tabs via storage event', () => {
        const newSettings: SettingsState = {
            soundEnabled: false,
            auraEnabled: true,
            matrixMode: false,
            currentView: 'favorites'
        };

        const event = new StorageEvent('storage', {
            key: 'vibeme:settings',
            newValue: JSON.stringify(newSettings),
            storageArea: localStorageMock
        });

        window.dispatchEvent(event);

        // Allow time for event handler
        setTimeout(() => {
            const settings = get(settingsStore);
            expect(settings).toEqual(newSettings);
        }, 0);
    });

    it('should handle corrupted localStorage data gracefully', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        localStorageMock.getItem.mockReturnValue('not-valid-json');

        vi.resetModules();
        import('../settingsStore').then(module => {
            const settings = get(module.settingsStore);
            // Should fall back to default settings
            expect(settings.soundEnabled).toBe(true);
            expect(consoleWarnSpy).toHaveBeenCalled();
        });

        consoleWarnSpy.mockRestore();
    });
});