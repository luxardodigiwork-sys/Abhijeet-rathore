import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Truck, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Eye, 
  UserPlus, 
  ShieldAlert, 
  ArrowRight,
  BarChart3,
  Lock,
  Unlock,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { storage } from '../../utils/localStorage';
import { formatCurrency } from '../../utils/currency';
import { Order, BackendUser } from '../../types';

export default function AdminDispatchPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [backendUsers, setBackendUsers] = useState<BackendUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      const ordersData = storage.getOrders();
      const usersData = storage.getBackendUsers();
      setOrders(ordersData);
      setBackendUsers(usersData.filter(u => u.role === 'dispatch'));
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const pendingPayment = orders.filter(o => o.paymentStatus === 'pending').length;
    const readyForDispatch = orders.filter(o => (o.paymentStatus === 'paid' || o.paymentStatus === 'confirmed') && ['processing', 'packed'].includes(o.status)).length;
    const shippedToday = orders.filter(o => o.status === 'shipped' && o.dispatchDate && new Date(o.dispatchDate).toDateString() === new Date().toDateString()).length;
    
    // Delayed orders: processing for more than 3 days
    const delayed = orders.filter(o => {
      const createdDate = new Date(o.createdAt);
      const diffDays = (new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
      return diffDays > 3 && o.status !== 'delivered' && o.status !== 'cancelled';
    }).length;

    return { total, pendingPayment, readyForDispatch, shippedToday, delayed };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const handleAssignStaff = (orderId: string, staffId: string) => {
    const staff = backendUsers.find(u => u.id === staffId);
    if (!staff) return;

    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, assignedStaffId: staffId, assignedStaffName: staff.fullName } : order
    );
    storage.saveOrders(updatedOrders);
    setOrders(updatedOrders);
    setShowAssignModal(false);
    setSelectedOrder(null);
  };

  const handleForceOverride = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const nextStatus: Order['status'] = order.status === 'pending' ? 'processing' : 'shipped';
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: nextStatus, paymentStatus: 'confirmed' as const } : o
    );
    storage.saveOrders(updatedOrders);
    setOrders(updatedOrders);
    alert(`Order ${orderId} status overridden by Admin.`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      case 'processing': return 'text-amber-600 bg-amber-50';
      case 'packed': return 'text-indigo-600 bg-indigo-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tight">Dispatch Control Panel</h1>
          <p className="text-brand-secondary font-sans mt-1">Strategic monitoring and operational oversight</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
            <ShieldAlert size={14} />
            Admin Access Only
          </div>
        </div>
      </div>

      {/* Top Section: Control Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-brand-black' },
          { label: 'Pending Payment', value: stats.pendingPayment, icon: Clock, color: 'text-amber-600' },
          { label: 'Ready for Dispatch', value: stats.readyForDispatch, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Shipped Today', value: stats.shippedToday, icon: Truck, color: 'text-blue-600' },
          { label: 'Delayed Orders', value: stats.delayed, icon: AlertCircle, color: 'text-red-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-brand-divider p-6 group hover:border-brand-black transition-all"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-brand-bg ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-display text-brand-black">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Order Monitoring Table */}
      <div className="bg-white border border-brand-divider shadow-sm">
        <div className="p-6 border-b border-brand-divider flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-bg border border-brand-divider pl-12 pr-4 py-3 font-sans focus:outline-none focus:border-brand-black transition-colors"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">
              Showing {filteredOrders.length} Orders
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg/50 border-b border-brand-divider">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Order ID</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Customer</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Payment</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Dispatch Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Assigned Staff</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Last Updated</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-brand-divider border-t-brand-black rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center font-sans text-brand-secondary">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className={`hover:bg-brand-bg/30 transition-colors ${
                    (() => {
                      const daysSinceCreation = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 3600 * 24));
                      const isDelayed = (order.status === 'pending' || order.status === 'processing') && daysSinceCreation >= 3;
                      
                      if (isDelayed) return 'bg-red-50/50 border-l-4 border-l-red-600';
                      if (order.status === 'shipped') return 'bg-blue-50/50 border-l-4 border-l-blue-500';
                      if (order.status === 'delivered') return 'bg-emerald-50/50 border-l-4 border-l-emerald-500';
                      
                      if (order.paymentStatus !== 'confirmed' && order.paymentStatus !== 'paid') return 'border-l-4 border-l-red-400';
                      if (order.verificationStatus === 'dispatch_ready') return 'border-l-4 border-l-emerald-400';
                      return 'border-l-4 border-l-amber-500';
                    })()
                  }`}>
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-brand-black">{order.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-brand-black">{order.userName}</p>
                      <p className="text-xs text-brand-secondary">{order.userEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      {order.paymentStatus === 'paid' || order.paymentStatus === 'confirmed' ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <Unlock size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Confirmed</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-amber-600">
                            <Lock size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Locked</span>
                          </div>
                          <p className="text-[9px] text-brand-secondary italic">Awaiting Accounts Approval</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.assignedStaffName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-black text-white flex items-center justify-center text-[10px] font-bold">
                            {order.assignedStaffName.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-brand-black">{order.assignedStaffName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-brand-secondary italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-brand-secondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/admin/orders/${order.id}`}
                          className="p-2 text-brand-secondary hover:text-brand-black transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowAssignModal(true);
                          }}
                          className="p-2 text-brand-secondary hover:text-brand-black transition-colors"
                          title="Assign Staff"
                        >
                          <UserPlus size={18} />
                        </button>
                        <button 
                          onClick={() => handleForceOverride(order.id)}
                          className="p-2 text-brand-secondary hover:text-red-600 transition-colors"
                          title="Force Override"
                        >
                          <ShieldAlert size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white border border-brand-divider p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <h3 className="text-lg font-display uppercase tracking-tight">Dispatch Delays</h3>
          </div>
          <div className="space-y-4">
            {orders.filter(o => {
              const diff = (new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 3600 * 24);
              return diff > 3 && o.status !== 'delivered';
            }).slice(0, 3).map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-brand-bg border border-brand-divider">
                <div>
                  <p className="text-xs font-bold text-brand-black">Order #{order.id}</p>
                  <p className="text-[10px] text-brand-secondary uppercase tracking-widest mt-1">
                    {Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 3600 * 24))} Days Pending
                  </p>
                </div>
                <Link to={`/admin/orders/${order.id}`} className="text-brand-black hover:scale-110 transition-transform">
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
            {stats.delayed === 0 && <p className="text-xs text-brand-secondary italic">No critical delays detected.</p>}
          </div>
        </div>

        <div className="bg-white border border-brand-divider p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={20} />
            </div>
            <h3 className="text-lg font-display uppercase tracking-tight">Pending Payments</h3>
          </div>
          <div className="space-y-4">
            {orders.filter(o => o.paymentStatus === 'pending' || o.paymentStatus === 'failed').slice(0, 3).map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-brand-bg border border-brand-divider">
                <div>
                  <p className="text-xs font-bold text-brand-black">{order.userName}</p>
                  <p className="text-[10px] text-brand-secondary uppercase tracking-widest mt-1">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <div className="text-amber-600">
                  <Lock size={14} />
                </div>
              </div>
            ))}
            {stats.pendingPayment === 0 && <p className="text-xs text-brand-secondary italic">All payments confirmed.</p>}
          </div>
        </div>

        <div className="bg-white border border-brand-divider p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-black text-white rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-lg font-display uppercase tracking-tight">High-Value Orders</h3>
          </div>
          <div className="space-y-4">
            {[...orders].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 3).map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-brand-bg border border-brand-divider">
                <div>
                  <p className="text-xs font-bold text-brand-black">Order #{order.id}</p>
                  <p className="text-[10px] text-brand-secondary uppercase tracking-widest mt-1">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <div className="text-brand-black">
                  <CheckCircle2 size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign Staff Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md p-8 shadow-2xl"
          >
            <h3 className="text-xl font-display uppercase tracking-tight mb-2">Assign Dispatch Staff</h3>
            <p className="text-sm text-brand-secondary mb-8">Select a team member to handle Order #{selectedOrder.id}</p>
            
            <div className="space-y-2 mb-8">
              {backendUsers.length > 0 ? (
                backendUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleAssignStaff(selectedOrder.id, user.id)}
                    className="w-full flex items-center justify-between p-4 border border-brand-divider hover:border-brand-black transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center text-xs font-bold text-brand-black group-hover:bg-brand-black group-hover:text-white transition-colors">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-brand-black">{user.fullName}</p>
                        <p className="text-[10px] text-brand-secondary uppercase tracking-widest">{user.role}</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-brand-secondary group-hover:text-brand-black" />
                  </button>
                ))
              ) : (
                <p className="text-sm text-brand-secondary italic text-center py-4">No dispatch staff available.</p>
              )}
            </div>

            <button 
              onClick={() => {
                setShowAssignModal(false);
                setSelectedOrder(null);
              }}
              className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary hover:text-brand-black transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
