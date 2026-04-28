import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { auth } from '../firebase';

export function AdminGuard() {
  const { isAuthReady } = useAuth();
  
  // Single-Admin hardcoded override + Env variable fallback
  const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || '+917976672811';

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-black" />
      </div>
    );
  }

  // The Vault Guard: Direct Firebase verification for Maximum Security
  const currentUser = auth.currentUser;

  // Strict Phone Number Check Hard-Coded Validation
  if (!currentUser || currentUser.phoneNumber !== ADMIN_PHONE) {
    // Kicked out directly to Home (Customers hit this if they try to access /admin URL)
    return <Navigate to="/" replace />;
  }

  // If phone exactly matches the Master Identity, render the nested Admin routes
  return <Outlet />;
}
