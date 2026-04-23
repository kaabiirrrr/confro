import { useState, useEffect, useRef } from 'react';
import { Camera, User, Mail, Phone, Shield, Clock, CheckCircle, Save, Key, Edit3, X, Database, RefreshCw } from 'lucide-react';
import { fetchAdminProfile, updateAdminProfile, uploadAdminAvatar } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const AdminProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showPasswordField, setShowPasswordField] = useState(false);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            const result = await fetchAdminProfile();
            if (result.success) {
                setProfile(result.data);
                setForm({
                    name: result.data.name || '',
                    phone: result.data.phone || '',
                    email: result.data.email || '',
                    password: '',
                });
            }
        } catch (err) {
            console.error('Failed to load profile', err);
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = { name: form.name, phone: form.phone };
            if (form.email !== profile.email) payload.email = form.email;
            if (form.password) payload.password = form.password;

            const result = await updateAdminProfile(payload);
            if (result.success) {
                toast.success('Profile updated successfully!');
                await loadProfile();
                setEditMode(false);
                setShowPasswordField(false);
                setForm(f => ({ ...f, password: '' }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoClick = () => fileInputRef.current?.click();

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingPhoto(true);
        try {
            const result = await uploadAdminAvatar(file);
            if (result.success) {
                toast.success('Photo updated!');
                setProfile(p => ({ ...p, photo_url: result.data.photo_url }));
            }
        } catch (err) {
            toast.error('Failed to upload photo. Make sure it is under 20MB.');
            console.error(err);
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const getRoleBadgeStyle = (role) => {
        const styles = {
            SUPER_ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            MODERATOR: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            FINANCE_ADMIN: 'bg-green-500/10 text-green-400 border-green-500/20',
            SUPPORT_ADMIN: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        };
        return styles[role] || 'bg-accent/10 text-accent border-accent/20';
    };

    const getInitials = (name, email) => {
        if (name && name.trim()) return name.trim()[0].toUpperCase();
        if (email) return email[0].toUpperCase();
        return 'A';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-8xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                        <img src="/Icons/icons8-account-male-96.png" alt="Profile" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        My Profile
                    </h1>
                    <p className="text-white/50 text-xs sm:text-sm mt-1">Manage your admin account settings and preferences</p>
                </div>
                {!editMode ? (
                    <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 border border-accent/20 text-accent rounded-xl text-xs sm:text-sm font-medium hover:bg-accent/20 transition flex-shrink-0"
                    >
                        <Edit3 size={14} />
                        <span className="hidden sm:inline">Edit Profile</span>
                        <span className="sm:hidden">Edit</span>
                    </button>
                ) : (
                    <button
                        onClick={() => { setEditMode(false); setShowPasswordField(false); }}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 text-white/60 rounded-xl text-xs sm:text-sm font-medium hover:text-white transition flex-shrink-0"
                    >
                        <X size={14} />
                        <span className="hidden sm:inline">Cancel</span>
                        <span className="sm:hidden">✕</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Avatar + Info Card */}
                <div className="lg:col-span-1 space-y-4">

                    {/* Avatar Card */}
                    <div className="bg-transparent border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
                        {/* Photo */}
                        <div className="relative group">
                            <div
                                onClick={handlePhotoClick}
                                className="w-28 h-28 rounded-full overflow-hidden border-2 border-accent/30 cursor-pointer relative"
                            >
                                {profile?.photo_url ? (
                                    <img
                                        src={profile.photo_url}
                                        alt={profile.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-accent/20 flex items-center justify-center text-accent text-3xl font-bold">
                                        {getInitials(profile?.name, profile?.email)}
                                    </div>
                                )}
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    {isUploadingPhoto ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Camera size={22} className="text-white" />
                                    )}
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                            {/* Camera badge */}
                            <button
                                onClick={handlePhotoClick}
                                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg border-2 border-[#0f1015]"
                            >
                                <Camera size={14} className="text-white" />
                            </button>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white">{profile?.name || 'Admin'}</h2>
                            <p className="text-white/50 text-sm">{profile?.email}</p>
                        </div>

                        {/* Role Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(profile?.role)}`}>
                            {profile?.role?.replace('_', ' ') || 'Admin'}
                        </span>

                        {/* Email Verified */}
                        <div className="flex items-center gap-2 text-xs text-green-400">
                            <CheckCircle size={14} />
                            <span>Email Verified</span>
                        </div>
                    </div>

                    {/* Account Info Card */}
                    <div className="bg-transparent border border-white/10 rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Account Info</h3>

                        <InfoRow
                            icon={<Shield size={15} />}
                            label="Role"
                            value={profile?.role?.replace(/_/g, ' ')}
                        />
                        <InfoRow
                            icon={<Clock size={15} />}
                            label="Member Since"
                            value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                        />
                        <InfoRow
                            icon={<Clock size={15} />}
                            label="Last Login"
                            value={formatDate(profile?.last_login_at || profile?.last_sign_in_at)}
                        />
                        <InfoRow
                            icon={<Clock size={15} />}
                            label="Profile Updated"
                            value={formatDate(profile?.updated_at)}
                        />
                    </div>
                </div>

                {/* Right: Edit Form */}
                <div className="lg:col-span-2 space-y-4">

                    <form onSubmit={handleSave} className="bg-transparent border border-white/10 rounded-2xl p-6 space-y-5">
                        <h3 className="text-lg font-semibold text-white">
                            {editMode ? 'Edit Profile Details' : 'Profile Details'}
                        </h3>

                        {/* Name */}
                        <FormField
                            icon={<User size={16} />}
                            label="Display Name"
                            value={form.name}
                            onChange={v => setForm(f => ({ ...f, name: v }))}
                            disabled={!editMode}
                            placeholder="Your display name"
                        />

                        {/* Email */}
                        <FormField
                            icon={<Mail size={16} />}
                            label="Email Address"
                            value={form.email}
                            onChange={v => setForm(f => ({ ...f, email: v }))}
                            disabled={!editMode}
                            type="email"
                            placeholder="admin@example.com"
                        />

                        {/* Phone */}
                        <FormField
                            icon={<Phone size={16} />}
                            label="Phone Number"
                            value={form.phone}
                            onChange={v => setForm(f => ({ ...f, phone: v }))}
                            disabled={!editMode}
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                        />

                        {/* Change Password toggle */}
                        {editMode && (
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordField(!showPasswordField)}
                                    className="flex items-center gap-2 text-sm text-accent hover:text-white transition"
                                >
                                    <Key size={14} />
                                    {showPasswordField ? 'Cancel Password Change' : 'Change Password'}
                                </button>

                                {showPasswordField && (
                                    <div className="mt-3">
                                        <FormField
                                            icon={<Key size={16} />}
                                            label="New Password"
                                            value={form.password}
                                            onChange={v => setForm(f => ({ ...f, password: v }))}
                                            disabled={false}
                                            type="password"
                                            placeholder="Min 8 characters"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Save button */}
                        {editMode && (
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        )}
                    </form>

                    {/* Login Activity Card */}
                    <div className="bg-transparent border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-white">Login Activity</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ActivityCard
                                title="Last Login"
                                value={formatDate(profile?.last_login_at || profile?.last_sign_in_at)}
                                icon={<Clock size={20} />}
                                color="accent"
                            />
                            <ActivityCard
                                title="Account Created"
                                value={formatDate(profile?.created_at)}
                                icon={<Shield size={20} />}
                                color="green"
                            />
                            <ActivityCard
                                title="Last Auth Sign-In"
                                value={formatDate(profile?.last_sign_in_at)}
                                icon={<CheckCircle size={20} />}
                                color="blue"
                            />
                            <ActivityCard
                                title="Email Status"
                                value={profile?.email_confirmed ? '✓ Verified' : '✗ Not Verified'}
                                icon={<Mail size={20} />}
                                color={profile?.email_confirmed ? 'green' : 'red'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const FormField = ({ icon, label, value, onChange, disabled, type = 'text', placeholder }) => (
    <div>
        <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">{label}</label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">{icon}</span>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition ${disabled
                    ? 'bg-white/2 border-white/5 text-white/40 cursor-default'
                    : 'bg-transparent border-white/10 text-white focus:outline-none focus:border-accent'
                    }`}
            />
        </div>
    </div>
);

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 text-white/40 text-xs shrink-0">
            {icon}
            {label}
        </span>
        <span className="text-white text-xs text-right">{value || '—'}</span>
    </div>
);

const ActivityCard = ({ title, value, icon, color }) => {
    const colorMap = {
        accent: 'text-accent bg-accent/10',
        green: 'text-green-400 bg-green-500/10',
        blue: 'text-blue-400 bg-blue-500/10',
        red: 'text-red-400 bg-red-500/10',
    };
    return (
        <div className="bg-transparent border border-white/5 rounded-xl p-4">
            <div className={`${colorMap[color].split(' ')[0]} mb-3`}>
                {icon}
            </div>
            <p className="text-white/40 text-xs uppercase tracking-wider">{title}</p>
            <p className="text-white font-medium text-sm mt-1">{value}</p>
        </div>
    );
};

export default AdminProfilePage;
