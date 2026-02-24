import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, UserPlus, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/api';

interface UserSummary {
    total: number;
    byRole: { role: string; count: number; color: string }[];
    recentUsers: { id: string; username: string; role: string; createdAt: string }[];
}

const ROLE_COLORS: Record<string, string> = {
    patient: 'bg-blue-50 text-blue-700',
    doctor: 'bg-green-50 text-green-700',
    specialist: 'bg-purple-50 text-purple-700',
    gp: 'bg-teal-50 text-teal-700',
    auditor: 'bg-orange-50 text-orange-700',
    admin: 'bg-red-50 text-red-700',
};

export const AdminUsersWidget: React.FC = () => {
    const navigate = useNavigate();

    const { data: userSummary, isLoading } = useQuery<UserSummary>({
        queryKey: ['admin-users-summary'],
        queryFn: async () => {
            // Fetch stats and recent users from backend API
            const [stats, usersResult] = await Promise.all([
                adminApi.getUserStats(),
                adminApi.getUsers({ page: 1, page_size: 3 }),
            ]);

            // Build role breakdown
            const byRole = Object.entries(stats.by_role)
                .filter(([, count]) => count > 0)
                .map(([role, count]) => ({
                    role,
                    count,
                    color: ROLE_COLORS[role] || 'bg-gray-50 text-gray-700',
                }));

            // Recent users
            const recentUsers = usersResult.users.slice(0, 3).map(u => ({
                id: u.id,
                username: u.username || 'Unknown',
                role: u.role,
                createdAt: u.created_at,
            }));

            return {
                total: stats.total_users,
                byRole,
                recentUsers,
            };
        },
        staleTime: 30000,
    });

    if (isLoading) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Users Overview</h3>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    if (!userSummary) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Users Overview</h3>
                </div>
                <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                    Unable to load user data
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-red-50">
                        <Shield size={14} className="text-red-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Users Overview</h3>
                </div>
                <button 
                    onClick={() => navigate('/admin/users')}
                    className="text-xs font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                >
                    Manage <ChevronRight size={12} />
                </button>
            </div>

            <div className="p-5">
                {/* Total Users */}
                <div className="flex items-center gap-4 mb-5">
                    <div className="p-3 rounded-xl bg-gray-900">
                        <Users size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{userSummary.total}</p>
                        <p className="text-xs text-gray-500 font-medium">Total Users</p>
                    </div>
                </div>

                {/* Role Breakdown */}
                <div className="flex flex-wrap gap-2 mb-5">
                    {userSummary.byRole.map((item) => (
                        <span 
                            key={item.role}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.color}`}
                        >
                            {item.role}
                            <span className="font-bold">{item.count}</span>
                        </span>
                    ))}
                </div>

                {/* Recent Users */}
                <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Recent Registrations</p>
                    <div className="space-y-2">
                        {userSummary.recentUsers.map((user, idx) => (
                            <motion.div 
                                key={user.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-xs text-white font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user.role] || 'bg-gray-50 text-gray-700'}`}>
                                    {user.role}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Quick Action */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/admin/users')}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    <UserPlus size={14} />
                    Manage Users
                </motion.button>
            </div>
        </motion.div>
    );
};

export default AdminUsersWidget;
