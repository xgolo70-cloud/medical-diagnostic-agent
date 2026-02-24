import React, { useState, useRef, useLayoutEffect } from 'react';
import { 
    Edit3 as ManualIcon, 
    Upload as UploadIcon, 
    Stethoscope, 
    CheckCircle2,
    FileText,
    Sparkles,
    Shield,
    Zap
} from 'lucide-react';
import { DiagnosisForm } from '../components/diagnosis';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { useGsapContext } from '../lib/animations';
import { PageHeader } from '../components/layout/PageHeader';

export const DiagnosisPage: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useGsapContext(containerRef);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".tab-content", {
                y: 10,
                opacity: 0,
                duration: 0.4,
                delay: 0.2,
                ease: "power2.out"
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
            if (e.key === '1') setTabValue(0);
            else if (e.key === '2') setTabValue(1);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-zinc-50/50">
             {/* Unified Header */}
             <PageHeader
                title="New Diagnosis"
                icon={<Stethoscope size={18} />}
                badge={
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200/60"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <CheckCircle2 size={12} />
                        </motion.div>
                        AI Assistant Ready
                    </motion.div>
                }
             />

            <main className="max-w-4xl mx-auto px-6 py-10">
                {/* ==================== Hero Section ==================== */}
                <motion.div 
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                     <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2 flex items-center gap-2">
                        Patient Assessment
                        <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                        >
                            <Sparkles size={20} className="text-amber-400" />
                        </motion.span>
                     </h2>
                     <p className="text-zinc-500 text-sm max-w-2xl leading-relaxed">
                        Enter clinical details manually or upload existing lab reports. The AI engine will analyze parameters to suggest differential diagnoses.
                     </p>
                     
                     {/* Feature Chips */}
                     <div className="flex flex-wrap gap-2 mt-4">
                        {[
                            { icon: <Zap size={12} />, label: 'AI-Powered Analysis', accent: 'bg-amber-50 text-amber-700 border-amber-200/60' },
                            { icon: <Shield size={12} />, label: 'HIPAA Compliant', accent: 'bg-blue-50 text-blue-700 border-blue-200/60' },
                            { icon: <Sparkles size={12} />, label: 'Image Analysis Available', accent: 'bg-purple-50 text-purple-700 border-purple-200/60' },
                        ].map(chip => (
                            <span key={chip.label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${chip.accent}`}>
                                {chip.icon} {chip.label}
                            </span>
                        ))}
                     </div>
                </motion.div>

                {/* ==================== Mode Switcher ==================== */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-1.5 rounded-2xl border border-zinc-200/60 shadow-sm inline-flex mb-8 w-full md:w-auto"
                >
                    <button
                        onClick={() => setTabValue(0)}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            tabValue === 0 
                                ? 'bg-black text-white shadow-md shadow-black/20' 
                                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                        }`}
                    >
                        <ManualIcon size={16} />
                        Manual Entry
                    </button>
                    <button
                        onClick={() => setTabValue(1)}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                             tabValue === 1 
                                ? 'bg-black text-white shadow-md shadow-black/20' 
                                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                        }`}
                    >
                        <UploadIcon size={16} />
                        Upload Report
                    </button>
                </motion.div>

                {/* ==================== Content Area ==================== */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm overflow-hidden tab-content min-h-[500px]"
                >
                    {/* Context Header */}
                    <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/40 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-zinc-100">
                                {tabValue === 0 ? <FileText size={14} className="text-zinc-500" /> : <UploadIcon size={14} className="text-zinc-500" />}
                            </div>
                            <h3 className="text-sm font-semibold text-zinc-900">
                                {tabValue === 0 ? 'Clinical Parameters Form' : 'Document Analysis'}
                            </h3>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <kbd className="min-w-[20px] h-5 flex items-center justify-center px-1.5 text-[10px] font-bold text-zinc-500 bg-zinc-100 border border-zinc-200 rounded shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)]">1</kbd>
                            <span className="text-[10px] text-zinc-400 font-medium">Manual</span>
                            <div className="w-px h-3 bg-zinc-200 mx-1" />
                            <kbd className="min-w-[20px] h-5 flex items-center justify-center px-1.5 text-[10px] font-bold text-zinc-500 bg-zinc-100 border border-zinc-200 rounded shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)]">2</kbd>
                            <span className="text-[10px] text-zinc-400 font-medium">Upload</span>
                        </div>
                    </div>
                    
                    <div className="p-0">
                         <AnimatePresence mode="wait">
                            <motion.div
                                key={tabValue}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {tabValue === 0 ? <DiagnosisForm unified={false} /> : <DiagnosisForm unified={true} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* ==================== Disclaimer Footer ==================== */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 flex items-center justify-center gap-2"
                >
                    <Shield size={12} className="text-zinc-400" />
                    <p className="text-xs text-zinc-400">
                        Protected Health Information (PHI) is processed locally on secure edge infrastructure.
                    </p>
                </motion.div>
            </main>
        </div>
    );
};

export default DiagnosisPage;
