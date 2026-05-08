import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, ChevronDown } from 'lucide-react';

/**
 * CustomDatePicker - A premium, themed date picker component.
 * 
 * @param {string} value - Current date value in YYYY-MM-DD format
 * @param {function} onChange - Callback when a date is selected
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message
 * @param {string} className - Additional trigger classes
 */
const CustomDatePicker = ({ 
  value, 
  onChange, 
  placeholder = "Select Date", 
  error = "",
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Helper to format date as YYYY-MM-DD in local time
  const formatDateToLocal = (year, month, day) => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Helper to parse YYYY-MM-DD into a local Date object
  const parseLocalValue = (val) => {
    if (!val) return new Date();
    const [y, m, d] = val.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const [viewDate, setViewDate] = useState(parseLocalValue(value));
  const containerRef = useRef(null);

  // Sync viewDate when value changes from outside
  useEffect(() => {
    if (value) {
      setViewDate(parseLocalValue(value));
    }
  }, [value]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [viewDate]);

  const firstDayOfMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    return new Date(year, month, 1).getDay();
  }, [viewDate]);

  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const currentYear = viewDate.getFullYear();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, viewDate.getMonth() + 1, 1));
  };

  const onDateClick = (day) => {
    const formattedDate = formatDateToLocal(currentYear, viewDate.getMonth(), day);
    onChange(formattedDate);
    setIsOpen(false);
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === viewDate.getMonth() && 
           today.getFullYear() === currentYear;
  };

  const isSelected = (day) => {
    if (!value) return false;
    const [y, m, d] = value.split('-').map(Number);
    return d === day && 
           (m - 1) === viewDate.getMonth() && 
           y === currentYear;
  };

  const formattedValue = useMemo(() => {
    if (!value) return "";
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, [value]);

  // Year Selection
  const years = useMemo(() => {
    const yrs = [];
    const thisYear = new Date().getFullYear();
    // Stop at current year for birthday/past-oriented picking
    for (let i = thisYear; i >= thisYear - 100; i--) {
      yrs.push(i);
    }
    return yrs;
  }, []);

  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const isFutureDate = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(currentYear, viewDate.getMonth(), day);
    return date > today;
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 
          bg-secondary/40 backdrop-blur-md rounded-xl border transition-all duration-300 cursor-pointer
          ${isOpen ? 'border-accent shadow-[0_0_0_3px_rgba(56,189,248,0.1)]' : 'border-white/10 hover:border-white/20'}
          ${error ? 'border-red-500/50' : ''}
        `}
      >
        <span className={`text-sm ${!value ? 'text-white/30' : 'text-white font-medium'}`}>
          {value ? formattedValue : placeholder}
        </span>
        <CalendarIcon size={18} className={`transition-colors duration-300 ${isOpen ? 'text-accent' : 'text-white/30'}`} />
      </div>

      {error && <p className="text-red-400 text-[11px] mt-1.5 ml-1 font-medium">{error}</p>}

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[110] mt-2 w-[300px] bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <button 
                   onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
                   className={`text-sm font-bold transition-colors px-2 py-1 rounded-lg hover:bg-white/5 flex items-center gap-1 ${showMonthPicker ? 'text-accent' : 'text-white'}`}
                >
                  {monthName}
                  <ChevronDown size={14} className={showMonthPicker ? "rotate-180" : ""} />
                </button>
                <button 
                   onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
                   className={`text-sm font-bold transition-colors px-2 py-1 rounded-lg hover:bg-white/5 flex items-center gap-1 ${showYearPicker ? 'text-accent' : 'text-white'}`}
                >
                  {currentYear}
                  <ChevronDown size={14} className={showYearPicker ? "rotate-180" : ""} />
                </button>
              </div>
              
              <div className="flex gap-1">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/5 rounded-lg text-white/50 hover:text-white transition-all">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/5 rounded-lg text-white/50 hover:text-white transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {showYearPicker ? (
              <div className="grid grid-cols-3 gap-1 max-h-[220px] overflow-y-auto no-scrollbar py-2">
                 {years.map(yr => (
                   <button
                     key={yr}
                     onClick={(e) => {
                       e.stopPropagation();
                       setViewDate(new Date(yr, viewDate.getMonth(), 1));
                       setShowYearPicker(false);
                     }}
                     className={`py-2 text-xs rounded-lg transition-all ${yr === currentYear ? 'bg-accent text-primary font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                   >
                     {yr}
                   </button>
                 ))}
              </div>
            ) : showMonthPicker ? (
              <div className="grid grid-cols-3 gap-1 py-2">
                {months.map((m, i) => (
                  <button
                    key={m}
                    onClick={(e) => {
                       e.stopPropagation();
                       setViewDate(new Date(currentYear, i, 1));
                       setShowMonthPicker(false);
                    }}
                    className={`py-2 text-xs rounded-lg transition-all ${i === viewDate.getMonth() ? 'bg-accent text-primary font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            ) : (
              <>
                {/* Weekdays Labels */}
                <div className="grid grid-cols-7 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <span key={day} className="text-[10px] font-bold uppercase tracking-wider text-white/20 text-center py-1">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    return (
                      <button
                        key={day}
                        onClick={() => !isFutureDate(day) && onDateClick(day)}
                        disabled={isFutureDate(day)}
                        className={`
                          h-9 w-full flex items-center justify-center text-xs rounded-lg transition-all duration-200
                          ${isSelected(day) 
                            ? 'bg-accent text-primary font-bold shadow-lg shadow-accent/20 scale-110 z-10' 
                            : isToday(day)
                              ? 'bg-accent/10 text-accent font-bold border border-accent/20'
                              : isFutureDate(day)
                                ? 'text-white/10 cursor-not-allowed'
                                : 'text-white/70 hover:bg-white/5 hover:text-white'}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <button 
                onClick={(e) => { e.stopPropagation(); onChange(""); setIsOpen(false); }}
                className="text-[10px] uppercase tracking-widest font-bold text-white/30 hover:text-red-400 transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const t = new Date();
                  onChange(formatDateToLocal(t.getFullYear(), t.getMonth(), t.getDate())); 
                  setIsOpen(false); 
                }}
                className="text-[10px] uppercase tracking-widest font-bold text-accent px-2 py-1 rounded hover:bg-accent/10 transition-colors"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;
