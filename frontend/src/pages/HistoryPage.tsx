/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useLayoutEffect, useState, useMemo } from 'react';
import {
    History as HistoryIcon,
    RefreshCw as RefreshIcon,
    Stethoscope as DiagnosisIcon,
    Upload as UploadIcon,
    TrendingUp as TrendingIcon,
    Search as SearchIcon,
    Download as DownloadIcon,
    FileText,
    Clock,
    AlertTriangle,
    Activity,
    ChevronDown,
    ChevronUp,
    Eye,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services';
import gsap from 'gsap';
import { useGsapContext } from '../lib/animations';
import { staggerContainer, fadeSlideUp } from '../lib/animations';
import { exportToCSV, exportToJSON } from '../lib/export';
import { toast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import type { DiagnosisResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/ui/StatCard';

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



// ================== Severity Badge ==================
const SeverityBadge: React.FC<{ severity: string; attention?: boolean }> = ({ severity, attention }) => {
    const styles: Record<string, string> = {
        Critical: 'bg-red-500/10 text-red-700 border-red-200 ring-red-500/20',
        High: 'bg-orange-500/10 text-orange-700 border-orange-200 ring-orange-500/20',
        Medium: 'bg-blue-500/10 text-blue-700 border-blue-200 ring-blue-500/20',
        Low: 'bg-emerald-500/10 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    };
    return (
        <div className="flex flex-col gap-1.5 items-start">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border ring-1 ${styles[severity] || 'bg-zinc-100 text-zinc-600 border-zinc-200 ring-zinc-200/50'}`}>
                {severity || 'Unknown'}
            </span>
            {attention && (
                <span className="text-[10px] text-red-600 font-semibold flex items-center gap-1 animate-pulse">
                    <AlertTriangle size={10} className="stroke-[3px]" />
                    Urgent
                </span>
            )}
        </div>
    );
};

// ================== Constants ==================
const ITEMS_PER_PAGE = 10;

// ================== Main Component ==================
export const HistoryPage: React.FC = () => {
    const navigate = useNavigate();

    // UI State
    const [activeTab, setActiveTab] = useState<'audit' | 'cases'>('cases');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Reset page on filter/tab change
    React.useEffect(() => { setCurrentPage(1); }, [searchQuery, severityFilter, categoryFilter, actionFilter, activeTab]);

    // ================== Data Fetching ==================
    const { data: history, isLoading: isLoadingHistory, isError: isErrorHistory, refetch: refetchHistory } = useQuery<AuditEntry[]>({
        queryKey: ['history'],
        queryFn: () => api.getHistory() as Promise<AuditEntry[]>,
        refetchInterval: 30000,
        enabled: activeTab === 'audit',
        retry: 1,
    });

    const { data: cases, isLoading: isLoadingCases, isError: isErrorCases, refetch: refetchCases } = useQuery<any[]>({
        queryKey: ['diagnoses_cases', severityFilter, categoryFilter],
        queryFn: () => {
            const params: Record<string, string> = {};
            if (severityFilter !== 'all') params.severity = severityFilter;
            if (categoryFilter !== 'all') params.condition_category = categoryFilter;
            return api.getDiagnoses(params);
        },
        enabled: activeTab === 'cases',
        retry: 1,
    });

    // Patient name lookup map
    const { data: patientsData } = useQuery<{ id: string; username: string; full_name: string | null }[]>({
        queryKey: ['patients_lookup'],
        queryFn: () => api.getPatients() as Promise<{ id: string; username: string; full_name: string | null }[]>,
        staleTime: 5 * 60 * 1000,  // cache for 5 min
    });

    const patientLookup = useMemo(() => {
        const map = new Map<string, string>();
        if (patientsData) {
            for (const p of patientsData) {
                const displayName = p.full_name || p.username;
                map.set(p.id, displayName);
                map.set(p.username, displayName);
            }
        }
        return map;
    }, [patientsData]);

    const resolvePatientName = (pid: string | undefined | null): { name: string; isResolved: boolean } => {
        if (!pid) return { name: 'N/A', isResolved: false };
        const resolved = patientLookup.get(pid);
        if (resolved) return { name: resolved, isResolved: true };
        // Fallback: show truncated ID
        return { name: pid.length > 12 ? `${pid.slice(0, 8)}…` : pid, isResolved: false };
    };

    // ================== Filtering ==================
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

    const filteredCases = useMemo(() => {
        if (!cases) return [];
        return cases.filter(c => {
            const searchStr = searchQuery.toLowerCase();
            return searchQuery === '' ||
                (c.patient_id && c.patient_id.toLowerCase().includes(searchStr)) ||
                (c.primary_diagnosis && c.primary_diagnosis.toLowerCase().includes(searchStr));
        });
    }, [cases, searchQuery]);

    // ================== Pagination ==================
    const activeData = activeTab === 'audit' ? filteredHistory : filteredCases;
    const totalPages = Math.max(1, Math.ceil(activeData.length / ITEMS_PER_PAGE));
    const paginatedData = activeData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // ================== Export ==================
    const handleExport = (type: 'csv' | 'json') => {
        let dataToExport: Record<string, unknown>[];
        let filename: string;
        if (activeTab === 'audit') {
            dataToExport = filteredHistory.map(entry => ({
                timestamp: entry.timestamp, action: formatAction(entry.action), user_id: entry.user_id,
                patient_id: entry.details.patient_id || '', filename: entry.details.filename || '',
            }));
            filename = 'audit_history';
        } else {
            dataToExport = filteredCases.map(c => ({
                date: c.date, patient_id: c.patient_id, diagnosis: c.primary_diagnosis,
                severity: c.severity, category: c.condition_category, immediate_attention: c.requires_immediate_attention,
            }));
            filename = 'clinical_cases';
        }
        if (type === 'csv') exportToCSV(dataToExport, filename);
        else exportToJSON(dataToExport, filename);
        toast.success(`Exported ${dataToExport.length} records as ${type.toUpperCase()}`);
        setShowExportMenu(false);
    };

    // ================== GSAP Animation ==================
    const containerRef = useRef<HTMLDivElement>(null);
    useGsapContext(containerRef);
    useLayoutEffect(() => {
        const targetData = activeTab === 'audit' ? history : cases;
        if (!targetData || targetData.length === 0) return;
        const ctx = gsap.context(() => {
            gsap.from(".history-table", { y: 20, opacity: 0, duration: 0.5, delay: 0.2, ease: "power2.out" });
        }, containerRef);
        return () => ctx.revert();
    }, [activeTab, history, cases]);

    const isLoading = activeTab === 'audit' ? isLoadingHistory : isLoadingCases;
    const isError = activeTab === 'audit' ? isErrorHistory : isErrorCases;

    return (
        <div ref={containerRef} className="min-h-screen bg-zinc-50/50">
            {/* Unified Header */}
            <PageHeader
                title="Records & History"
                icon={<HistoryIcon size={18} />}
                actions={
                    <>
                        {/* Centered Tabs */}
                        <div className="hidden md:flex bg-gray-100/80 p-1 rounded-xl">
                            {(['cases', 'audit'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                        activeTab === tab
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab === 'cases' ? 'Clinical Cases' : 'Audit Log'}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Button
                                variant="secondary" size="sm"
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                            >
                                <DownloadIcon size={14} />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                            <AnimatePresence>
                                {showExportMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                        className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden"
                                    >
                                        <button onClick={() => handleExport('csv')} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                            <FileText size={14} /> CSV Format
                                        </button>
                                        <button onClick={() => handleExport('json')} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                            <FileText size={14} /> JSON Format
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <Button
                            variant="secondary" size="sm"
                            onClick={() => activeTab === 'audit' ? refetchHistory() : refetchCases()}
                            className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                        >
                            <RefreshIcon size={14} className={isLoading ? 'animate-spin' : ''} />
                        </Button>
                    </>
                }
            />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Mobile Tabs */}
                <div className="md:hidden flex bg-zinc-100/80 p-1 rounded-xl mb-6">
                    {(['cases', 'audit'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                                activeTab === tab ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                            }`}
                        >
                            {tab === 'cases' ? 'Clinical Cases' : 'Audit Log'}
                        </button>
                    ))}
                </div>

                {/* ==================== Cases Stats ==================== */}
                {activeTab === 'cases' && cases && (
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                    >
                        <motion.div variants={fadeSlideUp}><StatCard title="Total Cases" value={cases.length} icon={<DiagnosisIcon size={18} />} color="bg-black" accent="bg-black" /></motion.div>
                        <motion.div variants={fadeSlideUp}><StatCard title="Critical / High" value={cases.filter(c => c.severity === 'Critical' || c.severity === 'High').length} icon={<AlertTriangle size={18} />} color="bg-red-500" accent="bg-red-500" /></motion.div>
                        <motion.div variants={fadeSlideUp}><StatCard title="Immediate Attention" value={cases.filter(c => c.requires_immediate_attention).length} icon={<Activity size={18} />} color="bg-amber-500" accent="bg-amber-500" /></motion.div>
                        <motion.div variants={fadeSlideUp}><StatCard title="This Week" value={cases.filter(c => { const d = new Date(c.date); const w = new Date(); w.setDate(w.getDate() - 7); return d >= w; }).length} icon={<TrendingIcon size={18} />} color="bg-emerald-500" accent="bg-emerald-500" /></motion.div>
                    </motion.div>
                )}

                {/* ==================== Audit Stats ==================== */}
                {activeTab === 'audit' && history && history.length > 0 && (
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                    >
                        <motion.div variants={fadeSlideUp}><StatCard title="Total Entries" value={history.length} icon={<HistoryIcon size={18} />} color="bg-blue-600" accent="bg-blue-600" /></motion.div>
                        <motion.div variants={fadeSlideUp}><StatCard title="Manual Diagnoses" value={history.filter(e => e.action === 'generate_diagnosis').length} icon={<DiagnosisIcon size={18} />} color="bg-emerald-500" accent="bg-emerald-500" /></motion.div>
                        <motion.div variants={fadeSlideUp}><StatCard title="PDF Analysed" value={history.filter(e => e.action === 'generate_diagnosis_unified').length} icon={<UploadIcon size={18} />} color="bg-purple-500" accent="bg-purple-500" /></motion.div>
                        <motion.div variants={fadeSlideUp}><StatCard title="Active This Week" value={history.filter(e => { const d = new Date(e.timestamp); const w = new Date(); w.setDate(w.getDate() - 7); return d >= w; }).length} icon={<TrendingIcon size={18} />} color="bg-amber-500" accent="bg-amber-500" /></motion.div>
                    </motion.div>
                )}

                {/* ==================== Filters ==================== */}
                <div className="bg-white border border-zinc-200/60 rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder={activeTab === 'audit' ? "Search user, patient ID, filename..." : "Search patient ID, diagnosis..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 transition-all text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {activeTab === 'audit' ? (
                            <select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="h-10 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="all">All Event Types</option>
                                <option value="generate_diagnosis">Manual Diagnosis</option>
                                <option value="generate_diagnosis_unified">PDF Analysis</option>
                            </select>
                        ) : (
                            <>
                                <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="h-10 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm appearance-none cursor-pointer">
                                    <option value="all">Any Severity</option>
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm appearance-none cursor-pointer">
                                    <option value="all">All Categories</option>
                                    <option value="Cardiovascular">Cardiovascular</option>
                                    <option value="Respiratory">Respiratory</option>
                                    <option value="Neurological">Neurological</option>
                                    <option value="General">General</option>
                                </select>
                            </>
                        )}
                        {/* Result Count Badge */}
                        <span className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold border border-zinc-200/60">
                            {activeData.length} result{activeData.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* ==================== Content Table ==================== */}
                <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm overflow-hidden min-h-[400px] history-table flex flex-col">
                    {isLoading && (
                        <div className="flex-1">
                            <div className="border-b border-zinc-100 bg-zinc-50/80 px-6 py-4 flex gap-16">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`h-3 rounded bg-zinc-200/70 ${i === 4 ? 'w-12' : 'w-24'}`} />
                                ))}
                            </div>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-16 px-6 py-5 border-b border-zinc-50 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-zinc-100" />
                                        <div className="space-y-2">
                                            <div className="h-3.5 w-24 bg-zinc-100 rounded-lg" />
                                            <div className="h-2.5 w-16 bg-zinc-50 rounded-lg" />
                                        </div>
                                    </div>
                                    <div className="h-6 w-28 bg-zinc-100 rounded-lg" />
                                    <div className="h-3 w-20 bg-zinc-100 rounded-lg" />
                                    <div className="h-3 w-24 bg-zinc-100 rounded-lg" />
                                    <div className="h-3 w-20 bg-zinc-50 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    )}

                    {isError && (
                        <div className="flex-1 flex flex-col items-center justify-center py-16">
                            <div className="p-4 rounded-full bg-red-50 text-red-500 mb-3"><HistoryIcon size={24} /></div>
                            <p className="text-red-600 font-medium">Failed to load {activeTab === 'audit' ? 'history' : 'cases'}</p>
                        </div>
                    )}

                    {!isLoading && !isError && activeData.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', damping: 20 }}
                                className="w-20 h-20 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-5"
                            >
                                {activeTab === 'cases' ? (
                                    <DiagnosisIcon size={36} className="text-zinc-300" />
                                ) : (
                                    <HistoryIcon size={36} className="text-zinc-300" />
                                )}
                            </motion.div>
                            {searchQuery ? (
                                <>
                                    <h3 className="text-zinc-900 font-semibold text-base mb-1">No Matches</h3>
                                    <p className="text-sm text-zinc-500 max-w-xs">
                                        No records match "{searchQuery}". Try adjusting your search or filters.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-zinc-900 font-semibold text-base mb-1">
                                        {activeTab === 'cases' ? 'No Clinical Cases Yet' : 'No Audit Entries'}
                                    </h3>
                                    <p className="text-sm text-zinc-500 max-w-xs mb-5">
                                        {activeTab === 'cases'
                                            ? 'Run your first AI diagnosis to see cases appear here.'
                                            : 'Actions will be logged here automatically as you use the system.'
                                        }
                                    </p>
                                    {activeTab === 'cases' && (
                                        <Button
                                            size="sm"
                                            onClick={() => navigate('/diagnosis')}
                                            className="bg-black text-white hover:bg-zinc-800 rounded-xl shadow-md shadow-black/20 gap-2"
                                        >
                                            <DiagnosisIcon size={14} />
                                            Start Diagnosis
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {!isLoading && paginatedData.length > 0 && (
                        <>
                            <div className="overflow-x-auto">
                                {activeTab === 'audit' ? (
                                    /* ==================== AUDIT TABLE ==================== */
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-50/80 border-b border-zinc-100">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Timestamp</th>
                                                <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Action Type</th>
                                                <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">User</th>
                                                <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Reference ID</th>
                                                <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">File / Context</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {(paginatedData as AuditEntry[]).map((entry, index) => (
                                                <tr key={index} className="group hover:bg-zinc-50/80 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                <Clock size={14} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-zinc-900">{new Date(entry.timestamp).toLocaleDateString()}</span>
                                                                <span className="text-xs text-zinc-500 font-mono">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                                            entry.action === 'generate_diagnosis' ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                            : entry.action === 'generate_diagnosis_unified' ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                                                        }`}>
                                                            {getActionIcon(entry.action)}
                                                            {formatAction(entry.action)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                                                                {entry.user_id.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-zinc-700">{entry.user_id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {entry.details.patient_id ? (
                                                            (() => {
                                                                const { name, isResolved } = resolvePatientName(entry.details.patient_id);
                                                                return (
                                                                    <button
                                                                        onClick={() => { navigator.clipboard.writeText(entry.details.patient_id!); toast.success('ID copied'); }}
                                                                        title={`${isResolved ? name + ' — ' : ''}ID: ${entry.details.patient_id}`}
                                                                        className={`text-xs px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                                                                            isResolved
                                                                                ? 'text-zinc-700 bg-white border-zinc-200 hover:bg-zinc-100'
                                                                                : 'font-mono text-zinc-600 bg-zinc-100 border-zinc-200 hover:bg-zinc-200 hover:border-zinc-300'
                                                                        }`}
                                                                    >
                                                                        {name}
                                                                    </button>
                                                                );
                                                            })()
                                                        ) : <span className="text-zinc-400 text-xs italic">N/A</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {entry.details.filename ? (
                                                            <div className="flex items-center gap-2 text-zinc-600">
                                                                <FileText size={14} className="text-zinc-400" />
                                                                <span className="text-xs truncate max-w-[200px]" title={entry.details.filename}>
                                                                    {entry.details.filename}
                                                                </span>
                                                            </div>
                                                        ) : <span className="text-zinc-400 text-xs italic">-</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    /* ==================== CASES TABLE ==================== */
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-50/80 border-b border-zinc-100">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Patient</th>
                                                <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Classification</th>
                                                <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Diagnosis</th>
                                                <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {(paginatedData as any[]).map((c) => {
                                                const rowId = c.id || c.date;
                                                const isExpanded = expandedRow === rowId;
                                                return (
                                                    <React.Fragment key={rowId}>
                                                        <tr
                                                            className={`group hover:bg-zinc-50/80 transition-colors cursor-pointer ${isExpanded ? 'bg-zinc-50/60' : ''}`}
                                                            onClick={() => setExpandedRow(isExpanded ? null : rowId)}
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-zinc-900">{c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}</span>
                                                                    <span className="text-xs text-zinc-500 font-mono">{c.date ? new Date(c.date).toLocaleTimeString() : 'N/A'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                            {c.patient_id ? (
                                                                (() => {
                                                                    const { name, isResolved } = resolvePatientName(c.patient_id);
                                                                    return (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.patient_id); toast.success('Patient ID copied'); }}
                                                                            title={`${isResolved ? name + ' — ' : ''}ID: ${c.patient_id}`}
                                                                            className={`text-xs font-medium px-2.5 py-1 rounded-lg inline-block border transition-colors cursor-pointer ${
                                                                                isResolved
                                                                                    ? 'text-zinc-900 bg-white border-zinc-200 hover:bg-zinc-100'
                                                                                    : 'font-mono text-zinc-900 bg-zinc-100 border-zinc-200/60 hover:bg-zinc-200 hover:border-zinc-300'
                                                                            }`}
                                                                        >
                                                                            {name}
                                                                        </button>
                                                                    );
                                                                })()
                                                            ) : (
                                                                <span className="text-zinc-400 text-xs italic">N/A</span>
                                                            )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <SeverityBadge severity={c.severity} attention={c.requires_immediate_attention} />
                                                                <span className="text-xs text-zinc-500 mt-1 block">{c.condition_category || 'General'}</span>
                                                            </td>
                                                            <td className="px-6 py-4 max-w-xs">
                                                                <div className="text-sm text-zinc-900 font-medium truncate" title={c.primary_diagnosis}>
                                                                    {c.primary_diagnosis || "N/A"}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button
                                                                        variant="secondary" size="sm"
                                                                        className="text-xs border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300 gap-1.5"
                                                                        onClick={(e: React.MouseEvent) => {
                                                                            e.stopPropagation();
                                                                            let resultData = c.diagnosis_result || c.result || {};
                                                                            if (typeof resultData === 'string') {
                                                                                try { resultData = JSON.parse(resultData); } catch { resultData = {}; }
                                                                            }
                                                                            navigate('/diagnosis/result', {
                                                                                state: {
                                                                                    patient_id: c.patient_id,
                                                                                    differential_diagnosis: resultData.differential_diagnosis || [],
                                                                                    severity: c.severity,
                                                                                    condition_category: c.condition_category,
                                                                                    requires_immediate_attention: c.requires_immediate_attention,
                                                                                    recommended_tests: resultData.recommended_tests || [],
                                                                                    citations: resultData.citations || [],
                                                                                    clinical_notes: resultData.clinical_notes || '',
                                                                                    timestamp: c.date || c.created_at
                                                                                } as DiagnosisResult
                                                                            });
                                                                        }}
                                                                    >
                                                                        <Eye size={14} /> Review
                                                                    </Button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setExpandedRow(isExpanded ? null : rowId); }}
                                                                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                                                    >
                                                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {/* Expandable Detail Row */}
                                                        <AnimatePresence>
                                                            {isExpanded && (
                                                                <tr>
                                                                    <td colSpan={5} className="p-0 border-0">
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: 'auto', opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.25 }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <div className="px-8 py-5 bg-zinc-50/80 border-t border-zinc-100">
                                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                                    <div>
                                                                                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Patient</span>
                                                                                        {(() => {
                                                                                            const { name, isResolved } = resolvePatientName(c.patient_id);
                                                                                            return (
                                                                                                <button
                                                                                                    onClick={(e) => { e.stopPropagation(); if (c.patient_id) { navigator.clipboard.writeText(c.patient_id); toast.success('Patient ID copied'); } }}
                                                                                                    className={`hover:text-black cursor-pointer ${isResolved ? 'text-zinc-900' : 'font-mono text-zinc-900'}`}
                                                                                                    title={isResolved ? `${name} — ID: ${c.patient_id}` : (c.patient_id || 'N/A')}
                                                                                                >
                                                                                                    {name}
                                                                                                </button>
                                                                                            );
                                                                                        })()}
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Severity</span>
                                                                                        <span className="text-zinc-900 font-medium">{c.severity || 'N/A'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Category</span>
                                                                                        <span className="text-zinc-900">{c.condition_category || 'General'}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Confidence</span>
                                                                                        <span className="text-zinc-900 font-medium">{c.confidence ? `${(c.confidence * 100).toFixed(0)}%` : 'N/A'}</span>
                                                                                    </div>
                                                                                </div>
                                                                                {c.primary_diagnosis && (
                                                                                    <div className="mt-4 pt-3 border-t border-zinc-200/60">
                                                                                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Primary Diagnosis</span>
                                                                                        <p className="text-zinc-800">{c.primary_diagnosis}</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </motion.div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </AnimatePresence>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* ==================== Pagination ==================== */}
                            {totalPages > 1 && (
                                <div className="border-t border-zinc-100 px-6 py-4 flex items-center justify-between bg-zinc-50/40">
                                    <p className="text-xs text-zinc-500">
                                        Showing <span className="font-semibold text-zinc-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>-<span className="font-semibold text-zinc-700">{Math.min(currentPage * ITEMS_PER_PAGE, activeData.length)}</span> of <span className="font-semibold text-zinc-700">{activeData.length}</span>
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-600 transition-all"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                            let page: number;
                                            if (totalPages <= 5) { page = i + 1; }
                                            else if (currentPage <= 3) { page = i + 1; }
                                            else if (currentPage >= totalPages - 2) { page = totalPages - 4 + i; }
                                            else { page = currentPage - 2 + i; }
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                                                        currentPage === page
                                                            ? 'bg-black text-white shadow-sm'
                                                            : 'text-zinc-600 hover:bg-white hover:shadow-sm hover:border-zinc-200 border border-transparent'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-600 transition-all"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HistoryPage;
