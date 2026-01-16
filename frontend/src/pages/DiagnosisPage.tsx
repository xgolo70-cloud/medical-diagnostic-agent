import React, { useState, useRef, useLayoutEffect } from 'react';
import { 
    Edit3 as ManualIcon, 
    Upload as UploadIcon, 
    Stethoscope, 
    ArrowLeft,
    CheckCircle2,
    FileText
} from 'lucide-react';
import { DiagnosisForm } from '../components/diagnosis';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { useGsapContext } from '../lib/animations';

export const DiagnosisPage: React.FC = () => {
    const navigate = useNavigate();
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
        <div ref={containerRef} className="min-h-screen bg-[#fafafa]">
             {/* Glass Header */}
             <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
                            <Stethoscope className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">New Diagnosis</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
                             <CheckCircle2 size={12} />
                             AI Assistant Ready
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                {/* Intro Section */}
                <div className="mb-8">
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Assessment</h2>
                     <p className="text-gray-500 text-sm max-w-2xl">
                        Enter clinical details manually or upload existing lab reports. The AI engine will analyze parameters to suggest differential diagnoses.
                     </p>
                </div>

                {/* Custom Tab Switcher */}
                <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm inline-flex mb-8 w-full md:w-auto">
                    <button
                        onClick={() => setTabValue(0)}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            tabValue === 0 
                                ? 'bg-black text-white shadow-md' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <ManualIcon size={16} />
                        Manual Entry
                    </button>
                    <button
                        onClick={() => setTabValue(1)}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                             tabValue === 1 
                                ? 'bg-black text-white shadow-md' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <UploadIcon size={16} />
                        Upload Report
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden tab-content min-h-[500px]">
                    {/* Context Header */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            {tabValue === 0 ? <FileText size={16} className="text-gray-400" /> : <UploadIcon size={16} className="text-gray-400" />}
                            <h3 className="text-sm font-semibold text-gray-900">
                                {tabValue === 0 ? 'Clinical Parameters Form' : 'Document Analysis'}
                            </h3>
                        </div>
                       
                        {/* Removed step indicator */}

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
                </div>

                {/* Disclaimer Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        Protected Health Information (PHI) is processed locally on secure edge infrastructure.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default DiagnosisPage;
