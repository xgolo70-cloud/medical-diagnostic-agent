import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Github, Twitter, Linkedin, Brain, ArrowUpRight, Mail } from 'lucide-react';
import { Button } from '../ui/Button';

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

export const SiteFooter = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <footer ref={ref} className="relative bg-gray-50/50 border-t border-gray-100 overflow-hidden font-sans">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.4]" 
                style={{
                    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />
            
            {/* CTA Section */}
            <div className="py-16 lg:py-24 xl:py-32 relative z-10 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6 lg:mb-8 font-display">
                            Ready to build the future?
                        </h2>
                        <p className="text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto mb-8 lg:mb-10 leading-relaxed">
                            Join the leading healthcare providers transforming patient care with intelligent edge AI.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button className="h-12 px-8 bg-black text-white hover:bg-gray-800 text-base font-semibold rounded-full shadow-lg shadow-black/5 hover:shadow-black/10 hover:-translate-y-0.5 transition-all w-full sm:w-auto hover:scale-105 active:scale-95 duration-200">
                                Start Building Now
                                <ArrowUpRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button 
                                variant="outline"
                                className="h-12 px-8 border-gray-200 text-gray-700 hover:bg-white text-base font-semibold rounded-full bg-white/50 backdrop-blur-sm w-full sm:w-auto hover:border-gray-300 transition-all hover:scale-105 active:scale-95 duration-200"
                            >
                                Book a Demo
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full relative z-20" />

            {/* Footer Links */}
            <div className="relative z-10 bg-white/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto pb-8 lg:pb-12 pt-10 lg:pt-16 px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12 lg:mb-16">
                        
                        {/* Brand Column */}
                        <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex flex-col">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center shadow-md shadow-black/5">
                                    <Brain className="w-4.5 h-4.5 text-white" />
                                </div>
                                <span className="font-bold text-lg text-gray-900 tracking-tight">AI & Things</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed font-medium">
                                Intelligent edge solutions for next-gen healthcare. Secure, compliant, and always on.
                            </p>
                            
                            {/* Animated Social Icons */}
                            <div className="flex gap-2.5 mt-auto">
                                {socialLinks.map((social, i) => (
                                    <motion.a 
                                        key={i}
                                        href={social.href}
                                        whileHover={{ y: -3, scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-9 h-9 rounded-full bg-white border border-gray-200/80 flex items-center justify-center text-gray-400 hover:text-black hover:border-gray-300 hover:shadow-sm transition-colors"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-4 h-4" />
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Columns */}
                        <div className="col-span-1 sm:col-span-2 lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-6">
                            {Object.values(footerLinks).map((section) => (
                                <div key={section.title} className="min-w-0">
                                    <h4 className="font-bold text-gray-900 mb-4 lg:mb-5 text-xs lg:text-[13px] tracking-wide uppercase">{section.title}</h4>
                                    <ul className="space-y-2.5 lg:space-y-3">
                                        {section.links.map((link, j) => (
                                            <li key={j}>
                                                <a 
                                                    href={link.href} 
                                                    className="group flex items-center gap-1.5 text-[13px] lg:text-[14px] text-gray-500 hover:text-gray-900 transition-colors font-medium w-fit"
                                                >
                                                    <span className="relative">
                                                        {link.label}
                                                        <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gray-900 transition-all duration-300 group-hover:w-full" />
                                                    </span>
                                                    {link.badge && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider ml-1">
                                                            {link.badge}
                                                        </span>
                                                    )}
                                                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 text-gray-400" />
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-6 lg:pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs text-gray-400 font-medium">
                            © 2025 AI & Things, Inc. All rights reserved.
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm transition-colors hover:border-green-200 hover:bg-green-50/30 cursor-help" title="All systems operational">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-gray-600 text-xs font-semibold tracking-tight">Systems Normal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

