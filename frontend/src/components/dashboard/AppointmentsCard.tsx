import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { Appointment } from '../../hooks/useDashboard';

interface AppointmentsCardProps {
    appointments: Appointment[];
    onUpdateStatus: (id: string, status: Appointment['status']) => void;
}

export const AppointmentsCard: React.FC<AppointmentsCardProps> = ({
    appointments,
    onUpdateStatus,
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Today's Schedule</h3>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {appointments.length} appointments
                    </span>
                </div>
                <button className="text-xs font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1">
                    View Calendar <ChevronRight size={12} />
                </button>
            </div>
            <div className="divide-y divide-gray-50">
                {appointments.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-400 text-sm">
                        No appointments scheduled for today
                    </div>
                ) : (
                    appointments.map((apt, index) => (
                        <motion.div 
                            key={apt.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 * index }}
                            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                                    {apt.patient.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{apt.patient}</p>
                                    <p className="text-xs text-gray-500">{apt.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{apt.time}</p>
                                    <p className={`text-xs ${apt.status === 'confirmed' ? 'text-green-600' : 'text-amber-600'}`}>
                                        {apt.status === 'confirmed' ? '✓ Confirmed' : '◯ Pending'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => onUpdateStatus(apt.id, apt.status === 'confirmed' ? 'pending' : 'confirmed')}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <MoreHorizontal size={14} className="text-gray-400" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default AppointmentsCard;
