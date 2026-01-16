import React, { useState, useRef, useCallback, useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Image as ImageIcon,
    Mic,
    Upload,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Stethoscope,
    Brain,
    Eye,
    Bone,
    Heart,
    Microscope,
    FileText,
    Pause,
    RotateCcw,
    Activity,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { exportDiagnosisReport } from '../lib/pdfExport';
import gsap from 'gsap';

// Types and API (Same as before)
interface AnalysisResult {
    analysis: string;
    modality: string;
    findings: string[];
    recommendations: string[];
    filename?: string;
    processing_time?: string;
}

interface ApiStatus {
    medgemma_available: boolean;
    medasr_available: boolean;
    genai_configured: boolean;
    message: string;
}

const API_BASE = 'http://localhost:8000/api/medgemma';

const medgemmaApi = {
    checkStatus: async (): Promise<ApiStatus> => {
        const res = await fetch(`${API_BASE}/status`);
        if (!res.ok) throw new Error('Failed to check API status');
        return res.json();
    },
    analyzeImage: async (file: File, modality: string, prompt: string): Promise<AnalysisResult> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('modality', modality);
        formData.append('prompt', prompt);
        const res = await fetch(`${API_BASE}/analyze-image-upload`, { method: 'POST', body: formData });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Analysis failed');
        }
        return res.json();
    }
};

const MODALITIES = [
    { id: 'xray', label: 'X-Ray', icon: Bone },
    { id: 'ct', label: 'CT Scan', icon: Brain },
    { id: 'mri', label: 'MRI', icon: Brain },
    { id: 'dermatology', label: 'Skin', icon: Eye },
    { id: 'pathology', label: 'Pathology', icon: Microscope },
    { id: 'fundus', label: 'Retinal', icon: Eye },
];

const ImageAnalyzer: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [modality, setModality] = useState('xray');
    const [prompt, setPrompt] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }
        setSelectedFile(file);
        setError(null);
        setResult(null);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleAnalyze = async () => {
        if (!selectedFile) return;
        setIsAnalyzing(true);
        setError(null);
        try {
            const analysis = await medgemmaApi.analyzeImage(selectedFile, modality, prompt || 'Provide a detailed analysis of this medical image.');
            setResult(analysis);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
        setPrompt('');
    };

    return (
        <div className="space-y-6">
            {/* Modality Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                     <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                        <Stethoscope size={16} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Select Modality</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-tour="modality-select">
                    {MODALITIES.map((mod) => {
                        const IconComponent = mod.icon;
                        const isSelected = modality === mod.id;
                        return (
                            <button
                                key={mod.id}
                                onClick={() => setModality(mod.id)}
                                className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 text-center group relative overflow-hidden ${
                                    isSelected
                                        ? 'bg-black text-white border-black shadow-md'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <IconComponent size={20} className={isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                                <span className="text-xs font-medium">{mod.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div className="space-y-6">
                    <div
                        className={`relative rounded-xl border-2 border-dashed transition-all min-h-[400px] flex flex-col items-center justify-center cursor-pointer bg-white ${
                            isDragging 
                                ? 'border-blue-500 bg-blue-50' 
                                : preview 
                                    ? 'border-gray-200 p-0 overflow-hidden' 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => !preview && fileInputRef.current?.click()}
                        data-tour="upload-area"
                    >
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} aria-label="Select medical image file" />
                        
                        {preview ? (
                            <div className="relative w-full h-full bg-gray-900 flex items-center justify-center group">
                                <img src={preview} alt="Medical preview" className="w-full h-full object-contain max-h-[400px]" />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleReset(); }} 
                                        className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                        <RotateCcw size={14} />
                                        Replace Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="text-gray-400" size={24} />
                                </div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-1">Upload Scans</h4>
                                <p className="text-xs text-gray-500 mb-4">Drag & drop DICOM, PNG, or JPG files</p>
                                <span className="px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium shadow-sm hover:shadow-md transition-shadow">
                                    Select File
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                        <div>
                             <label className="text-xs font-semibold text-gray-900 mb-2 block">Clinical Notes (Optional)</label>
                             <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Add specific areas to focus on..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all resize-none h-24 placeholder:text-gray-400 text-gray-800"
                            />
                        </div>
                        <Button
                            onClick={handleAnalyze}
                            disabled={!selectedFile || isAnalyzing}
                            className={`w-full py-6 rounded-lg text-sm font-bold tracking-wide shadow-md hover:shadow-lg transition-all ${
                                selectedFile && !isAnalyzing
                                    ? 'bg-black text-white hover:bg-gray-800'
                                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                            }`}
                        >
                            {isAnalyzing ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles size={16} />
                                    Run Analysis
                                </div>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    {error ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-gray-900 font-medium mb-1">Analysis Error</h3>
                            <p className="text-gray-500 text-sm">{error}</p>
                        </div>
                    ) : result ? (
                        <div className="flex flex-col h-full">
                            {/* Result Header */}
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-semibold text-gray-900">Analysis Complete</span>
                                </div>
                                {result.processing_time && (
                                    <span className="px-2 py-1 rounded bg-white border border-gray-200 text-[10px] font-mono text-gray-500">
                                        {result.processing_time}
                                    </span>
                                )}
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="gap-2"
                                    aria-label="Export analysis as PDF"
                                    onClick={() => exportDiagnosisReport({
                                        modality: result.modality,
                                        analysis: result.analysis,
                                        findings: result.findings || [],
                                        recommendations: result.recommendations || [],
                                        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                                        processingTime: result.processing_time,
                                    })}
                                >
                                    <FileText size={14} />
                                    Export PDF
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                                <div className="prose prose-sm max-w-none">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Activity size={16} className="text-blue-600" />
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide m-0">Clinical Findings</h4>
                                    </div>
                                    <div className="text-gray-600 leading-relaxed text-justify bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        {result.analysis}
                                    </div>
                                </div>

                                {result.findings && result.findings.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Eye size={16} className="text-amber-500" />
                                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Key Observations</h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {result.findings.map((finding, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 group">
                                                    <span className="flex-shrink-0 w-5 h-5 rounded bg-amber-50 text-amber-600 flex items-center justify-center text-[10px] font-bold mt-0.5 border border-amber-100">
                                                        {i + 1}
                                                    </span>
                                                    <span className="group-hover:text-gray-900 transition-colors">{finding}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {result.recommendations && result.recommendations.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Heart size={16} className="text-red-500" />
                                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Recommendations</h4>
                                        </div>
                                        <div className="grid gap-2">
                                            {result.recommendations.map((rec, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-red-100 hover:bg-red-50/30 transition-all cursor-default">
                                                    <ChevronRight size={14} className="text-red-400" />
                                                    <span className="text-sm text-gray-700 font-medium">{rec}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                            <div className="w-16 h-16 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-4">
                                <Activity className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-gray-900 font-semibold mb-1">Results View</h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                AI analysis findings and recommendations will appear here after processing.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
             {/* Disclaimer */}
             <div className="flex gap-3 items-start p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900/80 leading-relaxed">
                    <span className="font-semibold text-amber-900">Disclaimer: </span>
                    AI generated results are for investigational use only. Always verify with a certified radiologist.
                </div>
            </div>
        </div>
    );
};

const SpeechToText: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Recorder Card */}
                <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-8">
                         {isRecording && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-75" />
                                <div className="absolute -inset-4 rounded-full border border-red-100 animate-pulse" />
                            </>
                         )}
                        <button
                            onClick={() => setIsRecording(!isRecording)}
                            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${
                                isRecording ? 'bg-red-500 text-white' : 'bg-black text-white'
                            }`}
                        >
                            {isRecording ? <Pause size={32} fill="currentColor" /> : <Mic size={32} />}
                        </button>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {isRecording ? 'Recording in progress...' : 'Start Dictation'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-8 max-w-[200px]">
                        Speak clearly. MedASR will transcribe medical terminology in real-time.
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        {isRecording && (
                             <Button 
                                variant="outline" 
                                onClick={() => setIsPaused(!isPaused)}
                                className="w-full justify-center"
                            >
                                {isPaused ? 'Resume Recording' : 'Pause Recording'}
                            </Button>
                        )}
                         <Button 
                            variant="secondary" 
                            onClick={() => { setIsRecording(false); setIsPaused(false); }}
                            className="w-full justify-center bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600"
                        >
                            Reset Session
                        </Button>
                    </div>
                </div>

                {/* Transcription View */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-[500px]">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-400" />
                            <h3 className="text-sm font-semibold text-gray-900">Live Transcription</h3>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="flex h-2 w-2 relative">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRecording ? 'bg-red-400' : 'hidden'}`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isRecording ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                            </span>
                             <span className="text-xs font-mono text-gray-500">{isRecording ? '00:14' : 'Ready'}</span>
                        </div>
                    </div>
                    <div className="flex-1 p-6 bg-white overflow-y-auto">
                         <div className="space-y-4">
                            <p className="text-gray-500 italic text-sm text-center mt-20">
                                Words will appear here as you speak...
                            </p>
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <Button size="sm" variant="secondary" className="gap-2">
                            <Upload size={14} /> Export PDF
                        </Button>
                        <Button size="sm" className="bg-black text-white hover:bg-gray-800 shadow-md gap-2">
                            <CheckCircle2 size={14} /> Save to Patient Record
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MedAIPage: React.FC = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        medgemmaApi.checkStatus().then(setApiStatus).catch(() => setApiStatus(null));
    }, []);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".page-header", { y: -10, opacity: 0, duration: 0.6, ease: "power3.out" });
            gsap.from(".tab-content", { y: 10, opacity: 0, duration: 0.4, delay: 0.1, ease: "power2.out" });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#fafafa]">
             {/* Glass Header - Matching Dashboard */}
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
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">MedGemma</h1>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase border border-blue-100">v1.5 Local</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {apiStatus ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
                                <span className={`flex h-2 w-2 relative`}>
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiStatus.medgemma_available ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${apiStatus.medgemma_available ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                </span>
                                <span className="text-xs font-medium text-gray-600">
                                    {apiStatus.medgemma_available ? 'Model Active' : 'Connecting...'}
                                </span>
                            </div>
                        ) : null}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                 {/* Page Title & Tabs */}
                 <div className="page-header flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Diagnostic Tools</h2>
                        <p className="text-gray-500 text-sm">Select a tool to begin your session.</p>
                    </div>
                    
                    <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex">
                        <button
                            onClick={() => setTabValue(0)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                tabValue === 0 
                                    ? 'bg-black text-white shadow-md' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <ImageIcon size={16} />
                            Image Analysis
                        </button>
                        <button
                            onClick={() => setTabValue(1)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                tabValue === 1 
                                    ? 'bg-black text-white shadow-md' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <Mic size={16} />
                            Medical Dictation
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="tab-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tabValue}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            {tabValue === 0 ? <ImageAnalyzer /> : <SpeechToText />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default MedAIPage;
