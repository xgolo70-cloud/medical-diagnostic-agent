import React from 'react';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red';
    className?: string;
    animationDelay?: number;
}

const colorConfig = {
    blue: {
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        glow: 'group-hover:shadow-blue-500/10',
        gradient: 'from-blue-500 to-blue-400',
    },
    emerald: {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'group-hover:shadow-emerald-500/10',
        gradient: 'from-emerald-500 to-emerald-400',
    },
    amber: {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'group-hover:shadow-amber-500/10',
        gradient: 'from-amber-500 to-amber-400',
    },
    purple: {
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        glow: 'group-hover:shadow-purple-500/10',
        gradient: 'from-purple-500 to-purple-400',
    },
    red: {
        text: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        glow: 'group-hover:shadow-red-500/10',
        gradient: 'from-red-500 to-red-400',
    },
};

export const StatsCard: React.FC<StatsCardProps> = ({
    label,
    value,
    icon: Icon,
    trend,
    color = 'emerald',
    className,
}) => {
    const config = colorConfig[color];

    return (
        <div
            className={cn(
                'group relative rounded-xl bg-zinc-900/50 backdrop-blur-md border border-white/[0.08] p-5 flex flex-col justify-between h-32',
                'hover:border-zinc-700 transition-all duration-200',
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={cn('p-1.5 rounded-md bg-zinc-800/50', config.text)}>
                       <Icon size={16} />
                    </span>
                    <span className="text-sm font-medium text-zinc-400">{label}</span>
                </div>
                {trend && (
                     <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        trend.includes('+') ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-400 bg-zinc-500/10"
                    )}>
                        {trend}
                    </span>
                )}
            </div>

            <div className="mt-auto">
                <h3 className="text-3xl font-bold text-zinc-100 tracking-tight">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
            </div>
        </div>
    );
};

export default StatsCard;
