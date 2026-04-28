import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Country } from '../types';
import { formatCurrency } from '../utils/currency';
import { storage } from '../utils/localStorage';

export default function PrimeMembershipCheckoutPage() {
  const { selectedCountry } = useOutletContext<{ selectedCountry: Country | null }>();
  const navigate = useNavigate();
  const [globalSettings, setGlobalSettings] = useState(storage.getPrimeGlobalSettings());

  useEffect(() => {
    const handleStorageChange = () => {
      setGlobalSettings(storage.getPrimeGlobalSettings());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!globalSettings.isLive) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-display mb-4">Service Unavailable</h2>
        <p className="font-sans text-brand-secondary max-w-md mx-auto mb-8">
          {globalSettings.offlineMessage}
        </p>
        <Link to="/prime-membership" className="btn-primary px-8 py-4">
          RETURN TO PRIME
        </Link>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: selectedCountry?.name || '',
    language: 'English',
    interest: ''
  });

  const membershipFee = 1499;
  const displayFee = membershipFee;

  const [agreements, setAgreements] = useState({
    annualPlan: false,
    bespokeSeparate: false,
    policies: false,
    nonRefundable: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreements({ ...agreements, [e.target.name]: e.target.checked });
  };

  const isFormValid = Object.values(agreements).every(Boolean) && 
                      formData.fullName && formData.email && formData.phone && formData.country && formData.language;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        setError('Razorpay SDK failed to load. Are you online?');
        setIsSubmitting(false);
        return;
      }

      // 2. Create order on backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: displayFee })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.order) {
        setError(orderData.error || 'Failed to initialize payment. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Luxardo",
        description: "Prime Membership",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            // 4. Verify payment on backend
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Simulate successful payment
              navigate('/prime-membership/success');
            } else {
              setError('Payment verification failed.');
              setIsSubmitting(false);
            }
          } catch (err) {
            console.error('Verification error:', err);
            setError('Payment verification failed.');
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#000000"
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        setError(response.error.description || 'Payment failed');
        setIsSubmitting(false);
      });
      paymentObject.open();

    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to process payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-padding max-w-[1400px] mx-auto min-h-[70vh]">
      <SectionHeader title="Prime Member Checkout" subtitle="Secure Payment" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Side: Order Summary */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-brand-white p-8 md:p-12 border border-brand-divider sticky top-32">
            <h3 className="text-3xl font-display mb-8">Order Summary</h3>
            
            <div className="space-y-6 font-sans text-brand-secondary border-b border-brand-divider pb-8">
              <div className="flex justify-between">
                <span>Product</span>
                <span className="text-brand-black">Prime Member</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="text-brand-black">12 Months</span>
              </div>
              <div className="flex justify-between">
                <span>Access Type</span>
                <span className="text-brand-black">Prime Member Status</span>
              </div>
              <div className="flex justify-between">
                <span>Membership Fee</span>
                <span className="text-brand-black">{formatCurrency(displayFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxes</span>
                <span>Included</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-8">
              <span className="text-xl font-display">Total</span>
              <span className="text-2xl font-display">{formatCurrency(displayFee)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Member Details Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            <div className="space-y-8">
              <h3 className="text-3xl font-display">Member Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input 
                  type="text" 
                  name="fullName"
                  placeholder="Full Name" 
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Address" 
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                />
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="Phone Number" 
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                />
                <input 
                  type="text" 
                  name="country"
                  placeholder="Country" 
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                />
                <input 
                  type="text" 
                  name="language"
                  placeholder="Preferred Language" 
                  required
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                />
                
                <select 
                  name="interest"
                  value={formData.interest}
                  onChange={handleInputChange}
                  className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors text-brand-secondary"
                >
                  <option value="" disabled>Primary Interest (Optional)</option>
                  <option value="bespoke">Bespoke Tailoring</option>
                  <option value="style">Style Consultation</option>
                  <option value="fabric">Fabric Guidance</option>
                  <option value="private">Prime Member Services</option>
                </select>
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-brand-divider">
              <h3 className="text-xl font-display mb-6">Required Agreements</h3>
              
              <label className="flex items-start gap-4 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="annualPlan"
                  checked={agreements.annualPlan}
                  onChange={handleCheckboxChange}
                  className="mt-1 accent-brand-black w-4 h-4" 
                  required
                />
                <span className="text-sm font-sans text-brand-secondary group-hover:text-brand-black transition-colors leading-relaxed">
                  I understand that Prime Member is an annual access plan.
                </span>
              </label>
              
              <label className="flex items-start gap-4 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="bespokeSeparate"
                  checked={agreements.bespokeSeparate}
                  onChange={handleCheckboxChange}
                  className="mt-1 accent-brand-black w-4 h-4" 
                  required
                />
                <span className="text-sm font-sans text-brand-secondary group-hover:text-brand-black transition-colors leading-relaxed">
                  I understand that bespoke tailoring is available only to Prime Members, but bespoke garment charges are separate from the membership fee.
                </span>
              </label>

              <label className="flex items-start gap-4 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="policies"
                  checked={agreements.policies}
                  onChange={handleCheckboxChange}
                  className="mt-1 accent-brand-black w-4 h-4" 
                  required
                />
                <span className="text-sm font-sans text-brand-secondary group-hover:text-brand-black transition-colors leading-relaxed">
                  I agree to the <Link to="/policies/privacy" className="underline hover:text-brand-black">Privacy Policy</Link>, <Link to="/policies/terms" className="underline hover:text-brand-black">Terms & Conditions</Link>, and <Link to="/policies/membership-terms" className="underline hover:text-brand-black">Membership Terms</Link>.
                </span>
              </label>

              <label className="flex items-start gap-4 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="nonRefundable"
                  checked={agreements.nonRefundable}
                  onChange={handleCheckboxChange}
                  className="mt-1 accent-brand-black w-4 h-4" 
                  required
                />
                <span className="text-sm font-sans text-brand-secondary group-hover:text-brand-black transition-colors leading-relaxed">
                  I understand that the Prime Member fee is non-refundable once activated.
                </span>
              </label>
            </div>

            <div className="pt-8 text-center space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}
              <div className="p-6 border border-brand-divider bg-brand-bg flex items-center justify-between max-w-md mx-auto">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full border-4 border-brand-black" />
                  <span className="font-sans font-medium text-sm">
                    {selectedCountry?.code === 'IN' ? 'Razorpay (India)' : 'Stripe (International)'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-4 bg-brand-divider rounded" />
                  <div className="w-6 h-4 bg-brand-divider rounded" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!isFormValid || isSubmitting}
                className="btn-primary w-full md:w-auto md:px-16 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'PROCESSING...' : 'PROCEED TO SECURE PAYMENT'}
              </button>
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-secondary mt-6">
                Your payment will be processed securely.
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
