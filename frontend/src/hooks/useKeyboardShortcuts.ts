import { useEffect, useCallback } from 'react';

interface Shortcut {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    handler: () => void;
    description?: string;
}

interface UseKeyboardShortcutsOptions {
    enabled?: boolean;
}

export function useKeyboardShortcuts(
    shortcuts: Shortcut[],
    options: UseKeyboardShortcutsOptions = {}
) {
    const { enabled = true } = options;

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return;

            // Don't trigger shortcuts when typing in inputs
            const target = event.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            for (const shortcut of shortcuts) {
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
                const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
                const altMatch = shortcut.alt ? event.altKey : !event.altKey;

                // Handle Ctrl/Meta interchangeably for cross-platform
                const modifierMatch = shortcut.ctrl || shortcut.meta
                    ? (event.ctrlKey || event.metaKey)
                    : ctrlMatch && metaMatch;

                if (keyMatch && modifierMatch && shiftMatch && altMatch) {
                    event.preventDefault();
                    shortcut.handler();
                    break;
                }
            }
        },
        [shortcuts, enabled]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return shortcuts;
}

// Preset shortcuts for common actions
export function useNavigationShortcuts(navigate: (path: string) => void) {
    return useKeyboardShortcuts([
        { key: 'd', ctrl: true, handler: () => navigate('/dashboard'), description: 'Go to Dashboard' },
        { key: 'n', ctrl: true, handler: () => navigate('/diagnosis'), description: 'New Diagnosis' },
        { key: 'h', ctrl: true, handler: () => navigate('/history'), description: 'View History' },
        { key: ',', ctrl: true, handler: () => navigate('/settings'), description: 'Open Settings' },
    ]);
}

export default useKeyboardShortcuts;
