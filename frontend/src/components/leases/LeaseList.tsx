import React, { useState } from 'react';
import { Lease, LeaseStatus, UserRole } from '../../types';
import { leasesApi } from '../../api/leases';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { LeaseStatusBadge } from '../common/Badge';
import { formatINR, formatDate } from '../../utils/formatters';
import { FileText, Calendar, CreditCard, ExternalLink, Check, Ban, Clock } from 'lucide-react';

interface LeaseListProps {
  leases: Lease[];
  userRole: UserRole;
  onRefresh: () => void;
  onPayRent?: (lease: Lease) => void;
  onEditLease?: (lease: Lease) => void;
  isLoading?: boolean;
}

export const LeaseList: React.FC<LeaseListProps> = ({
  leases,
  userRole,
  onRefresh,
  onPayRent,
  onEditLease,
  isLoading,
}) => {
  const { success, error } = useToast();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleStatusChange = async (leaseId: number, status: LeaseStatus) => {
    setUpdatingId(leaseId);
    try {
      await leasesApi.updateStatus(leaseId, status);
      success(`Lease status updated to ${status}`);
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
        <p className="text-xs font-medium">Loading lease agreements...</p>
      </div>
    );
  }

  if (leases.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
        <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No active leases</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {userRole === 'TENANT'
            ? 'You do not have any registered leases at the moment.'
            : 'No signed leases exist for your properties yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leases.map((lease) => {
        const isBusy = updatingId === lease.id;
        const isActive = lease.status === 'ACTIVE';

        return (
          <div
            key={lease.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  #{lease.id}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Property ID #{lease.property_id}
                    </h4>
                    <LeaseStatusBadge status={lease.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tenant ID #{lease.tenant_id} • Landlord ID #{lease.owner_id}
                  </p>
                </div>
              </div>

              {/* Financial Specs */}
              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-xs text-slate-400 block">Monthly Rent</span>
                  <span className="text-base font-extrabold text-slate-900">{formatINR(lease.monthly_rent)}</span>
                </div>
                <div className="pl-4 border-l border-slate-100">
                  <span className="text-xs text-slate-400 block">Security Deposit</span>
                  <span className="text-sm font-bold text-slate-700">{formatINR(lease.security_deposit)}</span>
                </div>
              </div>
            </div>

            {/* Date duration & actions */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800">
                  {formatDate(lease.start_date)} — {formatDate(lease.end_date)}
                </span>
                {lease.agreement_url && (
                  <a
                    href={lease.agreement_url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Agreement
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                {userRole === 'TENANT' && isActive && onPayRent && (
                  <button
                    type="button"
                    onClick={() => onPayRent(lease)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <CreditCard className="w-4 h-4" /> Pay Rent (Razorpay)
                  </button>
                )}

                {(userRole === 'OWNER' || userRole === 'ADMIN') && (
                  <>
                    {lease.status === 'PENDING' && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatusChange(lease.id, 'ACTIVE')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Activate
                      </button>
                    )}
                    {isActive && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatusChange(lease.id, 'TERMINATED')}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" /> Terminate
                      </button>
                    )}
                    {onEditLease && (
                      <button
                        type="button"
                        onClick={() => onEditLease(lease)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
