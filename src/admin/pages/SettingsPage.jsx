import { useState, useEffect } from 'react';
import { Save, Settings2, Percent, Users } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import CustomDropdown from '../../components/ui/CustomDropdown';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        platform_commission: '10',
        maintenance_mode: 'false',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const result = await adminService.fetchPlatformSettings();
            if (result.success) {
                setSettings(prev => ({ ...prev, ...result.data }));
            }
        } catch (err) {
            console.error('Failed to fetch settings', err);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (key, value, description) => {
        setIsSaving(true);
        try {
            let result;
            if (key === 'platform_commission') {
                result = await adminService.updateCommission(parseFloat(value));
            } else {
                result = await adminService.updatePlatformSetting(key, value);
            }

            if (result.success) {
                toast.success(result.message || 'Setting updated');
                setSettings(prev => ({ ...prev, [key]: value }));
            }
        } catch (err) {
            toast.error('Failed to update setting');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-white/50">Loading configurations...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-lg sm:text-2xl font-bold text-white mb-8 flex items-center gap-2">
                <img src="/Icons/icons8-setting-100.png" alt="Settings" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                Platform Configuration
            </h1>

            <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <Settings2 className="text-accent" />
                        <div>
                            <h2 className="text-lg font-semibold text-white">Global Settings</h2>
                            <p className="text-sm text-white/50 mt-1">Changes applied here affect the entire marketplace.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-8">

                    {/* Commission Setting */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-8">
                        <div className="max-w-md">
                            <h3 className="text-white font-medium flex items-center gap-2">
                                <Percent size={16} className="text-white/50" />
                                Base Commission Rate
                            </h3>
                            <p className="text-sm text-white/50 mt-1">
                                The default percentage cut taken from successful contracts. For example, enter '0.10' for 10% or '0.15' for 15%.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={settings.platform_commission}
                                onChange={(e) => setSettings({ ...settings, platform_commission: e.target.value })}
                                className="w-24 bg-primary border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent outline-none"
                            />
                            <button
                                onClick={() => handleSave('platform_commission', settings.platform_commission, 'Global commission rate for contracts')}
                                disabled={isSaving}
                                className="bg-accent/20 hover:bg-accent text-accent hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Update
                            </button>
                        </div>
                    </div>

                    {/* Maintenance Mode */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="max-w-md">
                            <h3 className="text-white font-medium flex items-center gap-2">
                                Maintenance Mode
                            </h3>
                            <p className="text-sm text-white/50 mt-1">
                                When toggled on, non-admin users will see a maintenance page and API functionality will be restricted. Enter 'true' or 'false'.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <CustomDropdown
                                options={[
                                    { label: 'Off', value: 'false' },
                                    { label: 'On', value: 'true' }
                                ]}
                                value={settings.maintenance_mode}
                                onChange={(val) => setSettings({ ...settings, maintenance_mode: val })}
                                className="w-24"
                            />
                            <button
                                onClick={() => handleSave('maintenance_mode', settings.maintenance_mode, 'Put platform in maintenance mode')}
                                disabled={isSaving}
                                className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Admin Account Settings */}
            <div className="bg-transparent border border-white/10 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <Users className="text-accent" />
                        <div>
                            <h2 className="text-lg font-semibold text-white">Admin Account Settings</h2>
                            <p className="text-sm text-white/50 mt-1">Update your own administrator credentials.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">New Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter new email"
                                id="adminEmail"
                                className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">New Password</label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                id="adminPassword"
                                className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={async () => {
                                const email = document.getElementById('adminEmail').value;
                                const password = document.getElementById('adminPassword').value;

                                if (!email && !password) {
                                    alert('Please provide at least one field to update');
                                    return;
                                }

                                setIsSaving(true);
                                try {
                                    const result = await adminService.updateAdminProfile({ email, password });
                                    if (result.success) {
                                        toast.success('Account credentials updated successfully.');
                                        document.getElementById('adminEmail').value = '';
                                        document.getElementById('adminPassword').value = '';
                                    }
                                } catch (err) {
                                    toast.error(err.response?.data?.message || 'Failed to update account credentials');
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                            disabled={isSaving}
                            className="bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Save Account Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
