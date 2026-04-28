import React, { useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { Country, Order } from '../types';
import { ALL_COUNTRIES } from '../countries';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/localStorage';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const { selectedCountry } = useOutletContext<{ selectedCountry: Country | null }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [step, setStep] = useState<'details' | 'review'>('details');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cartItems, cartSubtotal, clearCart } = useCart();

  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('new');
  const [savedAddress, setSavedAddress] = useState<any>(null);

  const [shippingInfo, setShippingInfo] = useState({
    email: user?.email || '',
    phone: '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: selectedCountry?.code || 'IN'
  });

  React.useEffect(() => {
    if (isLoggedIn && user) {
      const addr = storage.getSavedAddress(user.id);
      if (addr) {
        setSavedAddress(addr);
        setAddressMode('saved');
        setShippingInfo({
          email: addr.email || user.email || '',
          phone: addr.phone || '',
          firstName: addr.firstName || user.name?.split(' ')[0] || '',
          lastName: addr.lastName || user.name?.split(' ')[1] || '',
          address: addr.address || '',
          apartment: addr.apartment || '',
          city: addr.city || '',
          state: addr.state || '',
          postalCode: addr.postalCode || '',
          country: addr.country || selectedCountry?.code || 'IN'
        });
      } else {
        setShippingInfo(prev => ({
          ...prev,
          email: user.email || prev.email,
          firstName: user.name?.split(' ')[0] || prev.firstName,
          lastName: user.name?.split(' ')[1] || prev.lastName,
        }));
      }
    }
  }, [isLoggedIn, user, selectedCountry]);

  const handleAddressModeChange = (mode: 'saved' | 'new') => {
    setAddressMode(mode);
    if (mode === 'saved' && savedAddress) {
      setShippingInfo(prev => ({
        ...prev,
        email: savedAddress.email || prev.email,
        phone: savedAddress.phone || prev.phone,
        firstName: savedAddress.firstName || prev.firstName,
        lastName: savedAddress.lastName || prev.lastName,
        address: savedAddress.address || '',
        apartment: savedAddress.apartment || '',
        city: savedAddress.city || '',
        state: savedAddress.state || '',
        postalCode: savedAddress.postalCode || '',
        country: savedAddress.country || selectedCountry?.code || 'IN'
      }));
    } else if (mode === 'new') {
      setShippingInfo(prev => ({
        ...prev,
        address: '',
        apartment: '',
        city: '',
        state: '',
        postalCode: ''
      }));
    }
  };

  const displaySubtotal = cartSubtotal;
  const shipping = 0; // Free shipping
  const total = displaySubtotal + shipping;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    setStep('review');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    setError(null);

    if (!isLoggedIn || !user) {
      setError('Please sign in to continue your order.');
      return;
    }

    if (!agreed) {
      setError('Please agree to the terms and conditions.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        setError('Razorpay SDK failed to load. Are you online?');
        setIsSubmitting(false);
        return;
      }

      // 2. Create order on backend (SECURE: Backend calculates total from items)
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cartItems,
          shippingInfo,
          userId: user?.id || null
        })
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
        description: "Order Payment",
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
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  userId: user.id,
                  userName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                  userEmail: shippingInfo.email,
                  totalAmount: total,
                  items: cartItems.map(item => ({
                    productId: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    image: item.product.image,
                    category: item.product.category
                  })),
                  shippingAddress: {
                    fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                    email: shippingInfo.email,
                    phone: shippingInfo.phone,
                    addressLine1: shippingInfo.address,
                    addressLine2: shippingInfo.apartment,
                    city: shippingInfo.city,
                    state: shippingInfo.state,
                    postalCode: shippingInfo.postalCode,
                    country: shippingInfo.country
                  }
                }
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // 5. Save order locally (sync with backend)
              const newOrder: Order = verifyData.order;

              storage.addOrder(newOrder);
              
              if (user) {
                storage.saveAddress(user.id, shippingInfo);
              }

              try {
                const webhookUrl = 'https://vivaciously-fuselike-caron.ngrok-free.dev/webhook/luxardo-order';
                const payload = {
                  orderId: newOrder.id,
                  name: newOrder.userName,
                  phone: newOrder.shippingAddress?.phone,
                  email: newOrder.userEmail,
                  address: `${newOrder.shippingAddress?.addressLine1} ${newOrder.shippingAddress?.addressLine2 ? newOrder.shippingAddress?.addressLine2 + ', ' : ''}${newOrder.shippingAddress?.city}, ${newOrder.shippingAddress?.state} ${newOrder.shippingAddress?.postalCode}, ${newOrder.shippingAddress?.country}`,
                  product: newOrder.items.map(i => i.name).join(', '),
                  amount: newOrder.totalAmount,
                  status: newOrder.paymentStatus,
                  date: newOrder.createdAt.split('T')[0]
                };

                console.log("Sending order to webhook", newOrder);

                await fetch(webhookUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(payload)
                });
              } catch (webhookError) {
                console.error('Failed to send order to webhook:', webhookError);
              }

              clearCart();
              navigate('/order-confirmation', { state: { order: newOrder } });
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
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          contact: shippingInfo.phone
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
      setError('Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="section-padding max-w-7xl mx-auto min-h-[70vh] flex flex-col items-center justify-center space-y-8">
        <h1 className="text-4xl font-display">Your cart is empty</h1>
        <p className="font-sans text-brand-secondary">Please add items to your cart before checking out.</p>
        <Link to="/collections" className="btn-primary px-12">Continue Shopping</Link>
      </div>
    );
  }

  const selectedCountryName = ALL_COUNTRIES.find(c => c.code === shippingInfo.country)?.name || shippingInfo.country;

  return (
    <div className="section-padding max-w-7xl mx-auto min-h-[70vh]">
      <SectionHeader 
        title={step === 'details' ? "Checkout" : "Review Order"} 
        subtitle={step === 'details' ? "Secure Payment" : "Final Confirmation"} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {step === 'details' ? (
          <form onSubmit={handleNextStep} className="space-y-12">
            <div className="space-y-8">
              <h3 className="text-2xl font-display border-b border-brand-divider pb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="email" 
                  required 
                  placeholder="Email Address" 
                  value={shippingInfo.email}
                  onChange={(e) => {
                    setShippingInfo({ ...shippingInfo, email: e.target.value });
                    setAddressMode('new');
                  }}
                  className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                />
                <input 
                  type="tel" 
                  required 
                  placeholder="Phone Number" 
                  value={shippingInfo.phone}
                  onChange={(e) => {
                    setShippingInfo({ ...shippingInfo, phone: e.target.value });
                    setAddressMode('new');
                  }}
                  className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                />
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-display border-b border-brand-divider pb-4">Shipping Address</h3>
              
              {savedAddress && (
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => handleAddressModeChange('saved')}
                    className={`flex-1 p-5 border text-left transition-all duration-300 ${addressMode === 'saved' ? 'border-brand-black bg-brand-black text-brand-white shadow-lg' : 'border-brand-divider hover:border-brand-black bg-transparent'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-sans font-bold text-xs uppercase tracking-widest">Use Last Saved Address</div>
                      {addressMode === 'saved' && <CheckCircle2 size={16} className="text-brand-white" />}
                    </div>
                    <div className={`text-sm font-sans leading-relaxed ${addressMode === 'saved' ? 'text-brand-white/90' : 'text-brand-secondary'}`}>
                      <p>{savedAddress.firstName} {savedAddress.lastName}</p>
                      <p>{savedAddress.address}</p>
                      <p>{savedAddress.city}, {savedAddress.state} {savedAddress.postalCode}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddressModeChange('new')}
                    className={`flex-1 p-5 border text-left transition-all duration-300 ${addressMode === 'new' ? 'border-brand-black bg-brand-black text-brand-white shadow-lg' : 'border-brand-divider hover:border-brand-black bg-transparent'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-sans font-bold text-xs uppercase tracking-widest">Add New Address</div>
                      {addressMode === 'new' && <CheckCircle2 size={16} className="text-brand-white" />}
                    </div>
                    <div className={`text-sm font-sans ${addressMode === 'new' ? 'text-brand-white/90' : 'text-brand-secondary'}`}>
                      Enter a different delivery location
                    </div>
                  </button>
                </div>
              )}

              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-2 gap-6">
                  <input 
                    type="text" 
                    required 
                    placeholder="First Name" 
                    value={shippingInfo.firstName}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, firstName: e.target.value });
                      setAddressMode('new');
                    }}
                    className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                  />
                  <input 
                    type="text" 
                    required 
                    placeholder="Last Name" 
                    value={shippingInfo.lastName}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, lastName: e.target.value });
                      setAddressMode('new');
                    }}
                    className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                  />
                </div>
                <input 
                  type="text" 
                  required 
                  placeholder="Street Address" 
                  value={shippingInfo.address}
                  onChange={(e) => {
                    setShippingInfo({ ...shippingInfo, address: e.target.value });
                    setAddressMode('new');
                  }}
                  className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                />
                <input 
                  type="text" 
                  placeholder="Apartment, suite, etc. (optional)" 
                  value={shippingInfo.apartment}
                  onChange={(e) => {
                    setShippingInfo({ ...shippingInfo, apartment: e.target.value });
                    setAddressMode('new');
                  }}
                  className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                />
                <div className="grid grid-cols-2 gap-6">
                  <input 
                    type="text" 
                    required 
                    placeholder="City" 
                    value={shippingInfo.city}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, city: e.target.value });
                      setAddressMode('new');
                    }}
                    className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                  />
                  <input 
                    type="text" 
                    required 
                    placeholder="State/Province" 
                    value={shippingInfo.state}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, state: e.target.value });
                      setAddressMode('new');
                    }}
                    className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <input 
                    type="text" 
                    required 
                    placeholder="Postal Code" 
                    value={shippingInfo.postalCode}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, postalCode: e.target.value });
                      setAddressMode('new');
                    }}
                    className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors" 
                  />
                  <select 
                    required 
                    className="w-full border-b border-brand-divider p-4 bg-transparent font-sans focus:outline-none focus:border-brand-black transition-colors appearance-none" 
                    value={shippingInfo.country}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, country: e.target.value });
                      setAddressMode('new');
                    }}
                  >
                    {ALL_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code} disabled={!c.active}>{c.name} {!c.active && '(Coming Soon)'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-display border-b border-brand-divider pb-4">Delivery Method</h3>
              <div className="p-6 border border-brand-black flex justify-between items-center bg-brand-bg">
                <div className="flex items-center gap-4">
                  <input type="radio" id="standard-delivery" name="delivery" defaultChecked className="accent-brand-black w-4 h-4" />
                  <label htmlFor="standard-delivery" className="font-sans font-medium">Standard Delivery</label>
                </div>
                <span className="font-sans font-medium">Free</span>
              </div>
              <p className="text-sm font-sans text-brand-secondary">Standard orders are processed within 3-5 business days. Includes premium presentation packaging.</p>
            </div>

            <div className="space-y-6 pt-8 border-t border-brand-divider">
              <div className="flex items-start gap-4">
                <input 
                  type="checkbox" 
                  id="terms" 
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="accent-brand-black mt-1 w-4 h-4 shrink-0" 
                />
                <label htmlFor="terms" className="text-sm font-sans text-brand-secondary leading-relaxed">
                  I have read and agree to the <Link to="/policies/shipping" className="underline hover:text-brand-black">Shipping Policy</Link>, <Link to="/policies/returns" className="underline hover:text-brand-black">Returns Policy</Link>, <Link to="/policies/privacy" className="underline hover:text-brand-black">Privacy Policy</Link>, <Link to="/policies/terms" className="underline hover:text-brand-black">Terms & Conditions</Link>, and <Link to="/policies/membership-terms" className="underline hover:text-brand-black">Membership Terms</Link> where applicable.
                </label>
              </div>

              <button 
                type="submit" 
                disabled={!agreed}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed py-5 flex items-center justify-center gap-3"
              >
                CONTINUE TO REVIEW
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-12">
            <button 
              onClick={() => setStep('details')}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-secondary hover:text-brand-black transition-colors"
            >
              <ArrowLeft size={14} /> Back to Details
            </button>

            <div className="space-y-10">
              <div className="space-y-6">
                <h3 className="text-2xl font-display border-b border-brand-divider pb-4">Review Your Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Contact Details</h4>
                    <div className="font-sans space-y-1">
                      <p className="text-brand-black">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                      <p className="text-brand-secondary">{shippingInfo.email}</p>
                      <p className="text-brand-secondary">{shippingInfo.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Shipping Address</h4>
                    <div className="font-sans space-y-1">
                      <p className="text-brand-black">{shippingInfo.address}</p>
                      {shippingInfo.apartment && <p className="text-brand-secondary">{shippingInfo.apartment}</p>}
                      <p className="text-brand-secondary">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}</p>
                      <p className="text-brand-secondary">{selectedCountryName}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-display border-b border-brand-divider pb-4">Items to be Ordered</h3>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center py-2 border-b border-brand-divider border-dashed last:border-0">
                      <div className="flex gap-4 items-center">
                        <span className="text-xs font-sans font-bold text-brand-black w-6">{item.quantity}x</span>
                        <div>
                          <p className="font-sans text-sm text-brand-black">{item.product.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-brand-secondary">{item.product.category}</p>
                        </div>
                      </div>
                      <span className="font-sans text-sm text-brand-black">{formatCurrency(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-display border-b border-brand-divider pb-4">Payment Method</h3>
                <div className="p-6 border border-brand-divider bg-brand-bg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-5 h-5 text-brand-black" />
                    <span className="font-sans font-medium">
                      {selectedCountry?.code === 'IN' ? 'Razorpay (Cards, UPI, Netbanking)' : 'Stripe (Credit/Debit Cards)'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-brand-divider rounded" />
                    <div className="w-8 h-5 bg-brand-divider rounded" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-brand-divider">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-sm font-sans flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-800" />
                    {error}
                  </div>
                )}

                <button 
                  onClick={handlePlaceOrder}
                  disabled={!agreed || isSubmitting} 
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed py-5 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin" size={20} /> PROCESSING...</>
                  ) : (
                    <>PLACE ORDER • {formatCurrency(total)}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="lg:pl-16 lg:border-l border-brand-divider">
          <div className="sticky top-32 space-y-8">
            <h3 className="text-2xl font-display border-b border-brand-divider pb-4">Order Summary</h3>
            
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-6 items-center">
                  <div className="w-20 h-24 bg-brand-divider shrink-0 relative overflow-hidden">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-black text-brand-white rounded-full flex items-center justify-center text-[10px] font-sans font-bold">{item.quantity}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display text-lg">{item.product.name}</h4>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">{item.product.category}</p>
                    <p className="text-[10px] font-sans text-brand-secondary mt-1">Ready-to-Stitch Box</p>
                  </div>
                  <div className="font-sans text-brand-black">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-brand-divider font-sans text-brand-secondary">
              <div className="flex justify-between">
                <span className="text-xs uppercase tracking-widest">Subtotal</span>
                <span className="text-brand-black">{formatCurrency(displaySubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs uppercase tracking-widest">Shipping</span>
                <span className="text-brand-black">Free</span>
              </div>
            </div>
            
            <div className="border-t border-brand-divider pt-8 flex justify-between items-end">
              <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-black">Total</span>
              <div className="text-right">
                <span className="text-3xl font-sans text-brand-black">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <div className="p-6 bg-brand-bg border border-brand-divider mt-8">
              <p className="text-[10px] font-sans text-brand-secondary leading-relaxed uppercase tracking-wider">
                Standard orders include a ready-to-stitch boxed garment with stitch style guidance. Stitching is not included.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

