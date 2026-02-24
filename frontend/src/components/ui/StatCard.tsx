import React from 'react';
import { motion } from 'framer-motion';

export interface StatCardProps {
    /** Stat label shown above the value */
    title: string;
    /** Displayed value (number or formatted string) */
    value: number | string;
    /** Icon rendered inside a colored pill */
    icon: React.ReactNode;
    /** Background color class for icon pill, e.g. "bg-black" */
    color: string;
    /** Accent color class for decorative blob */
    accent: string;
    /** Entrance delay in seconds (default 0) */
    delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, accent, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="bg-white border border-zinc-200/60 rounded-2xl p-5 hover:border-zinc-300 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
    >
        {/* Decorative accent blob */}
        <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${accent} opacity-[0.06] group-hover:opacity-[0.1] transition-opacity`} />

        <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className={`p-2.5 rounded-xl ${color} text-white shadow-sm`}>
                {icon}
            </div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{title}</span>
        </div>

        <div className="text-3xl font-bold text-zinc-900 tracking-tight relative z-10">{value}</div>
    </motion.div>
);

export default StatCard;
