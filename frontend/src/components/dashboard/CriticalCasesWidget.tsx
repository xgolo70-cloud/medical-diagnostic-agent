import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const CriticalCasesWidget: React.FC = () => {
    const navigate = useNavigate();
    
    // Fetch cases marked as "Critical"
    const { data: criticalCases, isLoading: isLoadingCritical } = useQuery({
        queryKey: ['diagnoses', 'critical'],
        queryFn: () => api.getDiagnoses({ severity: 'Critical', limit: 3 }),
    });

    // Fetch cases marked as "High"
    const { data: highCases, isLoading: isLoadingHigh } = useQuery({
        queryKey: ['diagnoses', 'high'],
        queryFn: () => api.getDiagnoses({ severity: 'High', limit: 2 }),
    });

    const isLoading = isLoadingCritical || isLoadingHigh;
    
    // Combine and sort (though the backend already sorts by date desc)
    const combinedCases = [...(criticalCases || []), ...(highCases || [])].slice(0, 4);

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden"
        >
            <div className="px-5 py-4 border-b border-red-100 bg-red-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <AlertTriangle size={16} className="text-red-500" />
                    </motion.div>
                    <h3 className="text-sm font-semibold text-red-900">Critical Attention</h3>
                </div>
                <button 
                    onClick={() => navigate('/history')}
                    className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                >
                    View all
                </button>
            </div>
            
            <div className="p-3 space-y-2">
                {isLoading ? (
                    <div className="py-6 text-center text-sm text-gray-500">Loading critical cases...</div>
                ) : combinedCases.length === 0 ? (
                    <div className="py-6 text-center">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-50 flex items-center justify-center">
                            <span className="text-green-500 font-bold">✓</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">No critical cases pending</p>
                    </div>
                ) : (
                    combinedCases.map((caseItem, index) => (
                        <motion.button
                            key={caseItem.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                            whileHover={{ scale: 0.98 }}
                            onClick={() => {
                                // Reconstruct the DiagnosisResult object for the standard view
                                navigate('/diagnosis/result', { 
                                    state: {
                                        patient_id: caseItem.patient_id,
                                        differential_diagnosis: caseItem.result?.differential_diagnosis || [],
                                        severity: caseItem.severity,
                                        condition_category: caseItem.condition_category,
                                        requires_immediate_attention: caseItem.requires_immediate_attention,
                                        recommended_tests: caseItem.result?.recommended_tests || [],
                                        citations: caseItem.result?.citations || [],
                                        clinical_notes: caseItem.result?.clinical_notes || '',
                                        timestamp: caseItem.date
                                    } 
                                })
                            }}
                            className="w-full flex items-start gap-3 p-3 rounded-lg border border-red-100 bg-red-50/20 hover:bg-red-50 transition-colors text-left group"
                        >
                            <div className="mt-0.5">
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-900 truncate">
                                        Patient: {caseItem.patient_id || 'Unknown'}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                        caseItem.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {caseItem.severity}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-700 mb-1 truncate">
                                    {caseItem.primary_diagnosis || "Awaiting Review"}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <Clock size={10} />
                                    {new Date(caseItem.date).toLocaleDateString()}
                                </div>
                            </div>
                            
                            <ChevronRight size={14} className="text-gray-400 group-hover:text-red-500 self-center" />
                        </motion.button>
                    ))
                )}
            </div>
        </motion.div>
    );
};
