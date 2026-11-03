import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { tripsService } from '@/services/tripsService';
import type { DestinationCandidate } from '@/@types/api';

interface CityAutocompleteProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  value: string;
  onChange: (value: string, candidate?: DestinationCandidate) => void;
  className?: string;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  label,
  placeholder = 'Ex: Lisboa, Portugal',
  helperText,
  error,
  value,
  onChange,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [candidates, setCandidates] = useState<DestinationCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value when prop changes (React recommended pattern)
  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(value);
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 2) {
      const timer = setTimeout(() => {
        setCandidates([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await tripsService.searchDestinations(trimmed, 6);
        if (active) {
          setCandidates(results || []);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch {
        if (active) {
          setCandidates([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue]);

  const handleSelect = (candidate: DestinationCandidate) => {
    const formatted = candidate.region
      ? `${candidate.name}, ${candidate.region} - ${candidate.country_code}`
      : `${candidate.name}, ${candidate.country_code}`;
    setInputValue(formatted);
    onChange(formatted, candidate);
    setIsOpen(false);
    setCandidates([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || candidates.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < candidates.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : candidates.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(candidates[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setCandidates([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-[#0B2B33] mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0B7A75]">
          <MapPin className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => {
            if (candidates.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-3 text-sm text-[#0B2B33] placeholder:text-gray-400 focus:border-[#0B7A75] focus:outline-none focus:ring-2 focus:ring-[#0B7A75]/20 transition-all ${
            error ? 'border-[#C93E22] focus:border-[#C93E22]' : ''
          }`}
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {loading && <Loader2 className="w-4 h-4 text-[#0B7A75] animate-spin" />}
          {inputValue && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-[#0B2B33] p-1 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {helperText && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-[#C93E22]">{error}</p>}

      {isOpen && candidates.length > 0 && (
        <ul className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden divide-y divide-gray-100">
          {candidates.map((c, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={`${c.provider_ref}-${index}`}
                onMouseDown={() => handleSelect(c)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#E3F1EF] text-[#085E5A]' : 'hover:bg-gray-50 text-[#0B2B33]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#0B7A75]' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm truncate">{c.name}</span>
                  {c.region && <span className="text-xs text-gray-500 truncate">({c.region})</span>}
                </div>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 shrink-0 uppercase">
                  {c.country_code}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
