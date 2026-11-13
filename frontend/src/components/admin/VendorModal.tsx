import React, { useState, useEffect } from 'react';
import { Vendor, VendorCreateInput, VendorUpdateInput } from '../../types';
import { Modal } from '../common/Modal';
import { vendorsApi } from '../../api/vendors';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { Wrench, Phone, Mail, User } from 'lucide-react';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendorToEdit?: Vendor | null;
}

const SERVICE_TYPES = [
  'Plumbing',
  'Electrical',
  'HVAC & Air Conditioning',
  'Carpentry & Woodwork',
  'Painting & Masonry',
  'Deep Cleaning & Sanitization',
  'Pest Control',
  'Appliance Repair',
];

export const VendorModal: React.FC<VendorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  vendorToEdit,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceType, setServiceType] = useState('Plumbing');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (vendorToEdit) {
      setName(vendorToEdit.name);
      setPhone(vendorToEdit.phone || '');
      setEmail(vendorToEdit.email || '');
      setServiceType(vendorToEdit.service_type);
      setIsActive(vendorToEdit.is_active);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setServiceType('Plumbing');
      setIsActive(true);
    }
  }, [vendorToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      error('Vendor name must be at least 2 characters.');
      return;
    }
    if (phone && !/^\d{10,12}$/.test(phone)) {
      error('Phone must be 10-12 digits.');
      return;
    }

    setLoading(true);
    try {
      if (vendorToEdit) {
        const updateData: VendorUpdateInput = {
          name,
          phone: phone || undefined,
          email: email || undefined,
          service_type: serviceType,
          is_active: isActive,
        };
        await vendorsApi.update(vendorToEdit.id, updateData);
        success('Vendor details updated successfully!');
      } else {
        const createData: VendorCreateInput = {
          name,
          phone: phone || undefined,
          email: email || undefined,
          service_type: serviceType,
          is_active: isActive,
        };
        await vendorsApi.create(createData);
        success('New maintenance vendor onboarded!');
      }
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
      title={vendorToEdit ? 'Edit Vendor Profile' : 'Onboard Maintenance Vendor'}
      subtitle="Contractors and technicians available for property maintenance dispatches."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Vendor Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. QuickFix Electricals & HVAC"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Service Specialty *</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          >
            {SERVICE_TYPES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Phone Number <span className="text-slate-400 font-normal">(10-12 digits)</span>
          </label>
          <input
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            placeholder="contact@vendor.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
          />
          <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
            Vendor is Active & Available for Service Calls
          </label>
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
            {loading ? 'Saving...' : vendorToEdit ? 'Update Vendor' : 'Onboard Vendor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
