import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Github, Twitter, Linkedin, Brain, ArrowRight, Mail, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface FooterLink {
    label: string;
    href: string;
    badge?: string;
}

const footerLinks: Record<string, { title: string; links: FooterLink[] }> = {
    platform: {
        title: "Platform",
        links: [
            { label: "Intelligence Engine", href: "#" },
            { label: "Edge Gateway", href: "#" },
            { label: "Security", href: "#" },
            { label: "Integrations", href: "#" },
            { label: "API Reference", href: "#" },
        ]
    },
    solutions: {
        title: "Solutions",
        links: [
            { label: "Remote Monitoring", href: "#" },
            { label: "Clinical Analytics", href: "#" },
            { label: "IoT Management", href: "#" },
            { label: "Compliance", href: "#" },
        ]
    },
    company: {
        title: "Company",
        links: [
            { label: "About Us", href: "#" },
            { label: "Careers", href: "#", badge: "Hiring" },
            { label: "Blog", href: "#" },
            { label: "Press", href: "#" },
        ]
    },
    legal: {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "#" },
            { label: "Terms of Service", href: "#" },
            { label: "BAA (HIPAA)", href: "#" },
            { label: "Cookie Policy", href: "#" },
        ]
    }
};

const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Email" },
];

const trustBadges = [
    { icon: Shield, label: "HIPAA Compliant" },
    { icon: Zap, label: "99.9% Uptime" },
    { icon: Sparkles, label: "AI Powered" },
];

export const SiteFooter = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const navigate = useNavigate();

    return (
        <footer ref={ref} className="relative overflow-hidden font-sans">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-gray-100/50" />
            
            {/* Subtle Pattern */}
            <div className="absolute inset-0 z-0 opacity-30" 
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                }}
            />
            
            {/* Decorative Gradient Orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl translate-y-1/2" />

            {/* CTA Section */}
            <div className="py-20 lg:py-28 relative z-10 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        {/* Pre-headline Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/80 shadow-sm mb-8">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-gray-700">Trusted by 500+ Healthcare Providers</span>
                        </div>
                        
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6 lg:mb-8 leading-[1.1]">
                            Ready to transform
                            <br />
                            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                                patient care?
                            </span>
                        </h2>
                        <div className="w-full flex justify-center">
                            <p 
                                className="text-lg lg:text-xl text-gray-500 max-w-3xl mb-10 lg:mb-12 leading-relaxed text-center"
                            >
                                Join leading healthcare providers using intelligent edge AI to deliver faster, more accurate diagnostics.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Button 
                                onClick={() => navigate('/login')}
                                className="group h-14 px-10 bg-gray-900 text-white hover:bg-gray-800 text-base font-semibold rounded-2xl shadow-xl shadow-gray-900/20 hover:shadow-2xl hover:shadow-gray-900/30 hover:-translate-y-1 transition-all w-full sm:w-auto duration-300"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button 
                                variant="outline"
                                className="h-14 px-10 border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 text-base font-semibold rounded-2xl bg-white/70 backdrop-blur-sm w-full sm:w-auto transition-all duration-300 hover:shadow-lg"
                            >
                                Schedule Demo
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            {trustBadges.map((badge, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                                    className="flex items-center gap-2 text-sm text-gray-500"
                                >
                                    <badge.icon className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{badge.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Divider */}
            <div className="relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>
            </div>

            {/* Footer Links */}
            <div className="relative z-10 bg-white/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto py-16 lg:py-20 px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
                        
                        {/* Brand Column */}
                        <div className="lg:col-span-4 flex flex-col">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-lg shadow-gray-900/20">
                                        <Brain className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-xl text-gray-900 tracking-tight">AI & Things</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
                                    Intelligent edge solutions for next-gen healthcare. Secure, compliant, and always on.
                                </p>
                                
                                {/* Social Icons */}
                                <div className="flex gap-3">
                                    {socialLinks.map((social, i) => (
                                        <motion.a 
                                            key={i}
                                            href={social.href}
                                            whileHover={{ y: -4, scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                                            aria-label={social.label}
                                        >
                                            <social.icon className="w-4 h-4" />
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Navigation Columns */}
                        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-8">
                            {Object.values(footerLinks).map((section, sectionIndex) => (
                                <motion.div 
                                    key={section.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.3 + sectionIndex * 0.1 }}
                                >
                                    <h4 className="font-semibold text-gray-900 mb-5 text-sm tracking-wide uppercase">
                                        {section.title}
                                    </h4>
                                    <ul className="space-y-3.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {section.links.map((link, j) => (
                                            <li key={j}>
                                                <span 
                                                    onClick={() => window.location.href = link.href}
                                                    className="group inline-flex items-center gap-2 text-sm cursor-pointer transition-colors duration-200"
                                                    style={{ color: '#6b7280', textDecoration: 'none' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                                                >
                                                    <span className="relative">
                                                        {link.label}
                                                        <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gray-900 transition-all duration-300 group-hover:w-full" />
                                                    </span>
                                                    {link.badge && (
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                                                            {link.badge}
                                                        </span>
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-gray-200/80">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="text-sm text-gray-400 font-medium">
                                © {new Date().getFullYear()} AI & Things, Inc. All rights reserved.
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {/* Language Selector */}
                                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-colors">
                                    <span className="text-base">🌐</span>
                                    <span className="font-medium">English</span>
                                </button>
                                
                                {/* Status Indicator */}
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-gray-600 text-sm font-semibold">All Systems Operational</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
