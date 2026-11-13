import React, { useState, useEffect, useCallback } from 'react';
import { Property, UserRole } from '../types';
import { propertiesApi, PropertyFilterParams } from '../api/properties';
import { PropertyCard } from '../components/properties/PropertyCard';
import { PropertyFilter } from '../components/properties/PropertyFilter';
import { PropertyDetailModal } from '../components/properties/PropertyDetailModal';
import { BookingModal } from '../components/bookings/BookingModal';
import { PropertyFormModal } from '../components/properties/PropertyFormModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../api/client';
import { CITY_IMAGES } from '../data/curatedImages';
import {
  Building2,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ExplorePageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

const TOP_CITIES = [
  { name: 'Mumbai', count: '120+ Listings' },
  { name: 'Bengaluru', count: '180+ Listings' },
  { name: 'Delhi', count: '90+ Listings' },
  { name: 'Pune', count: '75+ Listings' },
  { name: 'Hyderabad', count: '110+ Listings' },
  { name: 'Chennai', count: '60+ Listings' },
];

export const ExplorePage: React.FC<ExplorePageProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const { error, success } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [filters, setFilters] = useState<PropertyFilterParams>({
    page: 1,
    page_size: 9,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  // Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await propertiesApi.list(filters);
      setProperties(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages || 1);
    } catch (err: any) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, error]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleCityClick = (cityName: string) => {
    setFilters((prev) => ({
      ...prev,
      city: prev.city === cityName ? undefined : cityName,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      page_size: 9,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section with Architectural Styling */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Premium Property Marketplace & Leasing Engine
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Discover your next home <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                with verified simplicity.
              </span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Verified apartments, luxury villas, and studio rentals with seamless booking inspections,
              direct digital lease contracts, and automated Razorpay rent payments.
            </p>

            {/* Quick CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {user?.role === 'OWNER' || user?.role === 'ADMIN' ? (
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Plus className="w-4 h-4" /> List Your Property
                </button>
              ) : !isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  Get Started as Tenant or Landlord <ArrowRight className="w-4 h-4" />
                </button>
              ) : null}

              <div className="flex items-center gap-4 text-xs text-slate-300 ml-1">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Direct Landlords</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Transparent Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        {/* City Filter Carousel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-md mb-6">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Popular Hubs</span>
            {filters.city && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Filtered: {filters.city}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {TOP_CITIES.map((c) => {
              const isSelected = filters.city === c.name;
              const imgUrl = CITY_IMAGES[c.name] || CITY_IMAGES.Default;

              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleCityClick(c.name)}
                  className={`group relative overflow-hidden rounded-xl h-20 text-left p-2.5 transition-all ${
                    isSelected
                      ? 'ring-2 ring-emerald-600 ring-offset-2 scale-[1.02]'
                      : 'hover:opacity-90 opacity-80'
                  }`}
                >
                  <img src={imgUrl} alt={c.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-slate-900/60' : 'bg-slate-900/40 group-hover:bg-slate-900/50'}`} />
                  <div className="relative z-10 flex flex-col justify-end h-full text-white">
                    <span className="font-bold text-xs leading-none">{c.name}</span>
                    <span className="text-[10px] text-slate-200 mt-0.5">{c.count}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Filters */}
        <PropertyFilter
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          onReset={handleResetFilters}
        />

        {/* Results Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Available Residences</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {properties.length} of {total} verified properties
            </p>
          </div>

          {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Listing
            </button>
          )}
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="py-24 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-3 animate-spin text-emerald-600 opacity-60" />
            <p className="text-sm font-semibold text-slate-600">Searching property registry...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No properties match your search</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your city filter, budget range, or property type criteria to view more listings.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                onSelect={(selected) => setSelectedProperty(selected)}
                onBook={(target) => {
                  if (!isAuthenticated) {
                    onOpenAuth('login');
                  } else {
                    setBookingProperty(target);
                  }
                }}
                userRole={user?.role}
                isOwner={user?.id === p.owner_id}
              />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={filters.page === 1}
              onClick={() => handlePageChange((filters.page || 1) - 1)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200">
              Page {filters.page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={filters.page === totalPages}
              onClick={() => handlePageChange((filters.page || 1) + 1)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Property Details Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onBook={(prop) => {
          setSelectedProperty(null);
          if (!isAuthenticated) {
            onOpenAuth('login');
          } else {
            setBookingProperty(prop);
          }
        }}
        onEdit={(prop) => {
          setSelectedProperty(null);
          setEditingProperty(prop);
        }}
        onDelete={async (prop) => {
          if (window.confirm(`Are you sure you want to delete "${prop.title}"?`)) {
            try {
              await propertiesApi.delete(prop.id);
              success('Property deleted successfully');
              setSelectedProperty(null);
              fetchProperties();
            } catch (err: any) {
              error(getErrorMessage(err));
            }
          }
        }}
        onRequireAuth={() => onOpenAuth('login')}
        currentUserRole={user?.role}
        currentUserId={user?.id}
      />

      {/* Booking Schedule Modal */}
      <BookingModal
        property={bookingProperty}
        isOpen={!!bookingProperty}
        onClose={() => setBookingProperty(null)}
        onSuccess={() => {
          setBookingProperty(null);
          fetchProperties();
        }}
      />

      {/* Property Form Modal (Create or Edit) */}
      <PropertyFormModal
        isOpen={isCreateOpen || !!editingProperty}
        propertyToEdit={editingProperty}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingProperty(null);
        }}
        onSuccess={() => {
          fetchProperties();
        }}
      />
    </div>
  );
};
