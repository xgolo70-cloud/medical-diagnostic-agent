import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, ArrowLeft, Brain, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import { tokenManager } from '../../services/api';
import { Link } from 'react-router-dom';

const VALID_CREDENTIALS = [
    { username: 'admin', password: 'password', role: 'gp' as const },
    { username: 'dr.smith', password: 'specialist123', role: 'specialist' as const },
    { username: 'auditor', password: 'audit2024', role: 'auditor' as const },
];

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
        await new Promise((resolve) => setTimeout(resolve, 800)); // Slightly longer delay for "premium" feel

        const matchedUser = VALID_CREDENTIALS.find(
            (cred) => cred.username === username && cred.password === password
        );

        if (matchedUser) {
            // Save mock tokens for session persistence (since backend is not available)
            // This ensures the session survives page refresh
            const mockAccessToken = `mock_access_${Date.now()}_${matchedUser.username}`;
            const mockRefreshToken = `mock_refresh_${Date.now()}_${matchedUser.username}`;
            tokenManager.setTokens(mockAccessToken, mockRefreshToken);
            
            dispatch(loginSuccess({ username: matchedUser.username, role: matchedUser.role }));
        } else {
            dispatch(loginFailure('Invalid credentials.'));
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse: any) => {
            try {
                dispatch(loginStart());
                
                // Fetch user info from Google
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                
                if (!userInfoResponse.ok) {
                    throw new Error('Failed to fetch user info');
                }
                
                const userInfo = await userInfoResponse.json();
                
                // Store tokens
                tokenManager.setTokens(tokenResponse.access_token, tokenResponse.access_token);
                
                // Dispatch login success with Google data
                // Map Google profile to our app's user structure
                dispatch(loginSuccess({
                    username: userInfo.email,
                    role: 'specialist', // Default role for Google sign-in users
                    email: userInfo.email,
                    avatar: userInfo.picture,
                    displayName: userInfo.name,
                }));
                
            } catch (err) {
                console.error('Google login error:', err);
                dispatch(loginFailure('Google sign-in failed. Please try again.'));
            }
        },
        onError: () => {
             dispatch(loginFailure('Google sign-in failed.'));
        }
    });

    return (
        <div className="h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
            <style>
                {`
                    @keyframes blob {
                        0% { transform: translate(0px, 0px) scale(1); }
                        33% { transform: translate(30px, -50px) scale(1.1); }
                        66% { transform: translate(-20px, 20px) scale(0.9); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }
                    .animate-blob {
                        animation: blob 10s infinite;
                    }
                    .animation-delay-2000 {
                        animation-delay: 2s;
                    }
                    .animation-delay-4000 {
                        animation-delay: 4s;
                    }
                `}
            </style>

            {/* Light Creative Background */}
            <div className="absolute inset-0 bg-[#F8FAFC]">
                {/* Subtle Grid */}
                <div className="absolute inset-0 opacity-[0.4]" 
                     style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
                />
            </div>

            {/* Animated Pastel Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-[96px] opacity-70 animate-blob" />
                <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-[96px] opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-[96px] opacity-70 animate-blob animation-delay-4000" />
            </div>
            
            <div className="w-full max-w-5xl relative z-10 p-4">
                <div className="bg-white rounded-[3rem] shadow-[0_0_80px_-10px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,1)] border-[4px] border-white/40 overflow-hidden flex flex-col lg:flex-row lg:min-h-[640px] transition-all duration-500 hover:shadow-[0_0_120px_-10px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
                    
                     {/* Left Side - Brand Visual */}
                    <div className="lg:w-5/12 relative overflow-hidden bg-[#0A0A0A] p-8 lg:p-12 flex flex-col justify-between text-white group">
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

                    {/* Right Side - Smart Form */}
                    <div className="lg:w-7/12 p-6 lg:p-10 flex flex-col bg-white/40 backdrop-blur-sm relative">
                         <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-6">
                                <Link 
                                    to="/" 
                                    className="inline-flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:bg-gray-50 hover:text-black transition-all group"
                                >
                                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                                    Back
                                </Link>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 shadow-sm">
                                    <Lock size={10} className="text-emerald-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Secure Entry</span>
                                </div>
                            </div>

                            <div className="mb-6 flex flex-col gap-3">
                                <h3 className="text-2xl font-bold text-gray-900">Welcome Back</h3>
                                {error ? (
                                    <div className="bg-red-500 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-3 animate-in slide-in-from-left-2 duration-300">
                                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                            <AlertCircle size={18} className="text-white" /> 
                                        </div>
                                        <span className="text-sm font-bold tracking-wide">{error}</span>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm pl-1">Sign in to access your intelligent dashboard.</p>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5 group">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 group-focus-within:text-black transition-colors">Username</label>
                                            {formErrors.username && (
                                                <span className="text-[10px] font-bold text-red-500 animate-in fade-in flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                                    <AlertCircle size={10} /> {formErrors.username}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); if (formErrors.username) setFormErrors({ ...formErrors, username: undefined }); }}
                                        className={`w-full h-12 px-4 rounded-xl bg-white/60 border ${formErrors.username ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200'} text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black focus:bg-white transition-all shadow-sm text-sm`}
                                        placeholder="e.g. dr.smith"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-1.5 group">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 group-focus-within:text-black transition-colors">Password</label>
                                            {formErrors.password && (
                                                <span className="text-[10px] font-bold text-red-500 animate-in fade-in flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                                    <AlertCircle size={10} /> {formErrors.password}
                                                </span>
                                            )}
                                        </div>
                                        <button type="button" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">Forgot?</button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => { 
                                                setPassword(e.target.value); 
                                                if (formErrors.password) setFormErrors({ ...formErrors, password: undefined }); 
                                            }}
                                            className={`w-full h-12 px-4 rounded-xl bg-white/60 border ${formErrors.password ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200'} text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black focus:bg-white transition-all shadow-sm text-sm`}
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-black text-white rounded-xl font-bold text-sm tracking-wide hover:bg-gray-800 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                
                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold tracking-widest">Or</span>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleGoogleLogin()}
                                    disabled={isLoading}
                                    className="relative w-full h-12 bg-white text-zinc-700 border border-zinc-200/80 rounded-xl font-bold text-sm tracking-wide hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-100/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21-1.19-2.22z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    <span className="relative z-10">Sign in with Google</span>
                                </button>
                            </form>
                        </div>

                        {/* Smart Quick Login Footer */}
                        <div className="mt-6 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-mono">Quick Select</p>
                                <div className="px-3 py-1 rounded-full bg-white border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-semibold text-emerald-700">Demo Mode</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {VALID_CREDENTIALS.map((cred) => (
                                    <button
                                        key={cred.role}
                                        type="button"
                                        onClick={() => { setUsername(cred.username); setPassword(cred.password); }}
                                        className="group relative flex items-center justify-center gap-2 h-10 px-2 rounded-full border border-gray-200 bg-white hover:bg-zinc-950 hover:border-zinc-950 hover:scale-105 hover:shadow-xl hover:shadow-black/20 active:scale-95 transition-all duration-300 cursor-pointer"
                                    >
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                            cred.role === 'gp' ? 'bg-blue-100 text-blue-600 group-hover:bg-white group-hover:text-blue-600' : 
                                            cred.role === 'specialist' ? 'bg-purple-100 text-purple-600 group-hover:bg-white group-hover:text-purple-600' : 
                                            'bg-orange-100 text-orange-600 group-hover:bg-white group-hover:text-orange-600'
                                        }`}>
                                            {cred.role.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-[11px] font-semibold text-gray-600 group-hover:text-white capitalize truncate transition-colors">
                                            {cred.role === 'gp' ? 'GP' : cred.role}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
