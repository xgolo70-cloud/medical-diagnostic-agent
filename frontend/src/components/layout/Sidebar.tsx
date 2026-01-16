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
    PanelLeftClose,
    PanelLeft
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 64;

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.75} /> },
    { path: '/diagnosis', label: 'Analysis', icon: <Stethoscope size={18} strokeWidth={1.75} /> },
    { path: '/medai', label: 'MedGemma AI', icon: <Brain size={18} strokeWidth={1.75} /> },
    { path: '/history', label: 'History', icon: <History size={18} strokeWidth={1.75} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={18} strokeWidth={1.75} /> },
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
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-40 bg-black/30 md:hidden"
                        onClick={onMobileClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: currentWidth }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className={`
                    fixed top-0 left-0 z-50 h-full 
                    bg-[#fafafa] border-r border-gray-200/80
                    md:translate-x-0 
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    flex flex-col
                `}
                style={{ width: currentWidth }}
            >
                {/* Header */}
                <div className={`h-14 flex items-center border-b border-gray-200/60 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
                    <Link 
                        to="/"
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                            <Brain className="text-white w-4 h-4" />
                        </div>
                        {!isCollapsed && (
                            <span className="font-semibold text-gray-900 text-[13px] tracking-tight">
                                AI & Things
                            </span>
                        )}
                    </Link>
                    
                    {/* Mobile Close */}
                    <button 
                        onClick={onMobileClose}
                        aria-label="Close mobile menu"
                        className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>

                    {/* Desktop Toggle */}
                    {!isCollapsed && (
                        <button 
                            onClick={toggleCollapse}
                            aria-label="Collapse sidebar"
                            className="hidden md:flex p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <PanelLeftClose size={16} aria-hidden="true" />
                        </button>
                    )}
                </div>

                {/* Expand button when collapsed */}
                {isCollapsed && (
                    <button 
                        onClick={toggleCollapse}
                        aria-label="Expand sidebar"
                        className="hidden md:flex mx-auto mt-3 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <PanelLeft size={16} aria-hidden="true" />
                    </button>
                )}

                {/* Navigation */}
                <nav 
                    className={`flex-1 py-4 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-2' : 'px-3'}`}
                    role="navigation"
                    aria-label="Main navigation"
                >
                    {!isCollapsed && (
                        <div className="mb-2 px-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider" aria-hidden="true">
                            Menu
                        </div>
                    )}

                    <div className="space-y-0.5">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onMobileClose}
                                    title={isCollapsed ? item.label : undefined}
                                    aria-label={item.label}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`
                                        group relative flex items-center gap-2.5 h-9 rounded-lg text-[13px] transition-colors duration-150
                                        ${isCollapsed ? 'justify-center px-0' : 'px-2.5'}
                                        ${isActive 
                                            ? 'bg-white text-gray-900 font-medium shadow-sm border border-gray-200/80' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                                        }
                                    `}
                                >
                                    <span className={`flex-shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`} aria-hidden="true">
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && (
                                        <span className="truncate">{item.label}</span>
                                    )}

                                    {/* Tooltip */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-50">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div className={`border-t border-gray-200/60 ${isCollapsed ? 'p-2' : 'p-3'}`}>
                    {/* Home Link */}
                    <Link 
                        to="/"
                        title={isCollapsed ? 'Website' : undefined}
                        className={`
                            flex items-center gap-2.5 h-9 rounded-lg text-[13px] text-gray-500 hover:text-gray-900 hover:bg-white/60 transition-colors mb-2
                            ${isCollapsed ? 'justify-center px-0' : 'px-2.5'}
                        `}
                    >
                        <Home size={18} strokeWidth={1.75} />
                        {!isCollapsed && <span>Website</span>}
                    </Link>

                    {/* User */}
                    <div className={`
                        flex items-center gap-2.5 p-2 rounded-lg bg-white border border-gray-200/80 shadow-sm
                        ${isCollapsed ? 'justify-center' : ''}
                    `}>
                        <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-gray-900 truncate leading-tight">
                                    {user?.username || 'User'}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate leading-tight">{user?.role || 'Admin'}</p>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            aria-label="Sign out of your account"
                            className={`p-1 text-gray-400 hover:text-red-500 rounded transition-colors ${isCollapsed ? 'hidden' : ''}`}
                        >
                            <LogOut size={14} aria-hidden="true" />
                        </button>
                    </div>

                    {/* Logout button when collapsed */}
                    {isCollapsed && (
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="w-full mt-2 flex justify-center p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
