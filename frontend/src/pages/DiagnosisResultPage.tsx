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
    User
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">No Diagnosis Found</h2>
                    <Button onClick={() => navigate('/diagnosis')}>Return to Diagnosis</Button>
                </div>
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

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => navigate('/diagnosis')}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back
                        </Button>
                        <div className="h-6 w-px bg-gray-200" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shadow-md">
                                <Activity size={18} />
                            </div>
                            <div>
                                <h1 className="text-sm font-semibold text-gray-900 leading-none">Diagnosis Report</h1>
                                <p className="text-xs text-gray-500 mt-0.5">ID: {result.patient_id || 'ANON-001'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="hidden sm:flex bg-white border border-gray-200"
                            onClick={() => window.print()}
                        >
                            <Download size={16} className="mr-2" />
                            Export PDF
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => navigate('/diagnosis')}>
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
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                            <div className="p-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                                Primary Diagnosis
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(result.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                                            {primaryDiagnosis.primary_diagnosis}
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                            <span>confidence score based on analyzed symptoms</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-4xl font-bold text-gray-900">
                                            {Math.round(primaryDiagnosis.confidence * 100)}%
                                        </div>
                                        <div className="text-sm text-emerald-600 font-medium">Confidence</div>
                                    </div>
                                </div>

                                <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                    <h3 className="text-gray-900 font-semibold mb-2 flex items-center gap-2">
                                        <Info size={16} /> Clinical Rationale
                                    </h3>
                                    <p>{primaryDiagnosis.rationale}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Differential Diagnoses */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Brain size={20} className="text-gray-400" />
                                Differential Diagnosis
                            </h3>
                            <div className="space-y-4">
                                {result.differential_diagnosis.slice(1).map((diagnosis, index) => (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                                                    {index + 2}
                                                </div>
                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    {diagnosis.primary_diagnosis}
                                                </h4>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getConfidenceColor(diagnosis.confidence)}`}>
                                                {Math.round(diagnosis.confidence * 100)}% Match
                                            </div>
                                        </div>
                                        
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${getConfidenceBarColor(diagnosis.confidence)}`} 
                                                style={{ width: `${diagnosis.confidence * 100}%` }}
                                            />
                                        </div>

                                        <p className="text-sm text-gray-600 leading-relaxed pl-11">
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
                                className="bg-amber-50 rounded-xl border border-amber-100 p-6"
                            >
                                <h3 className="text-amber-900 font-semibold mb-3 flex items-center gap-2">
                                    <FileText size={18} /> Additional Clinical Notes
                                </h3>
                                <p className="text-sm text-amber-800/80 leading-relaxed">
                                    {result.clinical_notes}
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Actions & Info */}
                    <div className="space-y-6">
                        
                        {/* Recommended Tests */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                <Beaker size={18} className="text-gray-400" />
                                <h3 className="font-semibold text-gray-900">Recommended Tests</h3>
                            </div>
                            <div className="p-2">
                                {result.recommended_tests.map((test, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-gray-700">{test}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Citations */}
                        {result.citations && result.citations.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                            >
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                    <BookOpen size={18} className="text-gray-400" />
                                    <h3 className="font-semibold text-gray-900">References</h3>
                                </div>
                                <div className="p-2">
                                    {result.citations.map((citation, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer">
                                            <span className="text-xs font-mono text-gray-400 group-hover:text-black">[{i + 1}]</span>
                                            <span className="text-xs text-gray-600 group-hover:text-gray-900">{citation}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Metadata */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <User size={14} /> Patient
                                </span>
                                <span className="font-medium text-gray-900">{result.patient_id}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <Calendar size={14} /> Date
                                </span>
                                <span className="font-medium text-gray-900">{new Date(result.timestamp).toLocaleDateString()}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};
