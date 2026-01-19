import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, ChevronRight, Activity, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Waterfall Images - Medical Diagnostic AI Theme
const leftColumnImages = [
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=400&auto=format&fit=crop', // Doctor analyzing
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=400&auto=format&fit=crop', // X-Ray scan
    'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=400&auto=format&fit=crop', // Medical tablet
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400&auto=format&fit=crop', // Doctor with tech
    'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=400&auto=format&fit=crop', // Surgery room
];

const rightColumnImages = [
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400&auto=format&fit=crop', // Stethoscope
    'https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=400&auto=format&fit=crop', // Doctor team
    'https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=400&auto=format&fit=crop', // Health data
    'https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=400&auto=format&fit=crop', // Medical AI screen
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop', // Doctor portrait
];

export const HeroSection = () => {
    const navigate = useNavigate();
    const words = ["at the Edge", "for Everyone", "with Speed", "Securely"];
    const [index, setIndex] = React.useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [words.length]);

    // Waterfall CSS Animations
    const waterfallStyles = `
        @keyframes scrollDown {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        @keyframes scrollUp {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
        }
        .animate-waterfall-down {
            animation: scrollDown 25s linear infinite;
        }
        .animate-waterfall-up {
            animation: scrollUp 25s linear infinite;
        }
    `;

    return (
        <section className="relative pt-10 pb-20 lg:pt-14 lg:pb-32 overflow-hidden">
            <style>{waterfallStyles}</style>

            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] opacity-30 bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl pointer-events-none" />
            </div>

            {/* Left Waterfall Column */}
            <div className="absolute left-0 top-0 bottom-0 w-32 lg:w-48 xl:w-64 overflow-hidden z-0 hidden md:block">
                {/* Fade Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white z-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white z-20 pointer-events-none" />
                
                {/* Tilted Container */}
                <div className="absolute inset-0 transform -rotate-6 scale-125 origin-center opacity-60">
                    <div className="flex flex-col gap-4 animate-waterfall-down">
                        {[...leftColumnImages, ...leftColumnImages].map((img, i) => (
                            <div 
                                key={`left-${i}`} 
                                className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-gray-100/50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 z-10" />
                                <img 
                                    src={img} 
                                    alt="" 
                                    className="w-full h-full object-cover" 
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Waterfall Column */}
            <div className="absolute right-0 top-0 bottom-0 w-32 lg:w-48 xl:w-64 overflow-hidden z-0 hidden md:block">
                {/* Fade Overlays */}
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white z-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white z-20 pointer-events-none" />
                
                {/* Tilted Container */}
                <div className="absolute inset-0 transform rotate-6 scale-125 origin-center opacity-60">
                    <div className="flex flex-col gap-4 animate-waterfall-up">
                        {[...rightColumnImages, ...rightColumnImages].map((img, i) => (
                            <div 
                                key={`right-${i}`} 
                                className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-gray-100/50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 z-10" />
                                <img 
                                    src={img} 
                                    alt="" 
                                    className="w-full h-full object-cover" 
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-y-8">
                    
                    {/* Announcement Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center w-full"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-sm hover:border-gray-300 transition-colors cursor-default shadow-sm">
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
                        className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 w-full leading-tight"
                    >
                        Medical Intelligence <br className="hidden md:block" />
                        <div className="relative inline-flex flex-col items-center mt-2 md:mt-4">
                            <span className="relative inline-flex h-[1.2em] overflow-hidden">
                                <AnimatePresence mode="popLayout">
                                    <motion.span
                                        key={index}
                                        initial={{ y: "100%", opacity: 0 }}
                                        animate={{ y: "0%", opacity: 1 }}
                                        exit={{ y: "-100%", opacity: 0 }}
                                        transition={{ duration: 0.5, ease: "circOut" }}
                                        className="block bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent px-2 whitespace-nowrap"
                                    >
                                        {words[index]}
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                             <svg className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[130%] h-8 -z-10" viewBox="0 0 200 20" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                                    </linearGradient>
                                </defs>
                                <path d="M5 10 Q 50 18 90 9 T 195 10" stroke="url(#lineGradient)" strokeWidth="6" fill="none" strokeLinecap="round" />
                                <path d="M10 14 Q 60 20 100 12 T 190 14" stroke="url(#lineGradient)" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
                            </svg>
                        </div>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full text-lg md:text-xl text-gray-600 md:text-gray-500 max-w-3xl mx-auto leading-relaxed text-center px-4"
                    >
                        Advanced diagnostics and patient monitoring powered by local AI. 
                        Secure, private, and lightning fast. No cloud dependency required.
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
                    >
                        <button 
                            onClick={() => navigate('/login')}
                            className="group relative w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10">Sign In</span>
                            <div className="relative z-10 p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                            </div>
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
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
                            <Shield size={16} className="text-gray-900" />
                            <span>HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
                            <Activity size={16} className="text-gray-900" />
                            <span>99.9% Accuracy</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
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
