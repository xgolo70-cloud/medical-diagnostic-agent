import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Brain, ArrowRight, AlertCircle, Lock, CheckCircle, User, Mail, Phone, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabaseAuth, db } from '../../lib/supabase';

interface FormErrors {
    fullName?: string;
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    general?: string;
}

interface FormData {
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    phone: string;
    role: string;
}

const ROLES = [
    { value: 'patient', label: 'Patient', icon: User, bgSelected: 'bg-blue-600' },
    { value: 'doctor', label: 'Doctor', icon: Shield, bgSelected: 'bg-purple-600' },
    { value: 'specialist', label: 'Specialist', icon: Brain, bgSelected: 'bg-emerald-600' },
];

// Password strength calculator
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-yellow-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
};

export const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'patient',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // Rotating text state
    const words = ["Journey.", "Health.", "Care.", "Future."];
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [words.length]);

    const validateForm = (): boolean => {
        const errors: FormErrors = {};
        
        if (!formData.fullName.trim()) {
            errors.fullName = 'Full name is required';
        }
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }
        
        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.username)) {
            errors.username = 'Only letters, numbers, dots, and underscores';
        }
        
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
            errors.password = 'Password needs uppercase letter';
        } else if (!/[a-z]/.test(formData.password)) {
            errors.password = 'Password needs lowercase letter';
        } else if (!/\d/.test(formData.password)) {
            errors.password = 'Password needs a number';
        }
        
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setFormErrors({});

        try {
            // Sign up with Supabase Auth
            const { data, error } = await supabaseAuth.signUp(
                formData.email,
                formData.password,
                {
                    username: formData.username,
                    full_name: formData.fullName,
                }
            );

            if (error) {
                throw new Error(error.message);
            }

            // Update profile with additional data if user was created
            if (data.user) {
                // Wait a moment for the trigger to create the profile
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Update profile with role and phone
                await db.updateProfile(data.user.id, {
                    role: formData.role as 'patient' | 'doctor' | 'specialist' | 'admin' | 'auditor' | 'gp',
                    phone: formData.phone || null,
                    full_name: formData.fullName,
                });
            }

            setSuccess(true);
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setFormErrors({
                general: error instanceof Error ? error.message : 'Registration failed. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            setIsLoading(true);
            const { error } = await supabaseAuth.signInWithGoogle();
            
            if (error) {
                setFormErrors({ general: error.message });
            }
            // Note: Google OAuth will redirect, so we don't need to handle success here
        } catch (err) {
            console.error('Google signup error:', err);
            setFormErrors({ general: 'Google sign-up failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const updateField = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field as keyof FormErrors]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (success) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-8"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
                    <p className="text-gray-500">Redirecting to login...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa] relative overflow-hidden font-['Inter',sans-serif] p-4">
            {/* Subtle Background Grid - Clean Light Mode */}
            <div className="absolute inset-0 bg-[#fafafa]">
                <div 
                    className="absolute inset-0 opacity-30" 
                    style={{ 
                        backgroundImage: 'radial-gradient(#d4d4d4 1px, transparent 1px)', 
                        backgroundSize: '24px 24px' 
                    }} 
                />
            </div>

            {/* Minimal Accent Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-gradient-to-br from-emerald-100/40 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-gradient-to-tl from-blue-100/40 to-transparent rounded-full blur-3xl" />
            </div>
            
            <div className="w-full max-w-4xl relative z-10">
                {/* Main Card - Unified Clean Design */}
                <div className="bg-white rounded-xl border border-[#eaeaea] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col lg:flex-row min-h-[400px] sm:min-h-[450px] lg:min-h-[520px] max-h-[95vh] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                    
                    {/* Left Side - Brand Visual */}
                    <div className="lg:w-5/12 relative overflow-hidden bg-[#171717] p-4 sm:p-5 lg:p-6 flex flex-col text-white min-h-[160px] sm:min-h-[200px] lg:min-h-auto">
                         {/* Dynamic Background: Creative Waterfall Marquee */}
                         <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
                            <style>
                                {`
                                    @keyframes scrollUp {
                                        0% { transform: translateY(0); }
                                        100% { transform: translateY(-50%); }
                                    }
                                    @keyframes scrollDown {
                                        0% { transform: translateY(-50%); }
                                        100% { transform: translateY(0); }
                                    }
                                    .animate-scroll-up {
                                        animation: scrollUp 35s linear infinite;
                                    }
                                    .animate-scroll-down {
                                        animation: scrollDown 35s linear infinite;
                                    }
                                `}
                            </style>
                            
                            {/* Tilted Grid Container */}
                            <div className="grid grid-cols-3 gap-4 h-[150%] -mt-[20%] w-[150%] -ml-[25%] transform -rotate-12 scale-110 opacity-85">
                                
                                {/* Column 1: Up */}
                                <div className="flex flex-col gap-4 animate-scroll-up">
                                    {[
                                        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop', // Medical Team
                                        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop', // Doctor with Tech
                                        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=2070&auto=format&fit=crop', // Health App
                                        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2070&auto=format&fit=crop', // Pills
                                         // Duplicates for Loop
                                        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2070&auto=format&fit=crop',
                                    ].map((img, i) => (
                                        <div key={i} className="relative w-full aspect-2/3 rounded-xl overflow-hidden shadow-xl border border-white/10">
                                            <div className="absolute inset-0 bg-emerald-500/20 mix-blend-overlay z-10" />
                                            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60 z-10" />
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>

                                {/* Column 2: Down (Center) */}
                                <div className="flex flex-col gap-4 animate-scroll-down">
                                    {[
                                        'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=2070&auto=format&fit=crop', // Stethoscope
                                        'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop', // Surgery
                                        'https://images.unsplash.com/photo-1581595219315-a187dd40c322?q=80&w=2070&auto=format&fit=crop', // DNA Lab
                                        'https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=2070&auto=format&fit=crop', // Consultation
                                         // Duplicates for Loop
                                        'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1581595219315-a187dd40c322?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=2070&auto=format&fit=crop',
                                    ].map((img, i) => (
                                        <div key={i} className="relative w-full aspect-2/3 rounded-xl overflow-hidden shadow-xl border border-white/10">
                                            <div className="absolute inset-0 bg-teal-500/20 mix-blend-overlay z-10" />
                                            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60 z-10" />
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>

                                {/* Column 3: Up */}
                                <div className="flex flex-col gap-4 animate-scroll-up">
                                    {[
                                        'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2070&auto=format&fit=crop', // Blood Test
                                        'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2070&auto=format&fit=crop', // Medical Scan
                                        'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=2070&auto=format&fit=crop', // Nurse
                                        'https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=2070&auto=format&fit=crop', // DNA Helix
                                         // Duplicates for Loop
                                        'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=2070&auto=format&fit=crop',
                                    ].map((img, i) => (
                                        <div key={i} className="relative w-full aspect-2/3 rounded-xl overflow-hidden shadow-xl border border-white/10">
                                            <div className="absolute inset-0 bg-cyan-500/20 mix-blend-overlay z-10" />
                                            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60 z-10" />
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Global overlay for text contrast */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-black/40 pointer-events-none z-10" />
                         </div>
                         
                         {/* Header with logo and badge */}
                         <div className="relative z-20 flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <Brain className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-sm tracking-tight text-white">AI & Things</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[9px] font-medium text-white uppercase tracking-wider">Join Us</span>
                            </div>
                         </div>


                         {/* Main title - directly below header */}
                         <div className="relative z-20 max-w-[220px] mt-3">
                            <h2 className="text-2xl lg:text-3xl font-serif leading-tight drop-shadow-lg" style={{ color: '#ffffff' }}>
                                Start Your <br/>
                                <div className="relative inline-flex flex-col mt-1">
                                    <span className="relative inline-flex h-[1.2em] overflow-hidden min-w-[140px]">
                                        <AnimatePresence mode="popLayout">
                                            <motion.span
                                                key={wordIndex}
                                                initial={{ y: "100%", opacity: 0 }}
                                                animate={{ y: "0%", opacity: 1 }}
                                                exit={{ y: "-100%", opacity: 0 }}
                                                transition={{ duration: 0.5, ease: "circOut" }}
                                                className="block italic font-light whitespace-nowrap"
                                                style={{ color: '#a7f3d0' }}
                                            >
                                                {words[wordIndex]}
                                            </motion.span>
                                        </AnimatePresence>
                                    </span>
                                    <div className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400/60 via-white/80 to-emerald-400/60 rounded-full" />
                                </div>
                            </h2>
                         </div>

                         {/* Footer - pushed to bottom */}
                         <div className="relative z-20 pt-3 border-t border-white/10 mt-auto">
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">V.2.0.26</span>
                         </div>
                    </div>

                    {/* Right Side - Registration Form */}
                    <div className="lg:w-7/12 p-4 sm:p-5 lg:p-6 flex flex-col bg-white overflow-y-auto">
                         <div className="max-w-sm mx-auto w-full flex-1 flex flex-col">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-3">
                                <Link 
                                    to="/login" 
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 -ml-2.5 rounded-md text-xs font-medium text-[#666666] hover:bg-[#fafafa] hover:text-[#171717] transition-colors duration-150"
                                >
                                    <ArrowLeft size={14} />
                                    Login
                                </Link>
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#fafafa] border border-[#eaeaea] text-[#666666]">
                                    <Lock size={10} className="text-emerald-600" />
                                    <span className="text-[10px] font-semibold uppercase tracking-wider">Create</span>
                                </div>
                            </div>

                            {/* Title & Error */}
                            <div className="mb-3">
                                <h3 className="text-xl font-semibold text-[#171717] tracking-[-0.02em] mb-1.5">Join MedAI</h3>
                                {formErrors.general ? (
                                    <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md border border-red-100 flex items-center gap-2">
                                        <AlertCircle size={14} />
                                        <span className="text-sm font-medium">{formErrors.general}</span>
                                    </div>
                                ) : (
                                    <p className="text-[#666666] text-sm">Create your account to get started.</p>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-2">
                                {/* Full Name */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-medium text-[#666666]">Full Name</label>
                                        {formErrors.fullName && (
                                            <span className="text-[11px] font-medium text-red-500 flex items-center gap-1">
                                                <AlertCircle size={10} /> {formErrors.fullName}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => updateField('fullName', e.target.value)}
                                            onBlur={() => {
                                                if (!formData.fullName.trim()) setFormErrors(prev => ({ ...prev, fullName: 'Full name is required' }));
                                            }}
                                            className={`w-full h-10 pl-9 pr-3.5 rounded-md bg-white border ${formErrors.fullName ? 'border-red-300 focus:border-red-400' : 'border-[#eaeaea] focus:border-[#171717]'} text-[#171717] placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#eaeaea] transition-all duration-150 text-sm`}
                                            placeholder="Dr. John Smith"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-medium text-[#666666]">Email</label>
                                        {formErrors.email && (
                                            <span className="text-[11px] font-medium text-red-500 flex items-center gap-1">
                                                <AlertCircle size={10} /> {formErrors.email}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateField('email', e.target.value)}
                                            onBlur={() => {
                                                if (!formData.email.trim()) setFormErrors(prev => ({ ...prev, email: 'Email is required' }));
                                                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) setFormErrors(prev => ({ ...prev, email: 'Invalid email format' }));
                                            }}
                                            className={`w-full h-10 pl-9 pr-3.5 rounded-md bg-white border ${formErrors.email ? 'border-red-300 focus:border-red-400' : 'border-[#eaeaea] focus:border-[#171717]'} text-[#171717] placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#eaeaea] transition-all duration-150 text-sm`}
                                            placeholder="doctor@hospital.com"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-medium text-[#666666]">Username</label>
                                        {formErrors.username && (
                                            <span className="text-[11px] font-medium text-red-500 flex items-center gap-1">
                                                <AlertCircle size={10} /> {formErrors.username}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => updateField('username', e.target.value)}
                                        onBlur={() => {
                                            if (!formData.username.trim()) setFormErrors(prev => ({ ...prev, username: 'Username is required' }));
                                            else if (formData.username.length < 3) setFormErrors(prev => ({ ...prev, username: 'Min 3 chars' }));
                                        }}
                                        className={`w-full h-10 px-3.5 rounded-md bg-white border ${formErrors.username ? 'border-red-300 focus:border-red-400' : 'border-[#eaeaea] focus:border-[#171717]'} text-[#171717] placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#eaeaea] transition-all duration-150 text-sm`}
                                        placeholder="dr.smith"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Password and Confirm Password in a row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* Password */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-medium text-[#666666]">Password</label>
                                            {formErrors.password && (
                                                <span className="text-[10px] font-medium text-red-500 truncate max-w-[100px]">
                                                    {formErrors.password}
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => updateField('password', e.target.value)}
                                                onBlur={() => {
                                                    if (!formData.password) setFormErrors(prev => ({ ...prev, password: 'Required' }));
                                                    else if (formData.password.length < 8) setFormErrors(prev => ({ ...prev, password: 'Min 8 chars' }));
                                                }}
                                                className={`w-full h-10 px-3.5 pr-9 rounded-md bg-white border ${formErrors.password ? 'border-red-300 focus:border-red-400' : 'border-[#eaeaea] focus:border-[#171717]'} text-[#171717] placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#eaeaea] transition-all duration-150 text-sm`}
                                                placeholder="••••••••"
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#171717] transition-colors duration-150"
                                            >
                                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                        {/* Password Strength Indicator */}
                                        {formData.password && (
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className="flex gap-0.5 flex-1">
                                                    {[1, 2, 3].map((level) => (
                                                        <div 
                                                            key={level}
                                                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                                getPasswordStrength(formData.password).score >= level 
                                                                    ? getPasswordStrength(formData.password).color 
                                                                    : 'bg-gray-200'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className={`text-[9px] font-medium ${
                                                    getPasswordStrength(formData.password).score === 1 ? 'text-red-500' :
                                                    getPasswordStrength(formData.password).score === 2 ? 'text-yellow-600' : 'text-emerald-600'
                                                }`}>
                                                    {getPasswordStrength(formData.password).label}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-medium text-[#666666]">Confirm</label>
                                            {formErrors.confirmPassword && (
                                                <span className="text-[10px] font-medium text-red-500 truncate max-w-[100px]">
                                                    {formErrors.confirmPassword}
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={(e) => updateField('confirmPassword', e.target.value)}
                                                onBlur={() => {
                                                    if (formData.confirmPassword !== formData.password) setFormErrors(prev => ({ ...prev, confirmPassword: 'Mismatch' }));
                                                }}
                                                className={`w-full h-10 px-3.5 pr-9 rounded-md bg-white border ${formErrors.confirmPassword ? 'border-red-300 focus:border-red-400' : 'border-[#eaeaea] focus:border-[#171717]'} text-[#171717] placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#eaeaea] transition-all duration-150 text-sm`}
                                                placeholder="••••••••"
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#171717] transition-colors duration-150"
                                            >
                                                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-[#666666]">I am a</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {ROLES.map((role) => (
                                            <button
                                                key={role.value}
                                                type="button"
                                                onClick={() => updateField('role', role.value)}
                                                className={`flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg border transition-all duration-150 ${
                                                    formData.role === role.value
                                                        ? `${role.bgSelected} text-white border-transparent shadow-sm`
                                                        : 'bg-white border-[#eaeaea] hover:border-[#d4d4d4] hover:bg-[#fafafa] text-[#666666]'
                                                }`}
                                            >
                                                <role.icon size={13} />
                                                <span className="text-[11px] font-medium">{role.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Phone (Optional) */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-[#666666]">
                                        Phone <span className="text-[#a3a3a3]">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => updateField('phone', e.target.value)}
                                            className="w-full h-10 pl-9 pr-3.5 rounded-md bg-white border border-[#eaeaea] text-[#171717] placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#eaeaea] focus:border-[#171717] transition-all duration-150 text-sm"
                                            placeholder="+1 234 567 8900"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-10 bg-[#171717] text-white rounded-lg font-medium text-sm hover:bg-[#262626] active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 mt-2 shadow-sm"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight size={14} />
                                        </>
                                    )}
                                </button>
                                
                                {/* Divider */}
                                <div className="relative flex py-2 items-center">
                                    <div className="grow border-t border-[#eaeaea]"></div>
                                    <span className="shrink-0 mx-3 text-[#888888] text-xs font-medium">Or</span>
                                    <div className="grow border-t border-[#eaeaea]"></div>
                                </div>

                                {/* Google Button */}
                                <button
                                    type="button"
                                    onClick={() => handleGoogleSignup()}
                                    disabled={isLoading}
                                    className="w-full h-10 bg-white text-[#171717] border border-[#eaeaea] rounded-md font-medium text-sm hover:bg-[#fafafa] hover:border-[#d4d4d4] active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2.5"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21-1.19-2.22z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    Sign up with Google
                                </button>
                            </form>

                            {/* Footer */}
                            <p className="text-center text-xs text-[#888888] mt-4">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#171717] font-semibold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
