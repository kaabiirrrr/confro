import { useState } from 'react';
import { Users, Shield, FileText, Map as MapIcon, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

import RoleBuilder from '../components/RoleBuilder';
import AuditLogsViewer from '../components/AuditLogsViewer';
import AdminSessionMap from '../components/AdminSessionMap';
import AdminIdentityManager from '../components/AdminIdentityManager';

const TABS = [
    { id: 'users',    label: 'Admins & Access', icon: Users },
    { id: 'roles',    label: 'Role Builder',     icon: Shield },
    { id: 'audit',    label: 'Audit Logs',       icon: FileText },
    { id: 'sessions', label: 'Command Center',   icon: MapIcon },
];

const AdminManagementPage = () => {
    const [activeTab, setActiveTab] = useState('users');

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between sm:block">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <img src="/Icons/icons8-critical-thinking-80.png" alt="Admin" className="w-7 h-7 object-contain" />
                            Enterprise IAM System
                        </h1>
                        <p className="text-slate-500 dark:text-white/40 text-xs mt-1 hidden sm:block">
                            Manage role-based access control (RBAC), enforce security policies, view active sessions, and audit administrative activity
                        </p>
                    </div>
                </div>
                <p className="text-slate-500 dark:text-white/40 text-xs sm:hidden">
                    Manage RBAC, security policies, sessions, and audit logs
                </p>
            </div>

            <div className="flex justify-between sm:justify-start items-center gap-1 sm:gap-6 border-b border-slate-200 dark:border-white/10 w-full overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 sm:flex-none flex justify-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'text-accent'
                                : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div layoutId="iamTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'users'    && <AdminIdentityManager />}
                {activeTab === 'roles'    && <RoleBuilder />}
                {activeTab === 'audit'    && <AuditLogsViewer />}
                {activeTab === 'sessions' && <AdminSessionMap />}
            </div>
        </div>
    );
};

export default AdminManagementPage;
