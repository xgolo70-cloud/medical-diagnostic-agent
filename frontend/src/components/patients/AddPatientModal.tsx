import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    Mail,
    Phone,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Copy,
    Check,
    Key,
    ArrowRight,
    UserPlus
} from 'lucide-react';
import { Button } from '../ui/Button';
import api from '../../services/api';

interface AddPatientModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormData {
    full_name: string;
    email: string;
    phone: string;
}

interface SuccessData {
    patient: {
        id: string;
        username: string;
        email: string;
        full_name: string;
    };
    generated_password: string | null;
    message: string;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ open, onClose, onSuccess }) => {
    const [form, setForm] = useState<FormData>({ full_name: '', email: '', phone: '' });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [success, setSuccess] = useState<SuccessData | null>(null);
    const [copied, setCopied] = useState(false);

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormData, string>> = {};
        if (!form.full_name.trim() || form.full_name.trim().length < 2) {
            e.full_name = 'Full name is required (min 2 characters)';
        }
        if (!form.email.trim()) {
            e.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            e.email = 'Please enter a valid email address';
        }
        if (form.phone && !/^[+\d\s()-]{7,20}$/.test(form.phone)) {
            e.phone = 'Invalid phone format';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        setApiError(null);
        try {
            const payload: { full_name: string; email: string; phone?: string } = {
                full_name: form.full_name.trim(),
                email: form.email.trim().toLowerCase(),
            };
            if (form.phone.trim()) payload.phone = form.phone.trim();
            const result = await api.createPatient(payload);
            setSuccess(result);
            onSuccess();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setApiError(err.message);
            } else {
                setApiError('Failed to create patient. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyPassword = () => {
        if (success?.generated_password) {
            navigator.clipboard.writeText(success.generated_password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setForm({ full_name: '', email: '', phone: '' });
        setErrors({});
        setApiError(null);
        setSuccess(null);
        setCopied(false);
        onClose();
    };

    const handleChange = (field: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
        setApiError(null);
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200/60 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-md shadow-black/20">
                                    <UserPlus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-zinc-900">
                                        {success ? 'Patient Registered' : 'Register New Patient'}
                                    </h2>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {success ? 'Account created successfully' : 'Fill in patient details below'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6">
                            <AnimatePresence mode="wait">
                                {success ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-5"
                                    >
                                        {/* Success Icon */}
                                        <div className="flex justify-center">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', delay: 0.1 }}
                                                className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100"
                                            >
                                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                            </motion.div>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-sm font-medium text-zinc-900 mb-1">{success.message}</p>
                                            <p className="text-xs text-zinc-500">
                                                Username: <span className="font-mono font-semibold text-zinc-700">@{success.patient.username}</span>
                                            </p>
                                        </div>

                                        {/* Generated Password */}
                                        {success.generated_password && (
                                            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Key size={14} className="text-amber-500" />
                                                    <span className="text-xs font-semibold text-zinc-900">Temporary Password</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <code className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono text-zinc-800 select-all">
                                                        {success.generated_password}
                                                    </code>
                                                    <button
                                                        onClick={handleCopyPassword}
                                                        className="w-9 h-9 rounded-lg border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all"
                                                    >
                                                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-amber-600 mt-2 font-medium">
                                                    ⚠ Save this password — it won't be shown again.
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        {/* API Error */}
                                        {apiError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl"
                                            >
                                                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                                <p className="text-sm text-red-700">{apiError}</p>
                                            </motion.div>
                                        )}

                                        {/* Full Name */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 mb-1.5">
                                                <User size={12} /> Full Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.full_name}
                                                onChange={e => handleChange('full_name', e.target.value)}
                                                placeholder="e.g., Ahmed Mohammed"
                                                className={`w-full h-11 px-4 rounded-xl bg-zinc-50 border text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all ${
                                                    errors.full_name ? 'border-red-300 focus:border-red-400' : 'border-zinc-200 focus:border-zinc-400 focus:bg-white'
                                                }`}
                                                autoFocus
                                            />
                                            {errors.full_name && (
                                                <p className="text-[11px] text-red-500 mt-1">{errors.full_name}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 mb-1.5">
                                                <Mail size={12} /> Email Address <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={e => handleChange('email', e.target.value)}
                                                placeholder="patient@example.com"
                                                className={`w-full h-11 px-4 rounded-xl bg-zinc-50 border text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all ${
                                                    errors.email ? 'border-red-300 focus:border-red-400' : 'border-zinc-200 focus:border-zinc-400 focus:bg-white'
                                                }`}
                                            />
                                            {errors.email && (
                                                <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>
                                            )}
                                            {form.email && !errors.email && (
                                                <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                                                    Username: @{form.email.split('@')[0]?.toLowerCase().replace(/[.-]/g, '_')}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 mb-1.5">
                                                <Phone size={12} /> Phone Number <span className="text-zinc-400 font-normal">(optional)</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={e => handleChange('phone', e.target.value)}
                                                placeholder="+966 5X XXX XXXX"
                                                className={`w-full h-11 px-4 rounded-xl bg-zinc-50 border text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all ${
                                                    errors.phone ? 'border-red-300 focus:border-red-400' : 'border-zinc-200 focus:border-zinc-400 focus:bg-white'
                                                }`}
                                            />
                                            {errors.phone && (
                                                <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex items-start gap-2 text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-xl p-3">
                                            <Key size={12} className="text-zinc-400 shrink-0 mt-0.5" />
                                            A secure temporary password will be auto-generated for the patient.
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/40">
                            {success ? (
                                <Button
                                    onClick={handleClose}
                                    className="bg-black text-white hover:bg-zinc-800 rounded-xl shadow-md shadow-black/20 gap-2 px-5"
                                >
                                    Done
                                    <ArrowRight size={14} />
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="secondary"
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                        className="rounded-xl border-zinc-200 text-zinc-600"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-black text-white hover:bg-zinc-800 rounded-xl shadow-md shadow-black/20 gap-2 px-5 min-w-[140px]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={14} />
                                                Register Patient
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddPatientModal;
