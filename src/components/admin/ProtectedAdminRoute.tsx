import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedAdminRoute() {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-12 h-12 border-4 border-brand-divider border-t-brand-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !['super_admin', 'admin'].includes(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
