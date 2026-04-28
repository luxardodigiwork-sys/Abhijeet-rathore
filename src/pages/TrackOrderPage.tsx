import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SectionHeader } from '../components/SectionHeader';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { storage } from '../utils/localStorage';
import { Order } from '../types';

interface TrackingEvent {
  date: string;
  time: string;
  location: string;
  status: string;
  description: string;
}

export default function TrackOrderPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      const orders = storage.getOrders();
      const foundOrder = orders.find(o => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
        generateMockTracking(foundOrder);
      }
    }
  }, [orderId]);

  const generateMockTracking = (order: Order) => {
    const events: TrackingEvent[] = [];
    const orderDate = new Date(order.createdAt);
    
    // Estimated delivery is order date + 5 days
    const estDelivery = new Date(orderDate);
    estDelivery.setDate(estDelivery.getDate() + 5);
    setEstimatedDelivery(estDelivery.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

    // Always add placed event
    events.push({
      date: orderDate.toLocaleDateString(),
      time: orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: 'System',
      status: 'Order Received',
      description: 'Your order has been placed and is waiting to be processed.'
    });

    if (['processing', 'packed', 'shipped', 'delivered'].includes(order.status)) {
      const processDate = new Date(orderDate);
      processDate.setHours(processDate.getHours() + 12);
      events.unshift({
        date: processDate.toLocaleDateString(),
        time: processDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: 'LUXARDO Production Facility',
        status: 'Processing',
        description: 'Your order is being reviewed by our tailoring team.'
      });
    }

    if (['packed', 'shipped', 'delivered'].includes(order.status)) {
      const packedDate = new Date(orderDate);
      packedDate.setDate(packedDate.getDate() + 1);
      packedDate.setHours(14, 30);
      events.unshift({
        date: packedDate.toLocaleDateString(),
        time: packedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: 'LUXARDO Dispatch Facility',
        status: 'Packed',
        description: 'Order carefully packed and ready for courier pickup.'
      });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      const dispatchDate = order.dispatchDate ? new Date(order.dispatchDate) : new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000);
      
      events.unshift({
        date: dispatchDate.toLocaleDateString(),
        time: dispatchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: 'Courier Hub, Mumbai',
        status: 'Shipped',
        description: 'Shipment handed over to logistics partner.'
      });

      const transitDate1 = new Date(dispatchDate);
      transitDate1.setHours(transitDate1.getHours() + 18);
      events.unshift({
        date: transitDate1.toLocaleDateString(),
        time: transitDate1.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: 'Regional Sorting Center',
        status: 'In Transit',
        description: 'Shipment in transit to destination facility.'
      });

      // Show some mid-transit updates if the status is active and sufficient time has passed
      const now = new Date();
      if ((order.status === 'shipped' && now.getTime() > transitDate1.getTime() + 24 * 60 * 60 * 1000) || order.status === 'delivered') {
         const outForDeliveryDate = new Date(transitDate1);
         outForDeliveryDate.setDate(outForDeliveryDate.getDate() + 1);
         outForDeliveryDate.setHours(8, 15);
         events.unshift({
            date: outForDeliveryDate.toLocaleDateString(),
            time: outForDeliveryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: order.shippingAddress?.city || 'Local Delivery Center',
            status: 'Out for Delivery',
            description: 'Shipment is out for delivery.'
         });
      }
    }

    if (order.status === 'delivered') {
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(deliveryDate.getDate() + 4);
      events.unshift({
        date: deliveryDate.toLocaleDateString(),
        time: deliveryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: order.shippingAddress?.city || 'Destination',
        status: 'Delivered',
        description: 'Shipment delivered securely.'
      });
    }

    setTrackingEvents(events);
  };

  if (!order) {
    return (
      <div className="section-padding max-w-4xl mx-auto min-h-[70vh] text-center flex flex-col items-center justify-center space-y-6">
        <h2 className="text-2xl font-display uppercase tracking-widest">Order Not Found</h2>
        <p className="text-brand-secondary font-sans">We couldn't find an order with ID: {orderId}</p>
        <Link to="/account" className="btn-primary">Go to My Account</Link>
      </div>
    );
  }

  const steps = [
    { id: 'placed', label: 'Order Placed', icon: Clock, completed: true },
    { id: 'processing', label: 'Processing', icon: Package, completed: ['processing', 'packed', 'shipped', 'delivered'].includes(order.status) },
    { id: 'shipped', label: 'Shipped', icon: Truck, completed: ['shipped', 'delivered'].includes(order.status) },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle, completed: order.status === 'delivered' }
  ];

  return (
    <div className="section-padding max-w-4xl mx-auto min-h-[70vh]">
      <SectionHeader 
        title="Track Order" 
        subtitle={`Order #${order.id}`} 
      />

      <div className="mt-12 space-y-12">
        {/* Estimated Delivery Banner */}
        {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'returned' && estimatedDelivery && (
          <div className="bg-brand-black text-brand-white p-6 md:p-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2">Estimated Delivery</p>
            <p className="text-xl md:text-2xl font-display uppercase tracking-wider">{estimatedDelivery}</p>
          </div>
        )}

        {/* Tracking Timeline Graphic */}
        <div className="bg-brand-bg p-8 md:p-12 border border-brand-divider">
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-brand-divider hidden md:block"></div>
            <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex flex-row md:flex-col items-center gap-4 md:gap-3 text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                      step.completed 
                        ? 'bg-brand-black border-brand-black text-brand-white' 
                        : 'bg-brand-white border-brand-divider text-brand-secondary'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="text-left md:text-center">
                      <p className={`text-[10px] uppercase tracking-widest font-bold ${step.completed ? 'text-brand-black' : 'text-brand-secondary'}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Detailed Tracking Events */}
          <div className="bg-brand-white border border-brand-divider p-8 space-y-6">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold border-b border-brand-divider pb-4 mb-6">Tracking History</h3>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-brand-divider">
              {trackingEvents.map((event, idx) => (
                <div key={idx} className="relative flex items-start gap-6 md:justify-between">
                  <div className="hidden md:block w-[40%] text-right font-sans">
                     <p className="text-sm font-medium text-brand-black">{event.date}</p>
                     <p className="text-xs text-brand-secondary">{event.time}</p>
                  </div>
                  
                  <div className="absolute left-0 md:relative md:left-auto flex items-center justify-center w-6 h-6 rounded-full bg-brand-black text-brand-white border-4 border-brand-white shrink-0 z-10">
                    {idx === 0 ? <CheckCircle size={12} className="text-brand-white" /> : <div className="w-2 h-2 rounded-full bg-brand-white" />}
                  </div>

                  <div className="pl-10 md:pl-0 w-full md:w-[40%] font-sans">
                    <div className="md:hidden mb-1">
                      <span className="text-xs font-bold text-brand-black mr-2">{event.date}</span>
                      <span className="text-xs text-brand-secondary">{event.time}</span>
                    </div>
                    <h4 className="text-sm font-bold text-brand-black">{event.status}</h4>
                    <p className="text-xs text-brand-secondary mt-1">{event.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-brand-secondary">
                      <MapPin size={10} />
                      <span className="uppercase tracking-wider">{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-brand-white border border-brand-divider p-8 space-y-6">
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold border-b border-brand-divider pb-4">Shipping Details</h3>
              <div className="space-y-2 font-sans text-sm text-brand-secondary">
                <p className="font-medium text-brand-black">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                <p>{order.shippingAddress?.country}</p>
              </div>
              {order.trackingId && (
                <div className="pt-4 border-t border-brand-divider space-y-2">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-black">Courier Tracking</p>
                  <p className="font-sans text-sm text-brand-secondary">
                    {order.courierName || 'Partner'} - <span className="font-medium text-brand-black">{order.trackingId}</span>
                  </p>
                  {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest underline mt-2 inline-block">
                      Track on Courier Website
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="bg-brand-white border border-brand-divider p-8 space-y-6">
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold border-b border-brand-divider pb-4">Order Summary</h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover bg-brand-bg" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs font-sans text-brand-secondary">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-brand-divider flex justify-between items-center">
                <span className="text-[11px] uppercase tracking-widest font-bold">Total</span>
                <span className="text-lg font-medium">₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
