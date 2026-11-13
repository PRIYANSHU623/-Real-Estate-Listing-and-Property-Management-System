import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingsApi } from '../api/bookings';
import { leasesApi } from '../api/leases';
import { paymentsApi } from '../api/payments';
import { maintenanceApi } from '../api/maintenance';
import { Booking, Lease, MaintenanceTicket, Payment } from '../types';
import { LeaseList } from '../components/leases/LeaseList';
import { BookingList } from '../components/bookings/BookingList';
import { PaymentHistory } from '../components/payments/PaymentHistory';
import { PaymentModal } from '../components/payments/PaymentModal';
import { TicketList } from '../components/maintenance/TicketList';
import { TicketModal } from '../components/maintenance/TicketModal';
import { StatCard } from '../components/common/StatCard';
import { getErrorMessage } from '../api/client';
import {
  Key,
  Calendar,
  CreditCard,
  Wrench,
  Plus,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const TenantDashboard: React.FC = () => {
  const { user } = useAuth();
  const { error } = useToast();

  const [activeTab, setActiveTab] = useState<'leases' | 'bookings' | 'payments' | 'maintenance'>('leases');

  const [leases, setLeases] = useState<Lease[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Modals
  const [payingLease, setPayingLease] = useState<Lease | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const fetchTenantData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'leases') {
        const res = await leasesApi.my({ page_size: 20 });
        setLeases(res.items);
      }
      if (activeTab === 'bookings') {
        const res = await bookingsApi.list({ page_size: 20 });
        setBookings(res.items);
      }
      if (activeTab === 'payments') {
        const res = await paymentsApi.history({ page_size: 50 });
        setPayments(res.items);
      }
      if (activeTab === 'maintenance') {
        const res = await maintenanceApi.list({ page_size: 20 });
        setTickets(res.items);
      }
    } catch (err: any) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [activeTab, error]);

  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  // Quick initial load for counts
  useEffect(() => {
    leasesApi.my().then((r) => setLeases(r.items)).catch(() => {});
    bookingsApi.list().then((r) => setBookings(r.items)).catch(() => {});
    ticketsApi: maintenanceApi.list().then((r) => setTickets(r.items)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold mb-1 uppercase tracking-wider">
              Tenant Residence Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hello, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review your lease agreement, make Razorpay rent payments, or raise repair tickets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTicketModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Wrench className="w-4 h-4 text-emerald-600" /> Maintenance Request
            </button>
            <button
              type="button"
              onClick={() => {
                setPayingLease(leases[0] || null);
                setIsPayModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" /> Pay Rent Online
            </button>
          </div>
        </div>

        {/* Quick summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="My Leases"
            value={leases.length}
            subtitle={leases.some((l) => l.status === 'ACTIVE') ? '1 active lease' : 'No active lease'}
            icon={<Key className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            title="Scheduled Visits"
            value={bookings.length}
            subtitle={`${bookings.filter((b) => b.status === 'PENDING').length} pending approval`}
            icon={<Calendar className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Rent Receipts"
            value={payments.filter((p) => p.status === 'PAID').length}
            subtitle="Verified payment invoices"
            icon={<CreditCard className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            title="Maintenance Tickets"
            value={tickets.length}
            subtitle={`${tickets.filter((t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length} currently active`}
            icon={<Wrench className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs mb-6 overflow-x-auto">
          {[
            { id: 'leases', label: 'My Leases', icon: Key, count: leases.length },
            { id: 'bookings', label: 'My Bookings', icon: Calendar, count: bookings.length },
            { id: 'payments', label: 'Payment Receipts', icon: CreditCard, count: payments.length },
            { id: 'maintenance', label: 'Maintenance Requests', icon: Wrench, count: tickets.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Panes */}
        {activeTab === 'leases' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Your Lease Agreements</h3>
              <button
                type="button"
                onClick={() => {
                  setPayingLease(leases[0] || null);
                  setIsPayModalOpen(true);
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <CreditCard className="w-3.5 h-3.5" /> Pay Rent Online
              </button>
            </div>
            <LeaseList
              leases={leases}
              userRole="TENANT"
              onRefresh={fetchTenantData}
              onPayRent={(lease) => {
                setPayingLease(lease);
                setIsPayModalOpen(true);
              }}
              isLoading={loading}
            />
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">Scheduled Visits & Bookings</h3>
            <BookingList
              bookings={bookings}
              userRole="TENANT"
              onRefresh={fetchTenantData}
              isLoading={loading}
            />
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Transaction History</h3>
              <button
                type="button"
                onClick={() => {
                  setPayingLease(leases[0] || null);
                  setIsPayModalOpen(true);
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Make a Payment
              </button>
            </div>
            <PaymentHistory payments={payments} isLoading={loading} />
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Reported Issues & Repairs</h3>
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Submit New Request
              </button>
            </div>
            <TicketList
              tickets={tickets}
              userRole="TENANT"
              onRefresh={fetchTenantData}
              isLoading={loading}
            />
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPayModalOpen}
        lease={payingLease}
        onClose={() => {
          setIsPayModalOpen(false);
          setPayingLease(null);
        }}
        onSuccess={() => {
          fetchTenantData();
        }}
      />

      {/* Maintenance Request Modal */}
      <TicketModal
        isOpen={isTicketModalOpen}
        defaultPropertyId={leases[0]?.property_id}
        onClose={() => setIsTicketModalOpen(false)}
        onSuccess={() => {
          fetchTenantData();
        }}
      />
    </div>
  );
};
