import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

export const AnalyticsSummary: React.FC = () => {
    const data = [
        { label: 'Mon', value: 45 },
        { label: 'Tue', value: 32 },
        { label: 'Wed', value: 58 },
        { label: 'Thu', value: 42 },
        { label: 'Fri', value: 65 },
        { label: 'Sat', value: 25 },
        { label: 'Sun', value: 18 },
    ];

    const maxValue = Math.max(...data.map(d => d.value));

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
                    <div className="text-xl font-semibold text-[#171717] tracking-tight">285</div>
                    <div className="flex items-center justify-end gap-1 text-xs font-medium text-[#0070f3]">
                        <TrendingUp size={12} />
                        <span>+14.5%</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="flex items-end justify-between gap-2 h-24 w-full mt-auto">
                {data.map((d) => (
                    <div key={d.label} className="relative flex-1 flex flex-col items-center group cursor-pointer">
                        {/* Tooltip */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#171717] text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                            {d.value} scans
                        </div>
                        
                        {/* Bar */}
                        <div 
                            className="w-full bg-[#eaeaea] rounded-sm group-hover:bg-[#0070f3] transition-colors" 
                            style={{ height: `${(d.value / maxValue) * 100}%` }}
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
