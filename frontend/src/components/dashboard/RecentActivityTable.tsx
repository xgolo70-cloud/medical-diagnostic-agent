import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services';
import { Activity, FileText, CheckCircle2 } from 'lucide-react';

interface AuditEntry {
    timestamp: string;
    action: string;
    user_id: string;
    details: {
        patient_id?: string;
        filename?: string;
        [key: string]: unknown;
    };
}

const getActionIcon = (action: string) => {
    switch (action) {
        case 'generate_diagnosis':
            return <Activity size={14} className="text-[#0070f3]" />;
        case 'generate_diagnosis_unified':
            return <FileText size={14} className="text-[#8b5cf6]" />;
        default:
            return <CheckCircle2 size={14} className="text-[#10b981]" />;
    }
};

const formatAction = (action: string) => {
    switch (action) {
        case 'generate_diagnosis':
            return 'Manual Diagnosis';
        case 'generate_diagnosis_unified':
            return 'Report Upload';
        default:
            return action.replace(/_/g, ' ');
    }
};

export const RecentActivityTable: React.FC = () => {
    const { data: history, isLoading } = useQuery<AuditEntry[]>({
        queryKey: ['history'],
        queryFn: () => api.getHistory() as Promise<AuditEntry[]>,
        select: (data) => data.slice(0, 5)
    });

    if (isLoading) {
        return (
            <div className="h-[200px] w-full animate-pulse bg-[#fafafa]" />
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[200px] text-[#666666]">
                <Activity className="mb-2 opacity-50" size={24} />
                <span className="text-sm">No recent activity</span>
            </div>
        );
    }

    return (
        <table className="w-full text-left text-sm">
            <thead className="bg-[#fafafa] text-xs uppercase text-[#666666] font-medium">
                <tr>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3 text-right">Time</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
                {history.map((entry, i) => (
                    <tr 
                        key={i} 
                        className="group hover:bg-[#fafafa] transition-colors"
                    >
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-md bg-[#fafafa] border border-[#eaeaea]">
                                    {getActionIcon(entry.action)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-[#171717]">
                                        {formatAction(entry.action)}
                                    </span>
                                    <span className="text-xs text-[#666666]">
                                        {entry.details.patient_id ? `Patient #${entry.details.patient_id}` : 'System Task'}
                                    </span>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#171717] flex items-center justify-center text-[10px] text-white font-medium">
                                    {entry.user_id.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[#666666] text-xs">{entry.user_id}</span>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-right text-[#666666] text-xs font-mono">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
