import React, { useState, useEffect } from 'react';
import { MaintenanceTicket, Vendor } from '../../types';
import { Modal } from '../common/Modal';
import { maintenanceApi } from '../../api/maintenance';
import { vendorsApi } from '../../api/vendors';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { Wrench, Phone, Mail, UserCheck } from 'lucide-react';

interface AssignVendorModalProps {
  ticket: MaintenanceTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignVendorModal: React.FC<AssignVendorModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      vendorsApi
        .list({ page_size: 20 })
        .then((res) => {
          setVendors(res.items);
          if (res.items.length > 0) {
            setSelectedVendorId(ticket?.vendor_id || res.items[0].id);
          }
        })
        .catch((err) => error(getErrorMessage(err)))
        .finally(() => setFetching(false));
    }
  }, [isOpen, ticket]);

  if (!ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId) {
      error('Please select a vendor.');
      return;
    }

    setLoading(true);
    try {
      await maintenanceApi.assignVendor(ticket.id, selectedVendorId);
      success('Vendor assigned to maintenance ticket successfully!');
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
      title="Assign Maintenance Vendor"
      subtitle={`Select a specialized technician or service partner for: ${ticket.title}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {fetching ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading approved vendors...</div>
        ) : vendors.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
            No active vendors registered. Administrators can add vendors under the Vendors tab.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {vendors.map((vendor) => (
              <label
                key={vendor.id}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedVendorId === vendor.id
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="vendor"
                    value={vendor.id}
                    checked={selectedVendorId === vendor.id}
                    onChange={() => setSelectedVendorId(vendor.id)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{vendor.name}</h5>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                      {vendor.service_type}
                    </span>
                  </div>
                </div>
                {vendor.phone && (
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" /> {vendor.phone}
                  </span>
                )}
              </label>
            ))}
          </div>
        )}

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
            disabled={loading || vendors.length === 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" /> {loading ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
