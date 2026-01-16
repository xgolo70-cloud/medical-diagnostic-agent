import { describe, it, expect, vi, beforeEach } from 'vitest';
import settingsReducer, {
    setDisplayName,
    setEmail,
    setAvatar,
    setTheme,
    setAccentColor,
    setCompactView,
    setEmailNotifications,
    setPushNotifications,
    setWeeklyReport,
    setAnalyticsEnabled,
    updateSettings,
    resetSettings,
} from './settingsSlice';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('settingsSlice', () => {
    const defaultState = {
        displayName: '',
        email: '',
        avatar: null,
        theme: 'light' as const,
        accentColor: '#000000',
        compactView: false,
        emailNotifications: true,
        pushNotifications: true,
        weeklyReport: false,
        analyticsEnabled: true,
    };

    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should have correct default state', () => {
            const state = settingsReducer(undefined, { type: '@@INIT' });
            
            expect(state.theme).toBe('light');
            expect(state.accentColor).toBe('#000000');
            expect(state.compactView).toBe(false);
            expect(state.emailNotifications).toBe(true);
            expect(state.avatar).toBeNull();
        });
    });

    describe('Profile Actions', () => {
        it('should set display name', () => {
            const state = settingsReducer(defaultState, setDisplayName('Dr. Smith'));
            
            expect(state.displayName).toBe('Dr. Smith');
        });

        it('should set email', () => {
            const state = settingsReducer(defaultState, setEmail('dr.smith@example.com'));
            
            expect(state.email).toBe('dr.smith@example.com');
        });

        it('should set avatar (Base64)', () => {
            const base64Image = 'data:image/png;base64,iVBORw0KGgo...';
            const state = settingsReducer(defaultState, setAvatar(base64Image));
            
            expect(state.avatar).toBe(base64Image);
        });

        it('should clear avatar when set to null', () => {
            const stateWithAvatar = { ...defaultState, avatar: 'data:image/png;base64,...' };
            const state = settingsReducer(stateWithAvatar, setAvatar(null));
            
            expect(state.avatar).toBeNull();
        });
    });

    describe('Appearance Actions', () => {
        it('should set theme to dark', () => {
            const state = settingsReducer(defaultState, setTheme('dark'));
            
            expect(state.theme).toBe('dark');
        });

        it('should set theme to system', () => {
            const state = settingsReducer(defaultState, setTheme('system'));
            
            expect(state.theme).toBe('system');
        });

        it('should set accent color', () => {
            const state = settingsReducer(defaultState, setAccentColor('#2563eb'));
            
            expect(state.accentColor).toBe('#2563eb');
        });

        it('should toggle compact view on', () => {
            const state = settingsReducer(defaultState, setCompactView(true));
            
            expect(state.compactView).toBe(true);
        });

        it('should toggle compact view off', () => {
            const stateWithCompact = { ...defaultState, compactView: true };
            const state = settingsReducer(stateWithCompact, setCompactView(false));
            
            expect(state.compactView).toBe(false);
        });
    });

    describe('Notification Actions', () => {
        it('should toggle email notifications', () => {
            const state = settingsReducer(defaultState, setEmailNotifications(false));
            
            expect(state.emailNotifications).toBe(false);
        });

        it('should toggle push notifications', () => {
            const state = settingsReducer(defaultState, setPushNotifications(false));
            
            expect(state.pushNotifications).toBe(false);
        });

        it('should toggle weekly report', () => {
            const state = settingsReducer(defaultState, setWeeklyReport(true));
            
            expect(state.weeklyReport).toBe(true);
        });
    });

    describe('Privacy Actions', () => {
        it('should toggle analytics enabled', () => {
            const state = settingsReducer(defaultState, setAnalyticsEnabled(false));
            
            expect(state.analyticsEnabled).toBe(false);
        });
    });

    describe('Bulk Operations', () => {
        it('should update multiple settings at once', () => {
            const state = settingsReducer(defaultState, updateSettings({
                displayName: 'Dr. Johnson',
                theme: 'dark',
                accentColor: '#7c3aed',
            }));
            
            expect(state.displayName).toBe('Dr. Johnson');
            expect(state.theme).toBe('dark');
            expect(state.accentColor).toBe('#7c3aed');
            // Other values should remain unchanged
            expect(state.compactView).toBe(false);
        });

        it('should reset all settings to defaults', () => {
            const customState = {
                ...defaultState,
                displayName: 'Custom Name',
                theme: 'dark' as const,
                accentColor: '#ff0000',
                compactView: true,
            };
            
            const state = settingsReducer(customState, resetSettings());
            
            expect(state.displayName).toBe('');
            expect(state.theme).toBe('light');
            expect(state.accentColor).toBe('#000000');
            expect(state.compactView).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should persist settings to localStorage on each action', () => {
            settingsReducer(defaultState, setDisplayName('Test User'));
            
            expect(localStorageMock.setItem).toHaveBeenCalled();
        });

        it('should persist theme change to localStorage', () => {
            settingsReducer(defaultState, setTheme('dark'));
            
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'app_settings',
                expect.any(String)
            );
        });
    });

    describe('State Transitions', () => {
        it('should handle full user customization flow', () => {
            let state = settingsReducer(undefined, { type: '@@INIT' });
            
            // User sets up profile
            state = settingsReducer(state, setDisplayName('Dr. Williams'));
            state = settingsReducer(state, setEmail('dr.williams@hospital.com'));
            
            // User customizes appearance
            state = settingsReducer(state, setTheme('dark'));
            state = settingsReducer(state, setAccentColor('#059669'));
            state = settingsReducer(state, setCompactView(true));
            
            // User adjusts notifications
            state = settingsReducer(state, setEmailNotifications(false));
            state = settingsReducer(state, setWeeklyReport(true));
            
            // Verify final state
            expect(state.displayName).toBe('Dr. Williams');
            expect(state.email).toBe('dr.williams@hospital.com');
            expect(state.theme).toBe('dark');
            expect(state.accentColor).toBe('#059669');
            expect(state.compactView).toBe(true);
            expect(state.emailNotifications).toBe(false);
            expect(state.weeklyReport).toBe(true);
        });
    });
});
