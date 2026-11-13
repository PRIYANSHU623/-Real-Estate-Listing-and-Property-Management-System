import React, { useState } from 'react';
import { MaintenanceTicket, TicketStatus, UserRole } from '../../types';
import { maintenanceApi } from '../../api/maintenance';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { TicketPriorityBadge, TicketStatusBadge } from '../common/Badge';
import { formatDateTime, timeAgo } from '../../utils/formatters';
import { Wrench, UserCheck, CheckCircle2, Clock, Check, ChevronRight } from 'lucide-react';

interface TicketListProps {
  tickets: MaintenanceTicket[];
  userRole: UserRole;
  onRefresh: () => void;
  onAssignVendor?: (ticket: MaintenanceTicket) => void;
  isLoading?: boolean;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  userRole,
  onRefresh,
  onAssignVendor,
  isLoading,
}) => {
  const { success, error } = useToast();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleUpdateStatus = async (ticketId: number, status: TicketStatus) => {
    setUpdatingId(ticketId);
    try {
      await maintenanceApi.updateStatus(ticketId, status);
      success(`Ticket status updated to ${status}`);
      onRefresh();
    } catch (err: any) {
      error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-emerald-600 opacity-60" />
        <p className="text-xs font-medium">Loading maintenance requests...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
        <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No maintenance tickets</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          All property fixtures, appliances and utilities are currently operating smoothly.
        </p>
      </div>
    );
  }

  const statusWorkflow: TicketStatus[] = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const isBusy = updatingId === ticket.id;

        return (
          <div
            key={ticket.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TicketPriorityBadge priority={ticket.priority} />
                <TicketStatusBadge status={ticket.status} />
                <span className="text-xs text-slate-400">• Property #{ticket.property_id}</span>
              </div>
              <span className="text-xs text-slate-400">Created {timeAgo(ticket.created_at)}</span>
            </div>

            <div className="py-3">
              <h4 className="text-base font-bold text-slate-900">{ticket.title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                {ticket.description}
              </p>
            </div>

            {/* Workflow steps indicator */}
            <div className="py-2.5 px-3 bg-slate-50 rounded-xl flex items-center justify-between text-[11px] font-medium text-slate-400">
              {statusWorkflow.map((st, i) => {
                const isCurrent = ticket.status === st;
                const isPast = statusWorkflow.indexOf(ticket.status) >= i;

                return (
                  <div key={st} className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isCurrent ? 'bg-emerald-600 ring-2 ring-emerald-200' : isPast ? 'bg-emerald-400' : 'bg-slate-300'
                      }`}
                    />
                    <span className={`${isCurrent ? 'font-bold text-emerald-800' : isPast ? 'text-slate-700' : 'text-slate-400'}`}>
                      {st.replace('_', ' ')}
                    </span>
                    {i < statusWorkflow.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 ml-1 hidden sm:inline" />}
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            {(userRole === 'OWNER' || userRole === 'ADMIN') && (
              <div className="pt-3.5 mt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-slate-500 font-medium">
                  {ticket.vendor_id ? `Assigned to Vendor ID #${ticket.vendor_id}` : 'No vendor assigned yet'}
                </div>

                <div className="flex items-center gap-2">
                  {onAssignVendor && ticket.status !== 'CLOSED' && (
                    <button
                      type="button"
                      onClick={() => onAssignVendor(ticket)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Assign Vendor
                    </button>
                  )}

                  {ticket.status === 'ASSIGNED' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs font-bold transition-colors"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {ticket.status === 'IN_PROGRESS' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-colors shadow-xs"
                    >
                      Mark Resolved
                    </button>
                  )}

                  {ticket.status === 'RESOLVED' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 text-xs font-bold transition-colors"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
