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
        <footer ref={ref} className="relative bg-white border-t border-gray-100 overflow-hidden font-sans">
            {/* Background Pattern - Consistent with Hero */}
            <div className="absolute inset-0 z-0 opacity-[0.4]" 
                style={{
                    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />
            
            {/* CTA Section - Integrated Flow */}
            <div className="py-32 relative z-10 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-8 font-display">
                            Ready to transform?
                        </h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Join the leading healthcare providers building the future of patient care with AI & Things.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button className="h-14 px-8 bg-black text-white hover:bg-gray-800 text-lg font-semibold rounded-xl shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                                Start Free Trial
                                <ArrowUpRight className="w-5 h-5 ml-2" />
                            </Button>
                            <Button 
                                variant="outline"
                                className="h-14 px-8 border-gray-200 text-gray-700 hover:bg-gray-50 text-lg font-semibold rounded-xl bg-white/50 backdrop-blur-sm w-full sm:w-auto hover:border-gray-300 transition-all"
                            >
                                Schedule Demo
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full relative z-20" />

            {/* Footer Links Container */}
            <div className="relative z-10 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto pb-16 pt-20 px-6">
                    <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8 lg:gap-12">
                        
                        {/* Brand Column */}
                        <div className="col-span-2 md:col-span-4 flex flex-col">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-md shadow-black/5">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-xl text-gray-900 tracking-tight">AI & Things</span>
                            </div>
                            <p className="text-base text-gray-500 mb-8 max-w-sm leading-relaxed">
                                Empowering healthcare providers with intelligent edge solutions. Secure, compliant, and lightning fast.
                            </p>
                            
                            {/* Social Icons */}
                            <div className="flex gap-3 mt-16">
                                {socialLinks.map((social, i) => (
                                    <a 
                                        key={i}
                                        href={social.href}
                                        className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 hover:border-gray-300 transition-all duration-300"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Columns */}
                        <div className="col-span-2 md:col-span-8 flex flex-row flex-wrap justify-between gap-10 md:gap-6">
                            {Object.values(footerLinks).map((section) => (
                                <div key={section.title} className="flex-1 min-w-[140px]">
                                    <h4 className="font-bold text-gray-900 mb-6 text-sm tracking-wider uppercase">{section.title}</h4>
                                    <ul className="space-y-4">
                                        {section.links.map((link, j) => (
                                            <li key={j}>
                                                <a 
                                                    href={link.href} 
                                                    className="text-[15px] text-gray-500 hover:text-black transition-colors flex items-center gap-2 font-medium"
                                                >
                                                    {link.label}
                                                    {link.badge && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                            {link.badge}
                                                        </span>
                                                    )}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                     {/* Bottom Bar */}
                    <div className="mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-400 font-medium">
                            © 2025 AI & Things, Inc.
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100/50">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-green-700 text-xs font-bold">Systems Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

