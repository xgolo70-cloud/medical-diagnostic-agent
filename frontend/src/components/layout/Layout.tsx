import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar';
import { PageTransition } from './PageTransition';
import { useNavigationShortcuts } from '../../hooks';

export const Layout: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();

    useNavigationShortcuts(navigate);

    // Sync collapsed state from localStorage (same as Sidebar)
    useEffect(() => {
        const checkCollapsed = () => {
            const saved = localStorage.getItem('sidebar-collapsed');
            if (saved) setIsCollapsed(JSON.parse(saved));
        };
        
        checkCollapsed();
        // Listen for storage changes (when sidebar toggles)
        window.addEventListener('storage', checkCollapsed);
        
        // Also check periodically for same-tab updates
        const interval = setInterval(checkCollapsed, 100);
        
        return () => {
            window.removeEventListener('storage', checkCollapsed);
            clearInterval(interval);
        };
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const currentMargin = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

    return (
        <div className="flex min-h-screen bg-[#fafafa]">
            <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />

            <motion.main 
                initial={false}
                animate={{ marginLeft: currentMargin }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1 min-h-screen hidden md:block"
                style={{ marginLeft: currentMargin }}
            >
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </motion.main>

            {/* Mobile Layout */}
            <div className="flex-1 min-h-screen md:hidden">
                {/* Mobile Header */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={handleDrawerToggle}
                        className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                        aria-label="open menu"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
                            <Brain className="text-white w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">AI & Things</span>
                    </div>
                </div>

                <PageTransition>
                    <Outlet />
                </PageTransition>
            </div>
        </div>
    );
};

export default Layout;
