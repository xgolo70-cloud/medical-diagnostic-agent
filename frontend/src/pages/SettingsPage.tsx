import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Bell,
    Shield,
    Palette,
    Edit3,
    Camera,
    Keyboard,
    Settings,
    ArrowLeft,
    Check,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
    setAccentColor,
    setCompactView,
    setEmailNotifications,
    setPushNotifications,
    setWeeklyReport,
    setDisplayName,
    setEmail
} from '../store/settingsSlice';
import { toast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { resetTour, DASHBOARD_TOUR_STEPS, useTour } from '../components/ui/TourProvider';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Settings Section Component
interface SettingsSectionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, icon, children, footer }) => (
    <motion.div 
        variants={itemVariants}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6 hover:shadow-md transition-shadow duration-300"
    >
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-700"
                >
                    {icon}
                </motion.div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            </div>
            {children}
        </div>
        {footer && (
            <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-3 flex items-center justify-end">
                {footer}
            </div>
        )}
    </motion.div>
);

// Toggle Setting Item
interface ToggleSettingProps {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({ title, description, checked, onChange }) => (
    <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
            checked 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
        onClick={() => onChange(!checked)}
    >
        <div>
            <p className={`text-sm font-medium ${checked ? 'text-blue-700' : 'text-gray-900'}`}>{title}</p>
            <p className={`text-xs ${checked ? 'text-blue-600/80' : 'text-gray-500'}`}>{description}</p>
        </div>
        <motion.div 
            className={`w-11 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
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

// Confirmation Dialog Component
interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
    isOpen, title, message, confirmText, onConfirm, onCancel, isDanger 
}) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full ${isDanger ? 'bg-red-100' : 'bg-amber-100'}`}>
                        <AlertTriangle size={20} className={isDanger ? 'text-red-600' : 'text-amber-600'} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button 
                        variant="primary" 
                        onClick={onConfirm}
                        className={isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'}
                    >
                        {confirmText}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export const SettingsPage: React.FC = () => {
    const user = useAppSelector((state) => state.auth.user);
    const settings = useAppSelector((state) => state.settings);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { startTour } = useTour();

    // Local state for profile editing
    const [localDisplayName, setLocalDisplayName] = useState(settings.displayName || user?.username || '');
    const [localEmail, setLocalEmail] = useState(settings.email || '');
    
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    
    // Dialog state
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
    
    // Selected accent color (local for visual feedback)
    const [selectedAccent, setSelectedAccent] = useState(settings.accentColor);

    const handleSave = () => {
        // Save profile to Redux/localStorage
        dispatch(setDisplayName(localDisplayName));
        dispatch(setEmail(localEmail));
        toast.success('Settings saved successfully!');
    };

    const handlePasswordUpdate = async () => {
        // Validation
        if (!currentPassword) {
            toast.error('Please enter your current password');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        
        setIsUpdatingPassword(true);
        
        // Simulate API call (replace with real API when backend is ready)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo: just show success
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsUpdatingPassword(false);
    };

    const handleAccentColorChange = (color: string) => {
        setSelectedAccent(color);
        dispatch(setAccentColor(color));
        toast.success('Accent color updated!');
    };

    const handleDeactivateAccount = () => {
        setShowDeactivateDialog(false);
        toast.info('Account deactivation requested. You would be logged out if this were a real action.');
    };

    const getRoleLabel = (role?: string) => {
        switch (role) {
            case 'gp': return 'General Practitioner';
            case 'specialist': return 'Specialist';
            case 'auditor': return 'Auditor';
            case 'admin': return 'Administrator';
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
        <div className="min-h-screen bg-[#fafafa]">
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeactivateDialog}
                title="Deactivate Account"
                message="Are you sure you want to deactivate your account? This action cannot be undone and you will lose access to all your data."
                confirmText="Deactivate"
                onConfirm={handleDeactivateAccount}
                onCancel={() => setShowDeactivateDialog(false)}
                isDanger
            />

            {/* Glass Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                className="w-8 h-8 p-0 rounded-lg flex items-center justify-center border-gray-200"
                                onClick={() => navigate('/dashboard')}
                            >
                                <ArrowLeft size={16} className="text-gray-600" />
                            </Button>
                        </motion.div>
                        <div className="h-6 w-px bg-gray-200 mx-1" />
                        <motion.div 
                            whileHover={{ rotate: 90 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-md shadow-black/20"
                        >
                            <Settings className="w-4 h-4 text-white" />
                        </motion.div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Settings</h1>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="primary" size="sm" onClick={handleSave} className="bg-black text-white hover:bg-gray-800 shadow-md">
                            Save Changes
                        </Button>
                    </motion.div>
                </div>
            </header>

            <motion.main 
                className="max-w-4xl mx-auto px-6 py-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Profile Section */}
                <SettingsSection
                    title="Profile"
                    description="Manage your account information"
                    icon={<User size={16} />}
                >
                    <div className="flex items-center gap-6 mb-8">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="relative group cursor-pointer"
                        >
                            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-2xl font-semibold shadow-md ring-4 ring-white">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={20} className="text-white" />
                            </div>
                            <motion.button 
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                                onClick={() => toast.info('Avatar upload coming soon!')}
                            >
                                <Edit3 size={12} className="text-gray-600" />
                            </motion.button>
                        </motion.div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{user?.username || 'User'}</h2>
                            <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium">
                                {getRoleLabel(user?.role)}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Display Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={localDisplayName}
                                    onChange={(e) => setLocalDisplayName(e.target.value)}
                                    className="w-full h-10 px-3 pr-10 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                                />
                                <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                             <div className="relative">
                                <input
                                    type="email"
                                    value={localEmail}
                                    onChange={(e) => setLocalEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full h-10 px-3 pr-10 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">@</div>
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                {/* Notifications Section */}
                <SettingsSection
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
                    </div>
                </SettingsSection>

                {/* Appearance Section */}
                <SettingsSection
                    title="Appearance"
                    description="Customize the look and feel"
                    icon={<Palette size={16} />}
                >
                    <div className="space-y-4">
                        <ToggleSetting 
                            title="Compact View" 
                            description="Show more content with less spacing" 
                            checked={settings.compactView} 
                            onChange={(val) => dispatch(setCompactView(val))} 
                        />
                    
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                             <p className="text-xs font-semibold text-gray-900 mb-3">Accent Color</p>
                            <div className="flex gap-3">
                                {accentColors.map((themeColor) => (
                                    <motion.button
                                        key={themeColor.name}
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`w-8 h-8 rounded-full transition-all shadow-sm relative ${
                                            selectedAccent === themeColor.color 
                                                ? 'ring-2 ring-offset-2 ring-gray-400' 
                                                : 'ring-2 ring-offset-2 ring-transparent hover:ring-gray-200'
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

                {/* Onboarding Tour Section */}
                <SettingsSection
                    title="Onboarding Tour"
                    description="Restart the introductory tour"
                    icon={<Bell size={16} />}
                >
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Need a refresher?</p>
                            <p className="text-xs text-gray-500">Restart the guided tour to learn about all features</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="secondary"
                                size="sm"
                                aria-label="Restart onboarding tour"
                                onClick={() => {
                                    resetTour();
                                    navigate('/dashboard');
                                    setTimeout(() => startTour(DASHBOARD_TOUR_STEPS), 500);
                                    toast.success('Tour restarted! Check the dashboard.');
                                }}
                            >
                                Restart Tour
                            </Button>
                        </motion.div>
                    </div>
                </SettingsSection>

                {/* Keyboard Shortcuts Section */}
                <SettingsSection
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
                            <motion.div 
                                key={shortcut.keys} 
                                whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 transition-colors"
                            >
                                <span className="text-sm font-medium text-gray-700">{shortcut.action}</span>
                                <div className="flex gap-1">
                                    {shortcut.keys.split(' + ').map(k => (
                                         <kbd key={k} className="px-2 py-1 rounded bg-white border border-gray-200 text-[10px] font-bold text-gray-500 shadow-sm min-w-[20px] text-center">
                                            {k}
                                        </kbd>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </SettingsSection>

                {/* Security Section */}
                <SettingsSection
                    title="Security"
                    description="Manage your account security"
                    icon={<Shield size={16} />}
                     footer={
                        <div className="flex justify-end gap-3 w-full">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                                    onClick={() => setShowDeactivateDialog(true)}
                                >
                                    Deactivate Account
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                    variant="primary" 
                                    size="sm" 
                                    className="bg-black text-white hover:bg-gray-800"
                                    onClick={handlePasswordUpdate}
                                    disabled={isUpdatingPassword}
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
                            </motion.div>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current Password</label>
                            <input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••" 
                                className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Password</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••" 
                                className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm" 
                            />
                            {newPassword && newPassword.length < 6 && (
                                <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••" 
                                className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm" 
                            />
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                        </div>
                    </div>
                </SettingsSection>
            </motion.main>
        </div>
    );
};

export default SettingsPage;
