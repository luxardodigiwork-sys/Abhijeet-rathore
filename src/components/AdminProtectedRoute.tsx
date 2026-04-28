import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function AdminProtectedRoute() {
  const { user, isAuthReady } = useAuth();
  
  // Single-Admin hardcoded override + Env variable fallback
  const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || '+917976672811';

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-black" />
      </div>
    );
  }

  // Strict Phone Number Check
  if (!user || user.phoneNumber !== ADMIN_PHONE) {
    // Redirect to the login error page
    return <Navigate to="/login-error" replace />;
  }

  // If phone matches, render the nested Admin routes
  return <Outlet />;
}
