import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Brain, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
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
            dispatch(loginSuccess({ username: matchedUser.username, role: matchedUser.role }));
        } else {
            dispatch(loginFailure('Invalid credentials.'));
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans p-4 sm:p-6 lg:p-8 selection:bg-black selection:text-white">
            <style>
                {`
                    @keyframes movePattern {
                        0% { background-position: 0 0; }
                        100% { background-position: 24px 24px; }
                    }
                `}
            </style>

            {/* Animated Grid Pattern */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-[0.3]"
                style={{
                    backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    animation: 'movePattern 20s linear infinite'
                }}
            />

            {/* Organic Mesh Background */}
            <div className="absolute top-[-20%] right-[0%] w-[70%] h-[70%] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none mix-blend-multiply animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-rose-200/30 rounded-full blur-[100px] pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '6s' }} />
            
            <div className="w-full max-w-5xl relative z-10">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] lg:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white/60 overflow-hidden flex flex-col lg:flex-row lg:min-h-[600px] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
                    
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
                            <div className="grid grid-cols-3 gap-6 h-[150%] -mt-[20%] w-[150%] -ml-[25%] transform -rotate-12 scale-110 opacity-60">
                                
                                {/* Column 1: Up */}
                                <div className="flex flex-col gap-6 animate-scroll-up">
                                    {[
                                        'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=1986&auto=format&fit=crop', // Lion
                                        'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=2059&auto=format&fit=crop', // Flower Lion
                                        'https://images.unsplash.com/photo-1504006833117-8886a36e6bf3?q=80&w=1887&auto=format&fit=crop', // Abstract
                                        'https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=2070&auto=format&fit=crop', // Leopard
                                         // Duplicates for Loop
                                        'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=1986&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=2059&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1504006833117-8886a36e6bf3?q=80&w=1887&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=2070&auto=format&fit=crop',
                                    ].map((img, i) => (
                                        <div key={i} className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-lg">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>

                                {/* Column 2: Down (Center) */}
                                <div className="flex flex-col gap-6 animate-scroll-down">
                                    {[
                                        'https://images.unsplash.com/photo-1474511320723-9a56873867b5?q=80&w=2072&auto=format&fit=crop', // Fox
                                        'https://images.unsplash.com/photo-1557004396-66e4174d7bf6?q=80&w=1887&auto=format&fit=crop', // Tiger
                                        'https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=2080&auto=format&fit=crop', // Cat eye
                                        'https://images.unsplash.com/photo-1505148230895-7165f08b5130?q=80&w=2070&auto=format&fit=crop', // Jellyfish
                                         // Duplicates for Loop
                                        'https://images.unsplash.com/photo-1474511320723-9a56873867b5?q=80&w=2072&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1557004396-66e4174d7bf6?q=80&w=1887&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=2080&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1505148230895-7165f08b5130?q=80&w=2070&auto=format&fit=crop',
                                    ].map((img, i) => (
                                        <div key={i} className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-lg">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>

                                {/* Column 3: Up */}
                                <div className="flex flex-col gap-6 animate-scroll-up">
                                    {[
                                        'https://images.unsplash.com/photo-1497752531616-c3afd97aa9a1?q=80&w=1973&auto=format&fit=crop', // Owl
                                        'https://images.unsplash.com/photo-1559717652-f9479361ad3e?q=80&w=1887&auto=format&fit=crop', // Deer
                                        'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?q=80&w=1888&auto=format&fit=crop', // Wolf
                                        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80&w=2072&auto=format&fit=crop', // Panda
                                         // Duplicates for Loop
                                        'https://images.unsplash.com/photo-1497752531616-c3afd97aa9a1?q=80&w=1973&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1559717652-f9479361ad3e?q=80&w=1887&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?q=80&w=1888&auto=format&fit=crop',
                                        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80&w=2072&auto=format&fit=crop',
                                    ].map((img, i) => (
                                        <div key={i} className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-lg">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
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
                            <h2 className="text-4xl lg:text-5xl font-serif leading-none mb-6 !text-white drop-shadow-lg" style={{ color: '#ffffff' }}>
                                Beyond <br/>
                                <span className="italic font-light !text-gray-200">Thinking.</span>
                            </h2>
                            <p className="text-sm !text-gray-200 leading-relaxed font-light border-l border-white/40 pl-4 drop-shadow-sm">
                                "Experience the next generation of intelligent healthcare management."
                            </p>
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
                                        onChange={(e) => { setUsername(e.target.value); formErrors.username && setFormErrors({ ...formErrors, username: undefined }); }}
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
