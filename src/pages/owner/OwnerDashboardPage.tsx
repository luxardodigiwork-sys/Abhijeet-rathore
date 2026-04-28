import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Crown, 
  Building2,
  ArrowRight,
  Activity,
  Truck,
  AlertCircle,
  Users,
  LayoutDashboard,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { storage } from '../../utils/localStorage';
import { formatCurrency } from '../../utils/currency';

export default function OwnerDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [primeMembers, setPrimeMembers] = useState<any[]>([]);

  useEffect(() => {
    setOrders(storage.getOrders());
    const allUsers = storage.getUsers();
    setPrimeMembers(allUsers.filter(u => u.isPrimeMember));
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/backend-users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => ['processing', 'packed', 'pending'].includes(o.status)).length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    
    // Snapshot stats
    const today = new Date().toDateString();
    const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === today).length;
    const shippedToday = orders.filter(o => o.status === 'shipped' && o.dispatchDate && new Date(o.dispatchDate).toDateString() === today).length;
    
    const activeBackendUsers = users.filter(u => u.status === 'active').length;

    return {
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      activePrimeMembers: primeMembers.filter(m => m.membershipExpiry && new Date(m.membershipExpiry) > new Date()).length,
      wholesaleInquiries: 0, // Placeholder if no wholesale data
      ordersToday,
      shippedToday,
      activeBackendUsers
    };
  }, [orders, primeMembers, users]);

  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-8">
      {/* Debug Info */}
      <div className="hidden">Dashboard Loaded: Owner</div>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">Business Overview</h1>
        <p className="text-gray-500 font-medium">High-level summary and operational controls.</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Delivered Orders', value: stats.deliveredOrders, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Prime', value: stats.activePrimeMembers, icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Wholesale', value: stats.wholesaleInquiries, icon: Building2, color: 'text-gray-600', bg: 'bg-gray-100' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className={`p-3 rounded-xl w-fit mb-4 ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-black truncate">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Business Overview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Orders */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                <Activity size={20} className="text-gray-400" /> Recent Activity
              </h2>
              <Link to="/owner/dashboard" className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest flex items-center gap-1 transition-colors">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <div key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-black mb-1">Order #{order.id}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-black mb-1">{formatCurrency(order.totalAmount || 0)}</p>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-gray-100 text-gray-600">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">No recent orders found.</div>
              )}
            </div>
          </div>

          {/* Alerts / Dispatch Status */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-black flex items-center gap-2 mb-6">
              <AlertCircle size={20} className="text-gray-400" /> Operational Alerts
            </h2>
            <div className="space-y-4">
              {stats.pendingOrders > 0 ? (
                <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900 mb-1">Pending Dispatches</h3>
                    <p className="text-xs text-amber-700">There are {stats.pendingOrders} orders waiting to be processed and shipped.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900 mb-1">All Caught Up</h3>
                    <p className="text-xs text-emerald-700">There are no pending orders. Dispatch is fully caught up.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Snapshot */}
        <div className="space-y-8">
          {/* Business Snapshot */}
          <div className="bg-black text-white rounded-2xl shadow-lg p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Today's Snapshot</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold">{stats.ordersToday}</p>
                  <p className="text-xs text-gray-400 mt-1">Orders Received</p>
                </div>
                <ShoppingBag size={24} className="text-gray-600" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold">{stats.shippedToday}</p>
                  <p className="text-xs text-gray-400 mt-1">Orders Shipped</p>
                </div>
                <Truck size={24} className="text-gray-600" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold">{stats.activeBackendUsers}</p>
                  <p className="text-xs text-gray-400 mt-1">Active Staff</p>
                </div>
                <Users size={24} className="text-gray-600" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                to="/owner/dashboard" 
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-white group-hover:text-black transition-colors">
                    <ShoppingBag size={18} />
                  </div>
                  <span className="text-sm font-bold text-black">Manage Orders</span>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
              </Link>

              <Link 
                to="/owner/dashboard" 
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-white group-hover:text-black transition-colors">
                    <Users size={18} />
                  </div>
                  <span className="text-sm font-bold text-black">Backend Management</span>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
              </Link>

              <Link 
                to="/analysis/dashboard" 
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-white group-hover:text-black transition-colors">
                    <BarChart3 size={18} />
                  </div>
                  <span className="text-sm font-bold text-black">Reports & Analysis</span>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
              </Link>

              <Link 
                to="/accounts/dashboard" 
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-white group-hover:text-black transition-colors">
                    <DollarSign size={18} />
                  </div>
                  <span className="text-sm font-bold text-black">Accounts</span>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
