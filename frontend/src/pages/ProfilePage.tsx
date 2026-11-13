import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersApi } from '../api/users';
import { getErrorMessage } from '../api/client';
import { UserRoleBadge } from '../components/common/Badge';
import { formatDateTime } from '../utils/formatters';
import { User, Phone, Lock, Mail, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser, logout, quickDemoLogin } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-sm text-slate-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      error('Name must be at least 2 characters.');
      return;
    }
    if (phone && !/^\d{10,12}$/.test(phone)) {
      error('Phone number must be between 10 and 12 digits.');
      return;
    }
    if (password && password.length < 8) {
      error('New password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await usersApi.updateProfile({
        name,
        phone: phone || null,
        password: password || undefined,
      });
      setPassword('');
      await refreshUser();
      success('Profile updated successfully!');
    } catch (err: any) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm('Are you sure you want to deactivate your EstateHub account? You will be logged out.')) {
      try {
        await usersApi.deactivateAccount();
        success('Your account has been deactivated.');
        logout();
      } catch (err: any) {
        error(getErrorMessage(err));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Header banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black">{user.name}</h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
                <div className="mt-2">
                  <UserRoleBadge role={user.role} />
                </div>
              </div>
            </div>
          </div>

          {/* Form section */}
          <div className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleUpdate} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Account Information</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Email address is fixed for security identification.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-slate-400 font-normal">(10-12 digits)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Change Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>

            {/* Quick Demo Switcher on Profile */}
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Switch Demo Role
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Experience EstateHub from different role viewpoints (Tenant, Landlord, Admin):
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => quickDemoLogin('TENANT')}
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  Switch to Tenant
                </button>
                <button
                  onClick={() => quickDemoLogin('OWNER')}
                  className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  Switch to Owner
                </button>
                <button
                  onClick={() => quickDemoLogin('ADMIN')}
                  className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors"
                >
                  Switch to Admin
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Danger Zone
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Deactivating your account will disable login access and hide your listed properties.
              </p>
              <button
                type="button"
                onClick={handleDeactivate}
                className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
              >
                Deactivate My Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
