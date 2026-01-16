import React, { useState, useEffect } from 'react';
import {
    User,
    Bell,
    Shield,
    Palette,
    Save,
    Edit3,
    Camera,
    Keyboard,
    Settings,
    ArrowLeft,
    Plus
} from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { toast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import { resetTour, DASHBOARD_TOUR_STEPS, useTour } from '../components/ui/TourProvider';

// Settings Section Component
interface SettingsSectionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, icon, children, footer }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-700">
                    {icon}
                </div>
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
    </div>
);

// Toggle Setting Item
interface ToggleSettingProps {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({ title, description, checked, onChange }) => (
    <div
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
        <div className={`w-11 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
    </div>
);

export const SettingsPage: React.FC = () => {
    const user = useAppSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const { startTour } = useTour();

    const [displayName, setDisplayName] = useState(() => localStorage.getItem('settings_displayName') || user?.username || '');
    const [email, setEmail] = useState(() => localStorage.getItem('settings_email') || '');
    const [emailNotifications, setEmailNotifications] = useState(() => localStorage.getItem('settings_emailNotifications') !== 'false');
    const [pushNotifications, setPushNotifications] = useState(() => localStorage.getItem('settings_pushNotifications') !== 'false');
    const [weeklyReport, setWeeklyReport] = useState(() => localStorage.getItem('settings_weeklyReport') === 'true');
    const [compactView, setCompactView] = useState(() => localStorage.getItem('settings_compactView') === 'true');

    useEffect(() => {
         localStorage.setItem('settings_displayName', displayName);
        localStorage.setItem('settings_email', email);
        localStorage.setItem('settings_emailNotifications', String(emailNotifications));
        localStorage.setItem('settings_pushNotifications', String(pushNotifications));
        localStorage.setItem('settings_weeklyReport', String(weeklyReport));
        localStorage.setItem('settings_compactView', String(compactView));
    }, [displayName, email, emailNotifications, pushNotifications, weeklyReport, compactView]);

    const handleSave = () => {
        toast.success('Settings saved successfully!');
    };

    const getRoleLabel = (role?: string) => {
        switch (role) {
            case 'gp': return 'General Practitioner';
            case 'specialist': return 'Specialist';
            case 'auditor': return 'Auditor';
            default: return 'User';
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Glass Header - Consistent with Dashboard */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <Button 
                            variant="secondary" 
                            size="sm" 
                            className="w-8 h-8 p-0 rounded-lg flex items-center justify-center border-gray-200"
                            onClick={() => navigate('/dashboard')}
                        >
                            <ArrowLeft size={16} className="text-gray-600" />
                        </Button>
                        <div className="h-6 w-px bg-gray-200 mx-1" />
                        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-md shadow-black/20">
                            <Settings className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Settings</h1>
                    </div>
                     <div className="flex items-center gap-3">
                        <Button variant="primary" size="sm" onClick={handleSave} className="bg-black text-white hover:bg-gray-800 shadow-md">
                            Save Changes
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                {/* Profile Section */}
                <SettingsSection
                    title="Profile"
                    description="Manage your account information"
                    icon={<User size={16} />}
                >
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative group cursor-pointer">
                            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-2xl font-semibold shadow-md ring-4 ring-white">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={20} className="text-white" />
                            </div>
                            <button className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                                <Edit3 size={12} className="text-gray-600" />
                            </button>
                        </div>
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
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                        <ToggleSetting title="Email Notifications" description="Receive email updates about your diagnoses" checked={emailNotifications} onChange={setEmailNotifications} />
                        <ToggleSetting title="Push Notifications" description="Get instant alerts on your device" checked={pushNotifications} onChange={setPushNotifications} />
                        <ToggleSetting title="Weekly Summary Report" description="Receive a weekly digest of all activities" checked={weeklyReport} onChange={setWeeklyReport} />
                    </div>
                </SettingsSection>

                {/* Appearance Section */}
                <SettingsSection
                    title="Appearance"
                    description="Customize the look and feel"
                    icon={<Palette size={16} />}
                >
                    <div className="space-y-4">
                        <ToggleSetting title="Compact View" description="Show more content with less spacing" checked={compactView} onChange={setCompactView} />
                    
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                             <p className="text-xs font-semibold text-gray-900 mb-3">Accent Color</p>
                            <div className="flex gap-3">
                                {[
                                    { color: '#000000', name: 'Default' },
                                    { color: '#2563eb', name: 'Blue' },
                                    { color: '#059669', name: 'Green' },
                                    { color: '#7c3aed', name: 'Purple' },
                                    { color: '#d97706', name: 'Amber' },
                                ].map((themeColor) => (
                                    <button
                                        key={themeColor.name}
                                        className="w-8 h-8 rounded-full transition-transform hover:scale-110 ring-2 ring-offset-2 ring-transparent focus:ring-gray-400 shadow-sm"
                                        style={{ backgroundColor: themeColor.color }}
                                        title={themeColor.name}
                                        onClick={() => toast.info(`Theme color: ${themeColor.name}`)}
                                    />
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
                            <div key={shortcut.keys} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                                <span className="text-sm font-medium text-gray-700">{shortcut.action}</span>
                                <div className="flex gap-1">
                                    {shortcut.keys.split(' + ').map(k => (
                                         <kbd key={k} className="px-2 py-1 rounded bg-white border border-gray-200 text-[10px] font-bold text-gray-500 shadow-sm min-w-[20px] text-center">
                                            {k}
                                        </kbd>
                                    ))}
                                </div>
                            </div>
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
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300">Deactivate Account</Button>
                            <Button variant="primary" size="sm" className="bg-black text-white hover:bg-gray-800">Update Password</Button>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current Password</label>
                            <input type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Password</label>
                            <input type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                            <input type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm" />
                        </div>
                    </div>
                </SettingsSection>
            </main>
        </div>
    );
};

export default SettingsPage;
