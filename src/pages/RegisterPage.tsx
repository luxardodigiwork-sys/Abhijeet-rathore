import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CustomerAuth } from '../components/CustomerAuth';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function RegisterPage() {
  const { user, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/account';

  useEffect(() => {
    if (isAuthReady && user) {
      if (user.role === 'customer') {
        navigate(from, { replace: true });
      } else if (['super_admin', 'admin'].includes(user.role)) {
        navigate('/admin/dashboard');
      } else {
        navigate('/backend');
      }
    }
  }, [user, isAuthReady, navigate, from]);

  useEffect(() => {
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-brand-bg pt-32 pb-20 flex flex-col justify-center"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display uppercase tracking-widest text-brand-black mb-2">Create Account</h1>
        <p className="text-sm text-brand-secondary">Join us instantly using your mobile number.</p>
      </div>
      <CustomerAuth />
    </motion.div>
  );
}
