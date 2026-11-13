import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { analyticsApi } from '../api/analytics';
import { propertiesApi } from '../api/properties';
import { bookingsApi } from '../api/bookings';
import { leasesApi } from '../api/leases';
import { maintenanceApi } from '../api/maintenance';
import { paymentsApi } from '../api/payments';
import {
  Booking,
  Lease,
  MaintenanceTicket,
  OwnerAnalytics,
  Payment,
  Property,
} from '../types';
import { StatCard } from '../components/common/StatCard';
import { PropertyCard } from '../components/properties/PropertyCard';
import { PropertyFormModal } from '../components/properties/PropertyFormModal';
import { PropertyDetailModal } from '../components/properties/PropertyDetailModal';
import { BookingList } from '../components/bookings/BookingList';
import { LeaseList } from '../components/leases/LeaseList';
import { LeaseModal } from '../components/leases/LeaseModal';
import { TicketList } from '../components/maintenance/TicketList';
import { AssignVendorModal } from '../components/maintenance/AssignVendorModal';
import { PaymentHistory } from '../components/payments/PaymentHistory';
import { formatINR } from '../utils/formatters';
import { getErrorMessage } from '../api/client';
import {
  Building2,
  CalendarCheck,
  FileText,
  Wrench,
  CreditCard,
  Plus,
  Percent,
  Users,
  AlertCircle,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<
    'properties' | 'bookings' | 'leases' | 'maintenance' | 'payments' | 'analytics'
  >('properties');

  // Analytics data
  const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);

  // Tab data
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingTab, setLoadingTab] = useState<boolean>(false);

  // Modals
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);

  const [assignTicket, setAssignTicket] = useState<MaintenanceTicket | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const data = await analyticsApi.getOwnerAnalytics();
      setAnalytics(data);
    } catch {
      // ignore
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const fetchTabData = useCallback(async () => {
    setLoadingTab(true);
    try {
      if (activeTab === 'properties' || activeTab === 'analytics') {
        const res = await propertiesApi.list({ owner_id: user?.id, page_size: 50 });
        setProperties(res.items);
      }
      if (activeTab === 'bookings') {
        const res = await bookingsApi.list({ page_size: 50 });
        setBookings(res.items);
      }
      if (activeTab === 'leases') {
        const res = await leasesApi.list({ page_size: 50 });
        setLeases(res.items);
      }
      if (activeTab === 'maintenance') {
        const res = await maintenanceApi.list({ page_size: 50 });
        setTickets(res.items);
      }
      if (activeTab === 'payments') {
        const res = await paymentsApi.history({ page_size: 50 });
        setPayments(res.items);
      }
    } catch (err: any) {
      error(getErrorMessage(err));
    } finally {
      setLoadingTab(false);
    }
  }, [activeTab, user?.id, error]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold mb-1 uppercase tracking-wider">
              Landlord Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Property Portfolio & Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage listings, review booking visits, draft leases, and dispatch maintenance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLeaseModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-600" /> New Lease
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingProperty(null);
                setIsPropertyFormOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Property
            </button>
          </div>
        </div>

        {/* Analytics KPI Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Properties"
            value={analytics ? analytics.total_properties : '—'}
            subtitle={`${analytics?.occupied_properties || 0} occupied • ${analytics?.vacant_properties || 0} vacant`}
            icon={<Building2 className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            title="Occupancy Rate"
            value={analytics ? `${analytics.occupancy_rate.toFixed(1)}%` : '—'}
            subtitle={`${analytics?.active_tenants || 0} active tenant leases`}
            icon={<Percent className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Total Rent Revenue"
            value={analytics ? formatINR(analytics.total_revenue) : '—'}
            subtitle={`${analytics?.pending_payments || 0} invoices awaiting payment`}
            icon={<CreditCard className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            title="Open Maintenance"
            value={analytics ? analytics.open_maintenance_tickets : '—'}
            subtitle="Tickets requiring vendor resolution"
            icon={<Wrench className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs mb-6 overflow-x-auto">
          {[
            { id: 'properties', label: 'My Properties', icon: Building2, count: properties.length },
            { id: 'bookings', label: 'Booking Requests', icon: CalendarCheck, count: bookings.length },
            { id: 'leases', label: 'Lease Agreements', icon: FileText, count: leases.length },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench, count: tickets.length },
            { id: 'payments', label: 'Payments Received', icon: CreditCard, count: payments.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        {activeTab === 'properties' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Your Listed Properties</h3>
              <button
                type="button"
                onClick={() => {
                  setEditingProperty(null);
                  setIsPropertyFormOpen(true);
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> List Another Unit
              </button>
            </div>

            {loadingTab ? (
              <div className="p-12 text-center text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-emerald-600 opacity-60" />
                <p className="text-xs font-medium">Loading your listings...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No properties listed yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                  Add your first apartment or villa to begin receiving tenant inquiries and bookings.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPropertyFormOpen(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Create First Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    onSelect={(selected) => setSelectedProperty(selected)}
                    isOwner={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">Tenant Visit Inquiries</h3>
            <BookingList
              bookings={bookings}
              userRole="OWNER"
              onRefresh={fetchTabData}
              isLoading={loadingTab}
            />
          </div>
        )}

        {activeTab === 'leases' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Registered Lease Agreements</h3>
              <button
                type="button"
                onClick={() => {
                  setEditingLease(null);
                  setIsLeaseModalOpen(true);
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Draft New Lease
              </button>
            </div>
            <LeaseList
              leases={leases}
              userRole="OWNER"
              onRefresh={fetchTabData}
              onEditLease={(lease) => {
                setEditingLease(lease);
                setIsLeaseModalOpen(true);
              }}
              isLoading={loadingTab}
            />
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">Tenant Maintenance Requests</h3>
            <TicketList
              tickets={tickets}
              userRole="OWNER"
              onRefresh={fetchTabData}
              onAssignVendor={(ticket) => setAssignTicket(ticket)}
              isLoading={loadingTab}
            />
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">Rent Collection Records</h3>
            <PaymentHistory payments={payments} isLoading={loadingTab} />
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      <PropertyFormModal
        isOpen={isPropertyFormOpen || !!editingProperty}
        propertyToEdit={editingProperty}
        onClose={() => {
          setIsPropertyFormOpen(false);
          setEditingProperty(null);
        }}
        onSuccess={() => {
          fetchTabData();
          fetchAnalytics();
        }}
      />

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
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
              fetchTabData();
              fetchAnalytics();
            } catch (err: any) {
              error(getErrorMessage(err));
            }
          }
        }}
        currentUserRole="OWNER"
        currentUserId={user?.id}
      />

      {/* Lease Modal */}
      <LeaseModal
        isOpen={isLeaseModalOpen}
        leaseToEdit={editingLease}
        onClose={() => {
          setIsLeaseModalOpen(false);
          setEditingLease(null);
        }}
        onSuccess={() => {
          fetchTabData();
          fetchAnalytics();
        }}
      />

      {/* Assign Vendor Modal */}
      <AssignVendorModal
        ticket={assignTicket}
        isOpen={!!assignTicket}
        onClose={() => setAssignTicket(null)}
        onSuccess={() => {
          fetchTabData();
          fetchAnalytics();
        }}
      />
    </div>
  );
};
