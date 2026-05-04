import { useState, useEffect } from 'react';
import { getJobDeliveries } from '../../../services/apiService';
import DeliverySubmitForm from './DeliverySubmitForm';
import DeliveryList from './DeliveryList';
import InfinityLoader from '../../common/InfinityLoader';
import { useAuth } from '../../../context/AuthContext';

export default function WorkDeliverySystem({ contractId, jobId, isClient }) {
    const [deliveries, setDeliveries] = useState([]);
    const [groupedDeliveries, setGroupedDeliveries] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const { role } = useAuth();

    useEffect(() => {
        if (jobId) fetchDeliveries();
    }, [jobId]);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            const res = await getJobDeliveries(jobId);
            setDeliveries(res.data || []);
            if (res.grouped) {
                setGroupedDeliveries(res.grouped);
            }
        } catch (err) {
            console.error('Failed to fetch deliveries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewDelivery = (newDelivery) => {
        setDeliveries(prev => [newDelivery, ...prev]);
        fetchDeliveries(); // Refresh to ensure backend analytics sync
    };

    const handleUpdate = (updatedDelivery) => {
        setDeliveries(prev => prev.map(d => d.id === updatedDelivery.id ? { ...d, ...updatedDelivery } : d));
        fetchDeliveries();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <InfinityLoader/>
            </div>
        );
    }

    const filteredDeliveries = activeTab === 'all' 
        ? deliveries 
        : (groupedDeliveries?.[activeTab]?.deliveries || []);

    const memberIds = groupedDeliveries ? Object.keys(groupedDeliveries) : [];

    return (
        <div className="space-y-6 md:space-y-10 px-0 sm:px-2">
            {/* 1. Freelancer Submission Form (Only if active and not already approved) */}
            {!isClient && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <DeliverySubmitForm 
                        contractId={contractId} 
                        jobId={jobId} 
                        onSuccess={handleNewDelivery} 
                    />
                </div>
            )}

            {/* 2. Delivery History & Review */}
            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 px-1">
                    <div className="space-y-1">
                        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Project Deliveries</h2>
                        <p className="text-[10px] text-white/20 font-medium md:hidden">Track and review project milestones</p>
                    </div>
                    
                    {/* Role Tabs for Client */}
                    {isClient && memberIds.length > 1 && (
                        <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto scrollbar-hide shrink-0 max-w-full">
                            <button 
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                                    activeTab === 'all' ? 'bg-accent text-white shadow-lg' : 'text-light-text/30 hover:text-white'
                                }`}
                            >
                                All Timeline
                            </button>
                            {memberIds.map(fid => (
                                <button 
                                    key={fid}
                                    onClick={() => setActiveTab(fid)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                                        activeTab === fid ? 'bg-accent text-white shadow-lg' : 'text-light-text/30 hover:text-white'
                                    }`}
                                >
                                    {groupedDeliveries[fid].role}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <DeliveryList 
                    deliveries={filteredDeliveries} 
                    isClient={isClient} 
                    onUpdate={handleUpdate} 
                />
            </div>
        </div>
    );
}
