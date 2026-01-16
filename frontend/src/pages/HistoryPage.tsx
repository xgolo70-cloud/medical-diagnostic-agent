import React, { useRef, useLayoutEffect, useState, useMemo } from 'react';
import {
    History as HistoryIcon,
    RefreshCw as RefreshIcon,
    Stethoscope as DiagnosisIcon,
    Upload as UploadIcon,
    TrendingUp as TrendingIcon,
    Search as SearchIcon,
    Filter as FilterIcon,
    Download as DownloadIcon,
    FileText,
    ArrowLeft,
    Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services';
import gsap from 'gsap';
import { useGsapContext } from '../lib/animations';
import { exportToCSV, exportToJSON } from '../lib/export';
import { toast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface AuditEntry {
    timestamp: string;
    action: string;
    user_id: string;
    details: {
        patient_id?: string;
        filename?: string;
        [key: string]: unknown;
    };
}

const getActionIcon = (action: string) => {
    switch (action) {
        case 'generate_diagnosis':
            return <DiagnosisIcon size={14} className="text-blue-600" />;
        case 'generate_diagnosis_unified':
            return <UploadIcon size={14} className="text-purple-600" />;
        default:
            return <HistoryIcon size={14} className="text-gray-500" />;
    }
};

const formatAction = (action: string): string => {
    switch (action) {
        case 'generate_diagnosis':
            return 'Manual Diagnosis';
        case 'generate_diagnosis_unified':
            return 'PDF Analysis';
        default:
            return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
};

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all shadow-sm hover:shadow-md group">
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${color} text-white shadow-sm`}>
                {icon}
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
        </div>
        <div className="text-3xl font-bold text-gray-900 tracking-tight group-hover:scale-105 transition-transform origin-left">{value}</div>
    </div>
);

export const HistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: history, isLoading, isError, refetch } = useQuery<AuditEntry[]>({
        queryKey: ['history'],
        queryFn: () => api.getHistory() as Promise<AuditEntry[]>,
        refetchInterval: 30000,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [showExportMenu, setShowExportMenu] = useState(false);

    const filteredHistory = useMemo(() => {
        if (!history) return [];
        return history.filter(entry => {
            const searchMatch = searchQuery === '' ||
                entry.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.details.patient_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.details.filename?.toLowerCase().includes(searchQuery.toLowerCase());
            const actionMatch = actionFilter === 'all' || entry.action === actionFilter;
            return searchMatch && actionMatch;
        });
    }, [history, searchQuery, actionFilter]);

    const handleExport = (type: 'csv' | 'json') => {
        const dataToExport = filteredHistory.map(entry => ({
            timestamp: entry.timestamp,
            action: formatAction(entry.action),
            user_id: entry.user_id,
            patient_id: entry.details.patient_id || '',
            filename: entry.details.filename || '',
        }));
        if (type === 'csv') exportToCSV(dataToExport, 'diagnosis_history');
        else exportToJSON(dataToExport, 'diagnosis_history');
        toast.success(`Exported ${filteredHistory.length} records as ${type.toUpperCase()}`);
        setShowExportMenu(false);
    };

    const containerRef = useRef<HTMLDivElement>(null);
    useGsapContext(containerRef);

    useLayoutEffect(() => {
        if (!history || history.length === 0) return;
        const ctx = gsap.context(() => {
            gsap.from(".stats-grid > div", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" });
            gsap.from(".history-table", { y: 20, opacity: 0, duration: 0.5, delay: 0.3, ease: "power2.out" });
        }, containerRef);
        return () => ctx.revert();
    }, [history]);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#fafafa]">
             {/* Glass Header */}
             <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <Button 
                            variant="secondary" 
                            size="sm" 
                            className="w-8 h-8 p-0 rounded-lg flex items-center justify-center border-gray-200"
                            onClick={() => navigate('/dashboard')}
                        >
                            <ArrowLeft size={16} className="text-gray-600" />
                        </Button>
                        <div className="h-6 w-px bg-gray-200 mx-1" />
                        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-md shadow-black/20">
                            <HistoryIcon className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Audit Log</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                            >
                                <DownloadIcon size={14} />
                                <span>Export</span>
                            </Button>
                            {showExportMenu && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button onClick={() => handleExport('csv')} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                        <FileText size={14} /> CSV Format
                                    </button>
                                    <button onClick={() => handleExport('json')} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                        <FileText size={14} /> JSON Format
                                    </button>
                                </div>
                            )}
                        </div>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => refetch()}
                            className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                        >
                            <RefreshIcon size={14} className={isLoading ? 'animate-spin' : ''} />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                {history && history.length > 0 && (
                    <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                            title="Total Entries" 
                            value={history.length} 
                            icon={<HistoryIcon size={18} />} 
                            color="bg-blue-600"
                        />
                        <StatCard 
                            title="Manual Diagnoses" 
                            value={history.filter(e => e.action === 'generate_diagnosis').length} 
                            icon={<DiagnosisIcon size={18} />} 
                            color="bg-emerald-500"
                        />
                        <StatCard 
                            title="PDF Analysed" 
                            value={history.filter(e => e.action === 'generate_diagnosis_unified').length} 
                            icon={<UploadIcon size={18} />} 
                            color="bg-purple-500"
                        />
                        <StatCard 
                            title="Active This Week" 
                            value={history.filter(e => {
                                const date = new Date(e.timestamp);
                                const now = new Date();
                                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                return date >= weekAgo;
                            }).length} 
                            icon={<TrendingIcon size={18} />} 
                            color="bg-amber-500"
                        />
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search user, patient ID, filename..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                         <div className="relative flex-1 md:flex-none">
                            <FilterIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="w-full md:w-48 h-10 pl-10 pr-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="all">All Event Types</option>
                                <option value="generate_diagnosis">Manual Diagnosis</option>
                                <option value="generate_diagnosis_unified">PDF Analysis</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[400px] history-table flex flex-col">
                    {isLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent mb-4" />
                            <p className="text-sm font-medium text-gray-600">Retrieving audit logs...</p>
                        </div>
                    )}

                    {isError && (
                        <div className="flex-1 flex flex-col items-center justify-center py-12">
                             <div className="p-4 rounded-full bg-red-50 text-red-500 mb-3">
                                <HistoryIcon size={24} />
                             </div>
                             <p className="text-red-600 font-medium">Failed to load history</p>
                        </div>
                    )}

                    {!isLoading && !isError && filteredHistory.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                                <SearchIcon size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-gray-900 font-medium mb-1">No Entries Found</h3>
                            <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
                        </div>
                    )}

                    {!isLoading && filteredHistory.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-900 text-xs uppercase tracking-wider">Timestamp</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 text-xs uppercase tracking-wider">Action Type</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 text-xs uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 text-xs uppercase tracking-wider">Reference ID</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 text-xs uppercase tracking-wider">File / Context</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredHistory.map((entry, index) => (
                                        <tr key={index} className="group hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        <Clock size={14} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{new Date(entry.timestamp).toLocaleDateString()}</span>
                                                        <span className="text-xs text-gray-500 font-mono">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    entry.action === 'generate_diagnosis'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                        : entry.action === 'generate_diagnosis_unified'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                                }`}>
                                                    {getActionIcon(entry.action)}
                                                    {formatAction(entry.action)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                     <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                        {entry.user_id.charAt(0).toUpperCase()}
                                                     </div>
                                                    <span className="font-medium text-gray-700">{entry.user_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                               {entry.details.patient_id ? (
                                                    <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                        {entry.details.patient_id}
                                                    </span>
                                               ) : (
                                                   <span className="text-gray-400 text-xs italic">N/A</span>
                                               )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {entry.details.filename ? (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <FileText size={14} className="text-gray-400" />
                                                        <span className="text-xs truncate max-w-[200px]" title={entry.details.filename}>
                                                            {entry.details.filename}
                                                        </span>
                                                    </div>
                                                ) : (
                                                     <span className="text-gray-400 text-xs italic">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HistoryPage;
