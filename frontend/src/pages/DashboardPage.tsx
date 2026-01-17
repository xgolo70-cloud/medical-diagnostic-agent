import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import { Button } from '../components/ui/Button';
import { 
    RecentActivityTable,
    AnalyticsSummary 
} from '../components/dashboard';
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
    Sparkles,
    ChevronRight,
    Zap
} from 'lucide-react';

// Data
const statsData = [
    { label: 'Total Analyses', value: '1,284', icon: Activity, trend: '+12%' },
    { label: 'Pending Review', value: '8', icon: FileText, trend: '2 urgent' },
    { label: 'Model Accuracy', value: '98.2%', icon: TrendingUp, trend: '+0.4%' },
    { label: 'System Load', value: '24%', icon: Cpu, trend: 'Optimal' },
];

const quickActions = [
    {
        title: 'New Analysis',
        description: 'Start a diagnostic session',
        icon: Stethoscope,
        path: '/diagnosis',
    },
    {
        title: 'Upload Records',
        description: 'Import patient history/PDFs',
        icon: Upload,
        path: '/diagnosis',
    },
    {
        title: 'Patient History',
        description: 'View past diagnosis logs',
        icon: History,
        path: '/history',
    },
];

export const DashboardPage: React.FC = () => {
    const user = useAppSelector((state) => state.auth.user);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Glass Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                         <motion.div 
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black flex items-center justify-center shadow-md shadow-black/20 cursor-pointer"
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
                            Here's what's happening with your deployments today.
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
                            className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all duration-200 shadow-sm cursor-default"
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

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Recent Activity */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" data-tour="recent-activity">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-gray-400" />
                                    <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                                </div>
                                <button 
                                    onClick={() => navigate('/history')}
                                    className="text-xs font-medium text-gray-500 hover:text-black hover:underline transition-colors flex items-center gap-1"
                                >
                                    View full history
                                    <ChevronRight size={12} />
                                </button>
                            </div>
                            <div className="min-h-[300px]">
                                <RecentActivityTable />
                            </div>
                        </div>

                        {/* Analytics */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={16} className="text-gray-400" />
                                    <h3 className="text-sm font-semibold text-gray-900">Analytics Overview</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <AnalyticsSummary />
                            </div>
                        </div>
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
                                            <div className="text-sm font-medium text-gray-900 group-hover:text-black">
                                                {action.title}
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
                                            className="bg-gradient-to-r from-gray-800 to-black h-full rounded-full shadow-sm" 
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
                                            className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full shadow-sm" 
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

                         {/* Promo/New Feature - Dark Card Accent */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="bg-black rounded-xl shadow-xl overflow-hidden relative group cursor-pointer"
                        >
                             <motion.div 
                                animate={{ 
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 6, repeat: Infinity }}
                                className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                             >
                                 <Sparkles size={80} className="text-white" />
                             </motion.div>
                            <div className="p-8 relative z-10 flex flex-col h-full min-h-[240px] justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <motion.div 
                                            whileHover={{ scale: 1.1 }}
                                            className="inline-block px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/20 text-white shadow-sm"
                                        >
                                            Beta Access
                                        </motion.div>
                                        <motion.div 
                                            animate={{ 
                                                boxShadow: ["0 0 10px rgba(59,130,246,0.5)", "0 0 20px rgba(59,130,246,0.8)", "0 0 10px rgba(59,130,246,0.5)"]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-2.5 h-2.5 rounded-full bg-blue-500" 
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-white tracking-tight">MedASR Audio</h3>
                                    <p className="text-sm text-gray-300 leading-7 font-medium opacity-90">
                                        Capture clinical notes via voice with 99.9% medical term accuracy.
                                    </p>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Button 
                                            size="sm"
                                            onClick={() => navigate('/medai')}
                                            className="w-full h-11 bg-white text-black hover:bg-gray-50 border-none font-bold text-xs tracking-widest uppercase transition-all shadow-lg"
                                        >
                                            Try Feature Now
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};
