import React, { useState } from 'react';
import { Property } from '../../types';
import { Modal } from '../common/Modal';
import { bookingsApi } from '../../api/bookings';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { formatINR } from '../../utils/formatters';
import { Calendar, MessageSquare, Clock } from 'lucide-react';

interface BookingModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  property,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  // default date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState(defaultDateStr);
  const [message, setMessage] = useState('');

  if (!property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      error('Please pick a booking inspection date.');
      return;
    }

    setLoading(true);
    try {
      await bookingsApi.create({
        property_id: property.id,
        booking_date: bookingDate,
        message: message.trim() || undefined,
      });
      success('Booking request sent to property owner!');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Booking / Schedule Visit"
      subtitle="Send a visit or reservation request directly to the property landlord."
      maxWidth="md"
    >
      {/* Property summary */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{property.title}</h4>
          <p className="text-[11px] text-slate-500">{property.city}, {property.state}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-700">{formatINR(property.rent)}</span>
          <span className="text-[10px] text-slate-400 block">/month</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Preferred Date *
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Select any upcoming date for inspection or move-in.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Note to Landlord <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <textarea
              rows={3}
              placeholder="e.g. Hello, I am relocating for work and would like to visit the flat this Saturday afternoon..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
          >
            {loading ? 'Submitting...' : 'Send Booking Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
