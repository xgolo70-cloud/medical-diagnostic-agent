import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type VerificationStatus = 'loading' | 'success' | 'error' | 'already-verified';

export const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState<VerificationStatus>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No verification token provided');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/verify-email?token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    if (data.message.includes('already verified')) {
                        setStatus('already-verified');
                    } else {
                        setStatus('success');
                    }
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.detail || 'Verification failed');
                }
            } catch {
                setStatus('error');
                setMessage('Network error. Please try again.');
            }
        };

        verifyEmail();
    }, [token]);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h2>
                        <p className="text-gray-500">Please wait a moment</p>
                    </motion.div>
                );

            case 'success':
                return (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified! 🎉</h2>
                        <p className="text-gray-500 mb-8">{message}</p>
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
                );

            case 'already-verified':
                return (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <Mail className="w-10 h-10 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Verified</h2>
                        <p className="text-gray-500 mb-8">Your email has already been verified.</p>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate('/login')}
                            className="gap-2"
                        >
                            Go to Login
                            <ArrowRight size={18} />
                        </Button>
                    </motion.div>
                );

            case 'error':
                return (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-500 mb-4">{message}</p>
                        <p className="text-sm text-gray-400 mb-8">
                            The link may have expired or already been used.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => navigate('/register')}
                            >
                                Register Again
                            </Button>
                            <Link
                                to="/login"
                                className="text-sm text-gray-500 hover:text-black transition-colors"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-[96px] opacity-50" />
                <div className="absolute bottom-0 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-[96px] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
