import { useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface UseThemeReturn {
    theme: Theme;
    resolvedTheme: 'dark' | 'light';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'app-theme';

// Helper to get system theme preference
const getSystemTheme = (): 'dark' | 'light' => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function useTheme(): UseThemeReturn {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'dark';
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
        return stored || 'dark';
    });

    const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(getSystemTheme);

    // Compute resolved theme without setState
    const resolvedTheme = useMemo((): 'dark' | 'light' => {
        return theme === 'system' ? systemTheme : theme;
    }, [theme, systemTheme]);

    // Apply theme to DOM (useLayoutEffect to avoid flash)
    useLayoutEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolvedTheme);
        document.documentElement.setAttribute('data-theme', resolvedTheme);
    }, [resolvedTheme]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }, [resolvedTheme, setTheme]);

    return {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
    };
}

export default useTheme;
