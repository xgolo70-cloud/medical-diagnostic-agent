import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const quickActions = [
    { label: 'New Diagnosis', path: '/analysis', icon: '🔬' },
    { label: 'View Patients', path: '/history', icon: '👥' },
    { label: 'Recent Reports', path: '/history', icon: '📄' },
];

export const SearchModal: React.FC<SearchModalProps> = ({
    isOpen,
    onClose,
    searchQuery,
    onSearchChange,
}) => {
    const navigate = useNavigate();

    const handleAction = (path: string) => {
        navigate(path);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100"
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-100 overflow-hidden border border-gray-200"
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                            <Search size={20} className="text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search patients, reports, or actions..."
                                className="flex-1 text-base outline-none placeholder:text-gray-400 text-gray-900"
                                autoFocus
                            />
                            <kbd className="px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
                                ESC
                            </kbd>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-3">
                            <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                Quick Actions
                            </p>
                            <div className="mt-2 space-y-1">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => handleAction(action.path)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                                    >
                                        <span className="text-lg">{action.icon}</span>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                            {action.label}
                                        </span>
                                        <ArrowUpRight 
                                            size={14} 
                                            className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" 
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Command size={12} />
                                <span>K to open</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <span>↑↓ Navigate</span>
                                <span className="mx-1">•</span>
                                <span>↵ Select</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
