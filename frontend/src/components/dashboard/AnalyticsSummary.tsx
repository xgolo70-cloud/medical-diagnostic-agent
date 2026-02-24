import React from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { useWeeklyStats } from '../../hooks';

export const AnalyticsSummary: React.FC = () => {
    const { weeklyStats, isLoading } = useWeeklyStats();
    const { days, total, changePct } = weeklyStats;

    const maxValue = days.length > 0 ? Math.max(...days.map(d => d.value), 1) : 1;
    const isPositive = changePct >= 0;

    if (isLoading) {
        return (
            <div className="h-full flex flex-col animate-pulse">
                <div className="flex items-start justify-between mb-6">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-6 bg-gray-200 rounded w-12" />
                </div>
                <div className="flex items-end justify-between gap-2 h-24 w-full mt-auto">
                    {[40, 60, 35, 70, 50, 45, 55].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                            <div className="w-full bg-gray-200 rounded-sm" style={{ height: `${h}%` }} />
                            <div className="mt-2 h-3 bg-gray-200 rounded w-6" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart3 size={16} className="text-[#666666]" />
                        <span className="text-sm font-medium text-[#171717]">
                            Analysis Volume
                        </span>
                    </div>
                    <p className="text-xs text-[#666666]">
                        Weekly diagnostic requests
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-xl font-semibold text-[#171717] tracking-tight">{total}</div>
                    <div className={`flex items-center justify-end gap-1 text-xs font-medium ${isPositive ? 'text-[#0070f3]' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{isPositive ? '+' : ''}{changePct}%</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="flex items-end justify-between gap-2 h-24 w-full mt-auto">
                {days.map((d) => (
                    <div key={d.date} className="relative flex-1 flex flex-col items-center group cursor-pointer">
                        {/* Tooltip */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#171717] text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                            {d.value} scans
                        </div>
                        
                        {/* Bar */}
                        <div 
                            className="w-full bg-[#eaeaea] rounded-sm group-hover:bg-[#0070f3] transition-colors" 
                            style={{ height: `${(d.value / maxValue) * 100}%`, minHeight: d.value > 0 ? '4px' : '2px' }}
                        />
                        
                        {/* Label */}
                        <div className="mt-2 text-[10px] text-[#666666] font-medium group-hover:text-[#171717] transition-colors">
                            {d.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
