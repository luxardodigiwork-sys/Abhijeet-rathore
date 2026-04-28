import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoginErrorPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white border border-red-100 p-8 rounded-3xl shadow-xl text-center"
      >
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-display uppercase tracking-widest text-brand-black mb-2">Access Denied</h1>
        <p className="text-sm font-sans text-brand-secondary mb-8">
          The phone number provided does not have the strict administrator privileges required to access the Luxardo dashboard.
        </p>
        
        <Link to="/admin/login" className="inline-flex items-center justify-center gap-2 w-full py-4 bg-brand-black text-brand-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-brand-black/90 transition-colors">
          <ArrowLeft size={16} /> Return to Login
        </Link>
      </motion.div>
    </div>
  );
}
