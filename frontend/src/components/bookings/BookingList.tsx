import React, { useState } from 'react';
import { Booking, BookingStatus, UserRole } from '../../types';
import { bookingsApi } from '../../api/bookings';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { BookingStatusBadge } from '../common/Badge';
import { formatDate, timeAgo } from '../../utils/formatters';
import { Calendar, Check, X, Clock, MessageSquare, AlertCircle } from 'lucide-react';

interface BookingListProps {
  bookings: Booking[];
  userRole: UserRole;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  userRole,
  onRefresh,
  isLoading,
}) => {
  const { success, error } = useToast();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleUpdateStatus = async (bookingId: number, newStatus: BookingStatus) => {
    setProcessingId(bookingId);
    try {
      await bookingsApi.updateStatus(bookingId, newStatus);
      success(`Booking status updated to ${newStatus}`);
      onRefresh();
    } catch (err: any) {
      error(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-emerald-600 opacity-60" />
        <p className="text-xs font-medium">Loading bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
        <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No booking requests found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {userRole === 'TENANT'
            ? 'You have not scheduled any property visits or bookings yet.'
            : 'No booking requests have been received for your listed properties.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="divide-y divide-slate-100">
        {bookings.map((booking) => {
          const isPending = booking.status === 'PENDING';
          const isBusy = processingId === booking.id;

          return (
            <div
              key={booking.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <BookingStatusBadge status={booking.status} />
                  <span className="text-xs text-slate-400">• Requested {timeAgo(booking.created_at)}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">
                  Property ID #{booking.property_id}
                </h4>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <Calendar className="w-3.5 h-3.5" /> Visit: {formatDate(booking.booking_date)}
                  </span>
                </div>

                {booking.message && (
                  <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>"{booking.message}"</span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {userRole === 'OWNER' && isPending && (
                  <>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUpdateStatus(booking.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </>
                )}

                {userRole === 'TENANT' && isPending && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
