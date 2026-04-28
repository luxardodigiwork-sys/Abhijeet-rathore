import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedDispatchRoute() {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
    </div>;
  }

  if (!user || (user.role !== 'dispatch' && !['super_admin', 'admin'].includes(user.role))) {
    return <Navigate to="/backend" replace />;
  }

  return <Outlet />;
}
