import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import type { Notification } from '../../hooks/useDashboard';

interface NotificationsDropdownProps {
    isOpen: boolean;
    onToggle: () => void;
    notifications: Notification[];
    unreadCount: number;
    onMarkAsRead: (id: string) => void;
    onMarkAllRead: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
    isOpen,
    onToggle,
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllRead,
}) => {
    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggle}
                className="relative h-8 sm:h-9 w-8 sm:w-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
                <Bell size={15} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-gray-900">Notifications</h4>
                            <button 
                                onClick={onMarkAllRead}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Mark all read
                            </button>
                        </div>
                        <div className="max-h-80 overflow-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => onMarkAsRead(notif.id)}
                                        className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${
                                                notif.type === 'urgent' ? 'bg-red-500' :
                                                notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                                                <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100">
                            <button className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-1">
                                View all notifications
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationsDropdown;
