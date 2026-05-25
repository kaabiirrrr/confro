import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useConnects } from "../../../hooks/useConnects";
import { useAuth } from "../../../context/AuthContext";
import InfinityLoader from "../../common/InfinityLoader";

const CONNECTS_TYPES = [
    { label: "All connects", value: "" },
    { label: "All debits", value: "all_debits" },
    { label: "All connects", value: "all_credits" },
    { label: "Add Connects", value: "Add Connects" },
    { label: "Ad connects", value: "Ad connects" },
    { label: "Purchased", value: "Purchased" },
    { label: "New membership", value: "New membership" },
    { label: "Applied to job", value: "Applied to job" },
    { label: "Free", value: "Free" },
    { label: "Refunded", value: "Refunded" },
    { label: "Rollover", value: "Rollover" },
    { label: "Membership Downgrade", value: "Membership Downgrade" },
    { label: "Membership renewal", value: "Membership renewal" },
    { label: "Membership upgrade", value: "Membership upgrade" },
    { label: "Promotional", value: "Promotional" },
    { label: "Expired", value: "Expired" },
    { label: "Other", value: "Other" },
];

const DATE_RANGES = [
    { label: "All time", value: "" },
    { label: "Last 7 days", value: "7" },
    { label: "Last 30 days", value: "30" },
    { label: "Last 90 days", value: "90" },
];

export default function ConnectsHistory() {
    const { role } = useAuth();
    const isClient = role === 'CLIENT';
    const basePath = isClient ? '/client' : '/freelancer';

    const [typeOpen, setTypeOpen] = useState(false);
    const [dateOpen, setDateOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(CONNECTS_TYPES[0]);
    const [selectedDate, setSelectedDate] = useState(DATE_RANGES[0]);

    const { balance, history, loading, updateFilters } = useConnects({
        typeFilter: CONNECTS_TYPES[0].value,
        dateFilter: DATE_RANGES[0].value
    });

    const typeDropdownRef = useRef(null);
    const dateDropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) setTypeOpen(false);
            if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) setDateOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setTypeOpen(false);
        updateFilters({ typeFilter: type.value });
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setDateOpen(false);
        updateFilters({ dateFilter: date.value });
    };

    return (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 font-sans tracking-tight animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {isClient ? 'Project Connects History' : 'Connects History'}
                    </h1>
                    <div className="flex items-center gap-3 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-1.5 bg-white/[0.02] shrink-0">
                        <span className="text-light-text/40 text-[9px] font-black uppercase tracking-wider">
                            {isClient ? 'Hiring Power' : 'Available Balance'}
                        </span>
                        <span className="text-base font-extrabold text-accent">{balance}</span>
                    </div>
                </div>
                <Link to={`${basePath}/buy-connects`} className="h-9 sm:h-10 shrink-0 flex items-center px-5 sm:px-8 bg-accent text-white font-bold rounded-full transition-all text-[9px] uppercase tracking-[0.2em] hover:bg-accent/90 active:scale-95 shadow-none">
                    {isClient ? 'Refill Connects' : 'Buy Connects'}
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:justify-end items-start sm:items-end gap-4 sm:gap-6 mb-10">
                {/* Connects Type Dropdown */}
                <div className="relative w-full sm:w-64" ref={typeDropdownRef}>
                    <label className="block text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 px-1">Connects Type</label>
                    <button
                        onClick={() => setTypeOpen(!typeOpen)}
                        className={`w-full flex justify-between items-center bg-white/5 border rounded-xl px-4 py-2.5 text-left transition-all ${typeOpen ? 'border-accent/50 bg-white/10' : 'border-white/10 hover:border-white/20'}`}
                    >
                        <span className="text-white text-sm font-semibold">{selectedType.label}</span>
                        <ChevronDown size={16} className={`text-white/40 transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {typeOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-full bg-secondary/95 border border-white/10 rounded-xl z-50 max-h-60 overflow-y-auto backdrop-blur-xl">
                            <div className="p-1.5 space-y-1">
                                {CONNECTS_TYPES.map((type, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleTypeSelect(type)}
                                        className={`w-full flex items-center px-4 py-2 rounded-lg text-xs transition-all ${selectedType.value === type.value ? 'bg-accent/10 text-accent font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Date Dropdown */}
                <div className="relative w-full sm:w-64" ref={dateDropdownRef}>
                    <label className="block text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 px-1">Date Range</label>
                    <button
                        onClick={() => setDateOpen(!dateOpen)}
                        className={`w-full flex justify-between items-center bg-white/5 border rounded-xl px-4 py-2.5 text-left transition-all ${dateOpen ? 'border-accent/50 bg-white/10' : 'border-white/10 hover:border-white/20'}`}
                    >
                        <span className="text-white text-sm font-semibold">{selectedDate.label}</span>
                        <ChevronDown size={16} className={`text-white/40 transition-transform ${dateOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dateOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-full bg-secondary/95 border border-white/10 rounded-xl z-50 overflow-hidden backdrop-blur-xl">
                            <div className="p-1.5 space-y-1">
                                {DATE_RANGES.map((date, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleDateSelect(date)}
                                        className={`w-full flex items-center px-4 py-2 rounded-lg text-xs transition-all ${selectedDate.value === date.value ? 'bg-accent/10 text-accent font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {date.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* History Table Container */}
            <div className="w-full overflow-hidden relative min-h-[250px]">
                {loading && (
                    <div className="absolute inset-0 bg-primary/45 backdrop-blur-[1.5px] z-10 flex items-center justify-center rounded-xl transition-all duration-300">
                        <div className="bg-secondary border border-white/5 px-6 py-4 rounded-xl flex items-center gap-3">
                            <InfinityLoader />
                            <span className="text-xs text-white/60 font-bold uppercase tracking-wider">Loading history...</span>
                        </div>
                    </div>
                )}

                {history.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="flex items-center justify-center mb-4">
                            <img src="/Icons/icons8-clock-80.png" alt="Clock" className="w-20 h-20 object-contain opacity-45" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 tracking-tight">No Transactions Found</h3>
                        <p className="text-white/40 text-xs max-w-sm leading-relaxed">
                            We couldn't find any connects records matching these filters. Try adjusting your search criteria.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                                    <th className="py-3 sm:py-5 px-4 sm:px-10 whitespace-nowrap">Date</th>
                                    <th className="py-3 sm:py-5 px-4 sm:px-10">Description / Activity</th>
                                    <th className="py-3 sm:py-5 px-4 sm:px-10 text-right">Connects Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {history.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="py-4 sm:py-5 px-4 sm:px-10 text-[10px] font-bold text-white/30 group-hover:text-white/50 transition-colors whitespace-nowrap">
                                            {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="py-4 sm:py-5 px-4 sm:px-10 text-xs font-semibold text-white/70 group-hover:text-white transition-colors tracking-tight leading-relaxed">
                                            {tx.description || tx.type}
                                        </td>
                                        <td className={`py-4 sm:py-5 px-4 sm:px-10 text-right text-base font-bold tracking-tighter ${tx.amount > 0 ? 'text-accent' : 'text-white/60'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className="text-[10px] text-white/10 text-center font-bold uppercase tracking-[0.2em] pt-8">
                Secure Audit Log • Updated in Real-Time
            </p>
        </div>
    );
}
