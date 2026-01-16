import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface QuickActionProps {
    title: string;
    description: string;
    icon: LucideIcon;
    onClick: () => void;
    color?: 'primary' | 'emerald' | 'purple' | 'amber';
    className?: string;
}

const colorConfig = {
    primary: {
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        hoverGlow: 'hover:shadow-blue-500/5',
        gradient: 'from-blue-500/20 to-transparent',
    },
    emerald: {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        hoverGlow: 'hover:shadow-emerald-500/5',
        gradient: 'from-emerald-500/20 to-transparent',
    },
    purple: {
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        hoverGlow: 'hover:shadow-purple-500/5',
        gradient: 'from-purple-500/20 to-transparent',
    },
    amber: {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        hoverGlow: 'hover:shadow-amber-500/5',
        gradient: 'from-amber-500/20 to-transparent',
    },
};

export const QuickAction: React.FC<QuickActionProps> = ({
    title,
    description,
    icon: Icon,
    onClick,
    color = 'emerald',
    className,
}) => {
    const config = colorConfig[color];

    return (
        <button
            onClick={onClick}
            className={cn(
                'group w-full flex items-center gap-3 p-3 rounded-lg',
                'bg-zinc-900/50 backdrop-blur-sm border border-white/[0.08]',
                'hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200',
                'text-left',
                className
            )}
        >
            <div className={cn(
                'p-2 rounded-lg bg-zinc-800/50 text-zinc-400 group-hover:text-zinc-100 transition-colors'
            )}>
                <Icon size={18} />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    {title}
                </h3>
                <p className="text-xs text-zinc-500 group-hover:text-zinc-400 truncate">{description}</p>
            </div>

            <ArrowRight 
                size={16} 
                className="text-zinc-600 group-hover:text-zinc-300 transition-all duration-200 group-hover:translate-x-0.5" 
            />
        </button>
    );
};

export default QuickAction;
