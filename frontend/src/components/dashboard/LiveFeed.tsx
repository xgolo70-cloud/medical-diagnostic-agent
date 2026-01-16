import React from 'react';
import { cn } from '../../lib/utils';

interface LiveFeedItem {
    id: string;
    title: string;
    description: string;
    time: string;
    type: 'success' | 'info' | 'warning' | 'error';
}

interface LiveFeedProps {
    items: LiveFeedItem[];
    onViewAll?: () => void;
    className?: string;
}

const typeConfig = {
    success: {
        dot: 'bg-emerald-500',
        ring: 'ring-emerald-500/30',
    },
    info: {
        dot: 'bg-blue-500',
        ring: 'ring-blue-500/30',
    },
    warning: {
        dot: 'bg-amber-500',
        ring: 'ring-amber-500/30',
    },
    error: {
        dot: 'bg-red-500',
        ring: 'ring-red-500/30',
    },
};

export const LiveFeed: React.FC<LiveFeedProps> = ({ items, onViewAll, className }) => {
    return (
        <div className={cn('rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.04]', className)}>
            <div className="p-2">
                {items.map((item, index) => {
                    const config = typeConfig[item.type];
                    return (
                        <div
                            key={item.id}
                            className="group p-4 hover:bg-white/[0.03] rounded-xl transition-all duration-200 flex gap-4 mb-1 last:mb-0 cursor-default"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Status dot with ring */}
                            <div className="mt-2 relative flex-shrink-0">
                                <div className={cn('h-2.5 w-2.5 rounded-full ring-4', config.dot, config.ring)} />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-3 mb-1">
                                    <p className="text-[15px] font-semibold text-zinc-200 group-hover:text-white transition-colors truncate tracking-tight">{item.title}</p>
                                    <span className="text-[10px] font-medium text-zinc-500 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.04] flex-shrink-0">
                                        {item.time}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors truncate">{item.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {onViewAll && (
                <div className="px-4 pb-4 pt-2">
                    <button
                        onClick={onViewAll}
                        className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-emerald-400 transition-all w-full text-center py-2.5 border-t border-white/[0.04] hover:border-emerald-500/20"
                    >
                        View Full History
                    </button>
                </div>
            )}
        </div>
    );
};

export default LiveFeed;
