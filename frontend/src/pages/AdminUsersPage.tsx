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
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

interface User extends Profile {
    email?: string;
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
            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
            }
            if (roleFilter) {
                query = query.eq('role', roleFilter);
            }
            if (activeFilter) {
                query = query.eq('is_active', activeFilter === 'true');
            }

            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            setUsers(data as User[]);
            setTotalPages(Math.ceil((count || 1) / PAGE_SIZE));
        } catch (err) {
            console.error('Error fetching users:', err);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [page, searchTerm, roleFilter, activeFilter]);

    const fetchStats = useCallback(async () => {
        try {
            const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            
            setStats({
                total_users: total || 0,
                active_users: 0, 
                verified_users: 0,
                by_role: {}
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [fetchUsers, fetchStats]);

    const handleActivate = async (user: User) => {
        setActionInProgress(user.id);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: true })
                .eq('id', user.id);

            if (error) throw error;
            toast.success(`${user.username} activated`);
            fetchUsers();
        } catch (err) {
            console.error('Activate error:', err);
            toast.error('Failed to activate user');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleDeactivate = async (user: User) => {
        setActionInProgress(user.id);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: false })
                .eq('id', user.id);

            if (error) throw error;
            toast.success(`${user.username} deactivated`);
            fetchUsers();
        } catch (err) {
            console.error('Deactivate error:', err);
            toast.error('Failed to deactivate user');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        toast.info("Deactivating user (Soft Delete)");
        handleDeactivate(selectedUser);
        setShowDeleteModal(false);
    };

    const handleRoleChange = async (newRole: string) => {
        if (!selectedUser) return;
        setActionInProgress(selectedUser.id);
        try {
            // @ts-ignore
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole as any })
                .eq('id', selectedUser.id);

            if (error) throw error;
            toast.success(`${selectedUser.username} role updated to ${newRole}`);
            setShowRoleModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            console.error('Role update error:', err);
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
        <div className="min-h-screen bg-[#fafafa]">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                className="w-8 h-8 p-0 rounded-lg flex items-center justify-center"
                                onClick={() => navigate('/dashboard')}
                            >
                                <ArrowLeft size={16} className="text-gray-600" />
                            </Button>
                        </motion.div>
                        <div className="h-6 w-px bg-gray-200" />
                        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
                    </div>
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => { fetchUsers(); fetchStats(); }}
                        className="gap-2"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                        >
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_users}</p>
                        </motion.div>
                         <div className="hidden md:block col-span-3 bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-center text-gray-400 text-sm">
                            Detailed statistics require backend aggregation
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by username or name..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                                    className="h-10 pl-9 pr-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm appearance-none cursor-pointer"
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
                                className="h-10 px-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Users size={48} className="mb-4 opacity-20" />
                            <p>No users found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <motion.tr 
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold">
                                                        {user.username?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{user.full_name || user.username}</p>
                                                        {user.email && <p className="text-xs text-gray-500">{user.email}</p>}
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
                                                    <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    <span className={`text-sm ${user.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {actionInProgress === user.id ? (
                                                        <Loader2 size={16} className="animate-spin text-gray-400" />
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
                                                                title="Delete (Restrict to Soft)"
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
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight size={16} />
                                </Button>
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
                            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-full bg-red-100">
                                    <AlertTriangle size={20} className="text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">
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
                            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <Shield size={20} className="text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Change Role</h3>
                                </div>
                                <button onClick={() => setShowRoleModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X size={16} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Select a new role for <strong>{selectedUser.username}</strong>:
                            </p>
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {ROLES.map(role => (
                                    <button
                                        key={role.value}
                                        onClick={() => handleRoleChange(role.value)}
                                        disabled={actionInProgress === selectedUser.id}
                                        className={`p-3 rounded-lg border text-left transition-all ${
                                            selectedUser.role === role.value
                                                ? 'border-black bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
