import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { Logo } from './Logo';
import { Country } from '../types';
import { ALL_COUNTRIES } from '../countries';

interface FirstVisitModalProps {
  onSelect: (country: Country) => void;
}

export const FirstVisitModal: React.FC<FirstVisitModalProps> = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Auto-focus search input on mount
    searchInputRef.current?.focus();
  }, []);

  const filteredCountries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Reset item refs when filtered countries change
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, filteredCountries.length);
  }, [filteredCountries]);

  const handleContinue = () => {
    const country = ALL_COUNTRIES.find(c => c.code === selectedCountryCode);
    if (country) {
      onSelect(country);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredCountries.length > 0) {
        itemRefs.current[0]?.focus();
      }
    }
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, index: number, country: Country) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSelectedCountryCode(country.code);
      onSelect(country);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index < filteredCountries.length - 1) {
        const nextEl = itemRefs.current[index + 1];
        nextEl?.focus();
        nextEl?.scrollIntoView({ block: 'nearest' });
      } else {
        continueButtonRef.current?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index > 0) {
        const prevEl = itemRefs.current[index - 1];
        prevEl?.focus();
        prevEl?.scrollIntoView({ block: 'nearest' });
      } else {
        searchInputRef.current?.focus();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, pointerEvents: 'auto' }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
      className="fixed inset-0 z-[100] bg-brand-bg flex items-center justify-center p-4 md:p-8 pointer-events-auto"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl bg-brand-white p-8 md:p-16 flex flex-col items-center text-center shadow-sm border border-brand-divider max-h-[90vh]"
      >
        <div className="mb-8 shrink-0">
          <Logo className="h-16 md:h-20 w-auto" />
        </div>

        <h2 className="text-2xl md:text-3xl font-display mb-8 tracking-tight shrink-0">Select Your Country</h2>

        <div className="w-full flex flex-col min-h-0 mb-8">
          <div className="relative border border-brand-divider focus-within:border-brand-black transition-colors shrink-0 mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full py-4 pl-12 pr-6 text-sm font-sans tracking-[0.1em] outline-none bg-transparent pointer-events-auto"
            />
          </div>
          
          <div 
            className="overflow-y-auto border border-brand-divider bg-brand-white text-left flex-1 min-h-[200px] max-h-[300px] pointer-events-auto relative z-10"
            role="listbox"
            aria-label="Countries"
          >
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => (
                <button
                  key={country.code}
                  ref={(el) => { itemRefs.current[index] = el; }}
                  onClick={() => setSelectedCountryCode(country.code)}
                  onKeyDown={(e) => handleItemKeyDown(e, index, country)}
                  role="option"
                  aria-selected={selectedCountryCode === country.code}
                  tabIndex={0}
                  className={`w-full px-6 py-3 text-sm font-sans tracking-[0.1em] text-left hover:bg-brand-bg transition-colors flex justify-between items-center focus:outline-none focus:bg-brand-bg focus:ring-1 focus:ring-inset focus:ring-brand-black ${
                    selectedCountryCode === country.code ? 'bg-brand-bg font-bold' : ''
                  }`}
                >
                  <span>{country.name}</span>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-sm font-sans text-brand-secondary">
                No countries found.
              </div>
            )}
          </div>
        </div>

        <button
          ref={continueButtonRef}
          onClick={handleContinue}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              if (filteredCountries.length > 0) {
                itemRefs.current[filteredCountries.length - 1]?.focus();
              } else {
                searchInputRef.current?.focus();
              }
            }
          }}
          disabled={!selectedCountryCode}
          className={`btn-primary w-full py-5 text-[11px] uppercase tracking-[0.25em] font-bold transition-all duration-300 shrink-0 pointer-events-auto rounded-full ${
            selectedCountryCode
              ? ''
              : 'opacity-50 pointer-events-none'
          }`}
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
};
