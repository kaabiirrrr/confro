import React, { useState } from 'react';
import { ShieldAlert, Users, Shield, FileText, Map as MapIcon, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

// Import our new sub-components
import RoleBuilder from '../components/RoleBuilder';
import AuditLogsViewer from '../components/AuditLogsViewer';
import AdminSessionMap from '../components/AdminSessionMap';
import AdminIdentityManager from '../components/AdminIdentityManager';

const AdminManagementPage = () => {
    const [activeTab, setActiveTab] = useState('users');

    const tabs = [
        { id: 'users', label: 'Admins & Access', icon: Users },
        { id: 'roles', label: 'Role Builder', icon: Shield },
        { id: 'audit', label: 'Audit Logs', icon: FileText },
        { id: 'sessions', label: 'Command Center', icon: MapIcon },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
            {/* IAM Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <img src="/Icons/icons8-critical-thinking-80.png" className="w-10 h-10 object-contain" alt="Admin" />
                        Enterprise IAM System
                    </h1>
                    <p className="text-white/40 text-xs mt-2 max-w-2xl">
                        Manage role-based access control (RBAC), enforce security policies, view active sessions, and audit administrative activity across the platform.
                    </p>
                </motion.div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto custom-scrollbar border-b border-white/10 mb-8">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-4 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                                isActive 
                                ? 'text-accent' 
                                : 'text-white/40 hover:text-white'
                            }`}
                        >
                            {tab.label}
                            {isActive && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 w-full h-[2px] bg-accent" 
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content Area */}
            <div className="min-h-[600px]">
                {activeTab === 'users' && <AdminIdentityManager />}

                {activeTab === 'roles' && <RoleBuilder />}
                {activeTab === 'audit' && <AuditLogsViewer />}
                {activeTab === 'sessions' && <AdminSessionMap />}
            </div>
        </div>
    );
};

export default AdminManagementPage;
