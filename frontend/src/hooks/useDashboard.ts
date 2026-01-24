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
const APPOINTMENTS_KEY = 'dashboard_appointments';

// ================== Helper Functions ==================

function getRelativeTime(timestamp: string): string {
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

function getStoredAppointments(): Appointment[] {
    const stored = localStorage.getItem(APPOINTMENTS_KEY);
    if (stored) return JSON.parse(stored);
    
    // In demo mode, return rich demo data
    if (isDemoMode()) {
        localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(DEMO_APPOINTMENTS));
        return DEMO_APPOINTMENTS;
    }

    const today = new Date().toISOString().split('T')[0];
    const defaults: Appointment[] = [
        { id: '1', patient: 'Ahmed Al-Rashid', time: '09:30 AM', type: 'Follow-up', status: 'confirmed', date: today },
        { id: '2', patient: 'Sarah Johnson', time: '11:00 AM', type: 'New Patient', status: 'pending', date: today },
        { id: '3', patient: 'Mohammed Hassan', time: '02:30 PM', type: 'Lab Review', status: 'confirmed', date: today },
    ];
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(defaults));
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
    const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments);

    const addAppointment = useCallback((apt: Omit<Appointment, 'id'>) => {
        const newApt: Appointment = { ...apt, id: Date.now().toString() };
        setAppointments(prev => {
            const updated = [...prev, newApt];
            localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const updateStatus = useCallback((id: string, status: Appointment['status']) => {
        setAppointments(prev => {
            const updated = prev.map(a => a.id === id ? { ...a, status } : a);
            localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const removeAppointment = useCallback((id: string) => {
        setAppointments(prev => {
            const updated = prev.filter(a => a.id !== id);
            localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const todayAppointments = useMemo(() => 
        appointments.filter(a => a.date === new Date().toISOString().split('T')[0]),
    [appointments]);

    return { appointments, todayAppointments, addAppointment, updateStatus, removeAppointment };
}

// ================== Dashboard Stats Hook ==================

// ================== Dashboard Stats Hook ==================

export function useDashboardStats() {
    // In demo mode, bypass API call
    const isDemo = isDemoMode();
    
    const { data: historyData, isLoading } = useQuery<HistoryEntry[]>({
        queryKey: ['history'],
        queryFn: () => isDemo ? Promise.resolve(DEMO_HISTORY) : api.getHistory() as Promise<HistoryEntry[]>,
        staleTime: 30000,
        // Don't refetch in demo mode
        enabled: !isDemo,
    });

    const history = isDemo ? DEMO_HISTORY : historyData;

    const stats = useMemo(() => {
         if (isDemo) return DEMO_STATS;
         
         return {
            totalAnalyses: history?.length || 0,
            pendingReview: 8,
            modelAccuracy: 98.2,
            systemLoad: 24,
        };
    }, [history?.length, isDemo]);

    const diagnosisBreakdown = useMemo((): DiagnosisStats[] => {
        if (isDemo) return DEMO_DIAGNOSIS_STATS;

        const total = history?.length || 100;
        return [
            { type: 'Cardiology', count: Math.floor(total * 0.35), percentage: 35, color: 'bg-rose-500' },
            { type: 'Radiology', count: Math.floor(total * 0.27), percentage: 27, color: 'bg-blue-500' },
            { type: 'Pathology', count: Math.floor(total * 0.22), percentage: 22, color: 'bg-amber-500' },
            { type: 'Others', count: Math.floor(total * 0.16), percentage: 16, color: 'bg-gray-400' },
        ];
    }, [history?.length, isDemo]);

    const recentPatients = useMemo((): RecentPatient[] => {
        if (isDemo) return DEMO_RECENT_PATIENTS;

        const conditions: RecentPatient['condition'][] = ['Stable', 'Monitoring', 'Improving', 'Critical'];
        return (history || []).slice(0, 4).map((entry, i) => ({
            id: String(i + 1),
            name: entry.details?.patient_id ? `Patient #${entry.details.patient_id}` : `Patient ${i + 1}`,
            lastVisit: getRelativeTime(entry.timestamp),
            condition: conditions[i % 4],
            avatar: `P${i + 1}`,
            patientId: entry.details?.patient_id,
        }));
    }, [history, isDemo]);

    return { stats, diagnosisBreakdown, recentPatients, isLoading, history };
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
