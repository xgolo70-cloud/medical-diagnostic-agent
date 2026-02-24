import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, XCircle, Loader2, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

type ResetStatus = 'form' | 'loading' | 'success' | 'error';

// ================== Password Strength Indicator ==================
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-amber-500' };
    if (score <= 5) return { score, label: 'Strong', color: 'bg-emerald-500' };
    return { score, label: 'Very Strong', color: 'bg-green-600' };
};

export const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState<ResetStatus>(() => !token ? 'error' : 'form');
    const [error, setError] = useState(() => !token ? 'No reset token provided' : '');

    const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

    const validatePassword = (pass: string): string | null => {
        if (pass.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(pass)) return 'Password needs an uppercase letter';
        if (!/[a-z]/.test(pass)) return 'Password needs a lowercase letter';
        if (!/\d/.test(pass)) return 'Password needs a number';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate password
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setStatus('loading');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    new_password: password,
                    confirm_password: confirmPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('form');
                setError(data.detail || 'Failed to reset password');
            }
        } catch {
            setStatus('form');
            setError('Network error. Please try again.');
        }
    };

    if (status === 'error' && !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center"
                >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Link to="/forgot-password">
                        <Button variant="primary">Request New Link</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-[96px] opacity-50" />
                    <div className="absolute bottom-0 -right-4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-[96px] opacity-50" />
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center"
                >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset! 🎉</h2>
                    <p className="text-gray-500 mb-6">
                        Your password has been updated successfully. You can now log in with your new password.
                    </p>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => navigate('/login')}
                        className="gap-2"
                    >
                        Continue to Login
                        <ArrowRight size={18} />
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-[96px] opacity-50" />
                <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-[96px] opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
                        <p className="text-gray-500">Create a new, secure password</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError('');
                                    }}
                                    onBlur={() => {
                                        const validationError = validatePassword(password);
                                        if (validationError) setError(validationError);
                                    }}
                                    placeholder="••••••••"
                                    className={`w-full h-12 px-4 pr-11 rounded-xl bg-gray-50 border ${error && error.includes('Password') ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-black'} text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all`}
                                    disabled={status === 'loading'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            <AnimatePresence>
                                {password && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2.5 space-y-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full rounded-full ${passwordStrength.color}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                passwordStrength.score <= 2 ? 'text-red-600' :
                                                passwordStrength.score <= 3 ? 'text-orange-600' :
                                                passwordStrength.score <= 4 ? 'text-amber-600' : 'text-emerald-600'
                                            }`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {[
                                                { check: password.length >= 8, label: '8+ characters' },
                                                { check: /[A-Z]/.test(password), label: 'Uppercase letter' },
                                                { check: /[a-z]/.test(password), label: 'Lowercase letter' },
                                                { check: /\d/.test(password), label: 'Number' },
                                            ].map(req => (
                                                <div key={req.label} className={`flex items-center gap-1.5 text-xs ${req.check ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                    <Check size={10} className={req.check ? 'opacity-100' : 'opacity-30'} />
                                                    {req.label}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (error === 'Passwords do not match') setError('');
                                    }}
                                    onBlur={() => {
                                        if (confirmPassword && password !== confirmPassword) setError('Passwords do not match');
                                    }}
                                    placeholder="••••••••"
                                    className={`w-full h-12 px-4 pr-11 rounded-xl bg-gray-50 border ${error === 'Passwords do not match' ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-black'} text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all`}
                                    disabled={status === 'loading'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
