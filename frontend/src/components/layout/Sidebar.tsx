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
    ChevronLeft,
    Users,
    BookOpen,
    Sparkles,
    Menu,
    Shield
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import api from '../../services/api';

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 76;

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

// --- Grouped Navigation ---
const navSections: { label: string; items: NavItem[] }[] = [
    {
        label: 'Main',
        items: [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} strokeWidth={1.7} /> },
            { path: '/patients', label: 'Patients', icon: <Users size={19} strokeWidth={1.7} /> },
        ],
    },
    {
        label: 'Clinical',
        items: [
            { path: '/diagnosis', label: 'Analysis', icon: <Stethoscope size={19} strokeWidth={1.7} /> },
            { path: '/medai', label: 'MedGemma AI', icon: <Sparkles size={19} strokeWidth={1.7} /> },
            { path: '/history', label: 'History', icon: <History size={19} strokeWidth={1.7} /> },
        ],
    },
    {
        label: 'Settings & Tools',
        items: [
            { path: '/settings', label: 'Settings', icon: <Settings size={19} strokeWidth={1.7} /> },
            { path: '/guide', label: 'Guide', icon: <BookOpen size={19} strokeWidth={1.7} /> },
        ],
    },
];

const adminSection: { label: string; items: NavItem[] } = {
    label: 'Admin',
    items: [
        { path: '/admin/users', label: 'User Management', icon: <Shield size={19} strokeWidth={1.7} /> },
    ],
};

interface SidebarProps {
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Health Check State
    const [healthStatus, setHealthStatus] = useState<'healthy' | 'degraded' | 'offline'>('offline');

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    // Poll Health Check
    useEffect(() => {
        const checkHealth = async () => {
            const result = await api.checkHealth();
            if (result.status === 'healthy') setHealthStatus('healthy');
            else if (result.status === 'degraded') setHealthStatus('degraded');
            else setHealthStatus('offline');
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const currentWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

    const getStatusColor = () => {
        switch (healthStatus) {
            case 'healthy': return 'bg-emerald-500';
            case 'degraded': return 'bg-amber-500';
            default: return 'bg-red-500';
        }
    };

    const getStatusLabel = () => {
        switch (healthStatus) {
            case 'healthy': return 'Online';
            case 'degraded': return 'Degraded';
            default: return 'Offline';
        }
    };

    const userInitial = (user?.displayName || user?.username)?.charAt(0).toUpperCase() || 'U';

    // Render a single nav item
    const renderNavItem = (item: NavItem, isAdmin = false) => {
        const isActive = location.pathname === item.path;
        const activeAccent = isAdmin ? 'bg-red-500' : 'bg-black';
        const activeText = isAdmin ? 'text-red-600' : 'text-black';
        const activeBg = isAdmin ? 'bg-red-500/[0.06]' : 'bg-black/[0.04]';
        const hoverBg = isAdmin ? 'group-hover:bg-red-500/[0.04]' : 'group-hover:bg-black/[0.03]';

        return (
            <Link
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`
                    relative flex items-center gap-3 rounded-xl transition-all duration-200 group outline-none
                    ${isCollapsed ? 'justify-center mx-auto w-11 h-11' : 'px-3 py-2.5'}
                `}
            >
                {/* Active background */}
                {isActive && (
                    <motion.div
                        layoutId="sidebarActiveIndicator"
                        className={`absolute inset-0 ${activeBg} rounded-xl`}
                        initial={false}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                )}

                {/* Hover background (non-active) */}
                {!isActive && (
                    <div className={`absolute inset-0 bg-transparent ${hoverBg} rounded-xl transition-colors duration-200`} />
                )}

                {/* Left accent bar */}
                {isActive && !isCollapsed && (
                    <motion.div
                        layoutId="sidebarAccentBar"
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 ${activeAccent} rounded-r-full`}
                        initial={false}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                )}

                {/* Icon */}
                <span className={`
                    relative z-10 transition-all duration-200 shrink-0
                    ${isActive ? `${activeText} scale-[1.05]` : `text-zinc-400 group-hover:text-zinc-700`}
                `}>
                    {isActive
                        ? React.cloneElement(item.icon as React.ReactElement, { strokeWidth: 2.2 } as React.SVGAttributes<SVGElement>)
                        : item.icon}
                </span>

                {/* Label */}
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.15 }}
                            className={`
                                relative z-10 text-[13.5px] transition-colors duration-200 whitespace-nowrap
                                ${isActive ? `${activeText} font-semibold` : 'text-zinc-500 font-medium group-hover:text-zinc-800'}
                            `}
                        >
                            {item.label}
                        </motion.span>
                    )}
                </AnimatePresence>

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                    <div className={`
                        absolute left-full ml-3 px-3 py-1.5 text-[12px] font-medium rounded-lg
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all duration-200 translate-x-[-6px] group-hover:translate-x-0
                        z-[60] whitespace-nowrap pointer-events-none shadow-lg
                        ${isAdmin ? 'bg-red-600 text-white' : 'bg-zinc-900 text-white'}
                    `}>
                        {item.label}
                        <div className={`absolute left-0 top-1/2 -translate-x-[3px] -translate-y-1/2 w-1.5 h-1.5 transform rotate-45 ${isAdmin ? 'bg-red-600' : 'bg-zinc-900'}`} />
                    </div>
                )}
            </Link>
        );
    };

    // Render a section with label + items
    const renderSection = (section: { label: string; items: NavItem[] }, isAdmin = false) => (
        <div key={section.label} className="mb-1">
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`px-3 pt-4 pb-1.5 first:pt-0`}
                    >
                        <span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${isAdmin ? 'text-red-400' : 'text-zinc-400'}`}>
                            {section.label}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
            {isCollapsed && <div className="pt-3 first:pt-0" />}
            <div className={`space-y-0.5 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                {section.items.map((item) => renderNavItem(item, isAdmin))}
            </div>
        </div>
    );

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
                transition={{ type: "spring", stiffness: 250, damping: 28 }}
                className={`
                    fixed top-0 left-0 z-50 h-full
                    bg-white border-r border-zinc-100
                    md:translate-x-0
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    flex flex-col select-none
                `}
                style={{ width: currentWidth }}
            >
                {/* ===== HEADER ===== */}
                <div className={`h-16 flex items-center shrink-0 border-b border-zinc-100/80 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shadow-sm relative transition-transform duration-200 group-hover:scale-[1.04] group-active:scale-95 shrink-0">
                            <Brain className="w-[18px] h-[18px]" />
                        </div>

                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="font-bold text-[15px] tracking-tight text-zinc-900 whitespace-nowrap"
                                >
                                    AI & Things
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>

                    {/* Collapse Toggle (Desktop) */}
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                onClick={toggleCollapse}
                                className="hidden md:flex w-7 h-7 rounded-lg items-center justify-center text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 transition-all duration-200"
                                title="Collapse sidebar"
                            >
                                <ChevronLeft size={16} strokeWidth={2} />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Expand button when collapsed */}
                    {isCollapsed && (
                        <div className="absolute -right-3 top-4 hidden md:block z-[60]">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleCollapse}
                                className="w-6 h-6 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 hover:shadow-md transition-all duration-200"
                                title="Expand sidebar"
                            >
                                <Menu size={12} strokeWidth={2.5} />
                            </motion.button>
                        </div>
                    )}

                    {/* Mobile Close */}
                    {!isCollapsed && (
                        <button
                            onClick={onMobileClose}
                            className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* ===== NAVIGATION ===== */}
                <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-3 pb-6 ${isCollapsed ? 'px-2.5' : 'px-3'} scrollbar-thin scrollbar-thumb-zinc-100`}>
                    {navSections.map((section) => renderSection(section))}

                    {/* Admin section (role-gated) */}
                    {user?.role === 'admin' && (
                        <>
                            <div className={`my-2 ${isCollapsed ? 'mx-2' : 'mx-3'}`}>
                                <div className="h-px bg-zinc-100" />
                            </div>
                            {renderSection(adminSection, true)}
                        </>
                    )}
                </nav>

                {/* ===== FOOTER ===== */}
                <div className={`shrink-0 border-t border-zinc-100/80 ${isCollapsed ? 'p-2.5' : 'p-3'}`}>
                    {/* System Status */}
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-zinc-50/80"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-60`} />
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${getStatusColor()}`} />
                                </span>
                                <span className="text-[11px] font-medium text-zinc-500">
                                    System: {getStatusLabel()}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* User Profile */}
                    <div className={`
                        relative flex items-center gap-2.5 rounded-xl transition-all duration-200 group cursor-pointer
                        ${isCollapsed
                            ? 'justify-center p-1.5 hover:bg-zinc-100'
                            : 'p-2 hover:bg-zinc-50'
                        }
                    `}>
                        {/* Avatar */}
                        <div className={`
                            relative rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold shrink-0 overflow-hidden transition-transform duration-200 group-hover:scale-[1.03]
                            ${isCollapsed ? 'w-10 h-10 text-sm' : 'w-9 h-9 text-xs'}
                        `}>
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.displayName || user.username}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <span>{userInitial}</span>
                            )}
                            {/* Status Dot */}
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor()} border-2 border-white rounded-full`} />
                        </div>

                        {/* User Info */}
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex-1 min-w-0 overflow-hidden"
                                >
                                    <p className="text-[13px] font-semibold text-zinc-900 truncate leading-tight">
                                        {user?.displayName || user?.username || 'User'}
                                    </p>
                                    <p className="text-[11px] text-zinc-400 truncate leading-tight mt-0.5">
                                        {user?.email || user?.role || 'Administrator'}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Sign Out Button */}
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={handleLogout}
                                    className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 shrink-0"
                                    title="Sign out"
                                >
                                    <LogOut size={15} strokeWidth={2} />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Collapsed Tooltip / Popover */}
                        {isCollapsed && (
                            <div className="absolute left-full bottom-0 ml-2 w-52 p-3 bg-white rounded-xl shadow-xl border border-zinc-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-x-[-6px] group-hover:translate-x-0 z-[60]">
                                <div className="flex items-center gap-2.5 mb-2.5 pb-2.5 border-b border-zinc-100">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-800 overflow-hidden shrink-0">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <span>{userInitial}</span>
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[12px] font-bold text-zinc-900 truncate">{user?.displayName || user?.username || 'User'}</p>
                                        <p className="text-[11px] text-zinc-400 truncate">{user?.email || user?.role}</p>
                                    </div>
                                </div>
                                {/* Status in popover */}
                                <div className="flex items-center gap-2 px-1 py-1.5 mb-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor()}`} />
                                    <span className="text-[11px] text-zinc-500">System: {getStatusLabel()}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-2 py-2 text-[12px] font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut size={13} />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;