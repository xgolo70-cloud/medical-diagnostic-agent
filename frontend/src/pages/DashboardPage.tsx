import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import { Button } from '../components/ui/Button';
import { 
    RecentActivityTable,
    AnalyticsSummary 
} from '../components/dashboard';
import { useNotifications, useAppointments, useDashboardStats, useSearch, type DiagnosisStats } from '../hooks';
import {
    Stethoscope,
    TrendingUp,
    History,
    FileText,
    Activity,
    Upload,
    Cpu,
    AlertCircle,
    Plus,
    Settings,
    ChevronRight,
    Zap,
    Search,
    Calendar,
    Bell,
    Users,
    Brain,
    HeartPulse,
    Command,
    Filter,
    MoreHorizontal,
    ArrowUpRight,
    Mic
} from 'lucide-react';

// Quick actions config

const quickActions = [
    {
        title: 'New Analysis',
        description: 'Start a diagnostic session',
        icon: Stethoscope,
        path: '/diagnosis',
        badge: null,
    },
    {
        title: 'Upload Records',
        description: 'Import patient history/PDFs',
        icon: Upload,
        path: '/diagnosis',
        badge: null,
    },
    {
        title: 'Patient History',
        description: 'View past diagnosis logs',
        icon: History,
        path: '/history',
        badge: null,
    },
    {
        title: 'AI Assistant',
        description: 'Chat with MedGemma',
        icon: Brain,
        path: '/medai',
        badge: 'AI',
    },
];

// Keyboard shortcuts config
const keyboardShortcuts = [
    { keys: ['⌘', 'K'], action: 'Quick Search' },
    { keys: ['⌘', 'N'], action: 'New Analysis' },
    { keys: ['⌘', 'H'], action: 'History' },
];

export const DashboardPage: React.FC = () => {
    const user = useAppSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Use custom hooks for real data
    const { notifications, markAsRead, markAllRead, unreadCount } = useNotifications();
    const { todayAppointments, updateStatus } = useAppointments();
    const { diagnosisBreakdown, recentPatients, stats } = useDashboardStats();
    const { results: searchResults } = useSearch(searchQuery);

    // Computed stats data - now dynamic!
    const statsData = [
        { label: 'Total Analyses', value: stats.totalAnalyses.toLocaleString(), icon: Activity, trend: '+12%', color: 'emerald' },
        { label: 'Pending Review', value: String(stats.pendingReview), icon: FileText, trend: '2 urgent', color: 'amber' },
        { label: 'Model Accuracy', value: `${stats.modelAccuracy}%`, icon: TrendingUp, trend: '+0.4%', color: 'blue' },
        { label: 'System Load', value: `${stats.systemLoad}%`, icon: Cpu, trend: 'Optimal', color: 'purple' },
    ];

    // Handle keyboard shortcut for search
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
            }
            if (e.key === 'Escape') {
                setShowSearch(false);
                setShowNotifications(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Search Modal */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-start justify-center pt-[20vh]"
                        onClick={() => setShowSearch(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                                <Search size={20} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search patients, diagnoses, reports..."
                                    className="flex-1 text-lg outline-none bg-transparent placeholder:text-gray-400"
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <kbd className="px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded">ESC</kbd>
                            </div>
                            <div className="p-4">
                                {searchQuery.trim() && searchResults.length > 0 ? (
                                    <>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Search Results</p>
                                        <div className="space-y-1">
                                            {searchResults.map((result, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        navigate('/history');
                                                        setShowSearch(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                                                >
                                                    <FileText size={16} className="text-gray-400 group-hover:text-gray-600" />
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm text-gray-700 block truncate">{result.action}</span>
                                                        <span className="text-xs text-gray-400">
                                                            {result.details?.patient_id && `Patient: ${result.details.patient_id}`}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : searchQuery.trim() ? (
                                    <div className="text-center py-6">
                                        <Search size={24} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">No results found</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
                                        <div className="space-y-1">
                                            {[
                                                { icon: Stethoscope, label: 'New Diagnosis', shortcut: '⌘N' },
                                                { icon: Users, label: 'View Patients', shortcut: '⌘P' },
                                                { icon: FileText, label: 'Recent Reports', shortcut: '⌘R' },
                                            ].map((item) => (
                                                <button
                                                    key={item.label}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                                                >
                                                    <item.icon size={16} className="text-gray-400 group-hover:text-gray-600" />
                                                    <span className="flex-1 text-sm text-gray-700">{item.label}</span>
                                                    <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded">{item.shortcut}</kbd>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                         <motion.div 
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black flex items-center justify-center shadow-md shadow-black/20 cursor-pointer"
                            onClick={() => navigate('/diagnosis')}
                        >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </motion.div>
                        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
                            Dashboard
                        </h1>
                        <span className="text-gray-300 hidden sm:inline">/</span>
                        <span className="text-xs sm:text-sm text-gray-500 font-medium hidden sm:inline">Overview</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Search Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSearch(true)}
                            className="hidden md:flex items-center gap-2 h-9 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:border-gray-300 transition-all"
                        >
                            <Search size={14} />
                            <span>Search...</span>
                            <kbd className="ml-4 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded">⌘K</kbd>
                        </motion.button>

                        {/* Notifications */}
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative h-8 sm:h-9 w-8 sm:w-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                                <Bell size={15} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                            <h4 className="font-semibold text-sm text-gray-900">Notifications</h4>
                                            <button 
                                                onClick={() => markAllRead()}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                Mark all read
                                            </button>
                                        </div>
                                        <div className="max-h-80 overflow-auto">
                                            {notifications.map((notif) => (
                                                <div 
                                                    key={notif.id} 
                                                    onClick={() => markAsRead(notif.id)}
                                                    className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-2 ${
                                                            notif.type === 'urgent' ? 'bg-red-500' :
                                                            notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                                        }`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                                                            <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="px-4 py-2 border-t border-gray-100">
                                            <button className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-1">
                                                View all notifications
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => navigate('/settings')}
                                className="h-8 sm:h-9 px-3 sm:px-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-lg text-sm font-medium transition-all shadow-sm"
                            >
                                <Settings size={14} className="sm:w-[15px] sm:h-[15px]" />
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                                size="sm" 
                                variant="primary" 
                                onClick={() => navigate('/diagnosis')}
                                className="h-8 sm:h-9 px-3 sm:px-4 bg-black text-white hover:bg-gray-800 rounded-lg text-xs sm:text-sm font-medium gap-1.5 sm:gap-2 shadow-md shadow-gray-200 hover:shadow-lg transition-all"
                            >
                                <Plus size={14} className="sm:w-[15px] sm:h-[15px]" />
                                <span className="hidden sm:inline">New Analysis</span>
                                <span className="sm:hidden">New</span>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Welcome Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
                >
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
                            Welcome back, {user?.username}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Here's what's happening with your diagnostic platform today.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                       <motion.div 
                           whileHover={{ scale: 1.05 }}
                           className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm cursor-default"
                       >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-medium text-gray-600">All Systems Operational</span>
                        </motion.div>
                        <span className="text-xs text-gray-400 font-mono">v2.4.0</span>
                    </div>
                </motion.div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10" data-tour="stats-cards">
                    {statsData.map((stat, index) => (
                        <motion.div 
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
                            className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all duration-200 shadow-sm cursor-pointer"
                            onClick={() => navigate('/history')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <motion.div 
                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                    className="p-2 rounded-lg bg-gray-50 text-gray-500 group-hover:text-black group-hover:bg-gray-100 transition-colors"
                                >
                                    <stat.icon size={18} />
                                </motion.div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    stat.trend.includes('+') ? 'bg-green-50 text-green-700' : 
                                    stat.trend === 'Optimal' ? 'bg-blue-50 text-blue-700' :
                                    'bg-amber-50 text-amber-700'
                                }`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="text-3xl font-bold text-gray-900 tracking-tight mb-1 font-display"
                            >
                                {stat.value}
                            </motion.div>
                            <div className="text-sm font-medium text-gray-500">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid - 3 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column - 2 spans */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Recent Activity */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" data-tour="recent-activity">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-gray-400" />
                                    <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                        <Filter size={14} className="text-gray-400" />
                                    </button>
                                    <button 
                                        onClick={() => navigate('/history')}
                                        className="text-xs font-medium text-gray-500 hover:text-black hover:underline transition-colors flex items-center gap-1"
                                    >
                                        View all
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                            <div className="min-h-[300px]">
                                <RecentActivityTable />
                            </div>
                        </div>

                        {/* Two Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Analytics */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={16} className="text-gray-400" />
                                        <h3 className="text-sm font-semibold text-gray-900">Analytics Overview</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <AnalyticsSummary />
                                </div>
                            </div>

                            {/* Diagnosis Breakdown */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <div className="flex items-center gap-2">
                                        <HeartPulse size={16} className="text-gray-400" />
                                        <h3 className="text-sm font-semibold text-gray-900">Diagnosis Types</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="space-y-4">
                                        {diagnosisBreakdown.map((item: DiagnosisStats, index: number) => (
                                            <motion.div 
                                                key={item.type}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm font-medium text-gray-700">{item.type}</span>
                                                    <span className="text-xs text-gray-500">{item.count} ({item.percentage}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.percentage}%` }}
                                                        transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                                                        className={`${item.color} h-full rounded-full`}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Total: 702 this month</span>
                                        <button className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                                            Detailed Report <ArrowUpRight size={10} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Appointments */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    <h3 className="text-sm font-semibold text-gray-900">Today's Schedule</h3>
                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{todayAppointments.length} appointments</span>
                                </div>
                                <button className="text-xs font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1">
                                    View Calendar <ChevronRight size={12} />
                                </button>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {todayAppointments.map((apt, index) => (
                                    <motion.div 
                                        key={apt.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                                                {apt.patient.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{apt.patient}</p>
                                                <p className="text-xs text-gray-500">{apt.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">{apt.time}</p>
                                                <p className={`text-xs ${apt.status === 'confirmed' ? 'text-green-600' : 'text-amber-600'}`}>
                                                    {apt.status === 'confirmed' ? '✓ Confirmed' : '◯ Pending'}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => updateStatus(apt.id, apt.status === 'confirmed' ? 'pending' : 'confirmed')}
                                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <MoreHorizontal size={14} className="text-gray-400" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        
                        {/* Quick Actions */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" data-tour="quick-actions"
                        >
                             <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <Zap size={16} className="text-amber-400" />
                                </motion.div>
                                <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="p-3 space-y-1">
                                {quickActions.map((action, index) => (
                                    <motion.button
                                        key={action.title}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                                        whileHover={{ x: 4, backgroundColor: "rgba(0,0,0,0.02)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(action.path)}
                                        className="w-full flex items-center gap-4 p-3 rounded-lg border border-transparent hover:border-gray-200 transition-all text-left group"
                                    >
                                        <motion.div 
                                            whileHover={{ rotate: 10, scale: 1.1 }}
                                            className="p-2.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-black group-hover:shadow-sm transition-all"
                                        >
                                            <action.icon size={18} />
                                        </motion.div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900 group-hover:text-black">
                                                    {action.title}
                                                </span>
                                                {action.badge && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-bold">
                                                        {action.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 line-clamp-1">
                                                {action.description}
                                            </div>
                                        </div>
                                        <motion.div 
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 group-hover:text-black"
                                            whileHover={{ x: 3 }}
                                        >
                                            <ChevronRight size={14} />
                                        </motion.div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Recent Patients */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                        >
                             <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-gray-400" />
                                    <h3 className="text-sm font-semibold text-gray-900">Recent Patients</h3>
                                </div>
                                <button className="text-xs font-medium text-gray-500 hover:text-black transition-colors">
                                    View all
                                </button>
                            </div>
                            <div className="p-3 space-y-1">
                                {recentPatients.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Users size={20} className="text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">No recent patients</p>
                                        <p className="text-xs text-gray-400 mt-1">Patient records will appear here</p>
                                    </div>
                                ) : (
                                    recentPatients.map((patient, index) => (
                                        <motion.div
                                            key={patient.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                                        >
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                                patient.condition === 'Critical' ? 'bg-red-500' :
                                                patient.condition === 'Monitoring' ? 'bg-amber-500' :
                                                patient.condition === 'Improving' ? 'bg-blue-500' : 'bg-green-500'
                                            }`}>
                                                {patient.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{patient.name}</p>
                                                <p className="text-xs text-gray-500">{patient.lastVisit}</p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                patient.condition === 'Critical' ? 'bg-red-50 text-red-700' :
                                                patient.condition === 'Monitoring' ? 'bg-amber-50 text-amber-700' :
                                                patient.condition === 'Improving' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                                            }`}>
                                                {patient.condition}
                                            </span>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* System Status */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                        >
                             <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                >
                                    <Cpu size={16} className="text-gray-400" />
                                </motion.div>
                                <h3 className="text-sm font-semibold text-gray-900">System Capacity</h3>
                            </div>
                            <div className="p-5 space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-black" />
                                            <span className="text-xs font-medium text-gray-700">GPU VRAM Usage</span>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500">52%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: "52%" }}
                                            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                                            className="bg-linear-to-r from-gray-800 to-black h-full rounded-full shadow-sm" 
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <span className="text-xs font-medium text-gray-700">API Latency</span>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500">42ms</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: "15%" }}
                                            transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                                            className="bg-linear-to-r from-green-400 to-green-500 h-full rounded-full shadow-sm" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-xs font-medium text-gray-700">Memory Usage</span>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500">68%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: "68%" }}
                                            transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
                                            className="bg-linear-to-r from-blue-400 to-blue-500 h-full rounded-full shadow-sm" 
                                        />
                                    </div>
                                </div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="pt-4 border-t border-gray-100"
                                >
                                    <div className="flex gap-3 items-start p-3 bg-amber-50/50 border border-amber-100/50 rounded-lg">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                        </motion.div>
                                        <div className="text-xs">
                                            <p className="font-semibold text-amber-900 mb-0.5">Scheduled Maintenance</p>
                                            <p className="text-amber-700/80">Tonight, 02:00 AM UTC</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Keyboard Shortcuts */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                                <Command size={14} className="text-gray-500" />
                                <h3 className="text-sm font-semibold text-gray-900">Keyboard Shortcuts</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                {keyboardShortcuts.map((shortcut) => (
                                    <div key={shortcut.action} className="flex items-center justify-between group cursor-default">
                                        <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700 transition-colors">{shortcut.action}</span>
                                        <div className="flex items-center gap-1">
                                            {shortcut.keys.map((key, i) => (
                                                <React.Fragment key={i}>
                                                    <kbd className="min-w-[20px] h-5 flex items-center justify-center px-1 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)]">
                                                        {key}
                                                    </kbd>
                                                    {i < shortcut.keys.length - 1 && <span className="text-gray-300 text-[10px]">+</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Promo/New Feature - MedASR */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl shadow-xl overflow-hidden relative group cursor-pointer"
                            onClick={() => navigate('/medai')}
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                                <Mic size={100} className="text-white transform rotate-12" />
                            </div>
                            
                            <div className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-sm">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Beta Access</span>
                                    </div>
                                    <motion.div 
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                                    />
                                </div>
                                
                                <h3 className="text-xl font-bold mb-2 text-white tracking-tight">MedASR Audio</h3>
                                <p className="text-sm text-blue-50/90 leading-relaxed mb-6 font-medium">
                                    Capture clinical notes via voice with 99.9% medical term accuracy.
                                </p>
                                
                                <Button 
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/medai');
                                    }}
                                    className="w-full h-11 bg-white text-blue-700 hover:bg-blue-50 border-none font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-xl group-hover:translate-y-[-2px]"
                                >
                                    Try Feature Now
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};
