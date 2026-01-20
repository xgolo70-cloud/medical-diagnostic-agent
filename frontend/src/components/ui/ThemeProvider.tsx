import React, { useEffect, createContext, useContext, useMemo } from 'react';
import { useAppSelector } from '../../store/hooks';
import type { ThemeMode } from '../../store/settingsSlice';

// ================== Theme Context ==================

interface ThemeContextValue {
    theme: ThemeMode;
    resolvedTheme: 'light' | 'dark';
    accentColor: string;
    compactView: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    resolvedTheme: 'light',
    accentColor: '#000000',
    compactView: false,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeContext = () => useContext(ThemeContext);

// ================== Theme Provider ==================

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const { theme, accentColor, compactView } = useAppSelector((state) => state.settings);
    
    // Resolve system theme preference
    const resolvedTheme = useMemo(() => {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
    }, [theme]);
    
    // Apply theme class and CSS variables to document
    useEffect(() => {
        const root = document.documentElement;
        
        // Set theme mode
        root.setAttribute('data-theme', resolvedTheme);
        
        // Set accent color as CSS variable
        root.style.setProperty('--accent-color', accentColor);
        
        // Generate accent color variants (lighter/darker)
        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 0, g: 0, b: 0 };
        };
        
        const { r, g, b } = hexToRgb(accentColor);
        root.style.setProperty('--accent-color-rgb', `${r}, ${g}, ${b}`);
        root.style.setProperty('--accent-color-light', `rgba(${r}, ${g}, ${b}, 0.1)`);
        root.style.setProperty('--accent-color-medium', `rgba(${r}, ${g}, ${b}, 0.3)`);
        
        // Set compact view class
        if (compactView) {
            root.classList.add('compact-view');
        } else {
            root.classList.remove('compact-view');
        }
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                root.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [resolvedTheme, accentColor, compactView, theme]);
    
    const contextValue = useMemo(() => ({
        theme,
        resolvedTheme,
        accentColor,
        compactView,
    }), [theme, resolvedTheme, accentColor, compactView]);
    
    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
