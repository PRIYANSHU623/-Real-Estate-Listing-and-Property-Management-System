import React, { useState } from 'react';
import { TicketCreateInput, TicketPriority } from '../../types';
import { Modal } from '../common/Modal';
import { maintenanceApi } from '../../api/maintenance';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { Wrench, AlertTriangle } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPropertyId?: number;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultPropertyId,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [propertyId, setPropertyId] = useState<number>(defaultPropertyId || 1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim().length < 3) {
      error('Title must be at least 3 characters.');
      return;
    }
    if (description.trim().length < 10) {
      error('Description must be at least 10 characters.');
      return;
    }

    setLoading(true);
    try {
      await maintenanceApi.create({
        property_id: Number(propertyId),
        title,
        description,
        priority,
      });
      success('Maintenance ticket created! Landlord notified.');
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
      title="Submit Maintenance Request"
      subtitle="Report an issue or repair requirement for your leased residence."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Property ID *</label>
          <input
            type="number"
            required
            min={1}
            value={propertyId}
            onChange={(e) => setPropertyId(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Headline *</label>
          <input
            type="text"
            required
            placeholder="e.g. Master bedroom AC leaking water"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level *</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: 'LOW', label: 'Low' },
              { val: 'MEDIUM', label: 'Medium' },
              { val: 'HIGH', label: 'High' },
              { val: 'URGENT', label: 'Urgent' },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setPriority(p.val as TicketPriority)}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                  priority === p.val
                    ? p.val === 'URGENT'
                      ? 'bg-rose-50 border-rose-500 text-rose-700'
                      : 'bg-emerald-50 border-emerald-600 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Description * <span className="text-slate-400 font-normal">(min 10 chars)</span>
          </label>
          <textarea
            rows={4}
            required
            placeholder="Describe what happened, where the issue is located, and when it started..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
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
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <Wrench className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
