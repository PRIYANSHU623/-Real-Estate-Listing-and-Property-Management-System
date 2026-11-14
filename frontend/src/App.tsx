import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { ExplorePage } from './pages/ExplorePage';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { TenantDashboard } from './pages/TenantDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';

// Protected Route helper
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
  onOpenAuth: () => void;
}> = ({ children, allowedRoles, onOpenAuth }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-xs font-semibold">
        Verifying security token...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Authentication Required</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          Please sign in with your EstateHub account{/* or use a quick demo preset */} to access this section.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
        >
          Sign In{/* / Demo Login */}
        </button>
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenAuthModal={handleOpenAuth} />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<ExplorePage onOpenAuth={handleOpenAuth} />} />

          {/* Owner Dashboard routes */}
          <Route
            path="/owner/*"
            element={
              <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']} onOpenAuth={() => handleOpenAuth('login')}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Tenant Dashboard routes */}
          <Route
            path="/tenant/*"
            element={
              <ProtectedRoute allowedRoles={['TENANT', 'ADMIN']} onOpenAuth={() => handleOpenAuth('login')}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']} onOpenAuth={() => handleOpenAuth('login')}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute onOpenAuth={() => handleOpenAuth('login')}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
