import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';
import { getErrorMessage } from '../../api/client';
import { Mail, Lock, User, Phone, Sparkles, Building, Key, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, register, /* quickDemoLogin */ } = useAuth();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('TENANT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        success('Welcome back!');
        onClose();
      } else {
        if (name.trim().length < 2) {
          throw new Error('Name must be at least 2 characters.');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        if (phone && !/^\d{10,12}$/.test(phone)) {
          throw new Error('Phone must be between 10 and 12 digits (numbers only).');
        }

        await register(name, email, phone || null, password, role);
        success('Account created and logged in!');
        onClose();
      }
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  /*
  const handleDemoPreset = async (demoRole: UserRole) => {
    setLoading(true);
    setFormError(null);
    try {
      await quickDemoLogin(demoRole);
      success(`Signed in as Demo ${demoRole}!`);
      onClose();
    } catch (err: any) {
      setFormError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  */

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Sign in to EstateHub' : 'Create your EstateHub Account'}
      subtitle={mode === 'login' ? 'Access properties, bookings, leases and payments' : 'Join as a tenant, property owner, or administrator'}
      maxWidth="md"
    >
      {/* Mode Switcher Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setFormError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setFormError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Register New Account
        </button>
      </div>

      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('TENANT')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    role === 'TENANT'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Key className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                  <div className="text-xs">Tenant</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('OWNER')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    role === 'OWNER'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Building className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <div className="text-xs">Owner</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    role === 'ADMIN'
                      ? 'border-purple-500 bg-purple-50/50 text-purple-700 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                  <div className="text-xs">Admin</div>
                </button>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {mode === 'register' && (
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>
          {mode === 'register' && <p className="text-[11px] text-slate-400 mt-1">Must be at least 8 characters.</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-50 mt-2"
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      {/* 1-Click Demo Testing Presets */}
      {/*
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Instant Demo Logins
          </span>
          <span className="text-[11px] text-slate-400">One-click test accounts</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoPreset('TENANT')}
            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors"
          >
            Tenant Demo
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoPreset('OWNER')}
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
          >
            Owner Demo
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoPreset('ADMIN')}
            className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-purple-700 text-xs font-semibold border border-purple-200 transition-colors"
          >
            Admin Demo
          </button>
        </div>
      </div>
      */}
    </Modal>
  );
};
