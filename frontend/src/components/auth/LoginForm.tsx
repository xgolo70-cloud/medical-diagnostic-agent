import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, ArrowLeft, Brain, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import { tokenManager } from '../../services/api';
import { Link } from 'react-router-dom';

// Demo credentials for quick login (still connect to real API)
const DEMO_CREDENTIALS = [
    { username: 'admin', password: 'Admin123!', role: 'admin' as const },
    { username: 'dr.smith', password: 'Doctor123!', role: 'specialist' as const },
    { username: 'auditor', password: 'Auditor123!', role: 'auditor' as const },
];

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const LoginForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<{ username?: string; password?: string }>({});

    // Rotating text state
    const words = ["Thinking.", "Limits.", "Logic.", "Future."];
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [words.length]);




    const validateForm = (): boolean => {
        const errors: { username?: string; password?: string } = {};
        if (!username.trim()) errors.username = 'Username is required';
        if (!password) errors.password = 'Password is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        dispatch(loginStart());

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Invalid credentials');
            }

            // Save tokens from API response
            tokenManager.setTokens(data.access_token, data.refresh_token);
            
            // Fetch user info to get full profile
            const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                },
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                dispatch(loginSuccess({ 
                    username: userData.username, 
                    role: userData.role,
                    email: userData.email,
                    displayName: userData.full_name,
                    avatar: userData.avatar_url,
                }));
            } else {
                // Fallback: use basic info from token claims
                dispatch(loginSuccess({ username: username, role: 'specialist' }));
            }
        } catch (err) {
            dispatch(loginFailure(err instanceof Error ? err.message : 'Login failed'));
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                dispatch(loginStart());
                
                // Send Google token to our backend for verification and user creation
                const response = await fetch(`${API_BASE_URL}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: tokenResponse.access_token }),
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.detail || 'Google sign-in failed');
                }
                
                // Store our app's JWT tokens
                tokenManager.setTokens(data.access_token, data.refresh_token);
                
                // Fetch user info with our JWT
                const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${data.access_token}` },
                });
                
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    dispatch(loginSuccess({
                        username: userData.username,
                        role: userData.role,
                        email: userData.email,
                        avatar: userData.avatar_url,
                        displayName: userData.full_name,
                    }));
                } else {
                    throw new Error('Failed to fetch user profile');
                }
                
            } catch (err) {
                console.error('Google login error:', err);
                dispatch(loginFailure(err instanceof Error ? err.message : 'Google sign-in failed'));
            }
        },
        onError: () => {
             dispatch(loginFailure('Google sign-in failed.'));
        }
    });

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
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-gradient-to-tl from-purple-100/40 to-transparent rounded-full blur-3xl" />
            </div>
            
            <div className="w-full max-w-4xl relative z-10">
                {/* Main Card - Unified Clean Design */}
                <div className="bg-white rounded-xl border border-[#eaeaea] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col lg:flex-row min-h-[400px] sm:min-h-[450px] lg:min-h-[520px] max-h-[95vh] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                    
                     {/* Left Side - Brand Visual */}
                    <div className="lg:w-5/12 relative overflow-hidden bg-[#171717] p-4 sm:p-5 lg:p-6 flex flex-col justify-between text-white min-h-[160px] sm:min-h-[200px] lg:min-h-auto">
                         {/* Dynamic Background Slideshow - Merged & Fluid */}
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
                                        animation: scrollUp 30s linear infinite;
                                    }
                                    .animate-scroll-down {
                                        animation: scrollDown 30s linear infinite;
                                    }
                                `}
                            </style>
                            
                            {/* Tilted Grid Container */}
                            <div className="grid grid-cols-3 gap-6 h-[150%] -mt-[20%] w-[150%] -ml-[25%] transform -rotate-12 scale-110 opacity-85">
                                
                                {/* Column 1: Up */}
                                <div className="flex flex-col gap-6 animate-scroll-up">
                                    {[
                                        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop', // AI Neural Network
                                        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', // Data Viz
                                        'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2070&auto=format&fit=crop', // Medical Scan
                                        'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop', // VR Medicine
                                         // Duplicates for Loop
                                        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop',
                                    ].map((img, i) => (
                                        <div key={i} className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                                            <div className="absolute inset-0 bg-indigo-500/20 mix-blend-overlay z-10" />
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10" />
                                            <img src={img} alt="" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out" />
                                        </div>
                                    ))}
                                </div>

                                {/* Column 2: Down (Center) */}
                                <div className="flex flex-col gap-6 animate-scroll-down">
                                    {[
                                        'https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=2070&auto=format&fit=crop', // DNA Helix
                                        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop', // Doctor with Technology
                                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', // Abstract particles
                                        'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop', // Surgery
                                         // Duplicates for Loop
                                        'https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop',
                                    ].map((img, i) => (
                                        <div key={i} className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                                            <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay z-10" />
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10" />
                                            <img src={img} alt="" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out" />
                                        </div>
                                    ))}
                                </div>

                                {/* Column 3: Up */}
                                <div className="flex flex-col gap-6 animate-scroll-up">
                                    {[
                                        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop', // Molecular
                                        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop', // Robot Arm
                                        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop', // Microscope
                                        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop', // Chip
                                         // Duplicates for Loop
                                        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
                                    ].map((img, i) => (
                                        <div key={i} className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                                            <div className="absolute inset-0 bg-purple-500/20 mix-blend-overlay z-10" />
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10" />
                                            <img src={img} alt="" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Unifying global overlay - Minimal gradient for text contrast only */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none z-10" />

                         </div>
                         
                         <div className="relative z-20 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group-hover:bg-white/20 transition-colors duration-500">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-lg tracking-tight text-white drop-shadow-sm">AI & Things</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-medium text-white uppercase tracking-widest drop-shadow-sm">System Online</span>
                            </div>
                         </div>

                         <div className="relative z-20 max-w-xs mt-12 lg:mt-0">
                            <h2 className="text-4xl lg:text-5xl font-serif leading-none mb-12 !text-white drop-shadow-lg flex flex-col items-start" style={{ color: '#ffffff' }}>
                                Beyond <br/>
                                <div className="relative inline-flex flex-col mt-2">
                                    <span className="relative inline-flex h-[1.2em] overflow-hidden min-w-[200px]">
                                        <AnimatePresence mode="popLayout">
                                            <motion.span
                                                key={wordIndex}
                                                initial={{ y: "100%", opacity: 0 }}
                                                animate={{ y: "0%", opacity: 1 }}
                                                exit={{ y: "-100%", opacity: 0 }}
                                                transition={{ duration: 0.5, ease: "circOut" }}
                                                className="block italic font-light !text-blue-100 whitespace-nowrap"
                                            >
                                                {words[wordIndex]}
                                            </motion.span>
                                        </AnimatePresence>
                                    </span>
                                    <div className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-400/60 via-purple-400/80 to-blue-400/60 rounded-full" />
                                </div>
                            </h2>
                         </div>

                         <div className="relative z-20 flex items-center gap-3 pt-6 mt-8 lg:mt-auto opacity-60">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/80 drop-shadow-sm">V.2.0.26</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                         </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="lg:w-7/12 p-4 sm:p-5 lg:p-6 flex flex-col bg-white">
                         <div className="max-w-sm mx-auto w-full flex-1 flex flex-col justify-center">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <Link 
                                    to="/" 
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 -ml-2.5 rounded-md text-xs font-medium text-[#666666] hover:bg-[#fafafa] hover:text-[#171717] transition-colors duration-150"
                                >
                                    <ArrowLeft size={14} />
                                    Back
                                </Link>
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#fafafa] border border-[#eaeaea] text-[#666666]">
                                    <Lock size={10} className="text-emerald-600" />
                                    <span className="text-[10px] font-semibold uppercase tracking-wider">Secure</span>
                                </div>
                            </div>

                            {/* Title & Error */}
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-[#171717] tracking-[-0.02em] mb-1.5">Welcome Back</h3>
                                {error ? (
                                    <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md border border-red-100 flex items-center gap-2">
                                        <AlertCircle size={14} />
                                        <span className="text-sm font-medium">{error}</span>
                                    </div>
                                ) : (
                                    <p className="text-[#666666] text-sm">Sign in to access your intelligent dashboard.</p>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Username */}
                                <div className="space-y-1.5">
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
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); if (formErrors.username) setFormErrors({ ...formErrors, username: undefined }); }}
                                        className={`w-full h-10 px-3.5 rounded-md bg-white border ${formErrors.username ? 'border-red-300 focus:border-red-400' : 'border-[#eaeaea] focus:border-[#171717]'} text-[#171717] placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#eaeaea] transition-all duration-150 text-sm`}
                                        placeholder="e.g. dr.smith"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-medium text-[#666666]">Password</label>
                                        <div className="flex items-center gap-3">
                                            {formErrors.password && (
                                                <span className="text-[11px] font-medium text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={10} /> {formErrors.password}
                                                </span>
                                            )}
                                            <Link to="/forgot-password" className="text-[11px] font-medium text-[#888888] hover:text-[#171717] transition-colors duration-150">Forgot?</Link>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => { 
                                                setPassword(e.target.value); 
                                                if (formErrors.password) setFormErrors({ ...formErrors, password: undefined }); 
                                            }}
                                            className={`w-full h-10 px-3.5 pr-10 rounded-md bg-white border ${formErrors.password ? 'border-red-300 focus:border-red-400' : 'border-[#eaeaea] focus:border-[#171717]'} text-[#171717] placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#eaeaea] transition-all duration-150 text-sm`}
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#171717] transition-colors duration-150"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-10 bg-[#171717] text-white rounded-md font-medium text-sm hover:bg-[#404040] active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight size={14} />
                                        </>
                                    )}
                                </button>
                                
                                {/* Divider */}
                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-[#eaeaea]"></div>
                                    <span className="flex-shrink-0 mx-3 text-[#888888] text-xs font-medium">Or</span>
                                    <div className="flex-grow border-t border-[#eaeaea]"></div>
                                </div>

                                {/* Google Button */}
                                <button
                                    type="button"
                                    onClick={() => handleGoogleLogin()}
                                    disabled={isLoading}
                                    className="w-full h-10 bg-white text-[#171717] border border-[#eaeaea] rounded-md font-medium text-sm hover:bg-[#fafafa] hover:border-[#d4d4d4] active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2.5"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21-1.19-2.22z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    Sign in with Google
                                </button>
                            </form>
                        </div>

                        {/* Quick Select Footer */}
                        <div className="mt-6 bg-[#fafafa] rounded-md p-4 border border-[#eaeaea]">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] text-[#888888] uppercase tracking-wider font-medium">Quick Select</p>
                                <div className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-medium text-emerald-700">Demo</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {DEMO_CREDENTIALS.map((cred) => (
                                    <button
                                        key={cred.role}
                                        type="button"
                                        onClick={() => { setUsername(cred.username); setPassword(cred.password); }}
                                        className="group flex items-center justify-center gap-1.5 h-9 px-2 rounded-md border border-[#eaeaea] bg-white hover:bg-[#171717] hover:border-[#171717] hover:text-white active:scale-[0.98] transition-all duration-150"
                                    >
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold transition-colors ${
                                            cred.role === 'admin' ? 'bg-blue-100 text-blue-600 group-hover:bg-white group-hover:text-blue-600' : 
                                            cred.role === 'specialist' ? 'bg-purple-100 text-purple-600 group-hover:bg-white group-hover:text-purple-600' : 
                                            'bg-orange-100 text-orange-600 group-hover:bg-white group-hover:text-orange-600'
                                        }`}>
                                            {cred.role.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-medium text-[#666666] group-hover:text-white capitalize transition-colors">
                                            {cred.role}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Create Account Link */}
                        <p className="text-center text-xs text-[#888888] mt-4">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-[#171717] font-semibold hover:underline">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
