import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  Bell,
  User as UserIcon,
  LogOut,
  CheckCheck,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  CreditCard,
  Wrench,
  FileText,
  CalendarCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { notificationsApi } from '../../api/notifications';
import { Notification, UserRole } from '../../types';
import { UserRoleBadge } from './Badge';
import { timeAgo } from '../../utils/formatters';

interface NavbarProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const { user, isAuthenticated, logout, quickDemoLogin, unreadCount, refreshNotifications } = useAuth();
  const { success, error } = useToast();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [switchingDemo, setSwitchingDemo] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchNotificationsList = async () => {
    if (!isAuthenticated) return;
    setLoadingNotifications(true);
    try {
      const res = await notificationsApi.list({ page_size: 6 });
      setNotifications(res.items);
    } catch {
      // ignore
    } finally {
      setLoadingNotifications(false);
    }
  };

  const toggleNotifications = () => {
    if (!notificationsOpen) {
      fetchNotificationsList();
    }
    setNotificationsOpen(!notificationsOpen);
    setUserMenuOpen(false);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      refreshNotifications();
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      refreshNotifications();
      success('All notifications marked as read');
    } catch {
      error('Failed to mark all notifications as read');
    }
  };

  const handleDemoSwitch = async (role: UserRole) => {
    setSwitchingDemo(true);
    try {
      await quickDemoLogin(role);
      success(`Switched to Demo ${role} account`);
    } catch (err: any) {
      error(err.message || `Failed to switch to ${role}`);
    } finally {
      setSwitchingDemo(false);
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Marketplace', path: '/' },
    ...(user?.role === 'OWNER'
      ? [
          { label: 'My Properties', path: '/owner/properties' },
          { label: 'Bookings', path: '/owner/bookings' },
          { label: 'Leases', path: '/owner/leases' },
          { label: 'Maintenance', path: '/owner/maintenance' },
          { label: 'Analytics', path: '/owner/analytics' },
        ]
      : []),
    ...(user?.role === 'TENANT'
      ? [
          { label: 'My Bookings', path: '/tenant/bookings' },
          { label: 'My Leases', path: '/tenant/leases' },
          { label: 'Payments', path: '/tenant/payments' },
          { label: 'Maintenance', path: '/tenant/maintenance' },
        ]
      : []),
    ...(user?.role === 'ADMIN'
      ? [
          { label: 'Overview', path: '/admin/overview' },
          { label: 'Users', path: '/admin/users' },
          { label: 'Vendors', path: '/admin/vendors' },
          { label: 'All Properties', path: '/admin/properties' },
        ]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">Estate<span className="text-emerald-600">Hub</span></span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">PMS</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-emerald-700 bg-emerald-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher Pill (always visible for easy testing) */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
              <span className="px-2 text-slate-500 text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Demo:
              </span>
              <button
                onClick={() => handleDemoSwitch('TENANT')}
                disabled={switchingDemo}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  user?.role === 'TENANT' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tenant
              </button>
              <button
                onClick={() => handleDemoSwitch('OWNER')}
                disabled={switchingDemo}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  user?.role === 'OWNER' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Owner
              </button>
              <button
                onClick={() => handleDemoSwitch('ADMIN')}
                disabled={switchingDemo}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  user?.role === 'ADMIN' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>

            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={toggleNotifications}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-scale-up">
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {loadingNotifications ? (
                          <div className="p-6 text-center text-sm text-slate-400">Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                              className={`p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-start gap-3 ${
                                !n.is_read ? 'bg-emerald-50/40' : ''
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  !n.is_read ? 'bg-emerald-500' : 'bg-transparent'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-bold text-slate-900 leading-snug">{n.title}</h5>
                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">{timeAgo(n.created_at)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold text-slate-800 leading-none">{user?.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{user?.role}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-scale-up p-2">
                      <div className="p-3 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-2">
                          <UserRoleBadge role={user!.role} />
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" /> My Profile & Security
                      </Link>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          success('Logged out successfully');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg hover:shadow-emerald-600/30"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block px-3 mb-2">
              Switch Demo Role:
            </span>
            <div className="grid grid-cols-3 gap-2 px-1">
              <button
                onClick={() => handleDemoSwitch('TENANT')}
                className="py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200"
              >
                Tenant
              </button>
              <button
                onClick={() => handleDemoSwitch('OWNER')}
                className="py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                Owner
              </button>
              <button
                onClick={() => handleDemoSwitch('ADMIN')}
                className="py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 border border-purple-200"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
