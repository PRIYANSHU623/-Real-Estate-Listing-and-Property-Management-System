import React from 'react';
import {
  BookingStatus,
  LeaseStatus,
  PaymentStatus,
  PropertyStatus,
  TicketPriority,
  TicketStatus,
  UserRole,
} from '../../types';
import {
  BOOKING_STATUS_CONFIG,
  LEASE_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  PROPERTY_STATUS_CONFIG,
  ROLE_CONFIG,
  TICKET_PRIORITY_CONFIG,
  TICKET_STATUS_CONFIG,
} from '../../utils/formatters';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
}

export const PropertyStatusBadge: React.FC<{ status: PropertyStatus }> = ({ status }) => {
  const cfg = PROPERTY_STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export const BookingStatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const cfg = BOOKING_STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export const LeaseStatusBadge: React.FC<{ status: LeaseStatus }> = ({ status }) => {
  const cfg = LEASE_STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const cfg = PAYMENT_STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export const TicketPriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  const cfg = TICKET_PRIORITY_CONFIG[priority] || { label: priority, bg: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
};

export const TicketStatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const cfg = TICKET_STATUS_CONFIG[status] || { label: status, bg: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
};

export const UserRoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || { label: role, badge: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${cfg.badge}`}>
      {cfg.label}
    </span>
  );
};
