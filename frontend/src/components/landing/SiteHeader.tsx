import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppSelector } from '../../store/hooks';

export const SiteHeader = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'Workflow', href: '#workflow' },
        { label: 'Reviews', href: '#testimonials' },
        { label: 'Pricing', href: '#pricing' },
    ];

    // Animation variants
    const containerVariants = {
        top: { 
            width: "100%", 
            maxWidth: "80rem", // max-w-7xl
            y: 0,
            borderRadius: "0px",
            backgroundColor: "rgba(255, 255, 255, 0)",
            borderColor: "transparent",
            padding: "1.5rem 1.5rem"
        },
        scrolled: { 
            width: "90%", 
            maxWidth: "60rem", 
            y: 20, // Increased float distance
            borderRadius: "9999px",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            borderColor: "rgba(0,0,0,0.05)",
            padding: "0.75rem 1.25rem",
            boxShadow: "0 8px 32px -8px rgba(0,0,0,0.08)"
        }
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <motion.nav 
                    variants={containerVariants}
                    initial="top"
                    animate={isScrolled ? "scrolled" : "top"}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="pointer-events-auto flex items-center justify-between border border-transparent backdrop-blur-xl"
                >
                    {/* Logo Section */}
                    <div 
                        className="flex items-center gap-2 cursor-pointer group" 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <span className={`font-bold tracking-tight transition-colors duration-300 ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
                            AI & Things
                        </span>
                    </div>

                    {/* Desktop Navigation - Centered in Scrolled Mode */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a 
                                key={link.label}
                                href={link.href} 
                                className="relative px-4 py-2 text-sm font-medium text-gray-500 hover:text-black transition-colors rounded-full hover:bg-black/5"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <div 
                                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200"
                                onClick={() => navigate('/dashboard')}
                            >
                                <span className="text-xs font-medium text-gray-700 ml-2">{user?.username}</span>
                                <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black text-xs font-bold shadow-sm">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        ) : (
                            <>
                                <button 
                                    onClick={() => navigate('/login')} 
                                    className="group relative flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white rounded-full text-sm font-medium overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Sign In
                                        <ArrowRight size={14} className="opacity-0 -translate-x-2 w-0 group-hover:w-auto group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                    </span>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </motion.nav>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        />
                        
                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed top-24 left-4 right-4 z-50 p-4 rounded-3xl bg-white border border-gray-100 shadow-2xl md:hidden"
                        >
                            <div className="flex flex-col gap-2">
                                {navLinks.map((link) => (
                                    <a 
                                        key={link.label}
                                        href={link.href} 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-between p-4 rounded-2xl text-gray-700 hover:text-black hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        {link.label}
                                        <ArrowRight size={16} className="text-gray-300" />
                                    </a>
                                ))}
                                <div className="h-px bg-gray-100 my-2" />
                                {isAuthenticated ? (
                                    <Button 
                                        onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }} 
                                        className="w-full bg-black text-white py-4 rounded-xl"
                                    >
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        Dashboard
                                    </Button>
                                ) : (
                                    <div className="flex gap-3">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => navigate('/login')} 
                                            className="flex-1 rounded-xl py-4"
                                        >
                                            Log in
                                        </Button>
                                        <Button 
                                            onClick={() => navigate('/login')} 
                                            className="flex-1 bg-black text-white rounded-xl py-4"
                                        >
                                            Sign Up
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
