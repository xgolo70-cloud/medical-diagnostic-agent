import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface QuickActionProps {
    title: string;
    description: string;
    icon: LucideIcon;
    onClick: () => void;
    className?: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({
    title,
    description,
    icon: Icon,
    onClick,
    className,
}) => {
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
