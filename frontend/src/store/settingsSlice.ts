import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// ================== Types ==================

interface SettingsState {
    accentColor: string;
    compactView: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyReport: boolean;
    displayName: string;
    email: string;
}

// ================== Persistence ==================

const SETTINGS_STORAGE_KEY = 'app_settings';

const defaultSettings: SettingsState = {
    accentColor: '#000000',
    compactView: false,
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: false,
    displayName: '',
    email: '',
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
        setAccentColor: (state, action: PayloadAction<string>) => {
            state.accentColor = action.payload;
            saveSettingsToStorage(state);
        },
        setCompactView: (state, action: PayloadAction<boolean>) => {
            state.compactView = action.payload;
            saveSettingsToStorage(state);
        },
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
        setDisplayName: (state, action: PayloadAction<string>) => {
            state.displayName = action.payload;
            saveSettingsToStorage(state);
        },
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
            saveSettingsToStorage(state);
        },
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
    setAccentColor,
    setCompactView,
    setEmailNotifications,
    setPushNotifications,
    setWeeklyReport,
    setDisplayName,
    setEmail,
    updateSettings,
    resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
