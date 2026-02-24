import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Filter,
    UserCheck,
    UserX,
    Trash2,
    Shield,
    ArrowLeft,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    X,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { Button } from '../components/ui/Button';
import { staggerContainer, fadeSlideUp } from '../lib/animations';
import { toast } from '../components/ui/Toast';
import { adminApi } from '../services/api';

interface User {
    id: string;
    username: string;
    email?: string;
    full_name?: string;
    role: string;
    is_active: boolean;
    is_verified?: boolean;
    created_at: string;
    last_login?: string;
    phone?: string;
    avatar_url?: string;
    oauth_provider?: string;
}

interface UserStats {
    total_users: number;
    active_users: number;
    verified_users: number;
    by_role: Record<string, number>;
}

const ROLES = [
    { value: 'patient', label: 'Patient', color: 'bg-blue-100 text-blue-700' },
    { value: 'doctor', label: 'Doctor', color: 'bg-green-100 text-green-700' },
    { value: 'specialist', label: 'Specialist', color: 'bg-purple-100 text-purple-700' },
    { value: 'gp', label: 'GP', color: 'bg-teal-100 text-teal-700' },
    { value: 'auditor', label: 'Auditor', color: 'bg-orange-100 text-orange-700' },
    { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-700' },
];

export const AdminUsersPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = useAppSelector((state) => state.auth.user);
    
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);
    const PAGE_SIZE = 10;

    // Check admin access
    useEffect(() => {
        if (currentUser?.role !== 'admin') {
            toast.error('Admin access required');
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: {
                page: number;
                page_size: number;
                search?: string;
                role?: string;
                is_active?: boolean;
            } = { page, page_size: PAGE_SIZE };

            if (searchTerm) params.search = searchTerm;
            if (roleFilter) params.role = roleFilter;
            if (activeFilter) params.is_active = activeFilter === 'true';

            const result = await adminApi.getUsers(params);
            setUsers(result.users);
            setTotalPages(Math.ceil(result.total / PAGE_SIZE));
        } catch {
            toast.error('Failed to load users');
            setUsers([]);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [page, searchTerm, roleFilter, activeFilter]);

    const fetchStats = useCallback(async () => {
        try {
            const result = await adminApi.getUserStats();
            setStats(result);
        } catch {
            setStats(null);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [fetchUsers, fetchStats]);

    const handleActivate = async (user: User) => {
        setActionInProgress(user.id);
        try {
            await adminApi.activateUser(user.id);
            toast.success(`${user.username} activated`);
            fetchUsers();
        } catch {
            toast.error('Failed to activate user');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleDeactivate = async (user: User) => {
        setActionInProgress(user.id);
        try {
            await adminApi.deactivateUser(user.id);
            toast.success(`${user.username} deactivated`);
            fetchUsers();
        } catch {
            toast.error('Failed to deactivate user');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        // Soft delete - deactivate user
        handleDeactivate(selectedUser);
        setShowDeleteModal(false);
    };

    const handleRoleChange = async (newRole: string) => {
        if (!selectedUser) return;
        setActionInProgress(selectedUser.id);
        try {
            await adminApi.updateUser(selectedUser.id, { role: newRole });
            toast.success(`${selectedUser.username} role updated to ${newRole}`);
            setShowRoleModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch {
            toast.error('Failed to update role');
        } finally {
            setActionInProgress(null);
        }
    };

    const getRoleColor = (role: string) => {
        return ROLES.find(r => r.value === role)?.color || 'bg-gray-100 text-gray-700';
    };

    if (currentUser?.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-zinc-50/50">
            {/* Header */}
            <header className="border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="w-8 h-8 p-0 rounded-xl flex items-center justify-center border-zinc-200"
                            onClick={() => navigate('/dashboard')}
                        >
                            <ArrowLeft size={16} className="text-zinc-600" />
                        </Button>
                        <div className="h-6 w-px bg-zinc-200 mx-1" />
                        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shadow-md shadow-black/20">
                            <Users className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">User Management</h1>
                    </div>
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => { fetchUsers(); fetchStats(); }}
                        className="bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-sm gap-2"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                {stats && (
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        <motion.div 
                            variants={fadeSlideUp}
                            className="bg-white border border-zinc-200/60 rounded-2xl p-5 hover:border-zinc-300 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
                        >
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-black opacity-[0.06] group-hover:opacity-[0.1] transition-opacity" />
                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <div className="p-2.5 rounded-xl bg-black text-white shadow-sm">
                                    <Users size={18} />
                                </div>
                                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Total Users</span>
                            </div>
                            <div className="text-3xl font-bold text-zinc-900 tracking-tight relative z-10">{stats.total_users}</div>
                        </motion.div>
                        <motion.div 
                            variants={fadeSlideUp}
                            className="bg-white border border-zinc-200/60 rounded-2xl p-5 hover:border-zinc-300 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
                        >
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-emerald-500 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity" />
                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-sm">
                                    <UserCheck size={18} />
                                </div>
                                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Active Users</span>
                            </div>
                            <div className="text-3xl font-bold text-zinc-900 tracking-tight relative z-10">{stats.active_users}</div>
                        </motion.div>
                        <motion.div 
                            variants={fadeSlideUp}
                            className="bg-white border border-zinc-200/60 rounded-2xl p-5 hover:border-zinc-300 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
                        >
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-blue-500 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity" />
                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <div className="p-2.5 rounded-xl bg-blue-500 text-white shadow-sm">
                                    <CheckCircle2 size={18} />
                                </div>
                                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Verified</span>
                            </div>
                            <div className="text-3xl font-bold text-zinc-900 tracking-tight relative z-10">{stats.verified_users}</div>
                        </motion.div>
                        <motion.div 
                            variants={fadeSlideUp}
                            className="bg-white border border-zinc-200/60 rounded-2xl p-5 hover:border-zinc-300 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
                        >
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-purple-500 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity" />
                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <div className="p-2.5 rounded-xl bg-purple-500 text-white shadow-sm">
                                    <Shield size={18} />
                                </div>
                                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Roles</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1 relative z-10">
                                {Object.entries(stats.by_role).map(([role, count]) => (
                                    <span key={role} className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${getRoleColor(role)}`}>
                                        {role} {count}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-zinc-200/60 p-4 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search by username or name..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                className="w-full h-10 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 transition-all text-sm"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                                    className="h-10 pl-9 pr-8 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">All Roles</option>
                                    {ROLES.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>
                            <select
                                value={activeFilter}
                                onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
                                className="h-10 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                            <Users size={48} className="mb-4 opacity-20" />
                            <p>No users found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50/80 border-b border-zinc-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-500 text-xs uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {users.map((user) => (
                                        <motion.tr 
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group hover:bg-zinc-50/80 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-semibold">
                                                        {user.username?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-900">{user.full_name || user.username}</p>
                                                        {user.email && <p className="text-xs text-zinc-500">{user.email}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setShowRoleModal(true); }}
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)} hover:opacity-80 transition-opacity cursor-pointer`}
                                                >
                                                    {user.role}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-zinc-300'}`} />
                                                    <span className={`text-sm ${user.is_active ? 'text-green-700' : 'text-zinc-500'}`}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {actionInProgress === user.id ? (
                                                        <Loader2 size={16} className="animate-spin text-zinc-400" />
                                                    ) : (
                                                        <>
                                                            {user.is_active ? (
                                                                <button
                                                                    onClick={() => handleDeactivate(user)}
                                                                    className="p-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
                                                                    title="Deactivate"
                                                                >
                                                                    <UserX size={16} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleActivate(user)}
                                                                    className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                                                    title="Activate"
                                                                >
                                                                    <UserCheck size={16} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                                                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/40">
                            <p className="text-xs text-zinc-500">
                                Page <span className="font-semibold text-zinc-700">{page}</span> of <span className="font-semibold text-zinc-700">{totalPages}</span>
                            </p>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-600 transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-600 transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Delete/Deactivate Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-full bg-red-100">
                                    <AlertTriangle size={20} className="text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900">Delete User</h3>
                            </div>
                            <p className="text-sm text-zinc-600 mb-6">
                                <strong>Warning:</strong> Hard deleting users can impact data integrity. 
                                <br/><br/>
                                Would you like to <strong>deactivate</strong> {selectedUser.username} instead? 
                                This will prevent them from logging in but preserve their data.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                    Cancel
                                </Button>
                                <Button 
                                    variant="primary" 
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Deactivate User
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Role Change Modal */}
            <AnimatePresence>
                {showRoleModal && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <Shield size={20} className="text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-900">Change Role</h3>
                                </div>
                                <button onClick={() => setShowRoleModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <p className="text-sm text-zinc-600 mb-4">
                                Select a new role for <strong>{selectedUser.username}</strong>:
                            </p>
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {ROLES.map(role => (
                                    <button
                                        key={role.value}
                                        onClick={() => handleRoleChange(role.value)}
                                        disabled={actionInProgress === selectedUser.id}
                                        className={`p-3 rounded-xl border text-left transition-all ${
                                            selectedUser.role === role.value
                                                ? 'border-black bg-zinc-50'
                                                : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                                        }`}
                                    >
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${role.color}`}>
                                            {role.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsersPage;
