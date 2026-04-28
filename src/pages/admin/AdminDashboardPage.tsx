import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Users, ShoppingBag, IndianRupee, Package, Settings, CheckCircle2, AlertCircle, Clock, Truck, Mail, Plus, FileText, Shield, Image as ImageIcon, Layers, Crown, Send, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/localStorage';

export default function AdminDashboardPage() {
  const { isAuthReady } = useAuth();

  const dashboardData = useMemo(() => {
    if (!isAuthReady) return null;

    try {
      const data = storage.getDashboardStats();
      const orders = storage.getOrders();
      const products = storage.getProducts();
      const wholesaleInquiries = storage.getWholesaleInquiries();
      
      const today = new Date();
      const todayString = today.toDateString();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      let todayRev = 0;
      let last7Rev = 0;
      let pendingCount = 0;
      let processingCount = 0;
      let shippedCount = 0;
      let deliveredCount = 0;
      let cancelledCount = 0;
      let hasOrdersToday = false;

      orders.forEach(o => {
        const orderDate = new Date(o.createdAt);
        if (orderDate.toDateString() === todayString) {
          todayRev += o.totalAmount;
          hasOrdersToday = true;
        }
        if (orderDate >= sevenDaysAgo) {
          last7Rev += o.totalAmount;
        }

        switch(o.status) {
          case 'pending': pendingCount++; break;
          case 'processing': processingCount++; break;
          case 'shipped': shippedCount++; break;
          case 'delivered': deliveredCount++; break;
          case 'cancelled': cancelledCount++; break;
        }
      });

      const pendingOrders = pendingCount + processingCount;
      const deliveredOrders = deliveredCount;

      // Generate Smart Alerts
      const newAlerts: string[] = [];
      if (pendingOrders > 5) {
        newAlerts.push('Orders require attention');
      }
      if (products.some(p => p.stock < 5)) {
        newAlerts.push('Low stock items detected');
      }
      if (!hasOrdersToday) {
        newAlerts.push('No orders today');
      }

      const orderStatuses = {
        pending: pendingCount,
        processing: processingCount,
        shipped: shippedCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
      };

      return {
        stats: {
          revenue: data.totalRevenue,
          todayRevenue: todayRev,
          last7DaysRevenue: last7Rev,
          totalOrders: data.totalOrders,
          pendingOrders,
          deliveredOrders,
          activePrimeMembers: data.activeMembers,
          totalProducts: products.length,
          wholesaleInquiries: wholesaleInquiries.length,
          orderStatuses
        },
        alerts: newAlerts,
        recentOrders: data.recentOrders,
        recentActivity: [
          { id: 1, text: 'New order #LX-8291 placed', time: '10 mins ago' },
          { id: 2, text: 'Product "Midnight Blue Bandhgala" added', time: '1 hour ago' },
          { id: 3, text: 'Order #LX-8285 shipped', time: '2 hours ago' },
          { id: 4, text: 'Alexander Wright activated Prime membership', time: '3 hours ago' },
          { id: 5, text: 'Shipping policy updated', time: '5 hours ago' },
        ]
      };
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      return null;
    }
  }, [isAuthReady]);

  if (!isAuthReady || !dashboardData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-divider border-t-brand-black rounded-full animate-spin"></div>
          <p className="font-sans text-brand-secondary animate-pulse uppercase tracking-widest text-xs">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const { stats, alerts, recentActivity } = dashboardData;

  const managementGroups = [
    {
      title: 'Store Management',
      items: [
        { path: '/admin/orders', label: 'Orders', icon: ShoppingBag, desc: 'View and manage customer orders' },
        { path: '/admin/dispatch', label: 'Dispatch', icon: Truck, desc: 'Manage shipping and tracking' },
        { path: '/admin/products', label: 'Products', icon: Package, desc: 'Manage catalog and inventory' },
        { path: '/admin/collections', label: 'Collections', icon: Layers, desc: 'Manage product categories' },
      ]
    },
    {
      title: 'Content & Media',
      items: [
        { path: '/admin/content', label: 'Site Content', icon: FileText, desc: 'Edit homepage and pages' },
        { path: '/admin/prime-content', label: 'Prime Content', icon: Crown, desc: 'Manage exclusive content' },
        { path: '/admin/media', label: 'Media Library', icon: ImageIcon, desc: 'Manage images and assets' },
        { path: '/admin/policies', label: 'Policies', icon: Shield, desc: 'Edit terms and conditions' },
      ]
    },
    {
      title: 'Customers & Services',
      items: [
        { path: '/admin/prime-members', label: 'Prime Members', icon: Users, desc: 'Manage subscriptions' },
        { path: '/admin/bespoke-requests', label: 'Bespoke Requests', icon: Send, desc: 'View custom tailoring requests' },
        { path: '/admin/partners', label: 'Partners', icon: Wallet, desc: 'Manage wholesale and affiliates' },
      ]
    },
    {
      title: 'System Administration',
      items: [
        { path: '/admin/backend-management', label: 'Staff & Roles', icon: Shield, desc: 'Manage backend access' },
        { path: '/admin/settings', label: 'Settings', icon: Settings, desc: 'System configuration' },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight">Control Center</h1>
        <p className="text-brand-secondary font-sans mt-2 text-sm">Manage your entire website from here</p>
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {alerts.map((alert, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 px-3 py-1.5 bg-brand-bg border border-brand-divider"
            >
              <div className="w-1 h-1 rounded-full bg-brand-black" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">
                {alert}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Operational Metrics */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Pending Orders', value: stats.pendingOrders.toString(), note: 'Awaiting processing' },
            { label: 'Total Products', value: stats.totalProducts.toString(), note: 'Active in catalog' },
            { label: 'Active Prime Members', value: stats.activePrimeMembers.toString(), note: 'Current subscriptions' },
            { label: 'Wholesale Inquiries', value: stats.wholesaleInquiries.toString(), note: 'Awaiting reply' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 border border-brand-divider flex flex-col hover:border-brand-black/30 hover:shadow-sm transition-all duration-300"
            >
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-3">{stat.label}</h3>
              <p className="text-3xl font-display text-brand-black">{stat.value}</p>
              <p className="text-xs text-brand-secondary mt-2">{stat.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Management Areas */}
      <div className="space-y-10">
        {managementGroups.map((group, groupIdx) => (
          <section key={groupIdx}>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-brand-black mb-6 border-b border-brand-divider pb-2">{group.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {group.items.map((item, itemIdx) => (
                <Link 
                  key={itemIdx}
                  to={item.path} 
                  className="p-6 bg-white border border-brand-divider hover:border-brand-black hover:shadow-sm transition-all duration-300 group flex flex-col items-start gap-4 rounded-3xl"
                >
                  <div className="p-3 bg-brand-bg rounded-full group-hover:bg-brand-black group-hover:text-white transition-colors">
                    <item.icon size={20} className="text-brand-black group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-black mb-1">{item.label}</h4>
                    <p className="text-xs text-brand-secondary">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Recent Activity Area */}
      <section>
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-brand-black mb-6 border-b border-brand-divider pb-2">Recent Activity</h2>
        <div className="bg-white border border-brand-divider p-6 flex flex-col max-w-3xl">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex gap-4 border-b border-brand-divider last:border-0 py-4 first:pt-0 last:pb-0 group hover:bg-brand-bg/30 transition-colors -mx-2 px-2 rounded-2xl">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-brand-divider group-hover:bg-brand-black transition-colors shrink-0" />
              <div>
                <p className="font-sans text-brand-black text-sm leading-snug">{activity.text}</p>
                <p className="text-xs text-brand-secondary mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
