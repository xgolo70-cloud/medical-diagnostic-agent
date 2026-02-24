import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    CheckCircle2, 
    FileText, 
    Download,
    Activity,
    Brain,
    Beaker,
    BookOpen,
    Info,
    Calendar,
    User,
    AlertTriangle,
    Sparkles,
    Shield,
    Plus
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import type { DiagnosisResult } from '../types';

export const DiagnosisResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state as DiagnosisResult | null;

    useEffect(() => {
        if (!result) {
            navigate('/diagnosis', { replace: true });
        }
    }, [result, navigate]);

    if (!result) return null;

    const primaryDiagnosis = result.differential_diagnosis?.[0];

    if (!primaryDiagnosis) {
         return (
            <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                        <Activity className="text-zinc-400" size={28} />
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-900 mb-2">No Diagnosis Found</h2>
                    <p className="text-zinc-500 text-sm mb-6">The analysis didn't return any results. Try again with different parameters.</p>
                    <Button onClick={() => navigate('/diagnosis')} className="bg-black text-white hover:bg-zinc-800 shadow-md shadow-black/20">
                        <ArrowLeft size={14} className="mr-2" />
                        Return to Diagnosis
                    </Button>
                </motion.div>
            </div>
         );
    }

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.7) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (confidence >= 0.4) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getConfidenceBarColor = (confidence: number) => {
        if (confidence >= 0.7) return 'bg-emerald-500';
        if (confidence >= 0.4) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const getSeverityColor = (severity?: string) => {
        if (!severity) return 'bg-zinc-100 text-zinc-700';
        const s = severity.toLowerCase();
        if (s.includes('critical')) return 'bg-red-100 text-red-700 border-red-200';
        if (s.includes('high')) return 'bg-orange-100 text-orange-700 border-orange-200';
        if (s.includes('medium')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (s.includes('low')) return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    };

    return (
        <div className="min-h-screen bg-zinc-50/50">
            {/* Glass Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => navigate('/diagnosis')}
                            className="w-8 h-8 p-0 rounded-xl flex items-center justify-center border-zinc-200"
                        >
                            <ArrowLeft size={16} className="text-zinc-600" />
                        </Button>
                        <div className="h-6 w-px bg-zinc-200" />
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-md shadow-black/20">
                                <Activity size={16} />
                            </div>
                            <div>
                                <h1 className="text-sm font-semibold text-zinc-900 leading-none">Diagnosis Report</h1>
                                <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">ID: {result.patient_id || 'ANON-001'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="hidden sm:flex rounded-xl border-zinc-200 gap-2"
                            onClick={() => window.print()}
                        >
                            <Download size={14} />
                            Export PDF
                        </Button>
                        <Button 
                            size="sm"
                            onClick={() => navigate('/diagnosis')}
                            className="bg-black text-white hover:bg-zinc-800 rounded-xl shadow-md shadow-black/20 gap-2"
                        >
                            <Plus size={14} />
                            New Analysis
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Primary Result Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden relative"
                        >
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                                                <CheckCircle2 size={10} />
                                                Primary Diagnosis
                                            </span>
                                            <span className="text-[10px] text-zinc-400 font-mono">
                                                {new Date(result.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-2">
                                            {primaryDiagnosis.primary_diagnosis}
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                                            <Sparkles size={14} className="text-amber-500" />
                                            <span>AI confidence score based on analyzed symptoms</span>
                                        </div>
                                    </div>
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.3, type: 'spring' }}
                                        className="flex flex-col items-center bg-zinc-50 rounded-2xl p-4 border border-zinc-100 min-w-[100px]"
                                    >
                                        <div className="text-3xl font-bold text-zinc-900 tabular-nums">
                                            {Math.round(primaryDiagnosis.confidence * 100)}%
                                        </div>
                                        <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Confidence</div>
                                    </motion.div>
                                </div>

                                {/* Smart Classification Badges */}
                                <div className="flex flex-wrap items-center gap-2 mb-6">
                                    {result.severity && (
                                        <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${getSeverityColor(result.severity)}`}>
                                            Severity: {result.severity}
                                        </span>
                                    )}
                                    {result.condition_category && (
                                        <span className="px-2.5 py-1 rounded-xl text-xs font-semibold border bg-indigo-50 text-indigo-700 border-indigo-100">
                                            Category: {result.condition_category}
                                        </span>
                                    )}
                                </div>
                                
                                {result.requires_immediate_attention && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
                                    >
                                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <h4 className="text-sm font-bold text-red-900">Immediate Attention Required</h4>
                                            <p className="text-sm text-red-700 mt-1">This diagnosis indicates a potentially critical condition that requires prompt medical review.</p>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="prose prose-sm max-w-none text-zinc-600 bg-zinc-50/60 p-6 rounded-xl border border-zinc-100">
                                    <h3 className="text-zinc-900 font-semibold mb-2 flex items-center gap-2 text-sm">
                                        <Info size={14} /> Clinical Rationale
                                    </h3>
                                    <p className="leading-relaxed m-0">{primaryDiagnosis.rationale}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Differential Diagnoses */}
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                                    <Brain size={16} />
                                </div>
                                Differential Diagnosis
                                <span className="ml-auto text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                    {result.differential_diagnosis.length - 1} alternatives
                                </span>
                            </h3>
                            <div className="space-y-3">
                                {result.differential_diagnosis.slice(1).map((diagnosis, index) => (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        whileHover={{ x: 4 }}
                                        className="bg-white rounded-xl border border-zinc-200/60 p-5 shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white flex items-center justify-center text-sm font-bold text-zinc-500 transition-colors">
                                                    {index + 2}
                                                </div>
                                                <h4 className="text-base font-semibold text-zinc-900">
                                                    {diagnosis.primary_diagnosis}
                                                </h4>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getConfidenceColor(diagnosis.confidence)}`}>
                                                {Math.round(diagnosis.confidence * 100)}% Match
                                            </div>
                                        </div>
                                        
                                        <div className="w-full bg-zinc-100 rounded-full h-1.5 mb-3 overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${diagnosis.confidence * 100}%` }}
                                                transition={{ delay: 0.2 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
                                                className={`h-full rounded-full ${getConfidenceBarColor(diagnosis.confidence)}`}
                                            />
                                        </div>

                                        <p className="text-sm text-zinc-600 leading-relaxed pl-11">
                                            {diagnosis.rationale}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                         {/* Clinical Notes */}
                         {result.clinical_notes && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-amber-50/80 rounded-xl border border-amber-100 p-6"
                            >
                                <h3 className="text-amber-900 font-semibold mb-3 flex items-center gap-2 text-sm">
                                    <FileText size={16} /> Additional Clinical Notes
                                </h3>
                                <p className="text-sm text-amber-800/80 leading-relaxed">
                                    {result.clinical_notes}
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Actions & Info */}
                    <div className="space-y-4">
                        
                        {/* Recommended Tests */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/40 flex items-center gap-2">
                                <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
                                    <Beaker size={14} />
                                </div>
                                <h3 className="font-semibold text-zinc-900 text-sm">Recommended Tests</h3>
                            </div>
                            <div className="p-2">
                                {result.recommended_tests.map((test, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.05 }}
                                        className="flex items-start gap-3 p-3 hover:bg-zinc-50 rounded-xl transition-colors"
                                    >
                                        <CheckCircle2 size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-zinc-700">{test}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Citations */}
                        {result.citations && result.citations.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden"
                            >
                                <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/40 flex items-center gap-2">
                                    <div className="p-1 rounded-lg bg-amber-50 text-amber-600">
                                        <BookOpen size={14} />
                                    </div>
                                    <h3 className="font-semibold text-zinc-900 text-sm">References</h3>
                                    <span className="ml-auto text-[10px] font-bold text-zinc-400">{result.citations.length}</span>
                                </div>
                                <div className="p-2">
                                    {result.citations.map((citation, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 hover:bg-zinc-50 rounded-xl transition-colors group cursor-pointer">
                                            <span className="text-[10px] font-mono text-zinc-400 group-hover:text-black font-bold bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors">{i + 1}</span>
                                            <span className="text-xs text-zinc-600 group-hover:text-zinc-900 transition-colors leading-relaxed">{citation}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Metadata */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-4 space-y-3"
                        >
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-500 flex items-center gap-2">
                                    <User size={13} /> Patient
                                </span>
                                <span className="font-semibold text-zinc-900 font-mono text-xs">{result.patient_id}</span>
                            </div>
                            <div className="h-px bg-zinc-100" />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-500 flex items-center gap-2">
                                    <Calendar size={13} /> Date
                                </span>
                                <span className="font-semibold text-zinc-900 text-xs">{new Date(result.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                        </motion.div>

                        {/* AI Disclaimer */}
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium px-2">
                            <Shield size={10} />
                            AI-assisted analysis — always verify with licensed clinicians
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};
