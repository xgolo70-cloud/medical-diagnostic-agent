import React, { useState, useRef, useCallback, useLayoutEffect } from 'react';
import { authFetch } from '../utils/authFetch';
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
    ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/layout/PageHeader';
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

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/medgemma`;

const medgemmaApi = {
    checkStatus: async (): Promise<ApiStatus> => {
        const res = await authFetch(`${API_BASE}/status`);
        if (!res.ok) throw new Error('Failed to check API status');
        return res.json();
    },
    analyzeImage: async (file: File, modality: string, prompt: string): Promise<AnalysisResult> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('modality', modality);
        formData.append('prompt', prompt);
        
        const res = await authFetch(`${API_BASE}/analyze-image-upload`, { 
            method: 'POST', 
            body: formData
        });
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
            <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                     <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                        <Stethoscope size={16} />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900">Select Modality</h3>
                    <span className="ml-auto text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{MODALITIES.length} available</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-tour="modality-select">
                    {MODALITIES.map((mod, i) => {
                        const IconComponent = mod.icon;
                        const isSelected = modality === mod.id;
                        return (
                            <motion.button
                                key={mod.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.04, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setModality(mod.id)}
                                className={`p-4 rounded-xl border-2 transition-colors flex flex-col items-center gap-2.5 text-center group relative overflow-hidden ${
                                    isSelected
                                        ? 'bg-black text-white border-black shadow-lg shadow-black/20'
                                        : 'bg-white border-zinc-200/60 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                                }`}
                            >
                                {isSelected && (
                                    <motion.div
                                        layoutId="modality-glow"
                                        className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent"
                                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    />
                                )}
                                <IconComponent size={22} className={isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-600 transition-colors'} />
                                <span className="text-xs font-semibold tracking-wide">{mod.label}</span>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-2 right-2"
                                    >
                                        <CheckCircle2 size={12} className="text-white/70" />
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div className="space-y-6">
                    <div
                        className={`relative rounded-2xl border-2 border-dashed transition-all min-h-[400px] flex flex-col items-center justify-center cursor-pointer bg-white ${
                            isDragging 
                                ? 'border-blue-500 bg-blue-50/50 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' 
                                : preview 
                                    ? 'border-zinc-200 p-0 overflow-hidden' 
                                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50'
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => !preview && fileInputRef.current?.click()}
                        data-tour="upload-area"
                    >
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} aria-label="Select medical image file" />
                        
                        {preview ? (
                            <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center group">
                                <img src={preview} alt="Medical preview" className="w-full h-full object-contain max-h-[400px]" />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleReset(); }} 
                                        className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                        <RotateCcw size={14} />
                                        Replace Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8">
                                <motion.div
                                    animate={isDragging ? { scale: 1.15, y: -4 } : { y: [0, -6, 0] }}
                                    transition={isDragging ? { duration: 0.2 } : { duration: 3, repeat: Infinity, repeatType: 'loop' }}
                                    className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mx-auto mb-4"
                                >
                                    <Upload className={isDragging ? 'text-blue-500' : 'text-zinc-400'} size={24} />
                                </motion.div>
                                <h4 className="text-sm font-semibold text-zinc-900 mb-1">Upload Scans</h4>
                                <p className="text-xs text-zinc-500 mb-4">Drag & drop DICOM, PNG, or JPG files</p>
                                <span className="px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold shadow-md shadow-black/20 hover:shadow-lg transition-shadow inline-flex items-center gap-1.5">
                                    <Upload size={12} />
                                    Select File
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                        <div>
                             <label className="text-xs font-semibold text-zinc-900 mb-2 block">Clinical Notes (Optional)</label>
                             <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Add specific areas to focus on..."
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all resize-none h-24 placeholder:text-zinc-400 text-zinc-800"
                            />
                        </div>
                        <Button
                            onClick={handleAnalyze}
                            disabled={!selectedFile || isAnalyzing}
                            className={`w-full py-6 rounded-xl text-sm font-bold tracking-wide shadow-md hover:shadow-lg transition-all ${
                                selectedFile && !isAnalyzing
                                    ? 'bg-black text-white hover:bg-zinc-800'
                                    : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed shadow-none'
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
                <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    {error ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100"
                            >
                                <AlertCircle size={24} />
                            </motion.div>
                            <h3 className="text-zinc-900 font-semibold mb-1">Analysis Error</h3>
                            <p className="text-zinc-500 text-sm max-w-xs">{error}</p>
                            <button onClick={handleReset} className="mt-4 text-xs font-semibold text-zinc-500 hover:text-zinc-900 underline underline-offset-2 transition-colors">Try again</button>
                        </div>
                    ) : result ? (
                        <div className="flex flex-col h-full">
                            {/* Result Header */}
                            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/40 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-2 h-2 rounded-full bg-emerald-500"
                                    />
                                    <span className="text-sm font-semibold text-zinc-900">Analysis Complete</span>
                                </div>
                                {result.processing_time && (
                                    <span className="px-2 py-1 rounded-lg bg-white border border-zinc-200 text-[10px] font-mono text-zinc-500">
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
                                        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wide m-0">Clinical Findings</h4>
                                    </div>
                                    <div className="text-zinc-600 leading-relaxed text-justify bg-zinc-50/80 p-4 rounded-xl border border-zinc-100">
                                        {result.analysis}
                                    </div>
                                </div>

                                {result.findings && result.findings.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Eye size={16} className="text-amber-500" />
                                            <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Key Observations</h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {result.findings.map((finding, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="flex items-start gap-3 text-sm text-zinc-600 group"
                                                >
                                                    <span className="shrink-0 w-5 h-5 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-[10px] font-bold mt-0.5 border border-amber-100">
                                                        {i + 1}
                                                    </span>
                                                    <span className="group-hover:text-zinc-900 transition-colors">{finding}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {result.recommendations && result.recommendations.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Heart size={16} className="text-red-500" />
                                            <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Recommendations</h4>
                                        </div>
                                        <div className="grid gap-2">
                                            {result.recommendations.map((rec, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.08 }}
                                                    className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:border-red-100 hover:bg-red-50/30 transition-all cursor-default"
                                                >
                                                    <ChevronRight size={14} className="text-red-400" />
                                                    <span className="text-sm text-zinc-700 font-medium">{rec}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50/30">
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center mb-4"
                            >
                                <Activity className="text-zinc-300" size={28} />
                            </motion.div>
                            <h3 className="text-zinc-900 font-semibold mb-1">Results View</h3>
                            <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                                AI analysis findings and recommendations will appear here after processing.
                            </p>
                            <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                <Sparkles size={10} />
                                Powered by MedGemma
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
             {/* Disclaimer */}
             <div className="flex gap-3 items-start p-4 bg-amber-50/80 border border-amber-100 rounded-xl">
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
    const [transcript, setTranscript] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await sendToBackend(audioBlob);
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
        } catch {
            setError('Microphone access denied. Please allow microphone access in your browser settings.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setIsPaused(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const togglePause = () => {
        if (!mediaRecorderRef.current) return;
        if (isPaused) {
            mediaRecorderRef.current.resume();
            timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
        } else {
            mediaRecorderRef.current.pause();
            if (timerRef.current) clearInterval(timerRef.current);
        }
        setIsPaused(!isPaused);
    };

    const sendToBackend = async (blob: Blob) => {
        setIsTranscribing(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', blob, 'recording.webm');
            formData.append('language', 'en');

            const res = await authFetch(`${API_BASE}/transcribe-audio-upload`, {
                method: 'POST',
                body: formData,
            });

            if (res.status === 501) {
                setError('MedASR is not yet configured on this server. The speech-to-text model requires separate setup.');
                return;
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Transcription failed');
            }

            const data = await res.json();
            setTranscript(prev => prev ? `${prev}\n\n${data.transcription}` : data.transcription);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Transcription failed');
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleReset = () => {
        stopRecording();
        setTranscript('');
        setRecordingTime(0);
        setError(null);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Recorder Card */}
                <div className="lg:col-span-1 bg-white border border-zinc-200/60 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-8">
                         {isRecording && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-75" />
                                <div className="absolute -inset-4 rounded-full border border-red-100 animate-pulse" />
                            </>
                         )}
                        <button
                            onClick={() => isRecording ? stopRecording() : startRecording()}
                            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${
                                isRecording ? 'bg-red-500 text-white' : 'bg-black text-white'
                            }`}
                        >
                            {isRecording ? <Pause size={32} fill="currentColor" /> : <Mic size={32} />}
                        </button>
                    </div>
                    
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">
                        {isTranscribing ? 'Transcribing...' : isRecording ? 'Recording in progress...' : 'Start Dictation'}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-8 max-w-[200px]">
                        {isRecording
                            ? 'Click the button to stop and transcribe'
                            : 'Speak clearly. MedASR will transcribe medical terminology.'}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        {isRecording && (
                             <Button 
                                variant="outline" 
                                onClick={togglePause}
                                className="w-full justify-center"
                            >
                                {isPaused ? 'Resume Recording' : 'Pause Recording'}
                            </Button>
                        )}
                         <Button 
                            variant="secondary" 
                            onClick={handleReset}
                            className="w-full justify-center bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-600"
                        >
                            Reset Session
                        </Button>
                    </div>
                </div>

                {/* Transcription View */}
                <div className="lg:col-span-2 bg-white border border-zinc-200/60 rounded-2xl shadow-sm flex flex-col h-[500px]">
                    <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/40 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <FileText size={16} className="text-zinc-400" />
                            <h3 className="text-sm font-semibold text-zinc-900">Transcription</h3>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="flex h-2 w-2 relative">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRecording ? 'bg-red-400' : isTranscribing ? 'bg-blue-400' : 'hidden'}`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isRecording ? 'bg-red-500' : isTranscribing ? 'bg-blue-500' : 'bg-zinc-300'}`}></span>
                            </span>
                             <span className="text-xs font-mono text-zinc-500">
                                {isRecording ? formatTime(recordingTime) : isTranscribing ? 'Processing...' : 'Ready'}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 p-6 bg-white overflow-y-auto">
                        {error ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 border border-amber-100">
                                    <AlertCircle size={24} />
                                </div>
                                <h4 className="text-zinc-900 font-semibold mb-1 text-sm">Service Unavailable</h4>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                            </div>
                        ) : transcript ? (
                            <div className="prose prose-sm max-w-none">
                                <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">{transcript}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-sm flex items-center justify-center mb-4"
                                >
                                    <Mic className="text-zinc-300" size={28} />
                                </motion.div>
                                <p className="text-zinc-500 text-sm">
                                    Transcribed text will appear here after recording.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-zinc-100 bg-zinc-50/40 flex justify-end gap-3">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2"
                            disabled={!transcript}
                            onClick={() => {
                                if (!transcript) return;
                                const blob = new Blob([transcript], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'transcription.txt';
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                        >
                            <Upload size={14} /> Export
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MedAIPage: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        medgemmaApi.checkStatus().then(setApiStatus).catch(() => setApiStatus(null));
    }, []);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".tab-content", { y: 10, opacity: 0, duration: 0.4, delay: 0.1, ease: "power2.out" });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-zinc-50/50">
            {/* Unified Header */}
            <PageHeader
                title="MedGemma"
                icon={<Sparkles size={18} />}
                badge={
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase border border-blue-100">v1.5 Local</span>
                }
                actions={
                    apiStatus ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
                            <span className="flex h-2 w-2 relative">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiStatus.medgemma_available ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${apiStatus.medgemma_available ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            </span>
                            <span className="text-xs font-medium text-gray-600">
                                {apiStatus.medgemma_available ? 'Model Active' : 'Connecting...'}
                            </span>
                        </div>
                    ) : undefined
                }
            />

            <main className="max-w-7xl mx-auto px-6 py-8">
                 {/* Page Title & Tabs */}
                 <div className="page-header flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-1">Diagnostic Tools</h2>
                        <p className="text-zinc-500 text-sm">Select a tool to begin your session.</p>
                    </div>
                    
                    <div className="bg-white p-1.5 rounded-2xl border border-zinc-200/60 shadow-sm inline-flex">
                        <button
                            onClick={() => setTabValue(0)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                                tabValue === 0 
                                    ? 'bg-black text-white shadow-md shadow-black/20' 
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                            }`}
                        >
                            <ImageIcon size={16} />
                            Image Analysis
                        </button>
                        <button
                            onClick={() => setTabValue(1)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                                tabValue === 1 
                                    ? 'bg-black text-white shadow-md shadow-black/20' 
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
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
