import React from 'react';
import { Payment } from '../../types';
import { PaymentStatusBadge } from '../common/Badge';
import { formatINR, formatDateTime } from '../../utils/formatters';
import { CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface PaymentHistoryProps {
  payments: Payment[];
  isLoading?: boolean;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-emerald-600 opacity-60" />
        <p className="text-xs font-medium">Loading payment records...</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
        <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No payment transactions found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Rent receipts and transaction records will appear here after payments are initiated.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Receipt / ID</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Purpose</th>
              <th className="py-3 px-4">Property</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Gateway Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                  #PAY-{p.id}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                  {formatDateTime(p.created_at)}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  {p.purpose.replace('_', ' ')}
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  Property #{p.property_id}
                  {p.lease_id && <span className="block text-[11px] text-slate-400">Lease #{p.lease_id}</span>}
                </td>
                <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                  {formatINR(p.amount)}
                </td>
                <td className="py-3.5 px-4">
                  <PaymentStatusBadge status={p.status} />
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                  {p.razorpay_payment_id || p.razorpay_order_id || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
