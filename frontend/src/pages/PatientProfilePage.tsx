/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, User, Activity, Pill, Plus, X,
    Stethoscope, Mail, Phone, Shield, ChevronDown,
    ChevronUp, Eye, AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import type { DiagnosisResult } from '../types/patient';

// ================== Avatar gradient ==================
const AVATAR_GRADIENTS = [
    'from-violet-600 to-indigo-600',
    'from-rose-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-sky-500 to-blue-600',
];
const getGradient = (s: string) => AVATAR_GRADIENTS[s.charCodeAt(0) % AVATAR_GRADIENTS.length];

// ================== Severity Badge ==================
const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
    const styles: Record<string, string> = {
        Critical: 'bg-red-500/10 text-red-700 border-red-200 ring-red-500/20',
        High: 'bg-orange-500/10 text-orange-700 border-orange-200 ring-orange-500/20',
        Medium: 'bg-blue-500/10 text-blue-700 border-blue-200 ring-blue-500/20',
        Low: 'bg-emerald-500/10 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border ring-1 ${styles[severity] || 'bg-zinc-100 text-zinc-600 border-zinc-200 ring-zinc-200/50'}`}>
            {severity || 'Standard'}
        </span>
    );
};

// ================== Main Component ==================
export const PatientProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedDiag, setExpandedDiag] = useState<string | null>(null);

    // Modal State
    const [isAddingMed, setIsAddingMed] = useState(false);
    const [submittingMed, setSubmittingMed] = useState(false);
    const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', instructions: '' });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await api.getPatientProfile(id!);
            setProfile(data);
        } catch (err: any) {
            setError(err.message || "Failed to load patient profile");
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchProfile(); }, [id]);

    const handleAddMedication = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingMed(true);
        try {
            await api.addMedication(id!, newMed);
            setIsAddingMed(false);
            setNewMed({ name: '', dosage: '', frequency: '', instructions: '' });
            fetchProfile();
        } catch (err: any) {
            toast.error(err.message || "Failed to add medication");
        } finally {
            setSubmittingMed(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-zinc-600 font-medium">Loading patient record...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center">
                <div className="text-center">
                    <div className="p-4 rounded-full bg-red-50 text-red-500 mx-auto mb-3 w-fit"><AlertTriangle size={24} /></div>
                    <p className="text-red-600 font-medium">{error || "Profile not found"}</p>
                    <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/patients')}>Back to Directory</Button>
                </div>
            </div>
        );
    }

    const activeMeds = profile.medications?.filter((m: any) => m.status === 'active') || [];
    const criticalDiagnoses = profile.diagnoses?.filter((d: any) => d.severity === 'Critical' || d.severity === 'High') || [];

    return (
        <div className="min-h-screen bg-zinc-50/50">
            {/* ==================== Glass Header ==================== */}
            <header className="border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary" size="sm"
                            className="w-8 h-8 p-0 rounded-xl flex items-center justify-center border-zinc-200"
                            onClick={() => navigate('/patients')}
                        >
                            <ArrowLeft size={16} className="text-zinc-600" />
                        </Button>
                        <div className="h-6 w-px bg-zinc-200 mx-1" />
                        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shadow-md shadow-black/20">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Patient Profile</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* ==================== Hero Patient Card ==================== */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden"
                >
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-zinc-900 opacity-[0.03]" />
                    <div className="flex flex-col md:flex-row md:items-center gap-5 relative z-10">
                        <div className={`w-20 h-20 rounded-2xl bg-linear-to-tr ${getGradient(id || 'a')} text-white flex items-center justify-center font-bold text-3xl shadow-lg ring-4 ring-white`}>
                            {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">{profile.full_name || 'Unnamed Patient'}</h2>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-zinc-500">
                                <span className="flex items-center gap-1.5 font-mono text-xs bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200/60">@{profile.username}</span>
                                <span className="flex items-center gap-1.5"><Mail size={14} className="text-zinc-400" />{profile.email}</span>
                                {profile.phone && <span className="flex items-center gap-1.5"><Phone size={14} className="text-zinc-400" />{profile.phone}</span>}
                            </div>
                        </div>
                        {/* Quick Stats */}
                        <div className="flex gap-3 md:gap-5">
                            <div className="text-center px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200/60">
                                <div className="text-2xl font-bold text-zinc-900">{profile.diagnoses?.length || 0}</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Records</div>
                            </div>
                            <div className="text-center px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200/60">
                                <div className="text-2xl font-bold text-zinc-900">{activeMeds.length}</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Active Rx</div>
                            </div>
                            {criticalDiagnoses.length > 0 && (
                                <div className="text-center px-4 py-2 rounded-xl bg-red-50 border border-red-200/60">
                                    <div className="text-2xl font-bold text-red-600">{criticalDiagnoses.length}</div>
                                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider mt-0.5">Critical</div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ==================== Left Column ==================== */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Demographics Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl border border-zinc-200/60 p-5 shadow-sm"
                        >
                            <h3 className="font-semibold text-zinc-900 flex items-center gap-2 mb-4">
                                <div className="p-1.5 rounded-lg bg-zinc-100"><User size={16} className="text-zinc-500" /></div>
                                Demographics
                            </h3>
                            <div className="space-y-3 text-sm">
                                {[
                                    { label: 'Full Name', value: profile.full_name || 'N/A' },
                                    { label: 'Username', value: `@${profile.username}` },
                                    { label: 'Email', value: profile.email },
                                    { label: 'Phone', value: profile.phone || 'N/A' },
                                    { label: 'Registered', value: new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center border-b border-zinc-100 pb-2 last:border-0">
                                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{label}</span>
                                        <span className="text-zinc-900 font-medium text-right max-w-[60%] truncate">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Active Medications */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl border border-zinc-200/60 p-5 shadow-sm relative overflow-hidden"
                        >
                            <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-emerald-500 opacity-[0.04]" />
                            <div className="flex justify-between items-center mb-4 relative z-10">
                                <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-emerald-50"><Pill size={16} className="text-emerald-600" /></div>
                                    Active Prescriptions
                                    <span className="ml-1 text-xs bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200/60">
                                        {activeMeds.length}
                                    </span>
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsAddingMed(true)}
                                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-md shadow-black/20"
                                >
                                    <Plus size={16} />
                                </motion.button>
                            </div>

                            <div className="space-y-3 relative z-10">
                                {profile.medications.length === 0 ? (
                                    <div className="text-center py-6">
                                        <Pill size={28} className="mx-auto text-zinc-300 mb-2" />
                                        <p className="text-sm text-zinc-500 font-medium">No prescriptions</p>
                                        <p className="text-xs text-zinc-400">Click + to add one</p>
                                    </div>
                                ) : (
                                    profile.medications.map((med: any) => (
                                        <div key={med.id} className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <p className="font-semibold text-sm text-zinc-900">{med.name}</p>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                                    med.status === 'active'
                                                        ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                                                        : 'text-zinc-500 bg-zinc-100 border-zinc-200'
                                                }`}>{med.status}</span>
                                            </div>
                                            <p className="text-xs text-zinc-600 font-medium">{med.dosage} · {med.frequency}</p>
                                            {med.prescribing_doctor && (
                                                <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1">
                                                    <Shield size={10} /> Dr. {med.prescribing_doctor}
                                                </p>
                                            )}
                                            {med.instructions && <p className="text-xs text-zinc-500 mt-1 italic border-l-2 border-zinc-200 pl-2">"{med.instructions}"</p>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* ==================== Right Column: EMR Timeline ==================== */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-sm min-h-[500px]"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-black text-white shadow-sm"><Activity size={18} /></div>
                                    Medical History
                                    <span className="ml-1 text-xs bg-zinc-100 text-zinc-500 px-2.5 py-1 rounded-full font-semibold border border-zinc-200/60">
                                        {profile.diagnoses?.length || 0} records
                                    </span>
                                </h3>
                            </div>

                            {profile.diagnoses.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mx-auto mb-4">
                                        <Stethoscope size={32} className="text-zinc-300" />
                                    </div>
                                    <h4 className="text-zinc-900 font-medium mb-1">No Medical Records</h4>
                                    <p className="text-sm text-zinc-500">Diagnosis records will appear here when available.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {profile.diagnoses.map((diag: any, idx: number) => {
                                        const isExpanded = expandedDiag === diag.id;
                                        let resultData = diag.result || {};
                                        if (typeof resultData === 'string') {
                                            try { resultData = JSON.parse(resultData); } catch { resultData = {}; }
                                        }
                                        return (
                                            <motion.div
                                                key={diag.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.06 }}
                                                className={`border rounded-2xl transition-all overflow-hidden ${
                                                    diag.severity === 'Critical' ? 'border-red-200/60 bg-red-50/20' :
                                                    diag.severity === 'High' ? 'border-orange-200/60 bg-orange-50/20' :
                                                    'border-zinc-200/60 bg-white'
                                                }`}
                                            >
                                                <div
                                                    className="p-4 cursor-pointer flex items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
                                                    onClick={() => setExpandedDiag(isExpanded ? null : diag.id)}
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className={`p-2 rounded-xl shrink-0 ${
                                                            diag.severity === 'Critical' ? 'bg-red-100 text-red-600' :
                                                            diag.severity === 'High' ? 'bg-orange-100 text-orange-600' :
                                                            'bg-zinc-100 text-zinc-500'
                                                        }`}>
                                                            <Stethoscope size={16} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold text-zinc-900 truncate">{diag.primary_diagnosis || "Diagnostic Scan"}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <SeverityBadge severity={diag.severity} />
                                                                <span className="text-xs text-zinc-500">{diag.condition_category || 'General'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-sm font-medium text-zinc-700">{new Date(diag.date).toLocaleDateString()}</p>
                                                            <p className="text-xs text-zinc-500 font-mono">{new Date(diag.date).toLocaleTimeString()}</p>
                                                        </div>
                                                        <button className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.25 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50/50">
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                                                    <div>
                                                                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Severity</span>
                                                                        <span className="text-zinc-900 font-medium">{diag.severity || 'N/A'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Category</span>
                                                                        <span className="text-zinc-900">{diag.condition_category || 'General'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Confidence</span>
                                                                        <span className="text-zinc-900 font-medium">{diag.confidence ? `${(diag.confidence * 100).toFixed(0)}%` : 'N/A'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Attention</span>
                                                                        <span className={`font-medium ${diag.requires_immediate_attention ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                            {diag.requires_immediate_attention ? '⚠ Required' : '✓ Standard'}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <Button
                                                                    variant="secondary" size="sm"
                                                                    className="text-xs gap-1.5 border-zinc-200"
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                        navigate('/diagnosis/result', {
                                                                            state: {
                                                                                patient_id: profile.username,
                                                                                differential_diagnosis: resultData.differential_diagnosis || [],
                                                                                severity: diag.severity,
                                                                                condition_category: diag.condition_category,
                                                                                requires_immediate_attention: diag.requires_immediate_attention,
                                                                                recommended_tests: resultData.recommended_tests || [],
                                                                                citations: resultData.citations || [],
                                                                                clinical_notes: resultData.clinical_notes || '',
                                                                                timestamp: diag.date || diag.created_at
                                                                            } as DiagnosisResult
                                                                        });
                                                                    }}
                                                                >
                                                                    <Eye size={14} /> View Full Report
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* ==================== Add Medication Modal ==================== */}
            <AnimatePresence>
                {isAddingMed && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsAddingMed(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-2xl shadow-2xl border border-zinc-100 w-full max-w-md p-6 relative z-10"
                        >
                            <button onClick={() => setIsAddingMed(false)} className="absolute top-4 right-4 p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-colors">
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 rounded-xl bg-black text-white"><Pill size={18} /></div>
                                <div>
                                    <h2 className="text-lg font-bold text-zinc-900">New Prescription</h2>
                                    <p className="text-xs text-zinc-500">For {profile.full_name || profile.username}</p>
                                </div>
                            </div>
                            <form onSubmit={handleAddMedication} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">Medication Name</label>
                                    <input required type="text" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-zinc-400 outline-none transition-all text-sm" placeholder="e.g. Amoxicillin" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">Dosage</label>
                                        <input required type="text" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-zinc-400 outline-none transition-all text-sm" placeholder="e.g. 500mg" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">Frequency</label>
                                        <input required type="text" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-zinc-400 outline-none transition-all text-sm" placeholder="e.g. Twice daily" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">Instructions (Optional)</label>
                                    <textarea rows={2} value={newMed.instructions} onChange={e => setNewMed({...newMed, instructions: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-zinc-400 outline-none resize-none transition-all text-sm" placeholder="e.g. Take with food" />
                                </div>
                                <motion.button
                                    type="submit"
                                    disabled={submittingMed}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                    className="w-full py-2.5 bg-black text-white font-semibold rounded-xl hover:bg-zinc-800 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submittingMed ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Prescribing...</>
                                    ) : (
                                        'Prescribe Medication'
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientProfilePage;
