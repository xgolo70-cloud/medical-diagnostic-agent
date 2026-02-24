import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    UserPlus,
    Stethoscope,
    Brain,
    BarChart3,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Keyboard,
    Search,
    Shield,
    Users,
    FileText,
    Activity,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/layout/PageHeader';

interface GuideSection {
    id: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    accentColor: string;
    link: string;
    linkLabel: string;
    steps: { title: string; description: string }[];
}

const sections: GuideSection[] = [
    {
        id: 'add-patient',
        icon: <UserPlus size={22} />,
        title: 'Add a New Patient',
        subtitle: 'Register patients directly from the Patient Directory',
        accentColor: 'bg-emerald-500',
        link: '/patients',
        linkLabel: 'Go to Patients',
        steps: [
            { title: 'Open Patient Directory', description: 'Navigate to the Patient Directory from the sidebar or by clicking "Patients".' },
            { title: 'Click "+ New Patient"', description: 'In the top-right corner of the header, click the black "New Patient" button.' },
            { title: 'Fill in Patient Details', description: 'Enter the patient\'s full name (required), email (required), and phone number (optional).' },
            { title: 'Review Auto-Generated Info', description: 'The system auto-generates a username from the email and a secure temporary password.' },
            { title: 'Save the Password', description: 'After creation, copy the generated password using the copy button — it won\'t be shown again.' },
        ],
    },
    {
        id: 'run-diagnosis',
        icon: <Stethoscope size={22} />,
        title: 'Run an AI Diagnosis',
        subtitle: 'Analyze symptoms using the AI-powered diagnostic engine',
        accentColor: 'bg-blue-500',
        link: '/diagnosis',
        linkLabel: 'Start Diagnosis',
        steps: [
            { title: 'Navigate to Analysis', description: 'Click "Analysis" in the sidebar to open the diagnosis page.' },
            { title: 'Choose Input Mode', description: 'Select "Manual Entry" for filling a form, or "Upload Report" for an existing PDF.' },
            { title: 'Enter Patient Information', description: 'Fill out Patient ID, Age, Gender, Symptoms, and optionally Medical History + Vitals.' },
            { title: 'Upload Medical Image (Optional)', description: 'Drag and drop or browse for X-ray, MRI, CT, or other medical images.' },
            { title: 'Get Diagnosis', description: 'Click "Get Diagnosis" to start AI analysis. Results will show confidence level, differentials, and recommendations.' },
        ],
    },
    {
        id: 'medgemma',
        icon: <Brain size={22} />,
        title: 'Use MedGemma AI',
        subtitle: 'Analyze medical images with MedGemma v1.5',
        accentColor: 'bg-violet-500',
        link: '/medai',
        linkLabel: 'Open MedGemma',
        steps: [
            { title: 'Choose Modality', description: 'Select the scan type: X-Ray, CT Scan, MRI, Skin, Pathology, or Retinal.' },
            { title: 'Upload the Scan', description: 'Drag and drop an image or click "Select File" to upload a DICOM, PNG, or JPG file.' },
            { title: 'Add Clinical Notes (Optional)', description: 'Provide additional clinical context to help the AI focus its analysis.' },
            { title: 'Run Analysis', description: 'Click "Analyze Image" to start. The AI will process and return findings in the Results View.' },
        ],
    },
    {
        id: 'view-results',
        icon: <BarChart3 size={22} />,
        title: 'Understanding Results',
        subtitle: 'How to read and interpret AI diagnostic results',
        accentColor: 'bg-amber-500',
        link: '/history',
        linkLabel: 'View History',
        steps: [
            { title: 'Primary Diagnosis', description: 'The top card shows the most likely diagnosis with a confidence percentage and severity level.' },
            { title: 'Differential Diagnoses', description: 'Additional possible diagnoses are listed below with their own confidence bars.' },
            { title: 'Recommendations', description: 'AI-generated suggested next steps including tests, treatments, and specialist referrals.' },
            { title: 'References', description: 'Published medical literature and guidelines supporting the diagnosis.' },
            { title: 'Always Verify', description: 'AI-generated diagnoses are assistive tools — always verify with clinical expertise.' },
        ],
    },
];

const shortcuts = [
    { keys: ['1'], description: 'Switch to Manual Entry mode' },
    { keys: ['2'], description: 'Switch to Upload Report mode' },
    { keys: ['⌘', 'K'], description: 'Quick search (coming soon)' },
    { keys: ['Esc'], description: 'Close modals and overlays' },
];

export const GuidePage: React.FC = () => {
    const navigate = useNavigate();
    const [expandedSection, setExpandedSection] = useState<string | null>('add-patient');

    const toggleSection = (id: string) => {
        setExpandedSection(prev => (prev === id ? null : id));
    };

    return (
        <div className="min-h-screen bg-zinc-50/50">
            {/* Unified Header */}
            <PageHeader
                title="User Guide"
                icon={<BookOpen size={18} />}
                badge={
                    <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200">
                        <Sparkles size={12} />
                        Interactive Tutorial
                    </span>
                }
            />

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* ==================== Hero ==================== */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-3">
                        Getting Started
                    </h2>
                    <p className="text-zinc-500 text-base max-w-lg mx-auto leading-relaxed">
                        Learn how to add patients, run AI diagnoses, and navigate the system like a pro.
                    </p>
                </motion.div>

                {/* ==================== Quick Stats ==================== */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {[
                        { icon: <Users size={16} />, label: 'Manage Patients', color: 'bg-emerald-500' },
                        { icon: <Activity size={16} />, label: 'AI Diagnostics', color: 'bg-blue-500' },
                        { icon: <Shield size={16} />, label: 'HIPAA Compliant', color: 'bg-violet-500' },
                        { icon: <Search size={16} />, label: 'Smart Search', color: 'bg-amber-500' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-white border border-zinc-200/60 rounded-xl p-4 flex items-center gap-3"
                        >
                            <div className={`w-8 h-8 rounded-lg ${stat.color} text-white flex items-center justify-center`}>
                                {stat.icon}
                            </div>
                            <span className="text-sm font-medium text-zinc-700">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>

                {/* ==================== Guide Sections ==================== */}
                <div className="space-y-3">
                    {sections.map((section, sIdx) => {
                        const isOpen = expandedSection === section.id;
                        return (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: sIdx * 0.06 }}
                                className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm overflow-hidden"
                            >
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-xl ${section.accentColor} text-white flex items-center justify-center shadow-sm`}>
                                            {section.icon}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-base font-semibold text-zinc-900">{section.title}</h3>
                                            <p className="text-xs text-zinc-500 mt-0.5">{section.subtitle}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-semibold">
                                            {section.steps.length} STEPS
                                        </span>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown size={18} className="text-zinc-400" />
                                        </motion.div>
                                    </div>
                                </button>

                                {/* Expanded Steps */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <div className="px-6 pb-5 border-t border-zinc-100">
                                                <div className="py-4 space-y-0">
                                                    {section.steps.map((step, i) => (
                                                        <div key={i} className="flex gap-4 py-3">
                                                            {/* Step Number + Line */}
                                                            <div className="flex flex-col items-center">
                                                                <div className={`w-7 h-7 rounded-lg ${section.accentColor} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                                                                    {i + 1}
                                                                </div>
                                                                {i < section.steps.length - 1 && (
                                                                    <div className="w-px flex-1 bg-zinc-200 mt-2" />
                                                                )}
                                                            </div>
                                                            {/* Step Content */}
                                                            <div className="pb-2">
                                                                <h4 className="text-sm font-semibold text-zinc-900">{step.title}</h4>
                                                                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{step.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* CTA Button */}
                                                <Button
                                                    size="sm"
                                                    onClick={() => navigate(section.link)}
                                                    className="bg-black text-white hover:bg-zinc-800 rounded-xl shadow-md shadow-black/20 gap-2 mt-2"
                                                >
                                                    <ExternalLink size={13} />
                                                    {section.linkLabel}
                                                    <ChevronRight size={13} />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* ==================== Keyboard Shortcuts ==================== */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 bg-white border border-zinc-200/60 rounded-2xl shadow-sm p-6"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                            <Keyboard size={20} className="text-zinc-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900">Keyboard Shortcuts</h3>
                            <p className="text-xs text-zinc-500">Speed up your workflow with these shortcuts</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {shortcuts.map((sc, index) => (
                            <div key={index} className="flex items-center justify-between bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
                                <span className="text-sm text-zinc-700">{sc.description}</span>
                                <div className="flex items-center gap-1">
                                    {sc.keys.map((k, ki) => (
                                        <React.Fragment key={ki}>
                                            <kbd className="px-2 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-mono font-semibold text-zinc-600 shadow-sm">
                                                {k}
                                            </kbd>
                                            {ki < sc.keys.length - 1 && <span className="text-zinc-400 text-xs mx-0.5">+</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ==================== Quick Links ==================== */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                    {[
                        { icon: <UserPlus size={16} />, label: 'Add Patient', path: '/patients' },
                        { icon: <Stethoscope size={16} />, label: 'New Diagnosis', path: '/diagnosis' },
                        { icon: <Brain size={16} />, label: 'MedGemma AI', path: '/medai' },
                        { icon: <FileText size={16} />, label: 'View History', path: '/history' },
                    ].map(link => (
                        <button
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            className="bg-white border border-zinc-200/60 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-zinc-50 hover:border-zinc-300 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-black group-hover:text-white text-zinc-500 flex items-center justify-center transition-all">
                                {link.icon}
                            </div>
                            <span className="text-xs font-semibold text-zinc-700">{link.label}</span>
                        </button>
                    ))}
                </motion.div>

                {/* ==================== Footer ==================== */}
                <div className="mt-10 mb-6 text-center">
                    <div className="inline-flex items-center gap-2 text-xs text-zinc-400">
                        <CheckCircle2 size={12} />
                        <span>AI & Things • Medical Diagnostic Agent • v2.0</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GuidePage;
