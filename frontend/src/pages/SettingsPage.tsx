import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Bell,
    Shield,
    Palette,
    Edit3,
    Camera,
    Keyboard,
    Settings,

    Check,
    AlertTriangle,
    Loader2,
    Sun,
    Moon,
    Monitor,
    Download,
    Trash2,
    Database,
    Phone,
    LogOut,
    Monitor as Devices,
    Calendar,
    BadgeCheck,
    Crown,
    Info,
    Eye,
    EyeOff,
    ChevronRight,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
    setAccentColor,
    setCompactView,
    setEmailNotifications,
    setPushNotifications,
    setWeeklyReport,
    setCriticalAlerts,
    setDiagnosisComplete,
    setDisplayName,
    setEmail,
    setPhone,
    setTheme,
    setAvatar,
    setAnalyticsEnabled,
    resetSettings,
} from '../store/settingsSlice';
import { toast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { useTour } from '../components/ui/TourProvider';
import { resetTour, DASHBOARD_TOUR_STEPS } from '../components/ui/tourConfig';
import { storage } from '../lib/supabase';
import { authApi as api } from '../services/api';
import { tokenManager } from '../services/api';

// ================== Animation Variants ==================
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

// ================== Settings Section Component ==================
interface SettingsSectionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    id?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, icon, children, footer, id }) => (
    <motion.div
        id={id}
        variants={itemVariants}
        className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm overflow-hidden mb-6 hover:shadow-md transition-shadow duration-300"
    >
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700">
                    {icon}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
                    <p className="text-xs text-zinc-500">{description}</p>
                </div>
            </div>
            {children}
        </div>
        {footer && (
            <div className="bg-zinc-50/50 border-t border-zinc-100 px-6 py-3 flex items-center justify-end">
                {footer}
            </div>
        )}
    </motion.div>
);

// ================== Toggle Setting Item ==================
interface ToggleSettingProps {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({ title, description, checked, onChange }) => (
    <motion.div
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
            checked
                ? 'bg-blue-50/80 border-blue-200'
                : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
        }`}
        onClick={() => onChange(!checked)}
    >
        <div>
            <p className={`text-sm font-medium ${checked ? 'text-blue-700' : 'text-zinc-900'}`}>{title}</p>
            <p className={`text-xs ${checked ? 'text-blue-600/80' : 'text-zinc-500'}`}>{description}</p>
        </div>
        <motion.div
            className={`w-11 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-blue-600' : 'bg-zinc-300'}`}
            animate={{ backgroundColor: checked ? '#2563eb' : '#d1d5db' }}
        >
            <motion.div
                className="w-4 h-4 rounded-full bg-white shadow-sm"
                animate={{ x: checked ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        </motion.div>
    </motion.div>
);

// ================== Confirmation Dialog Component ==================
interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
    isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen, title, message, confirmText, onConfirm, onCancel, isDanger, isLoading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${isDanger ? 'bg-red-100' : 'bg-amber-100'}`}>
                        <AlertTriangle size={20} className={isDanger ? 'text-red-600' : 'text-amber-600'} />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
                </div>
                <p className="text-sm text-zinc-600 mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-zinc-800'}
                    >
                        {isLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                        {confirmText}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

// ================== Password Strength Indicator ==================
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-amber-500' };
    if (score <= 5) return { score, label: 'Strong', color: 'bg-emerald-500' };
    return { score, label: 'Very Strong', color: 'bg-green-600' };
};

// ================== Info Row Component ==================
const InfoRow: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
        <div className="flex items-center gap-2 text-zinc-500">
            {icon}
            <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-sm font-medium text-zinc-900">{value}</span>
    </div>
);

// ================== Main Component ==================
export const SettingsPage: React.FC = () => {
    const user = useAppSelector((state) => state.auth.user);
    const settings = useAppSelector((state) => state.settings);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('account-info');

    // Scrollspy: track which section is in view
    React.useEffect(() => {
        const sectionIds = ['account-info', 'profile', 'notifications', 'appearance', 'onboarding', 'shortcuts', 'security', 'sessions', 'privacy'];
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                }
            },
            { rootMargin: '-120px 0px -60% 0px', threshold: 0.1 }
        );
        sectionIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);
    const { startTour } = useTour();

    // File input ref for avatar upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local state for profile editing
    const [localDisplayName, setLocalDisplayName] = useState(settings.displayName || user?.displayName || user?.username || '');
    const [localEmail, setLocalEmail] = useState(settings.email || user?.email || '');
    const [localPhone, setLocalPhone] = useState(settings.phone || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Account info from backend
    const [accountInfo, setAccountInfo] = useState<{
        username?: string;
        email?: string;
        role?: string;
        full_name?: string;
        phone?: string;
        avatar_url?: string;
        is_verified?: boolean;
        is_active?: boolean;
        oauth_provider?: string;
        created_at?: string;
        last_login?: string;
    } | null>(null);
    const [isLoadingAccount, setIsLoadingAccount] = useState(true);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Dialog state
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);
    const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Selected accent color (local for visual feedback)
    const [selectedAccent, setSelectedAccent] = useState(settings.accentColor);

    // Password strength
    const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

    // ================== Load Account Info from Backend ==================
    useEffect(() => {
        const loadAccountInfo = async () => {
            setIsLoadingAccount(true);
            try {
                const data = await api.getCurrentUser();
                setAccountInfo(data as typeof accountInfo);
                // Merge backend data into local form fields
                if (data.full_name && !settings.displayName) setLocalDisplayName(data.full_name);
                if ((data as Record<string, unknown>)?.phone && !settings.phone) setLocalPhone((data as Record<string, unknown>).phone as string);
            } catch {
                // Silently fail — user can still edit locally
            } finally {
                setIsLoadingAccount(false);
            }
        };
        loadAccountInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (user) {
            setLocalDisplayName(settings.displayName || user.displayName || user.username || '');
            setLocalEmail(settings.email || user.email || '');
        }
    }, [user, settings.displayName, settings.email]);

    // ================== Handlers ==================
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB');
            return;
        }

        setIsUploadingAvatar(true);
        try {
            const userId = user?.username;
            if (!userId) {
                toast.error('You must be logged in to upload an avatar');
                return;
            }

            const { path, error: uploadError } = await storage.uploadImage(file, userId);
            if (uploadError) throw new Error(uploadError.message);

            if (path) {
                const { signedUrl, error: urlError } = await storage.getSignedUrl(path, 3600 * 24 * 365);
                if (urlError) throw new Error(urlError.message);

                if (signedUrl) {
                    await api.updateUserProfile({ avatar_url: signedUrl });
                    dispatch(setAvatar(signedUrl));
                    toast.success('Avatar updated!');
                }
            }
        } catch {
            toast.error('Failed to upload avatar');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        setIsSavingProfile(true);
        try {
            if (!user) {
                toast.error('User not authenticated');
                return;
            }

            await api.updateUserProfile({
                full_name: localDisplayName,
                phone: localPhone || undefined,
            });

            dispatch(setDisplayName(localDisplayName));
            dispatch(setEmail(localEmail));
            dispatch(setPhone(localPhone));

            toast.success('Profile saved!');
        } catch {
            toast.error('Failed to save profile');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!currentPassword) {
            toast.error('Current password is required');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await api.changePassword(currentPassword, newPassword, confirmPassword);
            toast.success('Password updated!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update password');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleAccentColorChange = (color: string) => {
        setSelectedAccent(color);
        dispatch(setAccentColor(color));
        toast.success('Accent color updated!');
    };

    const handleLogout = async () => {
        try {
            await api.logout();
            tokenManager.clearTokens();
            navigate('/login');
        } catch {
            tokenManager.clearTokens();
            navigate('/login');
        }
    };

    const handleLogoutAll = async () => {
        setIsLoggingOutAll(true);
        try {
            await api.logoutAll();
            toast.success('Logged out from all devices');
            navigate('/login');
        } catch {
            tokenManager.clearTokens();
            navigate('/login');
        } finally {
            setIsLoggingOutAll(false);
        }
    };

    const handleDeactivateAccount = async () => {
        try {
            await api.logout();
            tokenManager.clearTokens();
            navigate('/login');
            toast.info('You have been logged out. Contact an admin to deactivate your account.');
        } catch {
            toast.error('Failed to log out');
        } finally {
            setShowDeactivateDialog(false);
        }
    };

    const handleResetSettings = () => {
        dispatch(resetSettings());
        setShowResetDialog(false);
        toast.success('Settings reset to defaults!');
    };

    const getRoleLabel = (role?: string) => {
        switch (role) {
            case 'gp': return 'General Practitioner';
            case 'specialist': return 'Specialist';
            case 'auditor': return 'Auditor';
            case 'admin': return 'Administrator';
            case 'doctor': return 'Doctor';
            case 'patient': return 'Patient';
            default: return 'User';
        }
    };

    const accentColors = [
        { color: '#000000', name: 'Default' },
        { color: '#2563eb', name: 'Blue' },
        { color: '#059669', name: 'Green' },
        { color: '#7c3aed', name: 'Purple' },
        { color: '#d97706', name: 'Amber' },
    ];

    return (
        <div className="min-h-screen bg-zinc-50/50">
            {/* Confirmation Dialogs */}
            <ConfirmDialog
                isOpen={showDeactivateDialog}
                title="Deactivate Account"
                message="Are you sure you want to deactivate your account? This action cannot be undone and you will lose access to all your data."
                confirmText="Deactivate"
                onConfirm={handleDeactivateAccount}
                onCancel={() => setShowDeactivateDialog(false)}
                isDanger
            />
            <ConfirmDialog
                isOpen={showResetDialog}
                title="Reset All Settings"
                message="This will reset all your preferences (appearance, notifications, privacy) to their default values. Your profile data will not be affected."
                confirmText="Reset Settings"
                onConfirm={handleResetSettings}
                onCancel={() => setShowResetDialog(false)}
                isDanger
            />
            <ConfirmDialog
                isOpen={showLogoutAllDialog}
                title="Log Out All Devices"
                message="This will invalidate all your active sessions across every device. You will need to log in again on each device."
                confirmText="Log Out All"
                onConfirm={handleLogoutAll}
                onCancel={() => setShowLogoutAllDialog(false)}
                isLoading={isLoggingOutAll}
            />

            {/* Unified Header */}
            <PageHeader
                title="Settings"
                icon={<Settings size={18} />}
                actions={
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        disabled={isSavingProfile}
                        className="bg-black text-white hover:bg-gray-800 shadow-md rounded-lg"
                    >
                        {isSavingProfile ? (
                            <>
                                <Loader2 size={14} className="animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                }
            />

            {/* Section Quick Nav */}
            <div className="sticky top-[57px] z-30 bg-white/90 backdrop-blur-md border-b border-zinc-100">
                <div className="max-w-4xl mx-auto px-6 py-2 flex gap-1 overflow-x-auto scrollbar-none">
                    {[
                        { id: 'account-info', label: 'Account' },
                        { id: 'profile', label: 'Profile' },
                        { id: 'notifications', label: 'Notifications' },
                        { id: 'appearance', label: 'Appearance' },
                        { id: 'security', label: 'Security' },
                        { id: 'sessions', label: 'Sessions' },
                        { id: 'privacy', label: 'Privacy' },
                    ].map(section => (
                        <button
                            key={section.id}
                            onClick={() => {
                                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                activeSection === section.id
                                    ? 'bg-black text-white shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                            }`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>

            <motion.main
                className="max-w-4xl mx-auto px-6 py-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* ==================== Account Information ==================== */}
                <SettingsSection
                    id="account-info"
                    title="Account Information"
                    description="Your account details — read only"
                    icon={<Info size={16} />}
                >
                    {isLoadingAccount ? (
                        <div className="space-y-4 animate-pulse">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex justify-between py-3 border-b border-zinc-100">
                                    <div className="h-3 w-24 bg-zinc-200 rounded" />
                                    <div className="h-3 w-32 bg-zinc-100 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <InfoRow
                                label="Username"
                                value={accountInfo?.username || user?.username || '—'}
                                icon={<User size={12} />}
                            />
                            <InfoRow
                                label="Email"
                                value={accountInfo?.email || user?.email || '—'}
                                icon={<User size={12} />}
                            />
                            <InfoRow
                                label="Role"
                                value={getRoleLabel(accountInfo?.role || user?.role)}
                                icon={<Crown size={12} />}
                            />
                            <InfoRow
                                label="Verified"
                                value={accountInfo?.is_verified ? '✓ Verified' : '✗ Not Verified'}
                                icon={<BadgeCheck size={12} />}
                            />
                            <InfoRow
                                label="Member Since"
                                value={accountInfo?.created_at ? new Date(accountInfo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                                icon={<Calendar size={12} />}
                            />
                            {accountInfo?.last_login && (
                                <InfoRow
                                    label="Last Login"
                                    value={new Date(accountInfo.last_login).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    icon={<Calendar size={12} />}
                                />
                            )}
                            {accountInfo?.oauth_provider && (
                                <InfoRow
                                    label="Auth Provider"
                                    value={accountInfo.oauth_provider.charAt(0).toUpperCase() + accountInfo.oauth_provider.slice(1)}
                                    icon={<Shield size={12} />}
                                />
                            )}
                            {user?.role === 'admin' && (
                                <div className="mt-4 pt-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => navigate('/admin/users')}
                                        className="gap-2 text-zinc-600"
                                    >
                                        <Crown size={14} />
                                        Open Admin Panel
                                        <ChevronRight size={14} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </SettingsSection>

                {/* ==================== Profile Section ==================== */}
                <SettingsSection
                    id="profile"
                    title="Profile"
                    description="Manage your display information"
                    icon={<User size={16} />}
                >
                    <div className="flex items-center gap-6 mb-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative group cursor-pointer"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                            />

                            {settings.avatar ? (
                                <img
                                    src={settings.avatar}
                                    alt="Avatar"
                                    className="w-20 h-20 rounded-full object-cover shadow-md ring-4 ring-white"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-2xl font-semibold shadow-md ring-4 ring-white">
                                    {(user?.username || localDisplayName || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div
                                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera size={20} className="text-white" />
                            </div>
                            <motion.button
                                whileHover={{ scale: isUploadingAvatar ? 1 : 1.2 }}
                                whileTap={{ scale: isUploadingAvatar ? 1 : 0.9 }}
                                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-50"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingAvatar}
                            >
                                {isUploadingAvatar ? (
                                    <Loader2 size={12} className="text-zinc-600 animate-spin" />
                                ) : (
                                    <Edit3 size={12} className="text-zinc-600" />
                                )}
                            </motion.button>
                        </motion.div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">{localDisplayName || user?.username || 'User'}</h2>
                            <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium">
                                {getRoleLabel(user?.role)}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Display Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={localDisplayName}
                                    onChange={(e) => setLocalDisplayName(e.target.value)}
                                    className="w-full h-10 px-3 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 transition-all text-sm"
                                />
                                <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={localEmail}
                                    disabled
                                    className="w-full h-10 px-3 pr-10 rounded-xl border border-zinc-200 text-zinc-500 cursor-not-allowed bg-zinc-100 transition-all text-sm"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">@</div>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Phone Number</label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={localPhone}
                                    onChange={(e) => setLocalPhone(e.target.value)}
                                    placeholder="+966 5XX XXX XXXX"
                                    className="w-full h-10 px-3 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 transition-all text-sm"
                                />
                                <Phone size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                {/* ==================== Notifications Section ==================== */}
                <SettingsSection
                    id="notifications"
                    title="Notifications"
                    description="Configure how you receive alerts"
                    icon={<Bell size={16} />}
                >
                    <div className="space-y-3">
                        <ToggleSetting
                            title="Email Notifications"
                            description="Receive email updates about your diagnoses"
                            checked={settings.emailNotifications}
                            onChange={(val) => dispatch(setEmailNotifications(val))}
                        />
                        <ToggleSetting
                            title="Push Notifications"
                            description="Get instant alerts on your device"
                            checked={settings.pushNotifications}
                            onChange={(val) => dispatch(setPushNotifications(val))}
                        />
                        <ToggleSetting
                            title="Weekly Summary Report"
                            description="Receive a weekly digest of all activities"
                            checked={settings.weeklyReport}
                            onChange={(val) => dispatch(setWeeklyReport(val))}
                        />

                        <div className="border-t border-zinc-100 pt-3 mt-3">
                            <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider">Alert Types</p>
                        </div>

                        <ToggleSetting
                            title="Critical Case Alerts"
                            description="Immediate notifications for critical or high-severity diagnoses"
                            checked={settings.criticalAlerts}
                            onChange={(val) => dispatch(setCriticalAlerts(val))}
                        />
                        <ToggleSetting
                            title="Analysis Complete"
                            description="Get notified when AI analyses are finished"
                            checked={settings.diagnosisComplete}
                            onChange={(val) => dispatch(setDiagnosisComplete(val))}
                        />
                    </div>
                </SettingsSection>

                {/* ==================== Appearance Section ==================== */}
                <SettingsSection
                    id="appearance"
                    title="Appearance"
                    description="Customize the look and feel"
                    icon={<Palette size={16} />}
                >
                    <div className="space-y-4">
                        {/* Theme Mode Selector */}
                        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                            <p className="text-xs font-semibold text-zinc-900 mb-3">Theme Mode</p>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { mode: 'light' as const, icon: Sun, label: 'Light' },
                                    { mode: 'dark' as const, icon: Moon, label: 'Dark' },
                                    { mode: 'system' as const, icon: Monitor, label: 'System' },
                                ].map(({ mode, icon: Icon, label }) => (
                                    <motion.button
                                        key={mode}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => dispatch(setTheme(mode))}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                                            settings.theme === mode
                                                ? 'bg-black text-white border-black shadow-md'
                                                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                                        }`}
                                    >
                                        <Icon size={20} />
                                        <span className="text-xs font-medium">{label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <ToggleSetting
                            title="Compact View"
                            description="Show more content with less spacing"
                            checked={settings.compactView}
                            onChange={(val) => dispatch(setCompactView(val))}
                        />

                        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                            <p className="text-xs font-semibold text-zinc-900 mb-3">Accent Color</p>
                            <div className="flex gap-3">
                                {accentColors.map((themeColor) => (
                                    <motion.button
                                        key={themeColor.name}
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`w-8 h-8 rounded-full transition-all shadow-sm relative ${
                                            selectedAccent === themeColor.color
                                                ? 'ring-2 ring-offset-2 ring-zinc-400'
                                                : 'ring-2 ring-offset-2 ring-transparent hover:ring-zinc-200'
                                        }`}
                                        style={{ backgroundColor: themeColor.color }}
                                        title={themeColor.name}
                                        onClick={() => handleAccentColorChange(themeColor.color)}
                                    >
                                        {selectedAccent === themeColor.color && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <Check size={14} className="text-white drop-shadow-md" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                {/* ==================== Onboarding Tour ==================== */}
                <SettingsSection
                    id="onboarding"
                    title="Onboarding Tour"
                    description="Restart the introductory tour"
                    icon={<Bell size={16} />}
                >
                    <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                        <div>
                            <p className="text-sm font-medium text-zinc-900">Need a refresher?</p>
                            <p className="text-xs text-zinc-500">Restart the guided tour to learn about all features</p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                resetTour();
                                navigate('/dashboard');
                                setTimeout(() => startTour(DASHBOARD_TOUR_STEPS), 500);
                                toast.success('Tour restarted! Check the dashboard.');
                            }}
                        >
                            Restart Tour
                        </Button>
                    </div>
                </SettingsSection>

                {/* ==================== Keyboard Shortcuts ==================== */}
                <SettingsSection
                    id="shortcuts"
                    title="Keyboard Shortcuts"
                    description="Quick navigation shortcuts"
                    icon={<Keyboard size={16} />}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            { keys: 'Ctrl + D', action: 'Go to Dashboard' },
                            { keys: 'Ctrl + N', action: 'New Diagnosis' },
                            { keys: 'Ctrl + H', action: 'View History' },
                            { keys: 'Ctrl + ,', action: 'Open Settings' },
                        ].map((shortcut) => (
                            <div
                                key={shortcut.keys}
                                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100 transition-colors hover:bg-zinc-100/80"
                            >
                                <span className="text-sm font-medium text-zinc-700">{shortcut.action}</span>
                                <div className="flex gap-1">
                                    {shortcut.keys.split(' + ').map(k => (
                                        <kbd key={k} className="px-2 py-1 rounded-lg bg-white border border-zinc-200 text-[10px] font-bold text-zinc-500 shadow-sm min-w-[20px] text-center">
                                            {k}
                                        </kbd>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </SettingsSection>

                {/* ==================== Security Section ==================== */}
                <SettingsSection
                    id="security"
                    title="Security"
                    description="Manage your password and account security"
                    icon={<Shield size={16} />}
                    footer={
                        <div className="flex justify-between gap-3 w-full">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                                onClick={() => setShowDeactivateDialog(true)}
                            >
                                Deactivate Account
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                className="bg-black text-white hover:bg-zinc-800"
                                onClick={handlePasswordUpdate}
                                disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                            >
                                {isUpdatingPassword ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-10 px-3 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-10 px-3 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                                {/* Password Strength Indicator */}
                                <AnimatePresence>
                                    {newPassword && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-2 space-y-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className={`h-full rounded-full ${passwordStrength.color}`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                    passwordStrength.score <= 2 ? 'text-red-600' :
                                                    passwordStrength.score <= 3 ? 'text-orange-600' :
                                                    passwordStrength.score <= 4 ? 'text-amber-600' : 'text-emerald-600'
                                                }`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1">
                                                {[
                                                    { check: newPassword.length >= 8, label: '8+ characters' },
                                                    { check: /[A-Z]/.test(newPassword), label: 'Uppercase letter' },
                                                    { check: /[a-z]/.test(newPassword), label: 'Lowercase letter' },
                                                    { check: /\d/.test(newPassword), label: 'Number' },
                                                ].map(req => (
                                                    <div key={req.label} className={`flex items-center gap-1 text-[10px] ${req.check ? 'text-emerald-600' : 'text-zinc-400'}`}>
                                                        <Check size={8} className={req.check ? 'opacity-100' : 'opacity-30'} />
                                                        {req.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 transition-all text-sm"
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                )}
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                {/* ==================== Session Management ==================== */}
                <SettingsSection
                    id="sessions"
                    title="Session Management"
                    description="Manage your active sessions"
                    icon={<Devices size={16} />}
                >
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                            <div>
                                <p className="text-sm font-medium text-zinc-900">Log Out</p>
                                <p className="text-xs text-zinc-500">End your current session on this device</p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleLogout}
                                className="gap-2"
                            >
                                <LogOut size={14} />
                                Log Out
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50">
                            <div>
                                <p className="text-sm font-medium text-red-800">Log Out All Devices</p>
                                <p className="text-xs text-red-600/80">Invalidate all active sessions across every device</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowLogoutAllDialog(true)}
                                className="gap-2 text-red-600 border-red-200 hover:bg-red-100"
                            >
                                <Devices size={14} />
                                Log Out All
                            </Button>
                        </div>
                    </div>
                </SettingsSection>

                {/* ==================== Data & Privacy ==================== */}
                <SettingsSection
                    id="privacy"
                    title="Data & Privacy"
                    description="Manage your data and privacy settings"
                    icon={<Database size={16} />}
                >
                    <div className="space-y-4">
                        <ToggleSetting
                            title="Analytics & Usage Data"
                            description="Help us improve by sharing anonymous usage data"
                            checked={settings.analyticsEnabled}
                            onChange={(val) => dispatch(setAnalyticsEnabled(val))}
                        />

                        <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-zinc-900">Export Your Data</p>
                                <p className="text-xs text-zinc-500">Download all your settings and preferences as a JSON file</p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    const dataStr = JSON.stringify(settings, null, 2);
                                    const blob = new Blob([dataStr], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'ai-things-settings.json';
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    toast.success('Settings exported!');
                                }}
                                className="gap-2"
                            >
                                <Download size={14} />
                                Export
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-red-100 bg-red-50/50">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800">Clear All Data</p>
                                <p className="text-xs text-red-600/80">Reset all preferences to default values. Profile data is not affected.</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowResetDialog(true)}
                                className="gap-2 text-red-600 border-red-200 hover:bg-red-100"
                            >
                                <Trash2 size={14} />
                                Reset
                            </Button>
                        </div>
                    </div>
                </SettingsSection>
            </motion.main>
        </div>
    );
};

export default SettingsPage;
