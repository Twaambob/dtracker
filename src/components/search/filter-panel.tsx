import React from 'react';
import { Filter, X, DollarSign, Calendar } from 'lucide-react';

interface FilterState {
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onClear,
  isOpen,
  onToggle
}) => {
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  const updateFilter = (key: keyof FilterState, value: number | string | undefined) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <>
      {/* Filter Toggle Button (Mobile) */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-[#d4af37] hover:bg-[#b5952f] rounded-full shadow-lg flex items-center justify-center transition-all"
        aria-label="Toggle filters"
      >
        <Filter size={24} className="text-black" />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
            !
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <div
        className={`
          fixed lg:relative inset-0 lg:inset-auto z-50 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        `}
      >
        {/* Backdrop (Mobile) */}
        <div
          className="lg:hidden absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onToggle}
        />

        {/* Panel Content */}
        <div className="absolute lg:relative bottom-0 lg:bottom-auto left-0 right-0 bg-[#1a1a1a] lg:bg-transparent border-t lg:border-t-0 border-[#d4af37]/30 rounded-t-3xl lg:rounded-none p-6 lg:p-0 max-h-[80vh] lg:max-h-none overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#d4af37]">Filters</h3>
            <button onClick={onToggle} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={onClear}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Amount Range */}
            <div className="space-y-3">
              <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={14} /> Amount Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount || ''}
                  onChange={(e) => updateFilter('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-[#d4af37]/50 transition-all"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount || ''}
                  onChange={(e) => updateFilter('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-[#d4af37]/50 transition-all"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} /> Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => updateFilter('startDate', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-[#d4af37]/50 transition-all [color-scheme:dark]"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => updateFilter('endDate', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-[#d4af37]/50 transition-all [color-scheme:dark]"
                  placeholder="End date"
                />
              </div>
            </div>

            {/* Mobile Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onClear();
                  onToggle();
                }}
                className="lg:hidden w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
