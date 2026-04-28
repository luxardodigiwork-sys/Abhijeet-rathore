import React from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const order = location.state?.order;
  const orderNumber = order?.id || "LX-" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

  return (
    <div className="section-padding max-w-4xl mx-auto min-h-[70vh] text-center">
      <div className="flex justify-center mb-8">
        <CheckCircle className="w-20 h-20 text-brand-black stroke-[1px]" />
      </div>
      
      <SectionHeader 
        title="Payment Successful" 
        subtitle={`Order Confirmed`} 
      />
      
      <div className="space-y-12 max-w-2xl mx-auto">
        <div className="space-y-6">
          <p className="text-lg font-sans text-brand-black">
            Thank you for choosing LUXARDO. Your order <span className="font-bold">{orderNumber}</span> has been successfully placed and is being prepared with the utmost care.
          </p>
          <p className="font-sans text-brand-secondary leading-relaxed">
            A confirmation email has been sent to your inbox. You can track your order status and view your master tailor's blueprint in your account dashboard.
          </p>
        </div>

        {order && (
          <div className="bg-brand-bg p-10 border border-brand-divider space-y-8 text-left">
            <h4 className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-black border-b border-brand-divider pb-4">Order Summary</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-sans">
                <span className="text-brand-secondary">Estimated Delivery</span>
                <span className="font-medium">3-5 Business Days</span>
              </div>
              <div className="flex justify-between text-sm font-sans">
                <span className="text-brand-secondary">Items</span>
                <span className="font-medium">{order.items.length} items</span>
              </div>
              <div className="flex justify-between text-sm font-sans">
                <span className="text-brand-secondary">Total Paid</span>
                <span className="font-medium">₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
          <Link to={`/track-order/${orderNumber}`} className="btn-primary px-12">Track Order</Link>
          <Link to="/collections" className="btn-outline px-12 py-4 text-[11px] uppercase tracking-[0.25em]">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
