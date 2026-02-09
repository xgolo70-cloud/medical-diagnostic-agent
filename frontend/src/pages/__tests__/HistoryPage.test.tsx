import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HistoryPage } from '../HistoryPage';
import { api } from '../../services';

// Mock the API
vi.mock('../../services', () => ({
    api: {
        getHistory: vi.fn(),
    },
}));

// Mock ResizeObserver for GSAP/Charts
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('HistoryPage', () => {
    it('shows loading state initially', () => {
        // Mock a pending promise
        (api.getHistory as any).mockImplementation(() => new Promise(() => {}));
        
        render(<HistoryPage />, { wrapper: createWrapper() });
        
        expect(screen.getByText(/Retrieving audit logs/i)).toBeInTheDocument();
    });

    it('displays history data correctly', async () => {
        const mockHistory = [
            {
                timestamp: '2023-01-01T12:00:00Z',
                action: 'generate_diagnosis',
                user_id: 'dr_house',
                details: { patient_id: 'PT-123' }
            },
            {
                timestamp: '2023-01-02T14:30:00Z',
                action: 'generate_diagnosis_unified',
                user_id: 'dr_wilson',
                details: { filename: 'lab_report.pdf' }
            }
        ];

        (api.getHistory as any).mockResolvedValue(mockHistory);

        render(<HistoryPage />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText('dr_house')).toBeInTheDocument();
            expect(screen.getByText('PT-123')).toBeInTheDocument();
            expect(screen.getByText('dr_wilson')).toBeInTheDocument();
            expect(screen.getByText('lab_report.pdf')).toBeInTheDocument();
        });
    });

    it('filters history data by search', async () => {
        const mockHistory = [
            {
                timestamp: '2023-01-01T12:00:00Z',
                action: 'generate_diagnosis',
                user_id: 'dr_house',
                details: { patient_id: 'PT-123' }
            },
            {
                timestamp: '2023-01-02T14:30:00Z',
                action: 'generate_diagnosis_unified',
                user_id: 'dr_wilson',
                details: { filename: 'lab_report.pdf' }
            }
        ];

        (api.getHistory as any).mockResolvedValue(mockHistory);

        render(<HistoryPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('dr_house')).toBeInTheDocument());

        const searchInput = screen.getByPlaceholderText(/Search user/i);
        fireEvent.change(searchInput, { target: { value: 'wilson' } });

        expect(screen.queryByText('dr_house')).not.toBeInTheDocument();
        expect(screen.getByText('dr_wilson')).toBeInTheDocument();
    });
});
