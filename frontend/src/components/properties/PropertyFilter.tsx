import React from 'react';
import { PropertyFilterParams } from '../../api/properties';
import { PropertyType } from '../../types';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface PropertyFilterProps {
  filters: PropertyFilterParams;
  onChange: (updated: PropertyFilterParams) => void;
  onReset: () => void;
}

const CITIES = ['All Cities', 'Mumbai', 'Bengaluru', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata'];
const PROPERTY_TYPES: Array<{ value: PropertyType | ''; label: string }> = [
  { value: '', label: 'All Property Types' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'PLOT', label: 'Plot' },
];

export const PropertyFilter: React.FC<PropertyFilterProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const hasActiveFilters =
    !!filters.search ||
    !!filters.city ||
    !!filters.property_type ||
    !!filters.bedrooms ||
    !!filters.min_rent ||
    !!filters.max_rent;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs mb-8">
      {/* Top Search bar & City Selector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        {/* Search input */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by title, location or keywords..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-slate-50/50"
          />
        </div>

        {/* City Filter */}
        <div className="md:col-span-3">
          <select
            value={filters.city || ''}
            onChange={(e) => onChange({ ...filters, city: e.target.value || undefined, page: 1 })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-slate-50/50 text-slate-700 font-medium"
          >
            <option value="">All Cities</option>
            {CITIES.filter((c) => c !== 'All Cities').map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type Filter */}
        <div className="md:col-span-2">
          <select
            value={filters.property_type || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                property_type: (e.target.value as PropertyType) || undefined,
                page: 1,
              })
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-slate-50/50 text-slate-700 font-medium"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.label} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="md:col-span-2">
          <select
            value={`${filters.sort_by || 'created_at'}_${filters.sort_order || 'desc'}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('_');
              onChange({
                ...filters,
                sort_by: by as any,
                sort_order: order as any,
                page: 1,
              });
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-slate-50/50 text-slate-700 font-medium"
          >
            <option value="created_at_desc">Newest First</option>
            <option value="rent_asc">Rent: Low to High</option>
            <option value="rent_desc">Rent: High to Low</option>
            <option value="bedrooms_desc">Bedrooms: Most</option>
          </select>
        </div>
      </div>

      {/* Secondary Quick Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        {/* Bedrooms selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-semibold mr-1">Bedrooms:</span>
          {[undefined, 1, 2, 3, 4].map((bhk) => {
            const isSelected = filters.bedrooms === bhk;
            return (
              <button
                key={bhk === undefined ? 'any' : bhk}
                type="button"
                onClick={() => onChange({ ...filters, bedrooms: bhk, page: 1 })}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {bhk === undefined ? 'Any' : `${bhk}+ BHK`}
              </button>
            );
          })}
        </div>

        {/* Price quick filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-semibold mr-1">Budget:</span>
          {[
            { label: 'Any', min: undefined, max: undefined },
            { label: '< ₹25k', min: undefined, max: 25000 },
            { label: '₹25k - ₹50k', min: 25000, max: 50000 },
            { label: '₹50k - ₹1L', min: 50000, max: 100000 },
            { label: '₹1L+', min: 100000, max: undefined },
          ].map((range) => {
            const isSelected = filters.min_rent === range.min && filters.max_rent === range.max;
            return (
              <button
                key={range.label}
                type="button"
                onClick={() => onChange({ ...filters, min_rent: range.min, max_rent: range.max, page: 1 })}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors ml-auto"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
