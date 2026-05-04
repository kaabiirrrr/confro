import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight, Plus, Trash2,
  TrendingUp, Wallet, IndianRupee, ArrowUpRight, AlertCircle, CheckCircle2, History, Filter
} from 'lucide-react';
import { formatINR } from '../../../utils/currencyUtils';
import { getMyContracts, getWorkDiary, logWorkDiary, deleteWorkDiaryEntry } from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../common/InfinityLoader';
import CustomDropdown from '../../ui/CustomDropdown';

/* ─── Status Config ────────────────────────────────────────── */
const STATUS_CFG = {
  logged: { cls: 'bg-green-500/10 text-green-400 border-green-500/20', Icon: CheckCircle2 },
  pending: { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', Icon: Clock },
  reviewed: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', Icon: CheckCircle },
  rejected: { cls: 'bg-red-500/10 text-red-400 border-red-500/20', Icon: AlertCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status?.toLowerCase()] || { cls: 'bg-white/5 text-light-text/30 border-white/10', Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${cfg.cls}`}>
      <cfg.Icon size={12} />
      {status || 'Logged'}
    </span>
  );
};

const WorkDiary = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);

  // Form state
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedContract) {
      fetchEntries(selectedContract.id);
    }
  }, [selectedContract]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await getMyContracts();
      if (response.success) {
        const hourlyContracts = (response.data || []).filter(c =>
          c.status === 'ACTIVE' || c.status === 'IN_PROGRESS'
        );
        setContracts(hourlyContracts);
        if (hourlyContracts.length > 0) {
          setSelectedContract(hourlyContracts[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load active hourly contracts');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async (contractId) => {
    try {
      const response = await getWorkDiary({ contract_id: contractId });
      if (response.success) {
        setEntries(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching work diary:', error);
      toast.error('Failed to load work diary entries');
    }
  };

  // Group entries by day for the weekly view
  const weeklySummary = entries.reduce((acc, entry) => {
    const day = new Date(entry.work_date).toLocaleDateString('en-US', { weekday: 'long' });
    acc[day] = (acc[day] || 0) + Number(entry.hours);
    return acc;
  }, {});

  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);
  const estimatedEarnings = totalHours * (selectedContract?.agreed_rate || 0);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!selectedContract) {
      return toast.error('You must have an active contract to log work. Please check your Contract History or Proposals.');
    }

    if (!hours || isNaN(hours) || Number(hours) <= 0 || Number(hours) > 24) {
      return toast.error('Please enter valid hours (0.5 - 24.0)');
    }
    if (!description.trim() || description.trim().length < 5) {
      return toast.error('Please enter a detailed description (min 5 chars)');
    }

    try {
      setLogging(true);

      const response = await logWorkDiary({
        contract_id: selectedContract.id,
        work_date: workDate,
        hours: Number(hours),
        description: description.trim()
      });

      if (response.success) {
        toast.success('Work logged successfully');
        setHours('');
        setDescription('');
        setShowAddForm(false);
        fetchEntries(selectedContract.id);
      }
    } catch (error) {
      console.error('Error logging work:', error);
      toast.error(error.response?.data?.message || 'Failed to log work');
    } finally {
      setLogging(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this work entry?')) return;

    try {
      const response = await deleteWorkDiaryEntry(id);
      if (response.success) {
        toast.success('Entry deleted');
        fetchEntries(selectedContract.id);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <InfinityLoader/>
        <p className="text-light-text/60 animate-pulse">Loading work diary...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1630px] mx-auto space-y-4 sm:space-y-6 pb-10 animate-in ml-0 sm:ml-10 mr-0 sm:mr-6 fade-in slide-in-from-bottom-4 duration-500 font-sans tracking-tight"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 mb-6 sm:mb-12">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Hourly Work Diary</h1>
          <p className="text-light-text/60 text-xs sm:text-sm mt-1">Log and track your hourly progress on active projects.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto px-6 sm:px-8 h-10 sm:h-12 bg-accent hover:bg-accent/90 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] rounded-full transition active:scale-[0.98]"
        >
          {showAddForm ? 'View Summary' : 'Log Hours'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-16">
        {[
          { label: 'Total Period Hours', value: `${totalHours.toFixed(1)} hrs` },
          { label: 'Estimated Earnings', value: formatINR(estimatedEarnings) },
          { label: 'Current Rate', value: `${formatINR(selectedContract?.agreed_rate || 0)}/hr` },
          { label: 'Logged Entries', value: entries.length }
        ].map((stat, i) => (
          <div key={i} className="bg-transparent border border-white/5 p-4 sm:p-8 rounded-[16px] sm:rounded-[24px] space-y-3 sm:space-y-6 hover:border-accent/30 transition-all group">
            <div className="w-15 h-15 sm:w-15 sm:h-15 rounded-xl flex items-center justify-center p-2 sm:p-2.5 group-hover:scale-110 transition-transform">
              <img src="/Icons/credit.png" alt="icon" className="w-full h-full object-contain filter invert opacity-80" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-light-text/30 mb-1 sm:mb-2">{stat.label}</p>
              <h4 className="text-xl sm:text-3xl font-bold text-white tracking-tighter">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" />
            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/40">Recent Activity</h3>
          </div>
          <div className="flex items-center w-full sm:w-auto">
            <div className="flex-1 sm:flex-none sm:min-w-[280px]">
              <CustomDropdown
                options={contracts.map(c => ({
                  label: c.job?.title || 'Unknown Contract',
                  value: c.id
                }))}
                value={selectedContract?.id || ''}
                onChange={(val) => {
                  const c = contracts.find(cn => cn.id === val);
                  if (c) setSelectedContract(c);
                }}
                placeholder="All Contracts"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {showAddForm ? (
          <div className="border border-light-text/10 dark:border-white/5 rounded-[24px] sm:rounded-[40px] p-5 sm:p-10 animate-in zoom-in-95 duration-500 bg-white/[0.01] shadow-sm">
            <h3 className="text-[12px] sm:text-[14px] font-bold text-white mb-6 sm:mb-10 tracking-tight uppercase tracking-[0.2em] opacity-40">Log New Work Entry</h3>
            <form onSubmit={handleAddEntry} className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] font-bold text-light-text/30 uppercase tracking-[0.2em] ml-1">Work Date</label>
                  <input
                    type="date"
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full bg-secondary/30 dark:bg-secondary/50 border border-light-text/10 dark:border-white/5 rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 text-light-text dark:text-white focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] font-bold text-light-text/30 uppercase tracking-[0.2em] ml-1">Hours Worked</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-secondary/30 dark:bg-secondary/50 border border-light-text/10 dark:border-white/5 rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 text-light-text dark:text-white focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all font-medium text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <label className="text-[10px] font-bold text-light-text/30 uppercase tracking-[0.2em] ml-1">Detailed Memo</label>
                <textarea
                  placeholder="Briefly describe what you accomplished..."
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-secondary/30 dark:bg-secondary/50 border border-light-text/10 dark:border-white/5 rounded-2xl px-5 sm:px-6 py-4 sm:py-5 text-light-text dark:text-white focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all font-medium text-sm sm:text-[15px] resize-none leading-relaxed"
                ></textarea>
              </div>
              <div className="pt-4 sm:pt-6 flex flex-row gap-3 sm:gap-4">
                <button type="submit" disabled={logging}
                  className="flex-[2] h-12 sm:h-14 bg-accent text-white rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] hover:bg-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-accent/20 active:scale-95"
                >
                  {logging && <InfinityLoader/>}
                  <span className="truncate">{logging ? 'Saving...' : 'Submit Log'}</span>
                </button>
                <button type="button" onClick={() => setShowAddForm(false)}
                  className="flex-1 h-12 sm:h-14 bg-secondary/30 dark:bg-white/5 text-light-text border border-light-text/10 rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] hover:bg-secondary/50 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-transparent border border-white/10 rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-sm">
            {/* Desktop table header */}
            <div className="hidden sm:grid grid-cols-[1fr_1fr_120px_130px_100px] gap-4 px-10 py-6 border-b border-white/5 text-[10px] font-bold text-light-text/20 uppercase tracking-widest">
              <span>Date / Project</span>
              <span>Memo / Description</span>
              <span className="text-right">Hours</span>
              <span className="text-right">Status</span>
              <span className="text-right pr-4">Action</span>
            </div>

            <div className="divide-y divide-white/5">
              {entries.length === 0 ? (
                <div className="py-16 sm:py-32 text-center">
                  <History size={36} className="mx-auto mb-4 sm:mb-6 text-white/5" strokeWidth={1} />
                  <p className="text-light-text/30 font-bold text-xs sm:text-sm uppercase tracking-widest">No work entries found</p>
                  <button onClick={() => setShowAddForm(true)} className="mt-4 text-[10px] font-bold text-accent uppercase tracking-[0.2em] hover:text-accent/80 transition-all underline underline-offset-8 decoration-accent/30">
                    Log your first hour
                  </button>
                </div>
              ) : (
                entries.map((entry) => (
                  <div key={entry.id} className="group">
                    {/* Mobile card layout */}
                    <div className="sm:hidden p-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-sm font-black shrink-0">
                          {(entry.client_name || selectedContract?.job?.title || 'P')[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-xs truncate">{formatDate(entry.work_date)}</p>
                          <p className="text-white/50 text-[11px] line-clamp-1 italic mt-0.5">"{entry.description || 'No description'}"</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-accent font-black text-sm">{entry.hours} hrs</span>
                            <StatusBadge status={entry.status || 'Logged'} />
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 hover:bg-red-500/10 text-red-400/40 hover:text-red-400 rounded-xl transition-all flex-shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {/* Desktop row layout */}
                    <div className="hidden sm:grid grid-cols-[1fr_1fr_120px_130px_100px] gap-4 px-10 py-8 hover:bg-white/[0.02] transition-all items-center">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-sm font-black shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                          {(entry.client_name || selectedContract?.job?.title || 'P')[0]?.toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-white font-bold truncate group-hover:text-accent transition-colors leading-none mb-1.5 uppercase tracking-tighter">{formatDate(entry.work_date)}</span>
                          <span className="text-white/20 text-[10px] font-mono uppercase tracking-tighter truncate">Ref: {entry.id.slice(-8)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-white/60 text-[13px] font-medium leading-relaxed tracking-tight line-clamp-2 italic pr-4">"{entry.description || 'No description provided'}"</p>
                      </div>
                      <span className="text-right text-white font-black text-2xl tracking-tighter">{entry.hours}<span className="text-[10px] text-white/20 font-bold ml-1 uppercase">hrs</span></span>
                      <div className="flex justify-end"><StatusBadge status={entry.status || 'Logged'} /></div>
                      <div className="flex justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDeleteEntry(entry.id)} className="p-2.5 hover:bg-red-500/10 text-red-400/40 hover:text-red-400 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {entries.length > 0 && (
              <div className="p-5 sm:p-8 bg-white/[0.01] border-t border-white/5 text-center">
                <button onClick={() => setShowWeeklyModal(true)} className="text-[10px] sm:text-[11px] font-bold text-accent hover:text-accent/80 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2 sm:gap-3 mx-auto">
                  View Full Weekly Breakdown <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Guidelines */}
        <div className="mt-6 sm:mt-12 border border-white/5 rounded-[20px] sm:rounded-[32px] p-5 sm:p-8 flex items-center justify-between bg-white/[0.01] overflow-hidden">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-1 sm:mb-2 opacity-30">Active Accountability</p>
            <p className="text-xs sm:text-[15px] text-light-text/40 leading-relaxed font-medium max-w-xl">
              Always provide clear memos for your clients. Log time daily to ensure accuracy and faster invoice approvals.
            </p>
          </div>
          <div className="hidden md:block opacity-10"><Clock size={64} strokeWidth={1} /></div>
        </div>
      </div>

      {/* Weekly Summary Modal */}
      {showWeeklyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowWeeklyModal(false)}
          />
          <div className="relative bg-[#0A0D11] border border-white/5 rounded-[40px] p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
            <h3 className="text-[11px] font-bold text-light-text/20 uppercase tracking-[0.2em] mb-10">
              Weekly Breakdown
            </h3>

            <div className="space-y-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="flex items-center justify-between p-4 bg-transparent border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                  <span className="text-[13px] font-bold text-light-text/40 uppercase tracking-widest">{day}</span>
                  <span className="text-[15px] font-black text-white tracking-tighter">{weeklySummary[day] || 0} hrs</span>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-end">
              <span className="text-[11px] font-bold text-light-text/20 uppercase tracking-[0.2em]">Total Week</span>
              <span className="text-3xl font-black text-accent tracking-tighter">{totalHours} hrs</span>
            </div>

            <button
              onClick={() => setShowWeeklyModal(false)}
              className="mt-10 w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all border border-white/5"
            >
              Close Summary
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WorkDiary;
