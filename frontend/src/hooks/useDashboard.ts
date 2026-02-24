import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services';

// ================== Types ==================

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'urgent' | 'info' | 'success' | 'warning';
    read: boolean;
    createdAt: number;
}

export interface Appointment {
    id: string;
    patient: string;
    time: string;
    type: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    date: string;
}

export interface RecentPatient {
    id: string;
    name: string;
    lastVisit: string;
    condition: 'Stable' | 'Monitoring' | 'Improving' | 'Critical';
    avatar: string;
    patientId?: string;
}

export interface DiagnosisStats {
    type: string;
    count: number;
    percentage: number;
    color: string;
}

export interface SystemHealth {
    apiLatency: number;
    memoryUsage: number;
    memoryMb: number;
    uptime: string;
    uptimeSeconds: number;
    status: string;
}

export interface WeeklyStats {
    days: Array<{ label: string; value: number; date: string }>;
    total: number;
    changePct: number;
}

interface HistoryEntry {
    timestamp: string;
    action: string;
    user_id: string;
    details: {
        patient_id?: string;
        filename?: string;
    };
}

// ================== Storage Keys ==================

const NOTIFICATIONS_KEY = 'dashboard_notifications';

// ================== Helper Functions ==================

export function getRelativeTime(timestamp: string): string {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
}

function getStoredNotifications(): Notification[] {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) return JSON.parse(stored);
    
    const defaults: Notification[] = [
        { id: '1', title: 'Welcome', message: 'Welcome to AI & Things Medical Diagnostics', time: 'Just now', type: 'info', read: false, createdAt: Date.now() },
    ];
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(defaults));
    return defaults;
}


// ================== Notifications Hook ==================

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>(getStoredNotifications);

    const addNotification = useCallback((notif: Omit<Notification, 'id' | 'createdAt'>) => {
        const newNotif: Notification = { ...notif, id: Date.now().toString(), createdAt: Date.now() };
        setNotifications(prev => {
            const updated = [newNotif, ...prev];
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearNotification = useCallback((id: string) => {
        setNotifications(prev => {
            const updated = prev.filter(n => n.id !== id);
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return { notifications, addNotification, markAsRead, markAllRead, clearNotification, unreadCount };
}

// ================== Appointments Hook ==================

export function useAppointments() {
    const queryClient = useQueryClient();

    const { data: appointmentsData } = useQuery({
        queryKey: ['appointments'],
        queryFn: () => api.getAppointments(),
        staleTime: 60000,
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            api.updateAppointmentStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });

    const appointments = useMemo(() => {
        return appointmentsData || [];
    }, [appointmentsData]);

    const updateStatus = useCallback((id: string, status: Appointment['status']) => {
        statusMutation.mutate({ id, status });
    }, [statusMutation]);

    const todayAppointments = useMemo(() => 
        (appointments || []).filter((a: Appointment) => a.date === new Date().toISOString().split('T')[0]),
    [appointments]);

    return { appointments, todayAppointments, updateStatus };
}

// ================== System Health Hook ==================

export function useSystemHealth() {
    const { data, isLoading } = useQuery<SystemHealth>({
        queryKey: ['system-health'],
        queryFn: () => api.getSystemHealth(),
        refetchInterval: 30000, // Poll every 30 seconds
        staleTime: 15000,
    });

    return {
        health: data ?? { apiLatency: 0, memoryUsage: 0, memoryMb: 0, uptime: '—', uptimeSeconds: 0, status: 'loading' },
        isLoading,
    };
}

// ================== Weekly Stats Hook ==================

export function useWeeklyStats() {
    const { data, isLoading } = useQuery<WeeklyStats>({
        queryKey: ['weekly-stats'],
        queryFn: () => api.getWeeklyStats(),
        staleTime: 60000,
    });

    return {
        weeklyStats: data ?? { days: [], total: 0, changePct: 0 },
        isLoading,
    };
}

// ================== Dashboard Stats Hook ==================

const EMPTY_STATS = {
    totalAnalyses: 0,
    pendingReview: 0,
    modelAccuracy: 0,
    systemLoad: 0,
    totalThisMonth: 0,
};

const EMPTY_DIAGNOSIS_BREAKDOWN: DiagnosisStats[] = [];

export function useDashboardStats() {
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => api.getDashboardStats(),
        staleTime: 30000,
    });

    const { data: patientsData, isLoading: patientsLoading } = useQuery({
        queryKey: ['recent-patients'],
        queryFn: () => api.getRecentPatients(),
        staleTime: 30000,
    });

    const { data: historyData, isLoading: historyLoading } = useQuery<HistoryEntry[]>({
        queryKey: ['history'],
        queryFn: () => api.getHistory() as Promise<HistoryEntry[]>,
        staleTime: 30000,
    });

    const stats = useMemo(() => {
         if (statsData?.stats) return statsData.stats;
         return EMPTY_STATS;
    }, [statsData]);

    const diagnosisBreakdown = useMemo(() => {
        if (statsData?.diagnosisBreakdown) return statsData.diagnosisBreakdown;
        return EMPTY_DIAGNOSIS_BREAKDOWN;
    }, [statsData]);

    const recentPatients = useMemo(() => {
        if (patientsData) return patientsData;
        return [];
    }, [patientsData]);

    return { 
        stats, 
        diagnosisBreakdown, 
        recentPatients, 
        isLoading: statsLoading || patientsLoading || historyLoading, 
        history: historyData 
    };
}

// ================== Search Hook ==================

export function useSearch(query: string) {
    const { data: history } = useQuery<HistoryEntry[]>({
        queryKey: ['history'],
        queryFn: () => api.getHistory() as Promise<HistoryEntry[]>,
        staleTime: 30000,
    });

    const results = useMemo(() => {
        if (!query.trim()) return [];
        const searchLower = query.toLowerCase();
        return (history || []).filter(entry => 
            entry.action?.toLowerCase().includes(searchLower) ||
            entry.details?.patient_id?.toLowerCase().includes(searchLower) ||
            entry.details?.filename?.toLowerCase().includes(searchLower)
        ).slice(0, 5);
    }, [query, history]);

    return { results };
}
