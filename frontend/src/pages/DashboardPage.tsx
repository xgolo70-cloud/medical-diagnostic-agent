import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { Button } from '../components/ui/Button';
import { 
    StatsCard, 
    QuickAction, 
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
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-md shadow-black/20">
                            <Plus className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                            Dashboard
                        </h1>
                        <span className="text-gray-300">/</span>
                        <span className="text-sm text-gray-500 font-medium">Overview</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => navigate('/settings')}
                            className="h-9 px-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-lg text-sm font-medium transition-all shadow-sm"
                        >
                            <Settings size={15} />
                        </Button>
                        <Button 
                            size="sm" 
                            variant="primary" 
                            onClick={() => navigate('/diagnosis')}
                            className="h-9 px-4 bg-black text-white hover:bg-gray-800 rounded-lg text-sm font-medium gap-2 shadow-md shadow-gray-200 hover:shadow-lg transition-all"
                        >
                            <Plus size={15} />
                            <span>New Analysis</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
                            Welcome back, {user?.username}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Here's what's happening with your deployments today.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-medium text-gray-600">All Systems Operational</span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">v2.4.0</span>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10" data-tour="stats-cards">
                    {statsData.map((stat, i) => (
                        <div 
                            key={stat.label}
                            className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 rounded-lg bg-gray-50 text-gray-500 group-hover:text-black group-hover:bg-gray-100 transition-colors">
                                    <stat.icon size={18} />
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    stat.trend.includes('+') ? 'bg-green-50 text-green-700' : 
                                    stat.trend === 'Optimal' ? 'bg-blue-50 text-blue-700' :
                                    'bg-amber-50 text-amber-700'
                                }`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1 font-display">
                                {stat.value}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {stat.label}
                            </div>
                        </div>
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
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" data-tour="quick-actions">
                             <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                <Zap size={16} className="text-gray-400" />
                                <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="p-3 space-y-1">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.title}
                                        onClick={() => navigate(action.path)}
                                        className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left group"
                                    >
                                        <div className="p-2.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-black group-hover:shadow-sm transition-all">
                                            <action.icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 group-hover:text-black">
                                                {action.title}
                                            </div>
                                            <div className="text-xs text-gray-500 line-clamp-1">
                                                {action.description}
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all">
                                            <ChevronRight size={14} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                             <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                <Cpu size={16} className="text-gray-400" />
                                <h3 className="text-sm font-semibold text-gray-900">System Capacity</h3>
                            </div>
                            <div className="p-5 space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                            <span className="text-xs font-medium text-gray-700">GPU VRAM Usage</span>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500">52%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-black/80 h-full w-[52%] rounded-full shadow-sm" />
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                            <span className="text-xs font-medium text-gray-700">API Latency</span>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500">42ms</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-green-500 h-full w-[15%] rounded-full shadow-sm" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex gap-3 items-start p-3 bg-amber-50/50 border border-amber-100/50 rounded-lg">
                                        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                        <div className="text-xs">
                                            <p className="font-semibold text-amber-900 mb-0.5">Scheduled Maintenance</p>
                                            <p className="text-amber-700/80">Tonight, 02:00 AM UTC</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* Promo/New Feature - Dark Card Accent */}
                        <div className="bg-black rounded-xl shadow-xl overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                             <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
                                 <Sparkles size={80} className="text-white" />
                             </div>
                            <div className="p-8 relative z-10 flex flex-col h-full min-h-[240px] justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/20 text-white shadow-sm">
                                            Beta Access
                                        </div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-white tracking-tight" style={{ color: '#ffffff' }}>MedASR Audio</h3>
                                    <p className="text-sm text-gray-300 leading-7 font-medium opacity-90" style={{ color: '#e5e5e5' }}>
                                        Capture clinical notes via voice with 99.9% medical term accuracy.
                                    </p>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <Button 
                                        size="sm"
                                        onClick={() => navigate('/medai')}
                                        className="w-full h-11 bg-white text-black hover:bg-gray-50 border-none font-bold text-xs tracking-widest uppercase transition-all hover:scale-[1.02] shadow-lg"
                                    >
                                        Try Feature Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
