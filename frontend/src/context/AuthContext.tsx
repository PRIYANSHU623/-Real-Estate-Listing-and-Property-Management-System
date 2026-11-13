import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../api/auth';
import { notificationsApi } from '../api/notifications';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  unreadCount: number;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, phone: string | null, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  quickDemoLogin: (role: UserRole) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('current_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshNotifications = useCallback(async () => {
    if (!localStorage.getItem('access_token')) return;
    try {
      const res = await notificationsApi.unreadCount();
      setUnreadCount(res.unread);
    } catch {
      // ignore in background
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
      localStorage.setItem('current_user', JSON.stringify(currentUser));
      refreshNotifications();
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
    } finally {
      setIsLoading(false);
    }
  }, [refreshNotifications]);

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    const tokens = await authApi.login({ email, password });
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    setToken(tokens.access_token);

    const currentUser = await authApi.me();
    setUser(currentUser);
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    refreshNotifications();
    return currentUser;
  };

  const register = async (name: string, email: string, phone: string | null, password: string, role: UserRole) => {
    await authApi.register({ name, email, phone: phone || null, password, role });
    // After registration, log them in automatically
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    setUnreadCount(0);
  };

  const quickDemoLogin = async (role: UserRole): Promise<User> => {
    const demoAccounts: Record<UserRole, { name: string; email: string; phone: string; pass: string }> = {
      OWNER: {
        name: 'Vikram Malhotra',
        email: 'owner@estatehub.com',
        phone: '9876543210',
        pass: 'Password123!',
      },
      TENANT: {
        name: 'Aanya Sharma',
        email: 'tenant@estatehub.com',
        phone: '9876543211',
        pass: 'Password123!',
      },
      ADMIN: {
        name: 'System Admin',
        email: 'admin@estatehub.com',
        phone: '9876543212',
        pass: 'Password123!',
      },
    };

    const target = demoAccounts[role];

    try {
      // First try to login
      return await login(target.email, target.pass);
    } catch {
      // If login failed (user does not exist yet), try registering them first!
      try {
        await authApi.register({
          name: target.name,
          email: target.email,
          phone: target.phone,
          password: target.pass,
          role: role,
        });
        return await login(target.email, target.pass);
      } catch {
        // Fallback: try logging in once more
        return await login(target.email, target.pass);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        unreadCount,
        login,
        register,
        logout,
        refreshUser,
        refreshNotifications,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
