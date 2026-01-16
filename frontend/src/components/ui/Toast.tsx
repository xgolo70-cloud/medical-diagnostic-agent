import React from 'react';
import { Toaster } from 'sonner';

export const ToastProvider: React.FC = () => {
    return (
        <Toaster
            position="bottom-right"
            expand={false}
            richColors
            closeButton
            theme="dark"
            toastOptions={{
                style: {
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    color: '#f8fafc',
                    fontSize: '14px',
                },
                className: 'glass-panel',
                duration: 4000,
            }}
        />
    );
};

// Re-export toast function for convenience
export { toast } from 'sonner';

export default ToastProvider;
