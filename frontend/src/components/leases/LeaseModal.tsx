import React, { useState, useEffect } from 'react';
import { Lease, LeaseCreateInput, LeaseStatus, LeaseUpdateInput } from '../../types';
import { Modal } from '../common/Modal';
import { leasesApi } from '../../api/leases';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { Calendar, FileText, IndianRupee, Key, User } from 'lucide-react';

interface LeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leaseToEdit?: Lease | null;
  defaultPropertyId?: number;
}

export const LeaseModal: React.FC<LeaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  leaseToEdit,
  defaultPropertyId,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const nextYearStr = nextYear.toISOString().split('T')[0];

  const [propertyId, setPropertyId] = useState<number>(defaultPropertyId || 1);
  const [tenantId, setTenantId] = useState<number>(1);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextYearStr);
  const [monthlyRent, setMonthlyRent] = useState<number>(30000);
  const [securityDeposit, setSecurityDeposit] = useState<number>(60000);
  const [agreementUrl, setAgreementUrl] = useState('');
  const [status, setStatus] = useState<LeaseStatus>('ACTIVE');

  useEffect(() => {
    if (leaseToEdit) {
      setPropertyId(leaseToEdit.property_id);
      setTenantId(leaseToEdit.tenant_id);
      setStartDate(leaseToEdit.start_date);
      setEndDate(leaseToEdit.end_date);
      setMonthlyRent(leaseToEdit.monthly_rent);
      setSecurityDeposit(leaseToEdit.security_deposit);
      setAgreementUrl(leaseToEdit.agreement_url || '');
      setStatus(leaseToEdit.status);
    } else {
      if (defaultPropertyId) setPropertyId(defaultPropertyId);
      setStartDate(todayStr);
      setEndDate(nextYearStr);
      setMonthlyRent(30000);
      setSecurityDeposit(60000);
      setAgreementUrl('https://estatehub.com/agreements/sample-lease.pdf');
    }
  }, [leaseToEdit, defaultPropertyId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(endDate) <= new Date(startDate)) {
      error('Lease End Date must be strictly after Start Date.');
      return;
    }
    if (monthlyRent <= 0) {
      error('Monthly rent must be greater than 0.');
      return;
    }

    setLoading(true);
    try {
      if (leaseToEdit) {
        const updateData: LeaseUpdateInput = {
          start_date: startDate,
          end_date: endDate,
          monthly_rent: monthlyRent,
          security_deposit: securityDeposit,
          status,
          agreement_url: agreementUrl || undefined,
        };
        await leasesApi.update(leaseToEdit.id, updateData);
        success('Lease agreement updated successfully!');
      } else {
        const createData: LeaseCreateInput = {
          property_id: Number(propertyId),
          tenant_id: Number(tenantId),
          start_date: startDate,
          end_date: endDate,
          monthly_rent: Number(monthlyRent),
          security_deposit: Number(securityDeposit),
          agreement_url: agreementUrl || undefined,
        };
        await leasesApi.create(createData);
        success('New lease generated successfully!');
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
      title={leaseToEdit ? 'Modify Lease Agreement' : 'Generate New Lease Agreement'}
      subtitle="Establish rent terms, duration and deposit for a tenant."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* IDs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Property ID *</label>
            <input
              type="number"
              required
              min={1}
              disabled={!!leaseToEdit}
              value={propertyId}
              onChange={(e) => setPropertyId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tenant ID *</label>
            <input
              type="number"
              required
              min={1}
              disabled={!!leaseToEdit}
              value={tenantId}
              onChange={(e) => setTenantId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-50 font-mono"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lease Start Date *</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lease End Date *</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Monthly Rent & Security Deposit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent (₹) *</label>
            <input
              type="number"
              required
              min={1}
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Security Deposit (₹) *</label>
            <input
              type="number"
              required
              min={0}
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold"
            />
          </div>
        </div>

        {leaseToEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lease Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeaseStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="EXPIRED">Expired</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Agreement Document URL</label>
          <input
            type="url"
            placeholder="https://example.com/agreements/lease-agreement.pdf"
            value={agreementUrl}
            onChange={(e) => setAgreementUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
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
            {loading ? 'Saving...' : leaseToEdit ? 'Update Lease' : 'Create Lease Agreement'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
