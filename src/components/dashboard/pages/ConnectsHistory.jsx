import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Clock } from "lucide-react";
import { useConnects } from "../../../hooks/useConnects";
import { useAuth } from "../../../context/AuthContext";
import InfinityLoader from "../../common/InfinityLoader";

const CONNECTS_TYPES = [
    { label: "All connects", value: "" },
    { label: "All debits", value: "all_debits" },
    { label: "All credits", value: "all_credits" },
    { label: "Add Connects", value: "Add Connects" },
    { label: "Ad credits", value: "Ad credits" },
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

    if (loading && history.length === 0) return <div className="fixed inset-0 bg-primary/95 backdrop-blur-sm z-50 flex items-center justify-center min-h-screen w-full"><InfinityLoader size={60} /></div>;

    return (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 font-sans tracking-tight animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight mb-2 sm:mb-3">
                        {isClient ? 'Project Credit History' : 'Connects History'}
                    </h1>
                    <div className="space-y-1">
                        <label className="text-light-text/30 text-[9px] font-bold uppercase tracking-[0.2em] block">
                            {isClient ? 'Hiring Power' : 'Available Balance'}
                        </label>
                        <p className="text-2xl sm:text-3xl font-bold text-accent tracking-tight">{balance}</p>
                    </div>
                </div>
                <Link to={`${basePath}/buy-connects`} className="h-10 sm:h-12 shrink-0 flex items-center px-5 sm:px-8 bg-accent text-white font-bold rounded-full transition-all text-[9px] uppercase tracking-[0.2em] hover:bg-accent/80 active:scale-95 shadow-xl shadow-accent/10 mt-1 sm:mt-0">
                    {isClient ? 'Refill Credits' : 'Buy Connects'}
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:justify-end items-start sm:items-end gap-4 sm:gap-6 mb-10">
                {/* Connects Type Dropdown */}
                <div className="relative w-full md:w-96" ref={typeDropdownRef}>
                    <label className="block text-[10px] font-bold text-light-text/30 uppercase tracking-[0.2em] mb-4 px-2">Connects Type</label>
                    <button
                        onClick={() => setTypeOpen(!typeOpen)}
                        className={`w-full flex justify-between items-center bg-white/5 border rounded-full px-6 py-3 text-left transition-all ${typeOpen ? 'border-accent/40 shadow-xl bg-white/10' : 'border-white/10 hover:border-white/20'}`}
                    >
                        <span className="text-white text-base font-semibold">{selectedType.label}</span>
                        <ChevronDown size={20} className={`text-white/40 transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {typeOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-secondary border border-white/10 rounded-[24px] shadow-2xl z-50 max-h-72 overflow-y-auto backdrop-blur-xl">
                            <div className="p-2 space-y-1">
                                {CONNECTS_TYPES.map((type, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleTypeSelect(type)}
                                        className={`w-full flex items-center px-5 py-2.5 rounded-xl text-sm transition-all ${selectedType.value === type.value ? 'bg-accent/10 text-accent font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Date Dropdown */}
                <div className="relative w-full md:w-80" ref={dateDropdownRef}>
                    <label className="block text-[10px] font-bold text-light-text/30 uppercase tracking-[0.2em] mb-4 px-2">Date Range</label>
                    <button
                        onClick={() => setDateOpen(!dateOpen)}
                        className={`w-full flex justify-between items-center bg-white/5 border rounded-full px-6 py-3 text-left transition-all ${dateOpen ? 'border-accent/40 shadow-xl bg-white/10' : 'border-white/10 hover:border-white/20'}`}
                    >
                        <span className="text-white text-base font-semibold">{selectedDate.label}</span>
                        <ChevronDown size={20} className={`text-white/40 transition-transform ${dateOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dateOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-secondary border border-white/10 rounded-[24px] shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                            <div className="p-2 space-y-1">
                                {DATE_RANGES.map((date, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleDateSelect(date)}
                                        className={`w-full flex items-center px-5 py-2.5 rounded-xl text-sm transition-all ${selectedDate.value === date.value ? 'bg-accent/10 text-accent font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {date.label}
                                    </button>))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* History Table Container */}
            <div className="w-full overflow-hidden">
                {loading && history.length > 0 && (
                    <div className="p-4 bg-accent/5 flex items-center gap-3 border-b border-white/5">
                        <InfinityLoader size={20} />
                        <span className="text-xs text-accent font-bold uppercase tracking-[0.2em]">Refreshing Data...</span>
                    </div>
                )}

                {history.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Clock className="text-white/20" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No Transactions Found</h3>
                        <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                            We couldn't find any connects records matching these filters. Try adjusting your search criteria.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
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
