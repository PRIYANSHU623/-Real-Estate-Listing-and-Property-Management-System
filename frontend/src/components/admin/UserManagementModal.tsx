import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { UserCheck, Shield } from 'lucide-react';

interface UserManagementModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('TENANT');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setIsActive(user.is_active);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.updateUser(user.id, {
        role,
        is_active: isActive,
      });
      success(`User ${user.email} updated successfully!`);
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
      title="Manage User Permissions"
      subtitle={`Modify account attributes and access rights for ${user.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs font-bold text-slate-800">{user.name}</p>
          <p className="text-xs text-slate-500 font-mono">{user.email}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">System Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white font-medium"
          >
            <option value="TENANT">Tenant (Search, Book, Pay, Ticket)</option>
            <option value="OWNER">Owner (Listings, Bookings, Leases, Maintenance)</option>
            <option value="ADMIN">Administrator (Full System Oversight)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="userIsActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
          />
          <label htmlFor="userIsActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
            Account is Active (Allow platform login)
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
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" /> {loading ? 'Saving...' : 'Update Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
