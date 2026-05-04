import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Briefcase, FileText,
    FileSignature, CreditCard, AlertOctagon,
    BarChart3, Bell, ShieldAlert, Settings, LogOut,
    ShieldCheck, HandCoins, ScrollText, Tag, Megaphone, UserSearch,
    UserCircle, Sun, Moon, HelpCircle, Menu, X, Ticket
} from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';
import NotificationDropdown from '../../layouts/components/dropdown/NotificationDropdown';
import { fetchUnifiedNotifications, getUnifiedUnreadCount } from '../../services/notificationService';
import { fetchAdminProfile } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import HelpSupportModal from '../../components/shared/HelpSupportModal';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [openNotifications, setOpenNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [adminProfile, setAdminProfile] = useState(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    
    // Custom Tooltip State
    const [tooltip, setTooltip] = useState({ visible: false, text: '', top: 0, left: 0 });

    const handleMouseEnter = (e, label) => {
        if (isSidebarOpen) return;
        const rect = e.currentTarget.getBoundingClientRect();
        // Centers tooltip vertically with the item, and places it to the right
        setTooltip({
            visible: true,
            text: label,
            top: rect.top + (rect.height / 2),
            left: rect.right + 10
        });
    };

    const handleMouseLeave = () => {
        setTooltip(prev => ({ ...prev, visible: false }));
    };

    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    // Get current role from profile or Fallback to local storage
    const currentRole = adminProfile?.role || JSON.parse(localStorage.getItem('user'))?.role || 'ADMIN';

    useEffect(() => {
        const loadUnreadCount = async () => {
            const data = await fetchUnifiedNotifications(currentRole);
            setUnreadCount(getUnifiedUnreadCount(data));
        };
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [currentRole]);

    // Load real admin profile for topbar
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const result = await fetchAdminProfile();
                if (result.success) setAdminProfile(result.data);
            } catch (err) {
                // Silently fall back to defaults
            }
        };
        loadProfile();
    }, []);

    const handleLogout = async () => {
        navigate('/');
        setTimeout(async () => {
            await logout();
        }, 100);
    };

    const getInitials = (name, email) => {
        if (name && name.trim()) return name.trim()[0].toUpperCase();
        if (email) return email[0].toUpperCase();
        return 'A';
    };

    const allNavItems = [
        { path: '/admin/dashboard', icon: <img src="/Icons/icons8-dashboard-96.png" alt="Dashboard" className="w-6 h-6 object-contain" />, label: 'Dashboard', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/users', icon: <img src="/Icons/icons8-user-100.png" alt="Users" className="w-6 h-6 object-contain" />, label: 'Users', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/client-verification', icon: <img src="/Icons/icons8-verification-100.png" alt="Client Verifications" className="w-6 h-6 object-contain" />, label: 'Client Verification', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/freelancer-verification', icon: <img src="/Icons/icons8-verification-100.png" alt="Freelancer Verifications" className="w-6 h-6 object-contain" />, label: 'Freelancer Verification', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/jobs', icon: <img src="/Icons/icons8-bag-80.png" alt="Jobs" className="w-6 h-6 object-contain" />, label: 'Jobs', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/proposals', icon: <img src="/Icons/icons8-new-job-100.png" alt="Proposals" className="w-6 h-6 object-contain" />, label: 'Proposals', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/contracts', icon: <img src="/Icons/icons8-contract-60.png" alt="Contracts" className="w-6 h-6 object-contain" />, label: 'Contracts', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/payments', icon: <img src="/Icons/icons8-payments-64.png" alt="Revenue" className="w-6 h-6 object-contain" />, label: 'Revenue & Payments', roles: ['ADMIN', 'SUPER_ADMIN', 'FINANCE_ADMIN'] },
        { path: '/admin/withdrawals', icon: <img src="/Icons/icons8-withdrawal-80.png" alt="Withdrawals" className="w-6 h-6 object-contain" />, label: 'Withdrawals', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/connects', icon: <HandCoins size={18} className="text-accent" />, label: 'Connect Economy', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/disputes', icon: <img src="/Icons/icons8-disputes-100.png" alt="Disputes" className="w-6 h-6 object-contain" />, label: 'Disputes', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/reports', icon: <img src="/Icons/icons8-reports-100.png" alt="Reports" className="w-6 h-6 object-contain" />, label: 'Reports', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/problems', icon: <img src="/Icons/icons8-problem-solution-66.png" alt="User Problems" className="w-6 h-6 object-contain" />, label: 'User Problems', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/support-tickets', icon: <img src="/Icons/icons8-question-mark-100.png" alt="Support Tickets" className="w-6 h-6 object-contain" />, label: 'Support Tickets', roles: ['ADMIN', 'SUPER_ADMIN', 'SUPPORT_ADMIN'] },
        { path: '/admin/skills', icon: <img src="/Icons/icons8-skills-100.png" alt="Skills" className="w-6 h-6 object-contain" />, label: 'Skills', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/offers', icon: <img src="/Icons/icons8-offer-100.png" alt="Offers" className="w-6 h-6 object-contain" />, label: 'Offers', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/announcements', icon: <Megaphone size={18} className="text-blue-400" />, label: 'Announcements', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/faqs', icon: <img src="/Icons/icons8-faq-80.png" alt="FAQ Management" className="w-6 h-6 object-contain" />, label: 'FAQ Management', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/reviews', icon: <img src="/Icons/icons8-review-100.png" alt="Reviews" className="w-6 h-6 object-contain" />, label: 'Reviews', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/fraud', icon: <img src="/Icons/icons8-fraud-80.png" alt="Fraud Detection" className="w-6 h-6 object-contain" />, label: 'Fraud Detection', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/admin-management', icon: <img src="/Icons/icons8-critical-thinking-80.png" alt="Admin Management" className="w-6 h-6 object-contain" />, label: 'Admin Management', roles: ['SUPER_ADMIN'] },
        { path: '/admin/insights', icon: <img src="/Icons/icons8-leader-100.png" alt="Admin Insights" className="w-6 h-6 object-contain" />, label: 'Admin Insights', roles: ['SUPER_ADMIN'] },
        { path: '/admin/admin-logs', icon: <img src="/Icons/icons8-logs-64.png" alt="Admin Logs" className="w-6 h-6 object-contain" />, label: 'Admin Logs', roles: ['SUPER_ADMIN'] },
        { path: '/admin/plans', icon: <img src="/Icons/icons8-membership-card-100.png" alt="Plans" className="w-6 h-6 object-contain" />, label: 'Membership Plans', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/lottery', icon: <Ticket size={18} className="text-accent" />, label: 'Lottery', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/settings', icon: <img src="/Icons/icons8-setting-100.png" alt="Settings" className="w-6 h-6 object-contain" />, label: 'Settings', roles: ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'FINANCE_ADMIN', 'SUPPORT_ADMIN'] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(currentRole));

    return (
        <div className="flex h-screen bg-primary text-secondary overflow-hidden font-sans">

            {/* Mobile overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-[400] bg-black/50 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar — desktop: collapsible, mobile: slide-in drawer */}
            <aside
                className={`
                    ${isSidebarOpen ? 'w-72' : 'w-20'}
                    bg-transparent transition-all duration-300 flex-col z-20
                    hidden md:flex
                `}
            >
                <div className={`h-16 flex items-center ${isSidebarOpen ? 'justify-between px-6' : 'justify-center px-0'}`}>
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2">
                            <img src="/Blue-Logo-Admin-Full%20copy.png" alt="Connect Logo" className="h-10 object-contain" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src="/Blue-Logo-Admin%20copy.png" alt="Connect Logo" className="w-10 h-10 object-contain" />
                        </div>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
                    <ul className="space-y-1 px-4">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                                    onMouseLeave={handleMouseLeave}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group ${isActive
                                            ? 'text-accent font-bold'
                                            : 'text-slate-400 hover:text-white'
                                        }`
                                    }
                                >
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className={`py-4 space-y-1 ${isSidebarOpen ? 'px-6' : 'px-4'}`}>
                    <NavLink
                        to="/admin/profile"
                        onMouseEnter={(e) => handleMouseEnter(e, "My Profile")}
                        onMouseLeave={handleMouseLeave}
                        className={({ isActive }) =>
                            `flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all relative group ${isActive
                                ? 'text-accent font-bold'
                                : 'text-slate-400 hover:text-white'
                            } ${!isSidebarOpen ? 'justify-center' : ''}`
                        }
                    >
                        <img src="/Icons/icons8-account-male-96.png" alt="Profile" className="w-6 h-6 flex-shrink-0 object-contain" />
                        {isSidebarOpen && <span>My Profile</span>}
                    </NavLink>

                    <button
                        onClick={handleLogout}
                        onMouseEnter={(e) => handleMouseEnter(e, "Logout")}
                        onMouseLeave={handleMouseLeave}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 !text-red-600 hover:!text-red-700 rounded-xl transition-all font-medium relative group ${!isSidebarOpen ? 'justify-center' : ''}`}
                    >
                        <img src="/Icons/icons8-export-64.png" alt="Logout" className="w-6 h-6 flex-shrink-0 object-contain"
                            style={{ filter: 'invert(21%) sepia(100%) saturate(7483%) hue-rotate(359deg) brightness(94%) contrast(117%)' }} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Drawer */}
            <aside
                className={`fixed top-0 left-0 h-full z-[500] w-[280px] bg-primary border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
                    mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
                    <img src="/Blue-Logo-Admin-Full%20copy.png" alt="Connect Logo" className="h-6 object-contain" />
                    <button onClick={() => setMobileSidebarOpen(false)} className="text-white/50 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar">
                    <ul className="space-y-0.5 px-3">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    onClick={() => setMobileSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm ${isActive
                                            ? 'text-accent font-bold bg-accent/5'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
                                    <span className="whitespace-nowrap">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="py-3 px-3 space-y-0.5 border-t border-white/10 flex-shrink-0">
                    <NavLink to="/admin/profile" onClick={() => setMobileSidebarOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-sm ${isActive ? 'text-accent font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <img src="/Icons/icons8-account-male-96.png" alt="Profile" className="w-5 h-5 flex-shrink-0 object-contain" />
                        <span>My Profile</span>
                    </NavLink>
                    <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 !text-red-500 hover:!text-red-400 rounded-xl transition-all font-medium text-sm hover:bg-red-500/5">
                        <img src="/Icons/icons8-export-64.png" alt="Logout" className="w-5 h-5 flex-shrink-0 object-contain"
                            style={{ filter: 'invert(21%) sepia(100%) saturate(7483%) hue-rotate(359deg) brightness(94%) contrast(117%)' }} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-14 md:h-16 bg-transparent flex items-center justify-between px-4 md:px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="md:hidden flex items-center justify-center text-accent hover:scale-110 transition-transform duration-200"
                        >
                            <Menu size={22} />
                        </button>
                        {/* Desktop collapse toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden md:flex items-center justify-center text-accent hover:scale-110 transition-transform duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7" /></svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Theme Toggle */}
                        <button onClick={toggleTheme} className="p-1.5 md:p-2 rounded-full transition-colors duration-300 text-white/60 hover:text-accent cursor-pointer" title="Toggle Theme">
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        
                        {/* Help Icon */}
                        <button onClick={() => setIsHelpOpen(true)} className="p-1.5 md:p-2 rounded-full transition-all duration-300 text-white/60 hover:text-accent hover:bg-white/5 cursor-pointer" title="Help & Support">
                            <HelpCircle size={18} />
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenNotifications(!openNotifications)}
                                className={`relative p-1.5 md:p-2 rounded-full transition-all duration-300 ${openNotifications ? 'bg-accent/20 text-accent' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                            >
                                <Bell size={16} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center z-10 shadow-lg">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {openNotifications && (
                                <div className="absolute right-0 top-full">
                                    <NotificationDropdown role={currentRole} />
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <NavLink to="/admin/profile" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition group">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs md:text-sm font-bold text-white group-hover:text-accent transition-colors">
                                    {adminProfile?.name || 'Admin User'}
                                </p>
                                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/20">
                                    {adminProfile?.role?.replace(/_/g, ' ') || 'Super Admin'}
                                </p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex items-center justify-center bg-white/5 shadow-sm transition-transform group-hover:scale-105">
                                {adminProfile?.photo_url ? (
                                    <img src={adminProfile.photo_url} alt={adminProfile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-accent font-bold text-xs md:text-sm">
                                        {getInitials(adminProfile?.name, adminProfile?.email)}
                                    </span>
                                )}
                            </div>
                        </NavLink>
                    </div>
                </header>

                {/* Security Warning Banner */}
                {adminProfile?.must_change_password && (
                    <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 mb-2 p-3 sm:p-4 bg-rose-500/10 border border-rose-500/20 rounded-[16px] sm:rounded-[20px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 z-50 sticky top-14 md:top-4 shadow-xl shadow-rose-500/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 animate-pulse flex-shrink-0">
                                <ShieldAlert size={16} />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-rose-100">Security Action Required</h4>
                                <p className="text-[10px] sm:text-[11px] text-rose-100/60 font-medium">Your password was set by a Super Admin. Please update it now.</p>
                            </div>
                        </div>
                        <NavLink to="/admin/profile" className="px-4 sm:px-5 py-1.5 sm:py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-full transition-all border border-rose-500/20 whitespace-nowrap">
                            Change Password
                        </NavLink>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-auto px-4 md:px-6 py-4 md:py-8 bg-primary custom-scrollbar admin-panel">
                    <Outlet />
                </main>
            </div>
            <HelpSupportModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

            {/* Global Tooltip — desktop only */}
            {tooltip.visible && !isSidebarOpen && (
                <div 
                    className={`fixed z-[9999] px-3 py-1.5 backdrop-blur-xl border rounded-xl pointer-events-none text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-2xl transition-opacity duration-150 hidden md:block ${
                        isDark 
                            ? 'bg-[#0B1121]/90 border-white/10 text-white/90' 
                            : 'bg-white/95 border-slate-200/60 text-slate-800 drop-shadow-sm'
                    }`}
                    style={{ top: tooltip.top, left: tooltip.left, transform: 'translateY(-50%)' }}
                >
                    {tooltip.text}
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
