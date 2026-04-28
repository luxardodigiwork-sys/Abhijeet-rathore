import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Package, MapPin, CreditCard, Truck, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { storage } from '../utils/localStorage';
import { Order } from '../types';

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [isInvoiceSent, setIsInvoiceSent] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleResendInvoice = () => {
    setIsInvoiceSent(true);
    setTimeout(() => {
      setIsInvoiceSent(false);
    }, 5000);
  };

  const handleCancelOrder = () => {
    if (!order) return;
    const allOrders = storage.getOrders();
    const updatedOrders = allOrders.map(o => 
      o.id === order.id ? { ...o, status: 'cancelled' as const } : o
    );
    storage.saveOrders(updatedOrders);
    setOrder({
      ...order,
      status: 'cancelled',
      cancellationDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      cancellationReason: 'Customer requested cancellation',
      refundNote: 'Refund will be processed to the original payment method within 3-5 business days.'
    });
    setShowCancelConfirm(false);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const allOrders = storage.getOrders();
    const foundOrder = allOrders.find(o => o.id === orderId);
    
    if (foundOrder) {
      // Transform order data to match the component's expected format if necessary
      const transformedOrder = {
        ...foundOrder,
        date: new Date(foundOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        paymentStatus: 'Paid',
        total: formatCurrency(foundOrder.totalAmount),
        subtotal: formatCurrency(foundOrder.totalAmount), // Simplified
        shipping: formatCurrency(0),
        tax: formatCurrency(0),
        paymentMethod: 'Razorpay/Stripe',
        paymentReference: 'REF-' + foundOrder.id,
        items: foundOrder.items.map(item => ({
          ...item,
          price: formatCurrency(item.price),
          image: storage.getProducts().find(p => p.id === item.productId)?.image,
          format: 'Ready-to-Stitch Box'
        })),
        contactInfo: {
          email: foundOrder.shippingAddress?.email || foundOrder.userEmail,
          phone: foundOrder.shippingAddress?.phone || '+91 98765 43210'
        },
        deliveryMethod: 'Standard Delivery',
        trackingNumber: null
      };
      setOrder(transformedOrder);
    } else {
      navigate('/account?tab=orders');
    }
  }, [orderId, user, navigate]);

  if (!user || !order) return null;

  const standardTimeline = ['processing', 'confirmed', 'shipped', 'delivered'];
  const cancelledTimeline = ['processing', 'cancelled'];
  
  const currentTimeline = order.status === 'cancelled' ? cancelledTimeline : standardTimeline;
  const currentStatusIndex = currentTimeline.indexOf(order.status);

  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* 1. Header */}
          <div className="space-y-6">
            <Link 
              to="/account?tab=orders" 
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-brand-secondary hover:text-brand-black transition-colors"
            >
              <ChevronLeft size={14} /> Back to Orders
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-brand-divider">
              <div className="space-y-2">
                <h1 className="text-4xl font-display tracking-tight">Order #{order.id}</h1>
                <p className="font-sans text-brand-secondary">Placed on {order.date}</p>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 border border-brand-divider bg-brand-white text-center min-w-[100px]">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-1">Status</p>
                  <p className="font-sans text-brand-black font-medium">{order.status}</p>
                </div>
                <div className="px-4 py-2 border border-brand-divider bg-brand-white text-center min-w-[100px]">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-1">Payment</p>
                  <p className="font-sans text-brand-black font-medium">{order.paymentStatus}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Ordered Items */}
          <section className="space-y-6">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-brand-black">Ordered Items</h2>
            <div className="bg-brand-white border border-brand-divider p-6 space-y-6">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-6 pb-6 border-b border-brand-divider last:border-0 last:pb-0">
                  <div className="w-24 h-32 bg-brand-bg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-display text-xl">{item.name}</h3>
                        <p className="font-sans font-medium">{item.price}</p>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-sans text-brand-secondary">Format: <span className="text-brand-black">{item.format}</span></p>
                        <p className="text-sm font-sans text-brand-secondary">Qty: <span className="text-brand-black">{item.quantity}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Delivery Details */}
          <section className="space-y-6">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-brand-black">Delivery Details</h2>
            <div className="bg-brand-white border border-brand-divider p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Shipping Address</p>
                <div className="font-sans text-brand-black text-sm leading-relaxed">
                  <p className="font-medium">{order.shippingAddress?.fullName || order.userName}</p>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                  <p>{order.shippingAddress?.country}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Contact Info</p>
                  <div className="font-sans text-brand-black text-sm leading-relaxed">
                    <p>{order.contactInfo.email}</p>
                    <p>{order.contactInfo.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Payment Summary */}
          <section className="space-y-6">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-brand-black">Payment Summary</h2>
            <div className="bg-brand-white border border-brand-divider p-6">
              <div className="space-y-4 font-sans text-sm pb-6 border-b border-brand-divider">
                <div className="flex justify-between text-brand-secondary">
                  <span>Subtotal</span>
                  <span className="text-brand-black">{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-brand-secondary">
                  <span>Shipping</span>
                  <span className="text-brand-black">{order.shipping}</span>
                </div>
                <div className="flex justify-between text-brand-secondary">
                  <span>Tax</span>
                  <span className="text-brand-black">{order.tax}</span>
                </div>
              </div>
              
              <div className="py-6 border-b border-brand-divider flex justify-between font-medium text-brand-black text-lg">
                <span>Total</span>
                <span>{order.total}</span>
              </div>

              <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-1">Payment Method</p>
                  <p className="font-sans text-sm text-brand-black">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-1">Payment Reference</p>
                  <p className="font-sans text-sm text-brand-black">{order.paymentReference}</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Order Actions */}
          <section className="space-y-6">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-brand-black">Order Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/account?tab=orders')}
                className="btn-outline w-full py-4"
              >
                Track Order
              </button>
              
              <div className="relative">
                <button 
                  onClick={handleResendInvoice}
                  disabled={isInvoiceSent}
                  className="btn-primary w-full py-4 text-[11px] uppercase tracking-widest"
                >
                  {isInvoiceSent ? 'Invoice Sent' : 'Resend Invoice'}
                </button>
                {isInvoiceSent && (
                  <motion.p 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-6 left-0 right-0 text-[10px] font-sans text-brand-secondary text-center"
                  >
                    Invoice has been sent to your registered email.
                  </motion.p>
                )}
              </div>
            </div>

            {['pending', 'confirmed', 'processing'].includes(order.status) && (
              <div className="pt-4">
                {!showCancelConfirm ? (
                  <button 
                    onClick={() => setShowCancelConfirm(true)}
                    className="btn-outline w-full py-4 text-brand-secondary border-brand-divider"
                  >
                    Cancel Order
                  </button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 bg-brand-white p-6 border border-brand-divider rounded-3xl"
                  >
                    <p className="text-sm font-sans text-brand-black text-center">Are you sure you want to cancel this order?</p>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setShowCancelConfirm(false)}
                        className="btn-outline flex-1 py-3"
                      >
                        No, Keep It
                      </button>
                      <button 
                        onClick={handleCancelOrder}
                        className="btn-primary flex-1 py-3"
                      >
                        Yes, Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </section>

          {/* 6. Status Timeline */}
          <section className="space-y-6">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-brand-black">Status Timeline</h2>
            <div className="bg-brand-white border border-brand-divider p-8">
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-brand-divider"></div>
                
                <div className="space-y-8">
                  {currentTimeline.map((step, idx) => {
                    const isCompleted = currentStatusIndex >= idx;
                    const isCurrent = currentStatusIndex === idx;
                    const isCancelled = step === 'cancelled';
                    
                    return (
                      <div key={step} className="relative flex items-start gap-6">
                        <div className="relative z-10 bg-brand-white py-1">
                          {isCompleted ? (
                            <CheckCircle2 size={24} className={isCancelled ? "text-red-500" : "text-brand-black"} />
                          ) : (
                            <Circle size={24} className="text-brand-divider" />
                          )}
                        </div>
                        <div className="pt-1">
                          <p className={`font-sans font-medium ${isCompleted ? (isCancelled ? 'text-red-500' : 'text-brand-black') : 'text-brand-secondary'}`}>
                            {step}
                          </p>
                          {isCurrent && order.status === 'cancelled' && (
                            <div className="mt-2 space-y-1 text-sm font-sans text-brand-secondary">
                              <p>Date: {order.cancellationDate}</p>
                              <p>Reason: {order.cancellationReason}</p>
                              <p className="mt-2 text-brand-black">{order.refundNote}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
