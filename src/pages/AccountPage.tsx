import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { storage } from '../utils/localStorage';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { 
  User, 
  Package, 
  Heart, 
  Ruler, 
  Settings, 
  LogOut, 
  Crown, 
  ChevronRight, 
  MapPin,
  CreditCard,
  Bell,
  ShieldCheck,
  MessageSquare,
  X
} from 'lucide-react';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [trackingInput, setTrackingInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<{ id: string; status: string } | null>(null);
  const [globalSettings, setGlobalSettings] = useState(storage.getPrimeGlobalSettings());

  const orders = storage.getOrders().filter(o => o.userId === user?.id);

  const handleTrackOrder = (orderId: string) => {
    setTrackingInput(orderId);
    // Mock tracking logic
    let status = 'Order Placed';
    if (orderId === 'LX-8291') status = 'Delivered';
    else if (orderId === 'LX-7102') status = 'Processing';
    
    setTrackedOrder({ id: orderId, status });
    setActiveTab('track-order');
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    setGlobalSettings(storage.getPrimeGlobalSettings());
  }, []);

  if (!user) return null;

  const tabs = [
    { id: 'profile', label: 'Profile Overview', icon: <User size={18} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={18} /> },
    { id: 'favorites', label: 'My Favorites', icon: <Heart size={18} /> },
    { id: 'track-order', label: 'Track Order', icon: <MapPin size={18} /> },
    { id: 'membership', label: 'Membership Status', icon: <Crown size={18} /> },
    { id: 'addresses', label: 'Saved Addresses', icon: <MapPin size={18} /> },
    { id: 'account-details', label: 'Account Details', icon: <Settings size={18} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <section className="bg-brand-black text-brand-white pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-6xl font-display tracking-tight">
                Welcome, {user.name.split(' ')[0]}
              </h1>
              {user.isPrimeMember && (
                <span className="px-3 py-1 bg-brand-white text-brand-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                  <Crown size={12} /> Prime
                </span>
              )}
            </div>
            <p className="font-sans text-brand-white/60 text-lg">
              Manage your orders, bespoke requests, and styling profile.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 text-[11px] uppercase tracking-widest font-bold transition-all border ${
                  activeTab === tab.id 
                    ? 'bg-brand-black text-brand-white border-brand-black' 
                    : 'bg-brand-white text-brand-secondary border-brand-divider hover:border-brand-black'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 text-[11px] uppercase tracking-widest font-bold transition-all border bg-brand-white text-brand-secondary border-brand-divider hover:border-brand-black hover:text-brand-black mt-8"
            >
              <LogOut size={18} />
              Logout
            </button>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <h3 className="text-3xl font-display">Profile Overview</h3>
                  
                  <div className="bg-brand-white p-8 border border-brand-divider space-y-6">
                    <div className="flex items-center justify-between border-b border-brand-divider pb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center text-xl font-display">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xl font-display">{user.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {user.isPrimeMember ? (
                              <span className="px-2 py-0.5 bg-brand-black text-brand-white text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                                <Crown size={10} /> Prime Member
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-brand-bg text-brand-secondary text-[10px] uppercase tracking-widest font-bold">
                                Standard Customer
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('settings')} className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-black pb-1">
                        Edit Profile
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Email Address</p>
                        <p className="font-sans text-brand-black">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Phone Number</p>
                        <p className="font-sans text-brand-black">{user.phone || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Country</p>
                        <p className="font-sans text-brand-black">{user.country || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Account Created</p>
                        <p className="font-sans text-brand-black">{user.createdAt || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h3 className="text-3xl font-display">My Orders</h3>
                  
                  {(() => {
                    if (orders.length === 0) {
                      return (
                        <div className="bg-brand-white border border-brand-divider p-12 text-center space-y-6">
                          <Package size={48} className="mx-auto text-brand-divider" />
                          <p className="font-sans text-brand-secondary max-w-lg mx-auto leading-relaxed">
                            You have not placed any orders yet.
                          </p>
                          <button 
                            onClick={() => navigate('/collections')}
                            className="btn-primary px-12"
                          >
                            Explore Collections
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <div key={order.id} className="bg-brand-white p-6 border border-brand-divider space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-divider pb-6">
                              <div className="flex gap-8">
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Order ID</p>
                                  <p className="font-sans text-brand-black font-bold">#{order.id}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Date</p>
                                  <p className="font-sans text-brand-black">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Total Amount</p>
                                  <p className="font-sans text-brand-black">{formatCurrency(order.totalAmount)}</p>
                                </div>
                              </div>
                              <div className="flex gap-4">
                                <div className="space-y-1 text-right">
                                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Status</p>
                                  <p className="font-sans text-brand-black capitalize">{order.status}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-6">
                                  <Link to={`/product/${item.productId}`} className="w-20 h-24 bg-brand-bg overflow-hidden block shrink-0">
                                    <img src={storage.getProducts().find(p => p.id === item.productId)?.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                                  </Link>
                                  <div className="flex-1">
                                    <Link to={`/product/${item.productId}`}>
                                      <h4 className="font-display text-lg hover:text-brand-secondary transition-colors">{item.name}</h4>
                                    </Link>
                                    <p className="text-sm font-sans text-brand-secondary">Qty: {item.quantity}</p>
                                  </div>
                                  <div>
                                    <button 
                                      onClick={() => {
                                        const product = storage.getProducts().find(p => p.id === item.productId);
                                        if (product) {
                                          addToCart(product, 1);
                                          navigate('/cart');
                                        }
                                      }}
                                      className="btn-primary px-6 py-2 text-[10px] whitespace-nowrap"
                                    >
                                      Reorder
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="pt-6 border-t border-brand-divider flex justify-end gap-6">
                              <button 
                                onClick={() => handleTrackOrder(order.id)}
                                className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-black pb-1 hover:text-brand-secondary hover:border-brand-secondary transition-colors"
                              >
                                Track Order
                              </button>
                              <Link 
                                to={`/account/orders/${order.id}`}
                                className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-black pb-1 hover:text-brand-secondary hover:border-brand-secondary transition-colors"
                              >
                                View Order Details
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              {activeTab === 'membership' && (
                <motion.div
                  key="membership"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <h3 className="text-3xl font-display">Membership Status</h3>
                  {user.isPrimeMember ? (
                    <div className="bg-brand-white p-10 border border-brand-divider space-y-8">
                      <div className="flex items-center gap-4">
                        <Crown size={24} className="text-brand-black" />
                        <h4 className="text-2xl font-display">Prime Member Active</h4>
                      </div>
                      
                      {!globalSettings.isLive && (
                        <div className="bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm font-sans">
                          {globalSettings.offlineMessage}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-brand-divider">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Activation Date</p>
                          <p className="font-sans text-brand-black">{user.membershipActivation || 'October 12, 2024'}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Expiry Date</p>
                          <p className="font-sans text-brand-black">{user.membershipExpiry || 'October 12, 2025'}</p>
                        </div>
                      </div>

                      <div className="pt-6">
                        <button 
                          onClick={() => navigate('/prime-membership')} 
                          className="btn-primary px-8 py-3"
                        >
                          View Membership Benefits
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-brand-white p-10 border border-brand-divider space-y-8">
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Membership Status</p>
                        <h4 className="text-2xl font-display text-brand-black">Standard Account</h4>
                      </div>
                      
                      {!globalSettings.isLive && (
                        <div className="bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm font-sans">
                          {globalSettings.offlineMessage}
                        </div>
                      )}
                      
                      <div className="pt-6 border-t border-brand-divider">
                        <button 
                          onClick={() => navigate('/prime-membership')} 
                          className="btn-primary px-8 py-3"
                        >
                          {globalSettings.isLive ? 'Upgrade to Prime Member' : 'View Membership Details'}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'favorites' && (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h3 className="text-3xl font-display">My Favorites</h3>
                  
                  {wishlist.length === 0 ? (
                    <div className="bg-brand-white border border-brand-divider p-12 text-center space-y-6">
                      <Heart size={48} className="mx-auto text-brand-divider" />
                      <p className="font-sans text-brand-secondary max-w-lg mx-auto leading-relaxed">
                        You haven't added any items to your favorites yet.
                      </p>
                      <button 
                        onClick={() => navigate('/collections')}
                        className="btn-primary px-12"
                      >
                        Explore Collections
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map((item) => (
                        <div key={item.id} className="bg-brand-white border border-brand-divider group relative">
                          <button 
                            onClick={() => removeFromWishlist(item.id)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 bg-brand-white rounded-full flex items-center justify-center shadow-sm hover:bg-brand-black hover:text-brand-white transition-colors"
                          >
                            <X size={14} />
                          </button>
                          <Link to={`/product/${item.id}`} className="block aspect-[3/4] overflow-hidden">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                          </Link>
                          <div className="p-4 space-y-2">
                            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-secondary">{item.category}</p>
                            <Link to={`/product/${item.id}`}>
                              <h4 className="font-sans font-medium text-brand-black group-hover:text-brand-secondary transition-colors line-clamp-1">{item.name}</h4>
                            </Link>
                            <p className="text-sm font-sans text-brand-secondary">{formatCurrency(item.price)}</p>
                            <button 
                              onClick={() => {
                                addToCart(item, 1);
                                navigate('/cart');
                              }}
                              className="w-full btn-primary py-2 mt-4 text-[10px]"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'track-order' && (
                <motion.div
                  key="track-order"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <h3 className="text-3xl font-display">Track Order</h3>
                  <div className="bg-brand-white p-8 border border-brand-divider space-y-6">
                    <p className="font-sans text-brand-secondary">
                      Enter your order ID or tracking ID to track its current status.
                    </p>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (trackingInput.trim()) {
                          handleTrackOrder(trackingInput.trim());
                        }
                      }}
                      className="flex flex-col md:flex-row gap-4"
                    >
                      <input 
                        type="text" 
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="e.g. LX-8291" 
                        className="flex-1 bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black" 
                      />
                      <button type="submit" className="btn-primary px-8 py-3">
                        Track Now
                      </button>
                    </form>
                  </div>

                  {trackedOrder && (
                    <div className="bg-brand-white p-8 border border-brand-divider space-y-12">
                      <div className="flex justify-between items-end border-b border-brand-divider pb-6">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Order ID</p>
                          <p className="font-sans text-brand-black font-bold">#{trackedOrder.id}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Current Status</p>
                          <p className="font-sans text-brand-black">{trackedOrder.status}</p>
                        </div>
                      </div>

                      {(() => {
                        const timelineSteps = [
                          'Order Placed',
                          'Confirmed',
                          'Processing',
                          'Packed',
                          'Shipped',
                          'Out for Delivery',
                          'Delivered'
                        ];
                        const currentStepIndex = timelineSteps.indexOf(trackedOrder.status);
                        
                        // If status is not in the timeline (e.g. Cancelled) or tracking not available
                        if (currentStepIndex === -1) {
                          return (
                            <div className="text-center py-8">
                              <p className="font-sans text-brand-secondary italic">
                                Tracking details will appear once your order has been dispatched.
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-brand-divider md:-translate-x-1/2"></div>
                            
                            <div className="space-y-8 relative">
                              {timelineSteps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                
                                return (
                                  <div key={step} className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-0 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className="md:w-1/2 md:text-right md:pr-12 flex-1 order-2 md:order-1">
                                      <h4 className={`font-display text-lg ${isCurrent ? 'text-brand-black' : 'text-brand-secondary'}`}>{step}</h4>
                                      {isCurrent && (
                                        <p className="text-sm font-sans text-brand-secondary mt-1">
                                          Your order is currently {step.toLowerCase()}.
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-brand-white border-2 rounded-full order-1 md:order-2 shrink-0
                                      ${isCompleted ? 'border-brand-black' : 'border-brand-divider'}
                                      ${isCurrent ? 'ring-4 ring-brand-black/10' : ''}
                                    ">
                                      {isCompleted && <div className="w-2.5 h-2.5 bg-brand-black rounded-full"></div>}
                                    </div>
                                    
                                    <div className="md:w-1/2 md:pl-12 hidden md:block order-3">
                                      {/* Empty space for layout balance */}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-end">
                    <h3 className="text-3xl font-display">Saved Addresses</h3>
                    <button className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-black pb-1">
                      Add New Address
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-brand-white p-8 border border-brand-black space-y-4 relative">
                      <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest font-bold bg-brand-black text-brand-white px-2 py-1">Default</span>
                      <h4 className="font-sans font-bold text-brand-black">Alexander Wright</h4>
                      <p className="font-sans text-brand-secondary text-sm leading-relaxed">
                        123 Luxury Lane, Suite 400<br />
                        Mumbai, Maharashtra 400001<br />
                        India
                      </p>
                      <div className="pt-4 flex gap-4">
                        <button className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary hover:text-brand-black">Edit</button>
                        <button className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary hover:text-brand-black">Delete</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'account-details' && (
                <motion.div
                  key="account-details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <h3 className="text-3xl font-display">Account Details</h3>
                  <div className="space-y-6">
                    <div className="bg-brand-white p-8 border border-brand-divider space-y-6">
                      <h4 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2">
                        <User size={16} /> Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Full Name</label>
                          <input type="text" defaultValue={user.name} className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Email Address</label>
                          <input type="email" defaultValue={user.email} className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Phone Number</label>
                          <input type="tel" defaultValue={user.phone} className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Country</label>
                          <input type="text" defaultValue={user.country} className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black" />
                        </div>
                      </div>
                      <button className="btn-primary px-8 py-3 text-[10px]">Save Changes</button>
                    </div>

                    <div className="bg-brand-white p-8 border border-brand-divider space-y-6">
                      <h4 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2">
                        <Settings size={16} /> Password & Security
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Current Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">New Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black" />
                        </div>
                      </div>
                      <button className="btn-primary px-8 py-3 text-[10px]">Update Password</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
