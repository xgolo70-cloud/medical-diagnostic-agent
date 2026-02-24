import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search, UserPlus, ChevronRight, Users, Activity,
    AlertTriangle, RefreshCw, Mail, Phone,
    ChevronLeft, Clock
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { StatCard } from '../components/ui/StatCard';
import AddPatientModal from '../components/patients/AddPatientModal';

interface PatientSummary {
    id: string;
    username: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    created_at: string;
}

// ================== Avatar gradient palette ==================
const AVATAR_GRADIENTS = [
    'from-violet-600 to-indigo-600',
    'from-rose-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-sky-500 to-blue-600',
    'from-fuchsia-500 to-purple-600',
];
const getGradient = (id: string) => AVATAR_GRADIENTS[id.charCodeAt(0) % AVATAR_GRADIENTS.length];

// ================== Stat Card ==================


// ================== Pagination ==================
const ITEMS_PER_PAGE = 8;

// ================== Main Component ==================
export const PatientsListPage: React.FC = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<PatientSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchPatients = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getPatients();
            setPatients(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load patients");
        } finally {
            setLoading(false);
        }
    };

    const handlePatientCreated = () => {
        fetchPatients();
        toast.success('Patient registered successfully');
    };

    useEffect(() => { fetchPatients(); }, []);

    const filteredPatients = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return patients.filter(p =>
            p.username.toLowerCase().includes(s) ||
            (p.full_name && p.full_name.toLowerCase().includes(s)) ||
            p.email.toLowerCase().includes(s) ||
            (p.phone && p.phone.includes(s))
        );
    }, [patients, searchTerm]);

    // Reset page on search change
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredPatients.length / ITEMS_PER_PAGE));
    const paginatedPatients = filteredPatients.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Computed stats
    const recentCount = patients.filter(p => {
        const d = new Date(p.created_at);
        const w = new Date(); w.setDate(w.getDate() - 7);
        return d >= w;
    }).length;

    const withPhone = patients.filter(p => !!p.phone).length;

    return (
        <div className="min-h-screen bg-zinc-50/50">
            {/* Unified Header */}
            <PageHeader
                title="Patient Directory"
                icon={<Users size={18} />}
                actions={
                    <>
                        <Button
                            variant="secondary" size="sm"
                            onClick={() => fetchPatients()}
                            className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setShowAddModal(true)}
                            className="bg-black text-white hover:bg-gray-800 rounded-lg shadow-md shadow-black/20 gap-2"
                        >
                            <UserPlus size={14} />
                            New Patient
                        </Button>
                    </>
                }
            />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* ==================== Stat Cards ==================== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Total Patients" value={patients.length} icon={<Users size={18} />} color="bg-black" accent="bg-black" delay={0} />
                    <StatCard title="New This Week" value={recentCount} icon={<Clock size={18} />} color="bg-emerald-500" accent="bg-emerald-500" delay={0.1} />
                    <StatCard title="With Phone" value={withPhone} icon={<Phone size={18} />} color="bg-blue-500" accent="bg-blue-500" delay={0.2} />
                    <StatCard title="Needing Review" value={0} icon={<AlertTriangle size={18} />} color="bg-amber-500" accent="bg-amber-500" delay={0.3} />
                </div>

                {/* ==================== Search & Filter Bar ==================== */}
                <div className="bg-white border border-zinc-200/60 rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 transition-all text-sm"
                        />
                    </div>
                    <span className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold border border-zinc-200/60">
                        {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* ==================== Patient Table ==================== */}
                <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                    {loading && (
                        <div className="flex-1">
                            <div className="border-b border-zinc-100 bg-zinc-50/80 px-6 py-4 flex gap-16">
                                {['Patient', 'Contact', 'Registered', ''].map((_h, i) => (
                                    <div key={i} className={`h-3 rounded bg-zinc-200/70 ${i === 3 ? 'w-12' : 'w-24'}`} />
                                ))}
                            </div>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-16 px-6 py-5 border-b border-zinc-50 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-100" />
                                        <div className="space-y-2">
                                            <div className="h-3.5 w-32 bg-zinc-100 rounded-lg" />
                                            <div className="h-2.5 w-20 bg-zinc-50 rounded-lg" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 w-40 bg-zinc-100 rounded-lg" />
                                        <div className="h-2.5 w-28 bg-zinc-50 rounded-lg" />
                                    </div>
                                    <div className="h-3 w-24 bg-zinc-100 rounded-lg" />
                                    <div className="h-7 w-16 bg-zinc-100 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="flex-1 flex flex-col items-center justify-center py-16">
                            <div className="p-4 rounded-full bg-red-50 text-red-500 mb-3"><AlertTriangle size={24} /></div>
                            <p className="text-red-600 font-medium">{error}</p>
                            <Button variant="secondary" size="sm" className="mt-4" onClick={() => fetchPatients()}>
                                Retry
                            </Button>
                        </div>
                    )}

                    {!loading && !error && filteredPatients.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', damping: 20 }}
                                className="w-20 h-20 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-5"
                            >
                                <UserPlus size={36} className="text-zinc-300" />
                            </motion.div>
                            {patients.length === 0 ? (
                                <>
                                    <h3 className="text-zinc-900 font-semibold text-base mb-1">No Patients Yet</h3>
                                    <p className="text-sm text-zinc-500 max-w-xs mb-5">
                                        Get started by registering your first patient to the system.
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => setShowAddModal(true)}
                                        className="bg-black text-white hover:bg-zinc-800 rounded-xl shadow-md shadow-black/20 gap-2"
                                    >
                                        <UserPlus size={14} />
                                        Register First Patient
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-zinc-900 font-semibold text-base mb-1">No Matches</h3>
                                    <p className="text-sm text-zinc-500 max-w-xs">
                                        No patients match "{searchTerm}". Try adjusting your search.
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {!loading && !error && paginatedPatients.length > 0 && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-50/80 border-b border-zinc-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Patient</th>
                                            <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Registered</th>
                                            <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {paginatedPatients.map((patient, i) => (
                                            <motion.tr
                                                key={patient.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                                                onClick={() => navigate(`/patients/${patient.id}`)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full bg-linear-to-tr ${getGradient(patient.id)} text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white`}>
                                                            {(patient.full_name || patient.username).charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-zinc-900">{patient.full_name || 'Unnamed Patient'}</p>
                                                            <p className="text-xs text-zinc-500 font-mono mt-0.5">@{patient.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-zinc-700">
                                                        <Mail size={13} className="text-zinc-400" />
                                                        <span className="text-sm">{patient.email}</span>
                                                    </div>
                                                    {patient.phone && (
                                                        <div className="flex items-center gap-1.5 text-zinc-500 mt-1">
                                                            <Phone size={13} className="text-zinc-400" />
                                                            <span className="text-xs">{patient.phone}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-zinc-700 font-medium">
                                                            {new Date(patient.created_at).toLocaleDateString(undefined, {
                                                                year: 'numeric', month: 'short', day: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="text-xs text-zinc-500 font-mono mt-0.5">
                                                            {new Date(patient.created_at).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="secondary" size="sm"
                                                        className="text-xs border-zinc-200 text-zinc-600 hover:text-white hover:bg-black hover:border-black gap-1.5 transition-all"
                                                        onClick={(e: React.MouseEvent) => {
                                                            e.stopPropagation();
                                                            navigate(`/patients/${patient.id}`);
                                                        }}
                                                    >
                                                        <Activity size={14} />
                                                        View EMR
                                                        <ChevronRight size={14} />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ==================== Pagination ==================== */}
                            {totalPages > 1 && (
                                <div className="border-t border-zinc-100 px-6 py-4 flex items-center justify-between bg-zinc-50/40">
                                    <p className="text-xs text-zinc-500">
                                        Showing <span className="font-semibold text-zinc-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>-<span className="font-semibold text-zinc-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)}</span> of <span className="font-semibold text-zinc-700">{filteredPatients.length}</span>
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

            {/* Add Patient Modal */}
            <AddPatientModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handlePatientCreated}
            />
        </div>
    );
};

export default PatientsListPage;
