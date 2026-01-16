import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// ================== Types ==================

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
    // Profile
    displayName: string;
    email: string;
    avatar: string | null; // Base64 encoded image or URL
    
    // Appearance
    theme: ThemeMode;
    accentColor: string;
    compactView: boolean;
    
    // Notifications
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyReport: boolean;
    
    // Privacy
    analyticsEnabled: boolean;
}

// ================== Persistence ==================

const SETTINGS_STORAGE_KEY = 'app_settings';

const defaultSettings: SettingsState = {
    // Profile
    displayName: '',
    email: '',
    avatar: null,
    
    // Appearance
    theme: 'light',
    accentColor: '#000000',
    compactView: false,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: false,
    
    // Privacy
    analyticsEnabled: true,
};

const loadSettingsFromStorage = (): SettingsState => {
    try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...defaultSettings, ...parsed };
        }
    } catch {
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }
    return defaultSettings;
};

const saveSettingsToStorage = (settings: SettingsState): void => {
    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
        console.error('Failed to save settings to localStorage');
    }
};

// ================== Slice ==================

const initialState: SettingsState = loadSettingsFromStorage();

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        // Profile
        setDisplayName: (state, action: PayloadAction<string>) => {
            state.displayName = action.payload;
            saveSettingsToStorage(state);
        },
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
            saveSettingsToStorage(state);
        },
        setAvatar: (state, action: PayloadAction<string | null>) => {
            state.avatar = action.payload;
            saveSettingsToStorage(state);
        },
        
        // Appearance
        setTheme: (state, action: PayloadAction<ThemeMode>) => {
            state.theme = action.payload;
            saveSettingsToStorage(state);
        },
        setAccentColor: (state, action: PayloadAction<string>) => {
            state.accentColor = action.payload;
            saveSettingsToStorage(state);
        },
        setCompactView: (state, action: PayloadAction<boolean>) => {
            state.compactView = action.payload;
            saveSettingsToStorage(state);
        },
        
        // Notifications
        setEmailNotifications: (state, action: PayloadAction<boolean>) => {
            state.emailNotifications = action.payload;
            saveSettingsToStorage(state);
        },
        setPushNotifications: (state, action: PayloadAction<boolean>) => {
            state.pushNotifications = action.payload;
            saveSettingsToStorage(state);
        },
        setWeeklyReport: (state, action: PayloadAction<boolean>) => {
            state.weeklyReport = action.payload;
            saveSettingsToStorage(state);
        },
        
        // Privacy
        setAnalyticsEnabled: (state, action: PayloadAction<boolean>) => {
            state.analyticsEnabled = action.payload;
            saveSettingsToStorage(state);
        },
        
        // Bulk operations
        updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
            Object.assign(state, action.payload);
            saveSettingsToStorage(state);
        },
        resetSettings: (state) => {
            Object.assign(state, defaultSettings);
            saveSettingsToStorage(state);
        },
    },
});

export const {
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
} = settingsSlice.actions;

// Export types for use in components
export type { ThemeMode };

export default settingsSlice.reducer;

