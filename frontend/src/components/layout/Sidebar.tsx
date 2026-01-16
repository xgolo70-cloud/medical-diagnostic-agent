import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Stethoscope,
    History,
    Settings,
    LogOut,
    X,
    Brain,
    Home,
    ChevronRight
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';

export const SIDEBAR_WIDTH = 270;
export const SIDEBAR_COLLAPSED_WIDTH = 80;

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} strokeWidth={1.5} /> },
    { path: '/diagnosis', label: 'Analysis', icon: <Stethoscope size={20} strokeWidth={1.5} /> },
    { path: '/medai', label: 'MedGemma AI', icon: <Brain size={20} strokeWidth={1.5} /> },
    { path: '/history', label: 'History', icon: <History size={20} strokeWidth={1.5} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} strokeWidth={1.5} /> },
];

interface SidebarProps {
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved) setIsCollapsed(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const currentWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                        onClick={onMobileClose}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{ width: currentWidth }}
                transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1 }}
                className={`
                    fixed top-0 left-0 z-50 h-full 
                    bg-white/85 backdrop-blur-2xl border-r border-white/50
                    shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]
                    md:translate-x-0 
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    flex flex-col
                    overflow-hidden
                `}
                style={{ width: currentWidth }}
            >
                {/* Header */}
                <div className={`h-24 flex items-center shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
                    <Link 
                        to="/"
                        className="flex items-center gap-3.5 group relative overflow-hidden"
                    >
                        {/* Logo Container */}
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
                            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/10 relative z-10 transition-transform duration-300 group-hover:scale-105 active:scale-95">
                                <Brain className="w-5 h-5" />
                            </div>
                        </div>
                        
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col justify-center whitespace-nowrap"
                                >
                                    <span className="font-bold text-black text-[16px] tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-black via-black to-zinc-600">
                                        AI & Things
                                    </span>
                                    <span className="text-[11px] text-zinc-500 font-medium tracking-wider uppercase mt-1">
                                        Workspace
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Link>
                    
                    {/* Mobile Close */}
                    <button 
                        onClick={onMobileClose}
                        className="md:hidden p-2 text-black hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-4 space-y-2 overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-thumb-zinc-200">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onMobileClose}
                                className={`
                                    relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group outline-none
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                            >
                                {/* Active Indicator Background - Magic Motion */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabBackground"
                                        className="absolute inset-0 bg-black/[0.04] rounded-2xl border border-black/[0.02]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                    />
                                )}

                                {/* Hover Background (for non-active) */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] rounded-2xl transition-colors duration-300" />
                                )}

                                <span className={`
                                    relative z-10 transition-all duration-300 shrink-0
                                    ${isActive ? 'text-black scale-105' : 'text-zinc-500 group-hover:text-black group-hover:scale-105'}
                                `}>
                                    {isActive 
                                        ? React.cloneElement(item.icon as React.ReactElement, { strokeWidth: 2 } as any) 
                                        : item.icon}
                                </span>

                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className={`
                                                relative z-10 font-medium text-[14px] transition-colors duration-300 whitespace-nowrap
                                                ${isActive ? 'text-black font-semibold' : 'text-zinc-600 group-hover:text-black'}
                                            `}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                
                                {/* Active Dot (Right side) */}
                                {isActive && !isCollapsed && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                                    />
                                )}

                                {/* Collapsed Tooltip */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-5 px-3 py-2 bg-black/90 backdrop-blur text-white text-[13px] font-medium rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl translate-x-[-8px] group-hover:translate-x-0 z-50 whitespace-nowrap pointer-events-none">
                                        {item.label}
                                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black/90 transform rotate-45" />
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-5 relative shrink-0">
                    {/* Gradient Divider */}
                    <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

                    {/* Collapse Toggle (Desktop) */}
                    <button 
                         onClick={toggleCollapse}
                         className={`
                             absolute -right-3 top-[-26px]
                             hidden md:flex w-7 h-7 bg-white/100 backdrop-blur border border-zinc-200 shadow-sm rounded-full items-center justify-center 
                             text-zinc-500 hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 z-50
                             ${isCollapsed ? 'rotate-180' : ''}
                         `}
                     >
                         <ChevronRight size={14} strokeWidth={2} />
                     </button>

                    {/* Website Link */}
                    <Link 
                        to="/"
                        className={`
                            flex items-center gap-3.5 p-3 rounded-2xl text-black hover:bg-black/[0.03] transition-all duration-300 mb-2 group
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                    >
                         <div className={`
                             w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 shrink-0
                             ${isCollapsed ? '' : 'bg-zinc-50 group-hover:bg-white border border-zinc-100 group-hover:border-zinc-200'}
                         `}>
                            <Home size={18} strokeWidth={1.5} className="text-zinc-500 group-hover:text-black transition-colors" />
                         </div>
                         <AnimatePresence>
                             {!isCollapsed && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-[13px] font-medium text-zinc-600 group-hover:text-black transition-colors whitespace-nowrap"
                                >
                                    Website
                                </motion.span>
                             )}
                         </AnimatePresence>
                    </Link>

                    {/* User Profile */}
                    <div className={`
                        flex items-center gap-3.5 p-2 rounded-2xl bg-gradient-to-b from-white to-zinc-50/50 border border-white shadow-sm transition-all duration-300 hover:shadow-md
                        ${isCollapsed ? 'justify-center p-2 bg-none border-none shadow-none' : ''}
                    `}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-black to-zinc-700 text-white flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-white cursor-default select-none shrink-0">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div 
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex-1 min-w-0 overflow-hidden"
                                >
                                    <p className="text-[13px] font-bold text-black truncate tracking-tight">
                                        {user?.username || 'User'}
                                    </p>
                                    <p className="text-[11px] text-zinc-400 truncate font-medium">{user?.role || 'Administrator'}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={handleLogout}
                                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 shrink-0"
                                    title="Sign out"
                                >
                                    <LogOut size={16} strokeWidth={2} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
