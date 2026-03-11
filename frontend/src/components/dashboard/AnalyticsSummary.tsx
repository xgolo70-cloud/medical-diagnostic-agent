import React from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { useWeeklyStats } from '../../hooks';
import { BarChart, Bar, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

export const AnalyticsSummary: React.FC = () => {
    const { weeklyStats, isLoading } = useWeeklyStats();
    const { days, total, changePct } = weeklyStats;

    const isPositive = changePct >= 0;

    if (isLoading) {
        return (
            <div className="h-full flex flex-col animate-pulse">
                <div className="flex items-start justify-between mb-6">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-6 bg-gray-200 rounded w-12" />
                </div>
                <div className="flex items-end justify-between gap-2 h-32 w-full mt-auto">
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

            {/* Recharts Bar Chart */}
            <div className="h-32 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} dy={10} />
                        <RechartsTooltip 
                            cursor={{ fill: '#f3f4f6' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                            formatter={(value: number) => [`${value} scans`, 'Volume']}
                            labelStyle={{ color: '#666', marginBottom: '4px' }}
                        />
                        <Bar dataKey="value" fill="#0070f3" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
