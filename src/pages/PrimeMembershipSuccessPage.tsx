import React, { useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Crown, CheckCircle2, ArrowRight, Calendar, Scissors, ShieldCheck } from 'lucide-react';

export default function PrimeMembershipSuccessPage() {
  const { upgradeToPrime } = useAuth();

  useEffect(() => {
    // Automatically upgrade the user to Prime status when they reach this page
    upgradeToPrime();
  }, [upgradeToPrime]);

  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-brand-white border border-brand-divider p-12 md:p-20 text-center space-y-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-brand-black text-brand-white rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 size={48} />
          </motion.div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-brand-black">
              <Crown size={24} />
              <span className="text-[11px] uppercase tracking-[0.3em] font-bold">Prime Member Status</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display tracking-tight">Welcome to Prime</h1>
            <p className="font-sans text-brand-secondary text-lg max-w-xl mx-auto leading-relaxed">
              Your membership has been successfully activated. You now have full access to the inner circle of LUXARDO.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-brand-divider">
            <div className="space-y-4">
              <Calendar className="mx-auto text-brand-black" size={24} />
              <h4 className="text-[11px] uppercase tracking-widest font-bold">Style Consultation</h4>
              <p className="text-xs font-sans text-brand-secondary">Book your private session with our stylists.</p>
            </div>
            <div className="space-y-4">
              <Scissors className="mx-auto text-brand-black" size={24} />
              <h4 className="text-[11px] uppercase tracking-widest font-bold">Bespoke Access</h4>
              <p className="text-xs font-sans text-brand-secondary">Commission unique garments tailored to you.</p>
            </div>
            <div className="space-y-4">
              <ShieldCheck className="mx-auto text-brand-black" size={24} />
              <h4 className="text-[11px] uppercase tracking-widest font-bold">Priority Support</h4>
              <p className="text-xs font-sans text-brand-secondary">Dedicated concierge for all your needs.</p>
            </div>
          </div>

          <div className="pt-12 flex flex-col md:flex-row justify-center gap-6">
            <Link to="/prime-dashboard" className="btn-primary px-12 py-5 flex items-center justify-center gap-4">
              GO TO PRIME DASHBOARD <ArrowRight size={18} />
            </Link>
            <Link to="/account" className="btn-secondary border border-brand-black px-12 py-5 text-[11px] uppercase tracking-widest font-bold hover:bg-brand-black hover:text-brand-white transition-all">
              VIEW ACCOUNT
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm font-sans text-brand-secondary">
            A confirmation email has been sent to your registered address.
          </p>
        </div>
      </div>
    </div>
  );
}
