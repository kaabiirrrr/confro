import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
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
        <div className="w-full mx-auto mt-6 pb-12 font-sans tracking-tight animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-12">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-light-text tracking-tight mb-3">
                        {isClient ? 'Project Credit History' : 'Connects History'}
                    </h1>
                    <div className="space-y-1">
                        <label className="text-light-text/30 text-[11px] font-bold uppercase tracking-[0.2em] block">
                            {isClient ? 'Hiring Power' : 'Available Balance'}
                        </label>
                        <p className="text-4xl font-bold text-accent tracking-tight">{balance}</p>
                    </div>
                </div>
                <Link to={`${basePath}/buy-connects`} className="h-12 flex items-center px-10 bg-accent text-primary font-bold rounded-2xl transition-all text-[11px] uppercase tracking-[0.2em] hover:bg-white active:scale-95 shadow-xl shadow-accent/10">
                    {isClient ? 'Refill Credits' : 'Buy Connects'}
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-6 mb-10">
                {/* Connects Type Dropdown */}
                <div className="relative w-full md:w-72" ref={typeDropdownRef}>
                    <label className="block text-[11px] font-bold text-light-text/30 uppercase tracking-[0.2em] mb-3 px-1">Connects Type</label>
                    <button
                        onClick={() => setTypeOpen(!typeOpen)}
                        className={`w-full flex justify-between items-center bg-secondary/40 border rounded-2xl px-6 py-4 text-left transition-all ${typeOpen ? 'border-accent/40 shadow-xl bg-secondary/60' : 'border-white/10 hover:border-white/20'}`}
                    >
                        <span className="text-light-text text-sm font-semibold">{selectedType.label}</span>
                        <ChevronDown size={18} className={`text-light-text/40 transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {typeOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-secondary border border-white/10 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto backdrop-blur-xl">
                            <div className="p-2 space-y-1">
                                {CONNECTS_TYPES.map((type, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleTypeSelect(type)}
                                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm transition-all ${selectedType.value === type.value ? 'bg-accent/10 text-accent font-bold' : 'text-light-text/60 hover:bg-white/5 hover:text-light-text'}`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Date Dropdown */}
                <div className="relative w-full md:w-64" ref={dateDropdownRef}>
                    <label className="block text-[11px] font-bold text-light-text/30 uppercase tracking-[0.2em] mb-3 px-1">Date Range</label>
                    <button
                        onClick={() => setDateOpen(!dateOpen)}
                        className={`w-full flex justify-between items-center bg-secondary/40 border rounded-2xl px-6 py-4 text-left transition-all ${dateOpen ? 'border-accent/40 shadow-xl bg-secondary/60' : 'border-white/10 hover:border-white/20'}`}
                    >
                        <span className="text-light-text text-sm font-semibold">{selectedDate.label}</span>
                        <ChevronDown size={18} className={`text-light-text/40 transition-transform ${dateOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dateOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-secondary border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                            <div className="p-2 space-y-1">
                                {DATE_RANGES.map((date, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleDateSelect(date)}
                                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm transition-all ${selectedDate.value === date.value ? 'bg-accent/10 text-accent font-bold' : 'text-light-text/60 hover:bg-white/5 hover:text-light-text'}`}
                                    >
                                        {date.label}
                                    </button>))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* History Table Container */}
            <div className="bg-secondary/20 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-sm">
                {loading && history.length > 0 && (
                    <div className="p-4 bg-accent/5 flex items-center gap-3 border-b border-white/5">
                        <InfinityLoader size={20} />
                        <span className="text-xs text-accent font-bold uppercase tracking-[0.2em]">Refreshing Data...</span>
                    </div>
                )}

                {history.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center py-32 px-6 text-center border-dashed border-2 border-white/5 m-4 rounded-[28px]">
                        <h3 className="text-xl font-bold text-light-text mb-2 tracking-tight">No Transactions Found</h3>
                        <p className="text-light-text/40 text-sm max-w-sm leading-relaxed">
                            We couldn't find any connects records matching these filters. Try adjusting your search criteria.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[11px] font-bold text-light-text/30 uppercase tracking-[0.2em]">
                                    <th className="py-6 px-10">Date</th>
                                    <th className="py-6 px-10">Description / Activity</th>
                                    <th className="py-6 px-10 text-right">Connects Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {history.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="py-7 px-10 text-sm font-bold text-light-text/40 group-hover:text-light-text/60 transition-colors">
                                            {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="py-7 px-10 text-base font-semibold text-light-text/80 group-hover:text-light-text transition-colors tracking-tight">
                                            {tx.description || tx.type}
                                        </td>
                                        <td className={`py-7 px-10 text-right text-xl font-bold tracking-tighter ${tx.amount > 0 ? 'text-accent' : 'text-light-text/60'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className="text-[10px] text-white/10 text-center font-bold uppercase tracking-[0.2em] pt-4">
                Secure Audit Log • Updated in Real-Time
            </p>
        </div>
    );
}
