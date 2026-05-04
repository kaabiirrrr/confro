import { useState } from 'react';
import { Send, Users, Briefcase, Globe } from 'lucide-react';
import { sendBroadcast } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const NotificationsPage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetRole, setTargetRole] = useState('ALL');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                title,
                content,
                type: 'SYSTEM',
                target_role: targetRole === 'ALL' ? null : targetRole
            };

            const result = await sendBroadcast(payload);

            if (result.success) {
                toast.success(result.message || 'Broadcast sent successfully!');
                setTitle('');
                setContent('');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send broadcast');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Send size={22} className="text-accent" />
                    Broadcast Notifications
                </h1>
                <p className="text-white/40 text-xs mt-1">Send platform-wide announcements to all users or specific roles</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Information Card */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 text-accent-content">
                        <Globe className="text-accent mb-3" size={24} />
                        <h3 className="font-semibold text-white mb-2">Global Announcements</h3>
                        <p className="text-sm text-white/70 leading-relaxed">
                            Use this tool to send platform-wide announcements. Notifications will appear in the target users' in-app notification bell.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="md:col-span-2 bg-secondary border border-border rounded-xl p-6 shadow-sm">
                    <form onSubmit={handleSend} className="space-y-5">

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Target Audience</label>
                            <div className="grid grid-cols-3 gap-3">
                                <label className={`border rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${targetRole === 'ALL' ? 'border-accent bg-accent/10' : 'border-white/10 hover:border-white/30 bg-primary'}`}>
                                    <input type="radio" name="targetRole" value="ALL" checked={targetRole === 'ALL'} onChange={(e) => setTargetRole(e.target.value)} className="hidden" />
                                    <Globe size={20} className={targetRole === 'ALL' ? 'text-accent' : 'text-white/50'} />
                                    <span className={`text-xs font-medium ${targetRole === 'ALL' ? 'text-accent' : 'text-white/50'}`}>Everyone</span>
                                </label>
                                <label className={`border rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${targetRole === 'FREELANCER' ? 'border-accent bg-accent/10' : 'border-white/10 hover:border-white/30 bg-primary'}`}>
                                    <input type="radio" name="targetRole" value="FREELANCER" checked={targetRole === 'FREELANCER'} onChange={(e) => setTargetRole(e.target.value)} className="hidden" />
                                    <Briefcase size={20} className={targetRole === 'FREELANCER' ? 'text-accent' : 'text-white/50'} />
                                    <span className={`text-xs font-medium ${targetRole === 'FREELANCER' ? 'text-accent' : 'text-white/50'}`}>Freelancers</span>
                                </label>
                                <label className={`border rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${targetRole === 'CLIENT' ? 'border-accent bg-accent/10' : 'border-white/10 hover:border-white/30 bg-primary'}`}>
                                    <input type="radio" name="targetRole" value="CLIENT" checked={targetRole === 'CLIENT'} onChange={(e) => setTargetRole(e.target.value)} className="hidden" />
                                    <Users size={20} className={targetRole === 'CLIENT' ? 'text-accent' : 'text-white/50'} />
                                    <span className={`text-xs font-medium ${targetRole === 'CLIENT' ? 'text-accent' : 'text-white/50'}`}>Clients</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Notification Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Scheduled Maintenance Downtime"
                                className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Message Content</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your full announcement here..."
                                rows="5"
                                className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent"
                                required
                            ></textarea>
                            <p className="text-xs text-white/40 mt-1">Markdown is not supported yet. Plain text only.</p>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || !title || !content}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Send size={18} />
                                {isLoading ? 'Broadcasting...' : 'Broadcast Notification'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
