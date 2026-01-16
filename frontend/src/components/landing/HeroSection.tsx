import { motion } from 'framer-motion';
import { ArrowRight, Play, ChevronRight, Activity, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-10 pb-20 lg:pt-14 lg:pb-32 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] opacity-30 bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl pointer-events-none" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    
                    {/* Announcement Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-sm hover:border-gray-300 transition-colors cursor-default shadow-sm mb-8">
                            <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                v2.0 is now live
                            </span>
                            <span className="w-px h-3 bg-gray-200" />
                            <span className="flex items-center gap-1 text-gray-900 font-semibold group cursor-pointer">
                                Read changelog <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8"
                    >
                        Medical Intelligence <br className="hidden md:block" />
                        <span className="relative inline-block">
                            <span className="relative z-10 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                at the Edge
                            </span>
                            {/* Underline decoration */}
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-500/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full text-lg md:text-xl text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed text-center px-4"
                    >
                        Advanced diagnostics and patient monitoring powered by local AI. 
                        Secure, private, and lightning fast. No cloud dependency required.
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                    >
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20"
                        >
                            Get Started
                            <ArrowRight size={20} />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                            <Play size={20} className="fill-gray-900" />
                            View Demo
                        </button>
                    </motion.div>

                    {/* Feature Pills */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-gray-500"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                            <Shield size={16} className="text-gray-900" />
                            <span>HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                            <Activity size={16} className="text-gray-900" />
                            <span>99.9% Accuracy</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                            <Zap size={16} className="text-gray-900" />
                            <span>Real-time Analysis</span>
                        </div>
                    </motion.div>
                </div>
            </div>
            
            {/* Abstract Gradient Blob at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
        </section>
    );
};
