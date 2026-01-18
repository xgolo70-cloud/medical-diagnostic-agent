import React from 'react';
import { motion } from 'framer-motion';
import { Command } from 'lucide-react';

interface KeyboardShortcut {
    keys: string[];
    action: string;
}

interface KeyboardShortcutsCardProps {
    shortcuts: KeyboardShortcut[];
}

export const KeyboardShortcutsCard: React.FC<KeyboardShortcutsCardProps> = ({
    shortcuts,
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                <Command size={14} className="text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">Keyboard Shortcuts</h3>
            </div>
            <div className="p-4 space-y-3">
                {shortcuts.map((shortcut) => (
                    <div key={shortcut.action} className="flex items-center justify-between group cursor-default">
                        <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700 transition-colors">
                            {shortcut.action}
                        </span>
                        <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, i) => (
                                <React.Fragment key={i}>
                                    <kbd className="min-w-[20px] h-5 flex items-center justify-center px-1 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)]">
                                        {key}
                                    </kbd>
                                    {i < shortcut.keys.length - 1 && (
                                        <span className="text-gray-300 text-[10px]">+</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default KeyboardShortcutsCard;
