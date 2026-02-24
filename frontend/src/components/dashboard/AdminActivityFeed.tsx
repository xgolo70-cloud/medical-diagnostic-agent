import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Activity, 
    FileText, 
    LogIn, 
    Upload, 
    UserPlus, 
    Settings,
    ChevronRight,
    Filter,
    Loader2,
    Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services';

interface ActivityEntry {
    id: string;
    action: string;
    user: string;
    userRole: string;
    timestamp: string;
    details?: string;
    type: 'diagnosis' | 'login' | 'upload' | 'registration' | 'settings' | 'other';
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
    diagnosis: <Activity size={14} className="text-blue-600" />,
    login: <LogIn size={14} className="text-green-600" />,
    upload: <Upload size={14} className="text-purple-600" />,
    registration: <UserPlus size={14} className="text-amber-600" />,
    settings: <Settings size={14} className="text-gray-600" />,
    other: <FileText size={14} className="text-gray-500" />,
};

const ACTION_COLORS: Record<string, string> = {
    diagnosis: 'bg-blue-50 border-blue-100',
    login: 'bg-green-50 border-green-100',
    upload: 'bg-purple-50 border-purple-100',
    registration: 'bg-amber-50 border-amber-100',
    settings: 'bg-gray-50 border-gray-100',
    other: 'bg-gray-50 border-gray-100',
};

const FILTER_OPTIONS = [
    { value: '', label: 'All Activity' },
    { value: 'diagnosis', label: 'Diagnoses' },
    { value: 'login', label: 'Logins' },
    { value: 'upload', label: 'Uploads' },
    { value: 'registration', label: 'Registrations' },
];

export const AdminActivityFeed: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('');

    const { data: activities, isLoading } = useQuery<ActivityEntry[]>({
        queryKey: ['admin-activity-feed'],
        queryFn: async () => {
            const history = await api.getHistory() as { id?: string; action: string; user_id: string; timestamp: string; details?: { patient_id?: string } }[];
            return history.slice(0, 10).map((entry, idx) => ({
                id: entry.id || String(idx),
                action: entry.action,
                user: entry.user_id,
                userRole: 'user',
                timestamp: entry.timestamp,
                details: entry.details?.patient_id ? `Patient #${entry.details.patient_id}` : undefined,
                type: entry.action.includes('diagnosis') ? 'diagnosis' as const : 
                      entry.action.includes('upload') ? 'upload' as const : 'other' as const,
            }));
        },
        staleTime: 15000,
    });

    const filteredActivities = (activities || []).filter(
        a => !filter || a.type === filter
    );

    const getRelativeTime = useCallback((timestamp: string) => {
        const now = new Date().getTime();
        const time = new Date(timestamp).getTime();
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return new Date(timestamp).toLocaleDateString();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <Activity size={16} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">System Activity</h3>
                </div>
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Activity size={16} className="text-green-500" />
                    </motion.div>
                    <h3 className="text-sm font-semibold text-gray-900">System Activity</h3>
                    <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded">LIVE</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Filter size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-6 pr-3 py-1 text-xs bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5"
                        >
                            {FILTER_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={() => navigate('/history')}
                        className="text-xs font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                    >
                        View all <ChevronRight size={12} />
                    </button>
                </div>
            </div>

            {/* Activity Feed */}
            <div className="max-h-[360px] overflow-auto">
                <AnimatePresence mode="popLayout">
                    {filteredActivities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Activity size={24} className="mb-2 opacity-30" />
                            <p className="text-sm">No activity found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredActivities.map((activity, idx) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg border ${ACTION_COLORS[activity.type]}`}>
                                            {ACTION_ICONS[activity.type]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-medium text-gray-900">{activity.action}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="font-medium">{activity.user}</span>
                                                {activity.details && (
                                                    <>
                                                        <span className="text-gray-300">•</span>
                                                        <span>{activity.details}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono shrink-0">
                                            <Clock size={10} />
                                            {getRelativeTime(activity.timestamp)}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default AdminActivityFeed;
