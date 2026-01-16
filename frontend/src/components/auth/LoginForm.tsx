import React, { useState } from 'react';
import { Eye, EyeOff, Brain, Sparkles, Shield, BarChart3, Cpu } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import { BackButton } from '../ui/BackButton';

const VALID_CREDENTIALS = [
    { username: 'admin', password: 'password', role: 'gp' as const },
    { username: 'dr.smith', password: 'specialist123', role: 'specialist' as const },
    { username: 'auditor', password: 'audit2024', role: 'auditor' as const },
];

const FEATURES = [
    { icon: Cpu, title: 'AI Diagnostics', description: 'Advanced neural networks for accurate medical assessments', color: '#0070f3' },
    { icon: BarChart3, title: 'Smart Analytics', description: 'Real-time insights and comprehensive health reports', color: '#8b5cf6' },
    { icon: Shield, title: 'Secure Platform', description: 'Enterprise-grade security for patient data protection', color: '#10b981' },
];

const STATS = [
    { value: '99.2%', label: 'Accuracy Rate' },
    { value: '50K+', label: 'Diagnoses Made' },
    { value: '<2s', label: 'Response Time' },
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
        else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        dispatch(loginStart());
        await new Promise((resolve) => setTimeout(resolve, 500));

        const matchedUser = VALID_CREDENTIALS.find(
            (cred) => cred.username === username && cred.password === password
        );

        if (matchedUser) {
            dispatch(loginSuccess({ username: matchedUser.username, role: matchedUser.role }));
        } else {
            dispatch(loginFailure('Invalid username or password'));
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Promotional Section */}
            <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 bg-[#fafafa] border-r border-[#eaeaea]">
                <div className="max-w-md">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0070f3]/5 border border-[#0070f3]/20 mb-8">
                        <Sparkles size={14} className="text-[#0070f3]" />
                        <span className="text-xs font-semibold text-[#0070f3] uppercase tracking-wide">Next-Gen Healthcare AI</span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-4xl font-bold text-[#171717] leading-tight mb-4">
                        Transform Medical Diagnostics with{' '}
                        <span className="text-[#0070f3]">Artificial Intelligence</span>
                    </h2>
                    <p className="text-[#666666] text-base leading-relaxed mb-8">
                        Experience the future of healthcare with our AI-powered platform. 
                        Get instant, accurate diagnostic insights backed by advanced machine learning.
                    </p>

                    {/* Feature Cards */}
                    <div className="space-y-3 mb-8">
                        {FEATURES.map((feature) => {
                            const IconComponent = feature.icon;
                            return (
                                <div key={feature.title} className="flex items-start gap-4 p-4 rounded-md border border-[#eaeaea] bg-white hover:border-[#d4d4d4] transition-colors">
                                    <div className="p-2 rounded-md border border-[#eaeaea]" style={{ backgroundColor: `${feature.color}08` }}>
                                        <IconComponent size={18} style={{ color: feature.color }} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-[#171717] mb-0.5">{feature.title}</h3>
                                        <p className="text-xs text-[#666666]">{feature.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 pt-6 border-t border-[#eaeaea]">
                        {STATS.map((stat) => (
                            <div key={stat.label}>
                                <div className="text-2xl font-bold text-[#0070f3] mb-0.5">{stat.value}</div>
                                <div className="text-xs text-[#666666]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative flex-1 lg:max-w-md flex flex-col justify-center items-center p-8">
                <div className="absolute top-6 left-6">
                    <BackButton to="/" label="Back to Home" />
                </div>
                <div className="w-full max-w-sm">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-md bg-[#171717] mb-4">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-semibold text-[#171717] mb-1">Welcome back</h1>
                        <p className="text-sm text-[#666666]">Sign in to access your dashboard</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-[#fee2e2] border border-[#fecaca] text-[#b91c1c] text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-[#666666] mb-1.5">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); if (formErrors.username) setFormErrors({ ...formErrors, username: undefined }); }}
                                placeholder="Enter your username"
                                disabled={isLoading}
                                autoFocus
                                className={`w-full h-10 px-3 rounded-md border text-sm text-[#171717] placeholder-[#a3a3a3] focus:outline-none focus:border-[#171717] transition-colors ${formErrors.username ? 'border-[#ef4444]' : 'border-[#eaeaea]'}`}
                            />
                            {formErrors.username && <p className="mt-1 text-xs text-[#ef4444]">{formErrors.username}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[#666666] mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (formErrors.password) setFormErrors({ ...formErrors, password: undefined }); }}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                    className={`w-full h-10 px-3 pr-10 rounded-md border text-sm text-[#171717] placeholder-[#a3a3a3] focus:outline-none focus:border-[#171717] transition-colors ${formErrors.password ? 'border-[#ef4444]' : 'border-[#eaeaea]'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#171717] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {formErrors.password && <p className="mt-1 text-xs text-[#ef4444]">{formErrors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-10 rounded-md bg-[#171717] text-white text-sm font-medium hover:bg-[#404040] disabled:bg-[#a3a3a3] disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-[#eaeaea]" />
                        <span className="text-[10px] text-[#a3a3a3] font-medium uppercase">Demo Accounts</span>
                        <div className="flex-1 h-px bg-[#eaeaea]" />
                    </div>

                    {/* Demo Credentials */}
                    <div className="grid grid-cols-3 gap-2">
                        {VALID_CREDENTIALS.map((demo) => {
                            const color = demo.role === 'gp' ? '#10b981' : demo.role === 'specialist' ? '#8b5cf6' : '#f59e0b';
                            const label = demo.role === 'gp' ? 'GP' : demo.role === 'specialist' ? 'Specialist' : 'Auditor';
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => { setUsername(demo.username); setPassword(demo.password); }}
                                    className="p-3 rounded-md border border-[#eaeaea] bg-[#fafafa] hover:border-[#d4d4d4] hover:bg-white transition-colors text-left"
                                >
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                        <span className="text-xs font-medium text-[#171717]">{label}</span>
                                    </div>
                                    <span className="text-[10px] text-[#a3a3a3]">{demo.username}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-[10px] text-[#a3a3a3] mt-8">
                        © 2026 AI & Things. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
