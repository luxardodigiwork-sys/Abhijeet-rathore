import React from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function PrimeMembershipFailedPage() {
  return (
    <div className="section-padding max-w-4xl mx-auto min-h-[70vh] text-center">
      <div className="flex justify-center mb-8">
        <AlertCircle className="w-20 h-20 text-brand-black stroke-[1px]" />
      </div>
      
      <SectionHeader 
        title="Payment Failed" 
        subtitle="Prime Member Activation Incomplete" 
      />
      
      <div className="space-y-12 max-w-2xl mx-auto">
        <div className="space-y-6">
          <p className="text-lg font-sans text-brand-black">
            We were unable to process your payment for the Prime Member status.
          </p>
          <p className="font-sans text-brand-secondary leading-relaxed">
            This could be due to a temporary issue with the payment gateway or insufficient funds. No charges have been made to your account.
          </p>
        </div>

        <div className="bg-brand-bg p-10 border border-brand-divider space-y-8 text-left">
          <h4 className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-black border-b border-brand-divider pb-4">Troubleshooting Steps</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-black">Check Card Details</h5>
              <p className="text-xs font-sans text-brand-secondary leading-relaxed">
                Ensure your card number, expiry date, and CVV are entered correctly.
              </p>
            </div>
            <div className="space-y-3">
              <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-black">International Access</h5>
              <p className="text-xs font-sans text-brand-secondary leading-relaxed">
                Verify if your card is enabled for international transactions if you are outside India.
              </p>
            </div>
            <div className="space-y-3">
              <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-black">Try Another Method</h5>
              <p className="text-xs font-sans text-brand-secondary leading-relaxed">
                You may try using a different card or payment method (UPI/Netbanking for India).
              </p>
            </div>
            <div className="space-y-3">
              <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-black">Contact Support</h5>
              <p className="text-xs font-sans text-brand-secondary leading-relaxed">
                If the issue persists, please contact your bank or our support concierge.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
          <Link to="/prime-membership/checkout" className="btn-primary px-12">Retry Payment</Link>
          <Link to="/contact" className="px-12 py-4 border border-brand-black text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-brand-black hover:text-brand-white transition-all">Contact Concierge</Link>
        </div>
      </div>
    </div>
  );
}
