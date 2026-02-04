import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services';
import { 
    DEMO_NOTIFICATIONS, 
    DEMO_APPOINTMENTS, 
    DEMO_RECENT_PATIENTS, 
    DEMO_DIAGNOSIS_STATS, 
    DEMO_STATS,
    DEMO_HISTORY,
    isDemoMode 
} from '../data/demoData';
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

// Helper function - exported for potential use in other components
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
    
    // In demo mode, return rich demo data
    if (isDemoMode()) {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(DEMO_NOTIFICATIONS));
        return DEMO_NOTIFICATIONS;
    }
    
    // Default fallback
    const defaults: Notification[] = [
        { id: '1', title: 'Critical Result', message: 'Patient requires immediate attention', time: '5m ago', type: 'urgent', read: false, createdAt: Date.now() - 300000 },
        { id: '2', title: 'Report Ready', message: 'Lab results available for review', time: '1h ago', type: 'info', read: false, createdAt: Date.now() - 3600000 },
        { id: '3', title: 'System Update', message: 'MedGemma model updated to v1.5.2', time: '3h ago', type: 'success', read: false, createdAt: Date.now() - 10800000 },
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

// ================== Appointments Hook ==================

export function useAppointments() {
    const isDemo = isDemoMode();

    const { data: appointmentsData } = useQuery({
        queryKey: ['appointments'],
        queryFn: () => isDemo ? Promise.resolve(DEMO_APPOINTMENTS) : api.getAppointments(),
        staleTime: 60000,
    });

    const [localAppointments, setLocalAppointments] = useState<Appointment[]>([]);

    // Merge server data with local state if needed, or just use server data
    const appointments = useMemo(() => {
        return appointmentsData || localAppointments;
    }, [appointmentsData, localAppointments]);

    const addAppointment = useCallback((apt: Omit<Appointment, 'id'>) => {
        // For now, just update local state to reflect UI changes immediately
        // In a full implementation, this should call an API
        const newApt: Appointment = { ...apt, id: Date.now().toString() };
        setLocalAppointments(prev => [...prev, newApt]);
    }, []);

    const updateStatus = useCallback((id: string, status: Appointment['status']) => {
        // Mock update
         setLocalAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    }, []);

    const removeAppointment = useCallback((id: string) => {
        setLocalAppointments(prev => prev.filter(a => a.id !== id));
    }, []);

    const todayAppointments = useMemo(() => 
        (appointments || []).filter((a: Appointment) => a.date === new Date().toISOString().split('T')[0]),
    [appointments]);

    return { appointments: appointments || [], todayAppointments, addAppointment, updateStatus, removeAppointment };
}

// ================== Dashboard Stats Hook ==================

export function useDashboardStats() {
    // In demo mode, bypass API call
    const isDemo = isDemoMode();
    
    // Fetch stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => isDemo ? Promise.resolve({ stats: DEMO_STATS, diagnosisBreakdown: DEMO_DIAGNOSIS_STATS }) : api.getDashboardStats(),
        staleTime: 30000,
    });

    // Fetch recent patients
    const { data: patientsData, isLoading: patientsLoading } = useQuery({
        queryKey: ['recent-patients'],
        queryFn: () => isDemo ? Promise.resolve(DEMO_RECENT_PATIENTS) : api.getRecentPatients(),
        staleTime: 30000,
    });

    const { data: historyData, isLoading: historyLoading } = useQuery<HistoryEntry[]>({
        queryKey: ['history'],
        queryFn: () => isDemo ? Promise.resolve(DEMO_HISTORY) : api.getHistory() as Promise<HistoryEntry[]>,
        staleTime: 30000,
    });

    const stats = useMemo(() => {
         if (statsData?.stats) return statsData.stats;
         return DEMO_STATS;
    }, [statsData]);

    const diagnosisBreakdown = useMemo(() => {
        if (statsData?.diagnosisBreakdown) return statsData.diagnosisBreakdown;
        return DEMO_DIAGNOSIS_STATS;
    }, [statsData]);

    const recentPatients = useMemo(() => {
        if (patientsData) return patientsData;
        return DEMO_RECENT_PATIENTS;
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
