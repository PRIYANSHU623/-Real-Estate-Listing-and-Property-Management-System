import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { analyticsApi } from '../api/analytics';
import { adminApi } from '../api/admin';
import { vendorsApi } from '../api/vendors';
import { propertiesApi } from '../api/properties';
import { AdminAnalytics, Property, User, UserRole, Vendor } from '../types';
import { StatCard } from '../components/common/StatCard';
import { UserRoleBadge } from '../components/common/Badge';
import { VendorModal } from '../components/admin/VendorModal';
import { UserManagementModal } from '../components/admin/UserManagementModal';
import { PropertyCard } from '../components/properties/PropertyCard';
import { PropertyDetailModal } from '../components/properties/PropertyDetailModal';
import { formatINR, formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../api/client';
import {
  ShieldAlert,
  Users,
  Building,
  Wrench,
  CreditCard,
  Plus,
  Percent,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Clock,
  Phone,
  Mail,
  UserCheck,
  Search,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'vendors' | 'properties'>('overview');

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Users tab
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Vendors tab
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  // Properties tab
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [loadingTab, setLoadingTab] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const data = await analyticsApi.getAdminAnalytics();
      setAnalytics(data);
    } catch {
      // ignore
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const fetchTabContent = useCallback(async () => {
    setLoadingTab(true);
    try {
      if (activeTab === 'overview' || activeTab === 'users') {
        const res = await adminApi.listUsers({
          role: roleFilter || undefined,
          page_size: 50,
        });
        setUsers(res.items);
      }
      if (activeTab === 'vendors') {
        const res = await vendorsApi.list({ page_size: 50 });
        setVendors(res.items);
      }
      if (activeTab === 'properties') {
        const res = await propertiesApi.list({ page_size: 50 });
        setProperties(res.items);
      }
    } catch (err: any) {
      error(getErrorMessage(err));
    } finally {
      setLoadingTab(false);
    }
  }, [activeTab, roleFilter, error]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchTabContent();
  }, [fetchTabContent]);

  const handleDeleteVendor = async (vendor: Vendor) => {
    if (window.confirm(`Are you sure you want to remove vendor "${vendor.name}"?`)) {
      try {
        await vendorsApi.delete(vendor.id);
        success(`Vendor ${vendor.name} deleted`);
        fetchTabContent();
      } catch (err: any) {
        error(getErrorMessage(err));
      }
    }
  };

  const handleDeactivateUser = async (targetUser: User) => {
    if (targetUser.id === user?.id) {
      error('Admins cannot deactivate their own account');
      return;
    }
    if (window.confirm(`Deactivate user account ${targetUser.email}?`)) {
      try {
        await adminApi.deactivateUser(targetUser.id);
        success(`User ${targetUser.email} deactivated`);
        fetchTabContent();
      } catch (err: any) {
        error(getErrorMessage(err));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-bold mb-1 uppercase tracking-wider">
              System Administration
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Oversight & Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              System health KPIs, user management, vendor directory, and global properties oversight.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setVendorToEdit(null);
                setIsVendorModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Vendor
            </button>
          </div>
        </div>

        {/* System Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Registered Users"
            value={analytics ? analytics.total_users : '—'}
            subtitle={`${analytics?.total_owners || 0} owners • ${analytics?.total_tenants || 0} tenants`}
            icon={<Users className="w-5 h-5" />}
            color="purple"
          />
          <StatCard
            title="System Properties"
            value={analytics ? analytics.total_properties : '—'}
            subtitle={`${analytics?.occupied_properties || 0} occupied • ${analytics?.vacant_properties || 0} vacant`}
            icon={<Building className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            title="Total Platform Revenue"
            value={analytics ? formatINR(analytics.total_revenue) : '—'}
            subtitle={`${analytics?.active_leases || 0} active tenant leases`}
            icon={<CreditCard className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            title="Open Support Tickets"
            value={analytics ? analytics.open_maintenance_tickets : '—'}
            subtitle="Pending repairs across units"
            icon={<Wrench className="w-5 h-5" />}
            color="blue"
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: ShieldAlert },
            { id: 'users', label: 'User Directory', icon: Users, count: users.length },
            { id: 'vendors', label: 'Maintenance Vendors', icon: Wrench, count: vendors.length },
            { id: 'properties', label: 'Global Properties', icon: Building, count: properties.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-purple-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Panes */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4">Platform Health & Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-1">FastAPI Backend</h4>
                  <p className="text-slate-500 mb-3">Live on http://localhost:8000</p>
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                  >
                    Open Swagger UI →
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-1">Razorpay Gateway</h4>
                  <p className="text-slate-500 mb-3">Order creation and verification active</p>
                  <span className="text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded">
                    Active & Simulated
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-1">System Occupancy</h4>
                  <p className="text-slate-500 mb-3">
                    {analytics?.occupied_properties || 0} out of {analytics?.total_properties || 0} properties leased
                  </p>
                  <span className="text-blue-700 bg-blue-100 font-semibold px-2 py-0.5 rounded">
                    {analytics?.occupancy_rate.toFixed(1) || 0}% Occupancy
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Registered Accounts</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Filter by Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                >
                  <option value="">All Roles</option>
                  <option value="TENANT">Tenants Only</option>
                  <option value="OWNER">Owners Only</option>
                  <option value="ADMIN">Admins Only</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Joined</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{u.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-slate-400 text-[11px] font-mono">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <UserRoleBadge role={u.role} />
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{u.phone || '—'}</td>
                        <td className="py-3.5 px-4">
                          {u.is_active ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{formatDateTime(u.created_at)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setUserToEdit(u)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                              title="Edit Role & Permissions"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {u.is_active && u.id !== user?.id && (
                              <button
                                type="button"
                                onClick={() => handleDeactivateUser(u)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Deactivate Account"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Approved Maintenance Vendors</h3>
              <button
                type="button"
                onClick={() => {
                  setVendorToEdit(null);
                  setIsVendorModalOpen(true);
                }}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Onboard Vendor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-xs">
                        {vendor.service_type}
                      </span>
                      {vendor.is_active ? (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Available
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{vendor.name}</h4>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      {vendor.phone && (
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {vendor.phone}
                        </div>
                      )}
                      {vendor.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {vendor.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setVendorToEdit(vendor);
                        setIsVendorModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVendor(vendor)}
                      className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">All System Properties</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onSelect={(selected) => setSelectedProperty(selected)}
                  userRole="ADMIN"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vendor Modal */}
      <VendorModal
        isOpen={isVendorModalOpen}
        vendorToEdit={vendorToEdit}
        onClose={() => {
          setIsVendorModalOpen(false);
          setVendorToEdit(null);
        }}
        onSuccess={() => {
          fetchTabContent();
        }}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={!!userToEdit}
        user={userToEdit}
        onClose={() => setUserToEdit(null)}
        onSuccess={() => {
          fetchTabContent();
          fetchAnalytics();
        }}
      />

      {/* Property Details Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        currentUserRole="ADMIN"
      />
    </div>
  );
};
