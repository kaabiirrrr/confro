import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomDropdown - A premium, accessible dropdown component.
 */
const CustomDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option", 
  className = "", 
  fullWidth = true,
  error = "",
  variant = "glass"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const itemRefs = useRef([]);
  const isKeyboardNavRef = useRef(false);
  const keyboardNavTimeoutRef = useRef(null);

  // Normalize options to object format - Stabilized with useMemo
  const normalizedOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') return { label: opt, value: opt };
      return opt;
    });
  }, [options]);

  const selectedOption = useMemo(() => {
    return normalizedOptions.find(opt => opt.value === value);
  }, [normalizedOptions, value]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Accessibility: Auto-scroll to active item
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && itemRefs.current[activeIndex]) {
      // Set flag to ignore mouse enter during programmatic scroll
      isKeyboardNavRef.current = true;
      if (keyboardNavTimeoutRef.current) clearTimeout(keyboardNavTimeoutRef.current);
      
      itemRefs.current[activeIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });

      // Release flag after scroll completes
      keyboardNavTimeoutRef.current = setTimeout(() => {
        isKeyboardNavRef.current = false;
      }, 300);
    }
  }, [activeIndex, isOpen]);

  // Accessibility: Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    // Handle alphanumeric keys for jump-to search
    if (e.key.length === 1 && /[a-z0-9\s]/i.test(e.key)) {
      e.preventDefault();
      
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      
      const char = e.key.toLowerCase();
      const isSameChar = searchQuery.toLowerCase() === char;
      const newQuery = isSameChar ? char : (searchQuery + char).trim();
      
      setSearchQuery(newQuery);
      
      searchTimeoutRef.current = setTimeout(() => {
        setSearchQuery('');
      }, 800);

      // Search matching logic
      let matchIndex = -1;
      
      if (isSameChar && char.length === 1) {
        // Cycling support: find NEXT item starting with this char
        const startIndex = (activeIndex + 1) % normalizedOptions.length;
        for (let i = 0; i < normalizedOptions.length; i++) {
          const idx = (startIndex + i) % normalizedOptions.length;
          if (normalizedOptions[idx].label.toLowerCase().startsWith(char)) {
            matchIndex = idx;
            break;
          }
        }
      } else {
        // Normal prefix search
        matchIndex = normalizedOptions.findIndex(opt => 
          opt.label.trim().toLowerCase().startsWith(newQuery)
        );
      }

      if (matchIndex !== -1) {
        setActiveIndex(matchIndex);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < normalizedOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : normalizedOptions.length - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0) {
          onChange(normalizedOptions[activeIndex].value);
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'Backspace':
        if (searchQuery) {
          e.preventDefault();
          setSearchQuery(prev => prev.slice(0, -1));
        }
        break;
      default:
        break;
    }
  }, [isOpen, normalizedOptions, activeIndex, onChange, searchQuery]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div 
      className={`relative ${fullWidth ? 'w-full' : 'w-auto'} ${className}`} 
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div
        onClick={toggleDropdown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`
          group flex items-center justify-between px-4 py-2.5 
          transition-all duration-300 cursor-pointer
          ${variant === 'minimal' ? 'border-none bg-transparent !p-0' : 'border rounded-2xl bg-secondary'}
          ${isOpen && variant !== 'minimal' ? 'border-accent shadow-[0_0_0_3px_rgba(59,130,246,0.1)]' : variant !== 'minimal' ? 'border-white/10 hover:border-white/20' : ''}
          ${error ? 'border-red-500/50' : ''}
          ${className.includes('!bg-') ? '' : ''} 
          ${className.includes('!border-') ? '' : ''}
          ${className.includes('!p-') ? '' : ''}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedOption?.icon && (
            <span className="text-accent flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className={`text-sm truncate ${!selectedOption ? 'text-white/40' : 'text-white font-medium'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`flex-shrink-0 text-white/30 transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : 'group-hover:text-white/50'}`} 
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-400 text-[11px] mt-1.5 ml-1 font-medium">{error}</p>}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`
              absolute left-0 right-0 mt-2 z-50
              max-h-[280px] overflow-y-auto no-scrollbar
              rounded-[20px] border border-white/10 shadow-3xl p-2
              bg-secondary backdrop-blur-2xl
            `}
            role="listbox"
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-white/30 italic">No options available</div>
            ) : (
              normalizedOptions.map((option, index) => (
                <div
                  key={index}
                  role="option"
                  aria-selected={value === option.value}
                  onMouseEnter={() => {
                    if (!isKeyboardNavRef.current) setActiveIndex(index);
                  }}
                  onClick={() => handleSelect(option.value)}
                  ref={(el) => (itemRefs.current[index] = el)}
                  className={`
                    flex items-center justify-between px-3 py-2.5 
                    rounded-xl cursor-pointer transition-all duration-200
                    ${value === option.value ? 'bg-accent/10 text-accent' : 'text-white/70 hover:bg-white/5 hover:text-white'}
                    ${activeIndex === index ? 'bg-white/5 scale-[0.98]' : ''}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {option.icon && (
                      <span className={`flex-shrink-0 ${value === option.value ? 'text-accent' : 'text-white/40'}`}>
                        {option.icon}
                      </span>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{option.label}</span>
                      {option.description && (
                        <span className="text-[11px] text-white/40 truncate">{option.description}</span>
                      )}
                    </div>
                  </div>
                  {value === option.value && <Check size={14} className="text-accent flex-shrink-0 ml-2" />}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
