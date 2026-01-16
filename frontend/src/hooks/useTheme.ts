import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface UseThemeReturn {
    theme: Theme;
    resolvedTheme: 'dark' | 'light';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'app-theme';

export function useTheme(): UseThemeReturn {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'dark';
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
        return stored || 'dark';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

    // Resolve system theme
    const getSystemTheme = useCallback((): 'dark' | 'light' => {
        if (typeof window === 'undefined') return 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }, []);

    // Update resolved theme whenever theme or system preference changes
    useEffect(() => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        setResolvedTheme(resolved);

        // Apply to document
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
    }, [theme, getSystemTheme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => setResolvedTheme(getSystemTheme());

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme, getSystemTheme]);

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
