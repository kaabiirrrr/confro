import { useState, useEffect } from 'react';
import { User, Lock, Bell, Shield, AlertTriangle, Save, Eye, EyeOff, Check } from 'lucide-react';
import { getMyProfile, updateMyProfile, changePassword } from '../../../../services/apiService';
import { toast } from 'react-hot-toast';
import { toastApiError } from '../../../../utils/apiErrorToast';
import { supabase } from '../../../../lib/supabase';
import SectionHeader from '../../../ui/SectionHeader';
import Button from '../../../ui/Button';
import Card from '../../../ui/Card';
import InfinityLoader from '../../../common/InfinityLoader';

const TABS = [
    { key: 'profile', label: 'Profile', icon: <User size={16} /> },
    { key: 'password', label: 'Password', icon: <Lock size={16} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { key: 'privacy', label: 'Privacy', icon: <Shield size={16} /> },
    { key: 'account', label: 'Account', icon: <AlertTriangle size={16} /> },
];

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    const [form, setForm] = useState({ name: '', email: '', phone: '', bio: '', location: '', website: '' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [notifications, setNotifications] = useState({
        email_proposals: true, email_messages: true, email_contracts: true,
        push_proposals: false, push_messages: true, push_contracts: true
    });

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        setIsLoading(false);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setForm(f => ({ ...f, email: user.email || '', name: user.user_metadata?.name || '' }));
            }
            const res = await getMyProfile();
            if (res?.success && res.data) {
                const p = res.data;
                setProfile(p);
                setForm({
                    name: p.name || user?.user_metadata?.name || '',
                    email: p.email || user?.email || '',
                    phone: p.phone || '',
                    bio: p.bio || '',
                    location: p.location || '',
                    website: p.website_url || ''
                });
                if (p.notification_preferences) {
                    setNotifications(prev => ({ ...prev, ...p.notification_preferences }));
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleProfileSave = async () => {
        setIsSaving(true);
        try {
            const res = await updateMyProfile({
                name: form.name, phone: form.phone, bio: form.bio,
                location: form.location, website_url: form.website
            });
            if (res.success) toast.success('Profile updated!');
        } catch (err) {
            toastApiError(err, 'Update failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
        if (passwords.new.length < 8) return toast.error('Password must be at least 8 characters');
        setIsSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwords.new });
            if (error) throw error;
            toast.success('Password changed successfully!');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            toast.error(err.message || 'Failed to change password');
        } finally {
            setIsSaving(false);
        }
    };

    const handleNotificationSave = async () => {
        setIsSaving(true);
        try {
            await updateMyProfile({ notification_preferences: notifications });
            toast.success('Notification preferences saved!');
        } catch (err) {
            toastApiError(err, 'Failed to save preferences');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeactivate = async () => {
        if (!confirm('Are you sure you want to deactivate your account? This cannot be undone easily.')) return;
        toast.error('Please contact support to deactivate your account');
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><InfinityLoader size={20} /></div>;

    return (
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
            <SectionHeader
                title="Settings"
                subtext="Manage your account, security, and notification preferences."
            />

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${activeTab === tab.key
                                ? 'bg-accent/10 text-accent border-accent/20'
                                : 'bg-transparent text-white/50 hover:text-white border-white/10 hover:border-white/20'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="max-w-4xl space-y-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <Card className="space-y-8">
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none mb-1">Identity</p>
                                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Public Profile Information</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Field label="Full Name / Entity Identification" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Your full name" />
                            <Field label="Authenticated Email" value={form.email} type="email" disabled placeholder="email@example.com" />
                            <Field label="Contact Line" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+1 (555) 000-0000" type="tel" />
                            <Field label="Operational Base (Location)" value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} placeholder="City, Country" />
                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Mission Statement / Bio</label>
                                <textarea rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/10 focus:outline-none focus:border-accent/50 transition-all resize-none font-medium leading-relaxed"
                                    placeholder="Describe your organizational objectives and prerequisites..." />
                            </div>
                            <div className="md:col-span-2">
                                <Field label="External Digital Domain (Website)" value={form.website} onChange={v => setForm(f => ({ ...f, website: v }))} placeholder="https://yourwebsite.com" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <Button onClick={handleProfileSave} disabled={isSaving} loading={isSaving} icon={Save}>
                                Save Profile
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                    <Card className="space-y-8">
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                <Lock size={20} />
                            </div>
                            <div>
                                <p className="text-white/40 text-xs uppercase font-semibold tracking-wider leading-none mb-1">Security</p>
                                <h3 className="text-white font-semibold">Change Password</h3>
                            </div>
                        </div>

                        <div className="max-w-md space-y-6">
                            {Object.entries({ new: 'New Password', confirm: 'Confirm New Password' }).map(([key, label]) => (
                                <div key={key} className="space-y-2">
                                    <label className="block text-xs text-white/40 uppercase font-semibold tracking-wider">{label}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword[key] ? 'text' : 'password'}
                                            value={passwords[key]}
                                            onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 pr-12 py-3.5 text-white text-sm placeholder-white/10 focus:outline-none focus:border-accent/50 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => setShowPassword(p => ({ ...p, [key]: !p[key] }))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
                                            {showPassword[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <Button onClick={handlePasswordChange} disabled={isSaving || !passwords.new} loading={isSaving} icon={Shield}>
                                Update Password
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <Card className="space-y-6">
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                <Bell size={20} />
                            </div>
                            <div>
                                <p className="text-white/40 text-xs uppercase font-semibold tracking-wider leading-none mb-1">Communications</p>
                                <h3 className="text-white font-semibold">Notification Preferences</h3>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {[
                                { key: 'email_proposals', label: 'New Proposals', desc: 'Alerts for newly submitted freelancer applications', type: 'Email' },
                                { key: 'email_messages', label: 'Messages', desc: 'Alerts for direct messages from freelancers', type: 'Email' },
                                { key: 'email_contracts', label: 'Contract Updates', desc: 'State changes in active contracts', type: 'Email' },
                                { key: 'push_messages', label: 'Instant Messages', desc: 'Real-time push notifications for messages', type: 'Push' },
                                { key: 'push_contracts', label: 'Milestone Updates', desc: 'Immediate notification of contract progress', type: 'Push' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white text-sm font-medium">{item.label}</p>
                                            <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">{item.type}</span>
                                        </div>
                                        <p className="text-white/40 text-xs">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${notifications[item.key] ? 'bg-accent' : 'bg-white/10'}`}
                                    >
                                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${notifications[item.key] ? 'left-6' : 'left-0.5'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2">
                            <Button onClick={handleNotificationSave} disabled={isSaving} loading={isSaving} icon={Save}>
                                Save Preferences
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                    <Card className="space-y-6">
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                <Shield size={20} />
                            </div>
                            <div>
                                <p className="text-white/40 text-xs uppercase font-semibold tracking-wider leading-none mb-1">Protection</p>
                                <h3 className="text-white font-semibold">Visibility & Privacy</h3>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {[
                                { label: 'Profile Visibility', desc: 'Allow freelancers to find and view your profile during job search' },
                                { label: 'Proposal Notifications', desc: 'Receive email notifications for new inbound proposals' },
                                { label: 'Activity Status', desc: 'Allow others to see when you were last active' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                                    <div className="space-y-0.5">
                                        <p className="text-white text-sm font-medium">{item.label}</p>
                                        <p className="text-white/40 text-xs max-w-sm">{item.desc}</p>
                                    </div>
                                    <div className="relative w-12 h-6 rounded-full bg-accent">
                                        <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <Card className="space-y-6">
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <p className="text-red-400/50 text-xs uppercase font-semibold tracking-wider leading-none mb-1">Danger Zone</p>
                                <h3 className="text-white font-semibold">Account Management</h3>
                            </div>
                        </div>

                        <div className="p-6 border border-red-500/10 bg-red-500/5 rounded-xl space-y-4">
                            <div className="space-y-1">
                                <p className="text-red-400 font-semibold text-sm">Deactivate Account</p>
                                <p className="text-white/40 text-xs leading-relaxed">Deactivating your account will disable your profile and hide all your job postings. This action can be reversed by contacting support.</p>
                            </div>
                            <Button
                                variant="danger"
                                onClick={handleDeactivate}
                                icon={AlertTriangle}
                            >
                                Deactivate Account
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

const Field = ({ label, value, onChange, placeholder, type = 'text', disabled }) => (
    <div className="space-y-2">
        <label className="block text-xs text-white/40 uppercase font-semibold tracking-wider">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange ? e => onChange(e.target.value) : undefined}
            disabled={disabled}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-all font-medium ${disabled ? 'text-white/20 cursor-not-allowed border-dashed' : 'text-white'}`}
            placeholder={placeholder}
        />
    </div>
);

export default Settings;
