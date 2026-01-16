import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Github, Twitter, Linkedin, Brain, ArrowUpRight } from 'lucide-react';
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
];

export const SiteFooter = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <footer ref={ref} className="relative bg-white border-t border-gray-200 overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]" 
                style={{
                    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />
            
            {/* CTA Section */}
            <div className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-3xl p-12 shadow-sm"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 font-display">
                            Ready to deploy?
                        </h2>
                        <div className="flex justify-center w-full">
                            <p className="text-xl text-gray-500 max-w-xl w-full mb-10 text-center">
                                Start building with a free account. Speak to an expert for your Enterprise needs.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button className="h-12 px-8 bg-black text-white hover:bg-gray-800 font-medium rounded-lg shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                Start Deploying
                                <ArrowUpRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button 
                                variant="outline"
                                className="h-12 px-8 border-gray-300 text-gray-900 hover:bg-gray-50 font-medium rounded-lg bg-white"
                            >
                                Talk to an Expert
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full" />

            {/* Footer Links */}
            <div className="py-16 relative z-10 bg-white/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-12">
                        {/* Brand */}
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                                    <Brain className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-lg text-gray-900 tracking-tight">AI & Things</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
                                The intelligent edge platform for mission-critical healthcare IoT. Built for developers, trusted by clinicians.
                            </p>
                            
                            {/* Social */}
                            <div className="flex gap-2">
                                {socialLinks.map((social, i) => (
                                    <a 
                                        key={i}
                                        href={social.href}
                                        className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black hover:bg-white transition-all duraion-200"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        {Object.values(footerLinks).map((section) => (
                            <div key={section.title}>
                                <h4 className="font-bold text-gray-900 mb-6 text-xs tracking-wide uppercase font-mono bg-gray-100 inline-block px-2 py-1 rounded">{section.title}</h4>
                                <ul className="space-y-3">
                                    {section.links.map((link, j) => (
                                        <li key={j}>
                                            <a 
                                                href={link.href} 
                                                className="text-sm text-gray-500 hover:text-black transition-colors inline-flex items-center gap-2 font-medium"
                                            >
                                                {link.label}
                                                {link.badge && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black text-white">
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
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* Bottom Bar */}
            <div className="py-8 bg-white/80 backdrop-blur-sm relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-gray-400 font-mono">
                        © 2025 AI & Things, Inc. All rights reserved.
                    </div>
                    <div className="flex items-center gap-8 text-xs text-gray-500 font-medium">
                        <a href="#" className="hover:text-black transition-colors">Privacy</a>
                        <a href="#" className="hover:text-black transition-colors">Terms</a>
                        <a href="#" className="hover:text-black transition-colors">Sitemap</a>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-gray-400">All Systems Normal</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
