import { motion } from 'framer-motion';
import { Layers, Box, Hexagon, Circle, Triangle, Heart, Activity, Shield } from 'lucide-react';

const companies = [
    { name: "Acme Health", icon: Layers },
    { name: "MediCorp", icon: Box },
    { name: "Global Pharma", icon: Hexagon },
    { name: "BioTech Labs", icon: Circle },
    { name: "Future Care", icon: Triangle },
    { name: "CardioLife", icon: Heart },
    { name: "VitalSync", icon: Activity },
    { name: "SecureMed", icon: Shield },
];

export const TrustedBy = () => {
    return (
        <div className="py-4 border-y border-gray-200 relative overflow-hidden bg-white">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-0">
                <p className="text-center text-xs font-medium text-gray-500 mb-8 uppercase tracking-[0.15em]">
                    Trusted by industry leaders
                </p>

                <div className="flex overflow-hidden">
                    <motion.div
                        className="flex gap-16 pr-16"
                        animate={{ x: [0, "-50%"] }}
                        transition={{
                            duration: 30,
                            ease: "linear",
                            repeat: Infinity
                        }}
                    >
                        {[...companies, ...companies].map((company, i) => (
                            <div 
                                key={i} 
                                className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity duration-300"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <company.icon className="w-4 h-4 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                                    {company.name}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
