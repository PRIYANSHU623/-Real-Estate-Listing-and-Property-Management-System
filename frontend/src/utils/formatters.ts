import {
  BookingStatus,
  LeaseStatus,
  PaymentStatus,
  PropertyStatus,
  PropertyType,
  TicketPriority,
  TicketStatus,
  UserRole,
} from '../types';

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const past = new Date(dateStr).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - past) / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return formatDate(dateStr);
  } catch {
    return '';
  }
}

export const PROPERTY_STATUS_CONFIG: Record<PropertyStatus, { label: string; bg: string; text: string; dot: string }> = {
  AVAILABLE: { label: 'Available', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  BOOKED: { label: 'Booked', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  OCCUPIED: { label: 'Occupied', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  INACTIVE: { label: 'Inactive', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-600', dot: 'bg-slate-400' },
};

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string; dot: string }> = {
  PENDING: { label: 'Pending Review', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  REJECTED: { label: 'Declined', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-600', dot: 'bg-slate-400' },
};

export const LEASE_STATUS_CONFIG: Record<LeaseStatus, { label: string; bg: string; text: string; dot: string }> = {
  ACTIVE: { label: 'Active Lease', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  PENDING: { label: 'Pending Signature', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  EXPIRED: { label: 'Expired', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-600', dot: 'bg-slate-400' },
  TERMINATED: { label: 'Terminated', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; bg: string; text: string; dot: string }> = {
  PAID: { label: 'Paid', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  PENDING: { label: 'Pending', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  CREATED: { label: 'Initiated', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  FAILED: { label: 'Failed', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  REFUNDED: { label: 'Refunded', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
};

export const TICKET_PRIORITY_CONFIG: Record<TicketPriority, { label: string; bg: string; text: string }> = {
  LOW: { label: 'Low', bg: 'bg-slate-100', text: 'text-slate-700' },
  MEDIUM: { label: 'Medium', bg: 'bg-blue-100', text: 'text-blue-700' },
  HIGH: { label: 'High', bg: 'bg-amber-100', text: 'text-amber-800' },
  URGENT: { label: 'Urgent', bg: 'bg-rose-100', text: 'text-rose-800 font-semibold' },
};

export const TICKET_STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string; step: number }> = {
  OPEN: { label: 'Open', bg: 'bg-amber-50 border-amber-200 text-amber-700', text: 'text-amber-700', step: 1 },
  ASSIGNED: { label: 'Vendor Assigned', bg: 'bg-blue-50 border-blue-200 text-blue-700', text: 'text-blue-700', step: 2 },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-indigo-50 border-indigo-200 text-indigo-700', text: 'text-indigo-700', step: 3 },
  RESOLVED: { label: 'Resolved', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', text: 'text-emerald-700', step: 4 },
  CLOSED: { label: 'Closed', bg: 'bg-slate-100 border-slate-300 text-slate-600', text: 'text-slate-600', step: 5 },
};

export const ROLE_CONFIG: Record<UserRole, { label: string; badge: string }> = {
  ADMIN: { label: 'Administrator', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  OWNER: { label: 'Property Owner', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  TENANT: { label: 'Tenant', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  APARTMENT: 'Apartment',
  HOUSE: 'Independent House',
  VILLA: 'Luxury Villa',
  STUDIO: 'Studio Apartment',
  PLOT: 'Residential Plot',
  COMMERCIAL: 'Commercial Space',
};
