import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle2, Box, Send, ShieldCheck } from 'lucide-react';
import { storage } from '../../utils/localStorage';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/currency';

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierName, setCourierName] = useState('DTDC');
  const [courierService, setCourierService] = useState('Express');
  const [pickupDate, setPickupDate] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [invoiceSent, setInvoiceSent] = useState(false);

  // Determine the base path for navigation
  const basePath = location.pathname.split('/')[1];

  useEffect(() => {
    const fetchOrder = () => {
      if (!id) return;
      try {
        const orders = storage.getOrders();
        const foundOrder = orders.find(o => o.id === id);
        if (foundOrder) {
          setOrder(foundOrder);
          setTrackingInput(foundOrder.trackingId || '');
          setCourierName(foundOrder.courierName || 'DTDC');
          setCourierService(foundOrder.courierService || 'Express');
          setPickupDate(foundOrder.dispatchDate || new Date().toISOString().split('T')[0]);
          setTrackingUrl(foundOrder.trackingUrl || '');
        } else {
          navigate(`/${basePath}/dashboard`);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate, basePath]);

  const handleSaveDispatchDetails = () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const orders = storage.getOrders();
      const updatedOrders = orders.map(o => 
        o.id === order.id ? { 
          ...o, 
          trackingId: trackingInput,
          courierName,
          courierService,
          dispatchDate: pickupDate,
          trackingUrl
        } : o
      );
      storage.saveOrders(updatedOrders);
      setOrder({ 
        ...order, 
        trackingId: trackingInput,
        courierName,
        courierService,
        dispatchDate: pickupDate,
        trackingUrl
      });
    } catch (error) {
      console.error('Error saving dispatch details:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendInvoice = () => {
    setInvoiceSent(true);
    setTimeout(() => setInvoiceSent(false), 3000);
  };

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const orders = storage.getOrders();
      const updatedOrders = orders.map(o => 
        o.id === order.id ? { ...o, status: newStatus } : o
      );
      storage.saveOrders(updatedOrders);
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerificationStatusChange = async (newStatus: Order['verificationStatus']) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const orders = storage.getOrders();
      const updatedOrders = orders.map(o => 
        o.id === order.id ? { ...o, verificationStatus: newStatus } : o
      );
      storage.saveOrders(updatedOrders);
      setOrder({ ...order, verificationStatus: newStatus });
    } catch (error) {
      console.error('Error updating verification status:', error);
      alert('Failed to update verification status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-divider border-t-brand-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-brand-bg rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-display uppercase tracking-tight">Order Details</h1>
          <p className="text-brand-secondary font-sans text-sm mt-1">
            <span className="font-mono">{order.id}</span> • {new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })} at {new Date(order.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white border border-brand-divider p-6 shadow-sm space-y-6">
            <h2 className="text-sm uppercase tracking-widest font-bold text-brand-secondary border-b border-brand-divider pb-4">
              Order Items ({order.items.length})
            </h2>
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-24 bg-brand-bg flex items-center justify-center border border-brand-divider shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Package size={24} className="text-brand-secondary" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-display text-lg text-brand-black">{item.name}</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">
                        {item.category || 'Uncategorized'}
                      </p>
                      <p className="text-xs text-brand-secondary mt-2">
                        Qty: <span className="text-brand-black font-medium">{item.quantity}</span> × {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-sans font-medium text-brand-black">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-brand-divider space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-secondary">Subtotal</span>
                <span className="text-brand-black">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-secondary">Shipping</span>
                <span className="text-brand-black">Complimentary</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-4 mt-2 border-t border-brand-divider">
                <span className="text-brand-black">Total</span>
                <span className="text-brand-black">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Order Verification Section */}
          <div className="bg-white border border-brand-divider p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-brand-divider pb-4">
              <h2 className="text-sm uppercase tracking-widest font-bold text-brand-secondary">
                Order Verification Flow
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-brand-bg border border-brand-divider rounded-full">
                <ShieldCheck size={12} className="text-brand-black" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-brand-black">Admin Control</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleVerificationStatusChange('verified')}
                disabled={isUpdating}
                className={`flex flex-col items-center gap-3 p-6 border transition-all duration-300 ${
                  order.verificationStatus === 'verified'
                    ? 'bg-brand-black border-brand-black text-white shadow-lg'
                    : 'bg-white border-brand-divider text-brand-secondary hover:border-brand-black hover:text-brand-black'
                }`}
              >
                <CheckCircle2 size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
              </button>

              <button
                onClick={() => handleVerificationStatusChange('packing_ready')}
                disabled={isUpdating}
                className={`flex flex-col items-center gap-3 p-6 border transition-all duration-300 ${
                  order.verificationStatus === 'packing_ready'
                    ? 'bg-brand-black border-brand-black text-white shadow-lg'
                    : 'bg-white border-brand-divider text-brand-secondary hover:border-brand-black hover:text-brand-black'
                }`}
              >
                <Box size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">Packing Ready</span>
              </button>

              <button
                onClick={() => handleVerificationStatusChange('dispatch_ready')}
                disabled={isUpdating}
                className={`flex flex-col items-center gap-3 p-6 border transition-all duration-300 ${
                  order.verificationStatus === 'dispatch_ready'
                    ? 'bg-brand-black border-brand-black text-white shadow-lg'
                    : 'bg-white border-brand-divider text-brand-secondary hover:border-brand-black hover:text-brand-black'
                }`}
              >
                <Send size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">Dispatch Ready</span>
              </button>
            </div>

            <p className="text-[10px] text-brand-secondary italic font-sans text-center">
              Updating the verification status helps track the internal processing stage of the order.
            </p>
          </div>

          {/* Payment & Status */}
          <div className="bg-white border border-brand-divider p-6 shadow-sm space-y-6">
            <h2 className="text-sm uppercase tracking-widest font-bold text-brand-secondary border-b border-brand-divider pb-4">
              Payment & Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-brand-secondary text-xs mb-2">Payment Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border ${
                    (order.paymentStatus || 'paid') === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    order.paymentStatus === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                    order.paymentStatus === 'refunded' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {order.paymentStatus || 'Paid'}
                  </span>
                </div>
                <div>
                  <p className="text-brand-secondary text-xs mb-1">Payment Method</p>
                  <p className="font-medium text-sm text-brand-black uppercase tracking-widest">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid / Online Payment'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-brand-secondary text-xs mb-2">Order Status</p>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
                    disabled={isUpdating || order.status === 'cancelled'}
                    className={`text-xs font-medium px-4 py-2 w-full sm:w-auto min-w-[140px] rounded-full border focus:outline-none focus:ring-1 focus:ring-brand-black cursor-pointer transition-colors ${
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      order.status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      order.status === 'packed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    } ${order.status === 'cancelled' ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="returned">Returned</option>
                    <option value="failed_delivery">Failed Delivery</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                {(order.status === 'packed' || order.status === 'shipped' || order.status === 'delivered' || order.trackingId) && (
                  <div className="space-y-4 pt-4 border-t border-brand-divider mt-4">
                    <h3 className="text-xs font-bold text-brand-black uppercase tracking-widest">Dispatch Details</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-brand-secondary text-[10px] uppercase tracking-widest mb-1">Courier Partner</p>
                        <select
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          className="w-full bg-brand-bg border border-brand-divider px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
                        >
                          <option value="DTDC">DTDC</option>
                          <option value="BlueDart">BlueDart</option>
                          <option value="Delhivery">Delhivery</option>
                        </select>
                      </div>

                      <div>
                        <p className="text-brand-secondary text-[10px] uppercase tracking-widest mb-1">Service Type</p>
                        <select
                          value={courierService}
                          onChange={(e) => setCourierService(e.target.value)}
                          className="w-full bg-brand-bg border border-brand-divider px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
                        >
                          <option value="Express">Express</option>
                          <option value="Surface">Surface</option>
                          <option value="Premium">Premium</option>
                        </select>
                      </div>

                      <div>
                        <p className="text-brand-secondary text-[10px] uppercase tracking-widest mb-1">Pickup Date</p>
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full bg-brand-bg border border-brand-divider px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
                        />
                      </div>

                      <div>
                        <p className="text-brand-secondary text-[10px] uppercase tracking-widest mb-1">AWB / Tracking ID</p>
                        <input
                          type="text"
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          placeholder="Enter AWB number"
                          className="w-full bg-brand-bg border border-brand-divider px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
                        />
                      </div>

                      <div>
                        <p className="text-brand-secondary text-[10px] uppercase tracking-widest mb-1">Tracking URL</p>
                        <input
                          type="url"
                          value={trackingUrl}
                          onChange={(e) => setTrackingUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-brand-bg border border-brand-divider px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
                        />
                      </div>

                      <button 
                        onClick={handleSaveDispatchDetails}
                        disabled={isUpdating}
                        className="w-full bg-brand-black text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-brand-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        Save Dispatch Details
                      </button>

                      {order.trackingUrl && order.courierName === 'DTDC' && (
                        <a 
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center border border-brand-black text-brand-black px-4 py-2 text-xs uppercase tracking-widest hover:bg-brand-black hover:text-white transition-colors mt-2"
                        >
                          Track on DTDC
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Customer Info */}
          <div className="bg-white border border-brand-divider p-6 shadow-sm space-y-4">
            <h2 className="text-sm uppercase tracking-widest font-bold text-brand-secondary border-b border-brand-divider pb-4">
              Customer Info
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-brand-secondary text-xs mb-1">Name</p>
                <p className="font-medium text-brand-black">{order.userName}</p>
              </div>
              <div>
                <p className="text-brand-secondary text-xs mb-1">Email</p>
                <a href={`mailto:${order.userEmail}`} className="font-medium text-brand-black hover:underline">
                  {order.userEmail}
                </a>
              </div>
              <div>
                <p className="text-brand-secondary text-xs mb-1">Phone</p>
                <p className="font-medium text-brand-black">{order.shippingAddress?.phone || 'N/A'}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-brand-divider">
                <button 
                  onClick={handleResendInvoice}
                  disabled={invoiceSent}
                  className={`w-full py-2.5 border font-medium text-xs uppercase tracking-widest transition-colors ${
                    invoiceSent 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'border-brand-black text-brand-black hover:bg-brand-black hover:text-white'
                  }`}
                >
                  {invoiceSent ? 'Invoice Sent ✓' : 'Resend Invoice'}
                </button>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white border border-brand-divider p-6 shadow-sm space-y-4">
            <h2 className="text-sm uppercase tracking-widest font-bold text-brand-secondary border-b border-brand-divider pb-4">
              Shipping Info
            </h2>
            {order.shippingAddress ? (
              <div className="space-y-1 text-sm text-brand-black">
                <p className="font-medium mb-2">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="text-sm text-brand-secondary">No shipping address provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
