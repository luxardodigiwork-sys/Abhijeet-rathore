import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  CheckCircle2, 
  Box, 
  Send, 
  Truck, 
  Edit3, 
  ExternalLink,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  Phone,
  MapPin,
  X,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  Calendar,
  RotateCcw,
  ArrowRightLeft,
  Eye,
  CreditCard,
  Banknote,
  Hash,
  ShoppingBag,
  Printer,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { storage } from '../../utils/localStorage';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../context/AuthContext';

type FilterStatus = 'all' | 'verified' | 'packing_ready' | 'dispatch_ready' | 'packed' | 'shipped' | 'delivered' | 'returned' | 'failed_delivery';
type DateRange = 'today' | '7days' | 'month' | 'year' | 'all' | 'custom';
type SortOption = 'newest' | 'oldest' | 'dispatch_ready' | 'shipped' | 'delivered';

export default function DispatchDashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [editingTrackingId, setEditingTrackingId] = useState<{ id: string, value: string } | null>(null);
  const [selectedOrderAddress, setSelectedOrderAddress] = useState<Order | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [dispatchInfo, setDispatchInfo] = useState({
    courierName: '',
    dispatchDate: '',
    dispatchNote: '',
    internalRemarks: '',
    trackingId: ''
  });

  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateRange('all');
    setSortBy('newest');
  };

  useEffect(() => {
    const fetchOrders = () => {
      try {
        const data = storage.getOrders();
        // Sort by date descending
        setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Stabilize selectedOrderDetails for useEffect
  const selectedOrderDetailsId = selectedOrderDetails?.id;
  const selectedOrderDetailsData = useMemo(() => {
    if (!selectedOrderDetails) return null;
    return {
      courierName: selectedOrderDetails.courierName || '',
      dispatchDate: selectedOrderDetails.dispatchDate || '',
      dispatchNote: selectedOrderDetails.dispatchNote || '',
      internalRemarks: selectedOrderDetails.internalRemarks || '',
      trackingId: selectedOrderDetails.trackingId || ''
    };
  }, [
    selectedOrderDetails?.id,
    selectedOrderDetails?.courierName,
    selectedOrderDetails?.dispatchDate,
    selectedOrderDetails?.dispatchNote,
    selectedOrderDetails?.internalRemarks,
    selectedOrderDetails?.trackingId
  ]);

  useEffect(() => {
    if (selectedOrderDetailsData) {
      setDispatchInfo(prev => {
        if (JSON.stringify(prev) === JSON.stringify(selectedOrderDetailsData)) return prev;
        return selectedOrderDetailsData;
      });
    }
  }, [selectedOrderDetailsData]);

  const handleUpdateStatus = (orderId: string, updates: Partial<Order>) => {
    try {
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          const newHistory = [...(order.statusHistory || [])];
          
          // If status is changing, add to history
          if (updates.status && updates.status !== order.status) {
            newHistory.push({
              status: updates.status,
              timestamp: new Date().toISOString(),
              note: updates.dispatchNote || `Status updated to ${updates.status.replace('_', ' ')}`
            });

            // Set dispatch date if shipped
            if (updates.status === 'shipped' && !order.dispatchDate) {
              updates.dispatchDate = new Date().toISOString().split('T')[0];
            }
          }
          
          // If verificationStatus is changing, add to history
          if (updates.verificationStatus && updates.verificationStatus !== order.verificationStatus) {
            newHistory.push({
              status: updates.verificationStatus,
              timestamp: new Date().toISOString(),
              note: `Verification status updated to ${updates.verificationStatus.replace('_', ' ')}`
            });
          }

          const updatedOrder = { ...order, ...updates, statusHistory: newHistory };
          return updatedOrder;
        }
        return order;
      });
      storage.saveOrders(updatedOrders);
      setOrders(updatedOrders);
      
      // Update selectedOrderDetails if it's the one being updated
      if (selectedOrderDetails?.id === orderId) {
        const updatedOrder = updatedOrders.find(o => o.id === orderId);
        if (updatedOrder) setSelectedOrderDetails(updatedOrder);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const handleBulkUpdate = (updates: Partial<Order>) => {
    if (selectedOrderIds.size === 0) return;
    if (!confirm(`Are you sure you want to update ${selectedOrderIds.size} orders?`)) return;

    try {
      const updatedOrders = orders.map(order => {
        if (selectedOrderIds.has(order.id)) {
          const newHistory = [...(order.statusHistory || [])];
          
          if (updates.status && updates.status !== order.status) {
            newHistory.push({
              status: updates.status,
              timestamp: new Date().toISOString(),
              note: `Bulk status update to ${updates.status.replace('_', ' ')}`
            });
            if (updates.status === 'shipped' && !order.dispatchDate) {
              updates.dispatchDate = new Date().toISOString().split('T')[0];
            }
          }
          
          if (updates.verificationStatus && updates.verificationStatus !== order.verificationStatus) {
            newHistory.push({
              status: updates.verificationStatus,
              timestamp: new Date().toISOString(),
              note: `Bulk verification status update to ${updates.verificationStatus.replace('_', ' ')}`
            });
          }

          return { ...order, ...updates, statusHistory: newHistory };
        }
        return order;
      });

      storage.saveOrders(updatedOrders);
      setOrders(updatedOrders);
      setSelectedOrderIds(new Set());
      alert(`Successfully updated ${selectedOrderIds.size} orders`);
    } catch (error) {
      console.error('Error in bulk update:', error);
      alert('Failed to perform bulk update');
    }
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export');
      return;
    }

    const headers = [
      'Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 
      'Address', 'City', 'State', 'Postal Code', 'Country',
      'Items Count', 'Total Amount', 'Payment Method', 'Payment Status',
      'Verification Status', 'Dispatch Status', 'Courier', 'Tracking ID', 'Dispatch Date'
    ];

    const rows = filteredOrders.map(order => [
      order.id,
      new Date(order.createdAt).toLocaleDateString(),
      order.userName,
      order.userEmail,
      order.shippingAddress?.phone || '',
      `"${order.shippingAddress?.addressLine1 || ''} ${order.shippingAddress?.addressLine2 || ''}"`,
      order.shippingAddress?.city || '',
      order.shippingAddress?.state || '',
      order.shippingAddress?.postalCode || '',
      order.shippingAddress?.country || '',
      order.items.reduce((acc, item) => acc + item.quantity, 0),
      order.totalAmount,
      order.paymentMethod || 'prepaid',
      order.paymentStatus || 'pending',
      order.verificationStatus || 'unverified',
      order.status,
      order.courierName || '',
      order.trackingId || '',
      order.dispatchDate || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `luxardo_dispatch_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrderIds);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrderIds(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleSaveDispatchInfo = () => {
    if (!selectedOrderDetails) return;
    handleUpdateStatus(selectedOrderDetails.id, {
      courierName: dispatchInfo.courierName,
      dispatchDate: dispatchInfo.dispatchDate,
      dispatchNote: dispatchInfo.dispatchNote,
      internalRemarks: dispatchInfo.internalRemarks,
      trackingId: dispatchInfo.trackingId
    });
    alert('Dispatch information saved successfully');
  };

  const handleSaveTracking = (orderId: string) => {
    if (!editingTrackingId) return;
    handleUpdateStatus(orderId, { trackingId: editingTrackingId.value });
    setEditingTrackingId(null);
  };

  const { cities, states } = useMemo(() => {
    const c = new Set<string>();
    const s = new Set<string>();
    orders.forEach(o => {
      if (o.shippingAddress?.city) c.add(o.shippingAddress.city);
      if (o.shippingAddress?.state) s.add(o.shippingAddress.state);
    });
    return { 
      cities: Array.from(c).sort(), 
      states: Array.from(s).sort() 
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      
      let matchesDate = true;
      if (dateRange === 'today') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateRange === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (dateRange === 'month') {
        matchesDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      } else if (dateRange === 'year') {
        matchesDate = orderDate.getFullYear() === now.getFullYear();
      } else if (dateRange === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = orderDate >= start && orderDate <= end;
      }

      const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.shippingAddress?.phone || '').includes(searchQuery) ||
        (order.trackingId || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'verified' && order.verificationStatus === 'verified') ||
        (statusFilter === 'packing_ready' && order.verificationStatus === 'packing_ready') ||
        (statusFilter === 'dispatch_ready' && order.verificationStatus === 'dispatch_ready') ||
        (statusFilter === 'packed' && order.status === 'packed') ||
        (statusFilter === 'shipped' && order.status === 'shipped') ||
        (statusFilter === 'delivered' && order.status === 'delivered') ||
        (statusFilter === 'returned' && order.status === 'returned') ||
        (statusFilter === 'failed_delivery' && order.status === 'failed_delivery');

      return matchesDate && matchesSearch && matchesStatus;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'dispatch_ready') {
        if (a.verificationStatus === 'dispatch_ready' && b.verificationStatus !== 'dispatch_ready') return -1;
        if (a.verificationStatus !== 'dispatch_ready' && b.verificationStatus === 'dispatch_ready') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'shipped') {
        if (a.status === 'shipped' && b.status !== 'shipped') return -1;
        if (a.status !== 'shipped' && b.status === 'shipped') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'delivered') {
        if (a.status === 'delivered' && b.status !== 'delivered') return -1;
        if (a.status !== 'delivered' && b.status === 'delivered') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [orders, searchQuery, statusFilter, dateRange, customStartDate, customEndDate, sortBy]);

  const stats = useMemo(() => {
    const rangeOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      
      if (dateRange === 'today') return orderDate.toDateString() === now.toDateString();
      if (dateRange === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return orderDate >= sevenDaysAgo;
      }
      if (dateRange === 'month') return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      if (dateRange === 'year') return orderDate.getFullYear() === now.getFullYear();
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      }
      return true;
    });

    return {
      dispatchReady: rangeOrders.filter(o => o.verificationStatus === 'dispatch_ready').length,
      packed: rangeOrders.filter(o => o.status === 'packed').length,
      shipped: rangeOrders.filter(o => o.status === 'shipped').length,
      delivered: rangeOrders.filter(o => o.status === 'delivered').length,
      returnedFailed: rangeOrders.filter(o => o.status === 'returned' || o.status === 'failed_delivery').length,
      total: rangeOrders.length,
    };
  }, [orders, dateRange, customStartDate, customEndDate]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Admin Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispatch Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track order shipments</p>
        </div>
        {isAdmin && (
          <Link
            to="/admin/backend-management"
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Settings size={16} />
            Admin Control & Users
          </Link>
        )}
      </div>

      {/* Stats Grid - Simplified */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Dispatch</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.dispatchReady + stats.packed}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Box size={20} />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shipped</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.shipped}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Send size={20} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivered</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.delivered}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="p-3 bg-gray-50 text-gray-600 rounded-lg">
            <Package size={20} />
          </div>
        </div>
      </div>

      {/* Filters & Search - Simplified */}
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-black cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="packing_ready">Packing Ready</option>
            <option value="dispatch_ready">Dispatch Ready</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
            <option value="failed_delivery">Failed Delivery</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 flex items-center gap-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-black hover:text-black transition-all bg-white"
          >
            <ExternalLink size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrderIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] bg-black text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 border-r border-white/20 pr-8">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold">
              {selectedOrderIds.size}
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">Orders Selected</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkUpdate({ verificationStatus: 'verified' })}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2"
            >
              <ShieldCheck size={14} /> Mark Verified
            </button>
            <button
              onClick={() => handleBulkUpdate({ status: 'packed' })}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2"
            >
              <Box size={14} /> Mark Packed
            </button>
            <button
              onClick={() => handleBulkUpdate({ status: 'shipped' })}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2"
            >
              <Send size={14} /> Mark Shipped
            </button>
          </div>

          <button
            onClick={() => setSelectedOrderIds(new Set())}
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-400px)] relative">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky-table-header">
              <tr>
                <th className="px-6 py-4 w-10 border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleAllSelection}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500 border-b border-gray-200">Order ID & Date</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500 border-b border-gray-200">Customer Info</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500 border-b border-gray-200">Items & Qty</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500 border-b border-gray-200">Shipping To</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500 border-b border-gray-200">Payment</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500 border-b border-gray-200">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500 border-b border-gray-200">Tracking</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-right border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className={`hover:bg-gray-50/50 transition-colors ${selectedOrderIds.has(order.id) ? 'bg-gray-50' : ''} ${
                    (() => {
                      const daysSinceCreation = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 3600 * 24));
                      const isDelayed = (order.status === 'pending' || order.status === 'processing') && daysSinceCreation >= 3;
                      
                      if (isDelayed) return 'bg-red-50/50 border-l-4 border-l-red-600';
                      if (order.status === 'shipped') return 'bg-blue-50/50 border-l-4 border-l-blue-500';
                      if (order.status === 'delivered') return 'bg-emerald-50/50 border-l-4 border-l-emerald-500';
                      
                      if (order.verificationStatus === 'dispatch_ready') return 'border-l-4 border-l-emerald-400';
                      return 'border-l-4 border-l-amber-500';
                    })()
                  }`}>
                    <td className="px-6 py-6 border-b border-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.has(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                      />
                    </td>
                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="flex items-center gap-2 group/id">
                        <Hash size={12} className="text-gray-400" />
                        <span className="font-mono text-xs font-bold text-black uppercase">
                          {order.id.split('-')[0]}
                        </span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(order.id);
                            alert('Order ID copied to clipboard');
                          }}
                          className="p-1 text-gray-400 hover:text-black opacity-0 group-hover/id:opacity-100 transition-all"
                          title="Copy Full ID"
                        >
                          <ArrowRightLeft size={10} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1.5 font-medium">
                        <Calendar size={10} />
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="text-sm font-bold text-gray-900">{order.userName}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1.5">
                        <Phone size={10} className="text-gray-400" />
                        {order.shippingAddress?.phone || 'No Phone'}
                      </div>
                    </td>
                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2 overflow-hidden shrink-0">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="inline-block h-8 w-8 rounded border border-white bg-gray-100 overflow-hidden ring-1 ring-gray-100">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-[8px] font-bold text-gray-400">
                                    N/A
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="inline-flex h-8 w-8 items-center justify-center rounded border border-white bg-gray-200 text-[10px] font-bold text-gray-600 ring-1 ring-gray-100">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-gray-900 truncate max-w-[120px]">
                              {order.items[0]?.name}
                              {order.items.length > 1 && <span className="text-gray-400 font-medium ml-1">+{order.items.length - 1} more</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <ShoppingBag size={10} />
                          {order.items.reduce((acc, item) => acc + item.quantity, 0)} Units
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="max-w-[150px]">
                        <div className="text-xs font-bold text-gray-900 truncate">
                          {order.shippingAddress?.city}, {order.shippingAddress?.state}
                        </div>
                        <button 
                          onClick={() => setSelectedOrderAddress(order)}
                          className="text-[10px] font-bold text-black uppercase tracking-widest mt-1.5 hover:underline flex items-center gap-1 group"
                        >
                          <MapPin size={10} className="text-gray-400 group-hover:text-black transition-colors" /> 
                          View Address
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          {order.paymentMethod === 'cod' ? (
                            <Banknote size={12} className="text-amber-600" />
                          ) : (
                            <CreditCard size={12} className="text-blue-600" />
                          )}
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                            order.paymentMethod === 'cod' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {order.paymentMethod?.toUpperCase() || 'PREPAID'}
                          </span>
                        </div>
                        <div className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                          order.paymentStatus === 'confirmed' || order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {order.paymentStatus === 'confirmed' || order.paymentStatus === 'paid' ? (
                            <><CheckCircle2 size={10} /> VERIFIED</>
                          ) : (
                            <><Clock size={10} /> PENDING</>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${
                            order.verificationStatus === 'dispatch_ready' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            order.verificationStatus === 'packing_ready' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            order.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-gray-50 text-gray-400 border-gray-200'
                          }`}>
                            {order.verificationStatus?.replace('_', ' ') || 'Unverified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            order.status === 'packed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            order.status === 'returned' ? 'bg-red-50 text-red-700 border-red-200' :
                            order.status === 'failed_delivery' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-gray-50 text-gray-500 border-gray-200'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 border-b border-gray-50">
                      {editingTrackingId?.id === order.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingTrackingId.value}
                            onChange={(e) => setEditingTrackingId({ ...editingTrackingId, value: e.target.value })}
                            className="w-32 px-2 py-1 text-xs border border-black rounded focus:outline-none"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleSaveTracking(order.id)}
                            className="p-1 bg-black text-white rounded hover:bg-gray-800"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group/tracking">
                          <span className="font-mono text-xs text-gray-900">
                            {order.trackingId || '—'}
                          </span>
                          <button 
                            onClick={() => setEditingTrackingId({ id: order.id, value: order.trackingId || '' })}
                            className="p-1 text-gray-400 hover:text-black transition-colors opacity-0 group-hover/tracking:opacity-100"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-6 text-right border-b border-gray-50">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          title="View Order Details"
                          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <Eye size={18} />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        
                        {order.verificationStatus !== 'verified' && order.verificationStatus !== 'packing_ready' && order.verificationStatus !== 'dispatch_ready' && (
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to mark this order as Verified?')) {
                                handleUpdateStatus(order.id, { verificationStatus: 'verified' });
                              }
                            }}
                            title="Mark Verified"
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <ShieldCheck size={18} />
                          </button>
                        )}
                        {order.verificationStatus === 'verified' && (
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to mark this order as Packing Ready?')) {
                                handleUpdateStatus(order.id, { verificationStatus: 'packing_ready' });
                              }
                            }}
                            title="Mark Packing Ready"
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Box size={18} />
                          </button>
                        )}
                        {order.verificationStatus === 'packing_ready' && (
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to mark this order as Dispatch Ready?')) {
                                handleUpdateStatus(order.id, { verificationStatus: 'dispatch_ready' });
                              }
                            }}
                            title="Mark Dispatch Ready"
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            <Clock size={18} />
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'processing') && order.verificationStatus === 'dispatch_ready' && (
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to mark this order as Packed?')) {
                                handleUpdateStatus(order.id, { status: 'packed' });
                              }
                            }}
                            title="Mark Packed"
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Box size={18} />
                          </button>
                        )}
                        {order.status === 'packed' && (
                          <button
                            onClick={async () => {
                              if (confirm('Create DTDC Shipment for this order?')) {
                                try {
                                  const res = await fetch('/api/dtdc/create-shipment', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      orderId: order.id,
                                      shipmentData: {
                                        receiverName: order.shippingAddress?.fullName,
                                        phone: order.shippingAddress?.phone,
                                        address: order.shippingAddress?.addressLine1,
                                        pincode: order.shippingAddress?.postalCode,
                                        city: order.shippingAddress?.city,
                                        state: order.shippingAddress?.state,
                                        codAmount: 0,
                                        parcelWeight: 1.5,
                                        invoiceValue: order.totalAmount
                                      }
                                    })
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    handleUpdateStatus(order.id, { 
                                      status: 'shipped',
                                      trackingId: data.trackingId,
                                      courierName: 'DTDC'
                                    });
                                    alert(`Shipment created! Tracking ID: ${data.trackingId}`);
                                  } else {
                                    alert('Failed to create shipment');
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert('Error creating shipment');
                                }
                              }
                            }}
                            title="Create DTDC Shipment"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Send size={18} />
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to mark this order as Delivered?')) {
                                  handleUpdateStatus(order.id, { status: 'delivered' });
                                }
                              }}
                              title="Mark Delivered"
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <Truck size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to mark this order as Failed Delivery?')) {
                                  handleUpdateStatus(order.id, { status: 'failed_delivery' });
                                }
                              }}
                              title="Mark Failed Delivery"
                              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                            >
                              <AlertCircle size={18} />
                            </button>
                          </>
                        )}
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to mark this order as Returned?')) {
                                handleUpdateStatus(order.id, { status: 'returned' });
                              }
                            }}
                            title="Mark Returned"
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <RotateCcw size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Package size={40} className="text-gray-200" />
                      <p className="text-gray-500 font-medium">No orders found matching your criteria.</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 px-6 py-2 bg-black text-white text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-gray-800 transition-all"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Address Modal */}
      {selectedOrderAddress && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900">Shipping Details</h3>
              <button onClick={() => setSelectedOrderAddress(null)} className="text-gray-400 hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Recipient</p>
                  <p className="font-bold text-gray-900">{selectedOrderAddress.shippingAddress?.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedOrderAddress.userEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Phone</p>
                  <p className="font-bold text-gray-900">{selectedOrderAddress.shippingAddress?.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <p>{selectedOrderAddress.shippingAddress?.addressLine1}</p>
                    {selectedOrderAddress.shippingAddress?.addressLine2 && <p>{selectedOrderAddress.shippingAddress?.addressLine2}</p>}
                    <p>{selectedOrderAddress.shippingAddress?.city}, {selectedOrderAddress.shippingAddress?.state}</p>
                    <p>{selectedOrderAddress.shippingAddress?.postalCode}</p>
                    <p className="font-bold text-gray-900 mt-1 uppercase tracking-widest text-[10px]">{selectedOrderAddress.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => setSelectedOrderAddress(null)}
                className="w-full py-3 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-900 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
              <div>
                <h3 className="font-bold text-gray-900">Dispatch Order Detail View</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">#{selectedOrderDetails.id}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  selectedOrderDetails.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  selectedOrderDetails.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {selectedOrderDetails.status.replace('_', ' ')}
                </div>
                <button onClick={() => setSelectedOrderDetails(null)} className="text-gray-400 hover:text-black transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Customer & Shipping */}
                <div className="space-y-8">
                  <section>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <User size={14} /> Customer Info
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Name</p>
                        <p className="text-sm font-bold text-gray-900">{selectedOrderDetails.userName}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                        <p className="text-sm text-gray-600">{selectedOrderDetails.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                        <p className="text-sm text-gray-600">{selectedOrderDetails.shippingAddress?.phone}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MapPin size={14} /> Shipping Details
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Address</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {selectedOrderDetails.shippingAddress?.addressLine1}<br />
                          {selectedOrderDetails.shippingAddress?.addressLine2 && <>{selectedOrderDetails.shippingAddress.addressLine2}<br /></>}
                          {selectedOrderDetails.shippingAddress?.city}, {selectedOrderDetails.shippingAddress?.state}<br />
                          {selectedOrderDetails.shippingAddress?.postalCode}<br />
                          <span className="font-bold text-gray-900 uppercase tracking-widest text-[10px]">{selectedOrderDetails.shippingAddress?.country}</span>
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Clock size={14} /> Status Timeline
                    </h4>
                    <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-gray-200">
                      {selectedOrderDetails.statusHistory && selectedOrderDetails.statusHistory.length > 0 ? (
                        selectedOrderDetails.statusHistory.map((history, idx) => (
                          <div key={idx} className="relative pl-8">
                            <div className="absolute left-0 top-1.5 w-[23px] h-[23px] bg-white border-2 border-black rounded-full flex items-center justify-center z-10">
                              <div className="w-1.5 h-1.5 bg-black rounded-full" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">{history.status.replace('_', ' ')}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">
                              {new Date(history.timestamp).toLocaleString('en-GB', { 
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                              })}
                            </p>
                            {history.note && <p className="text-[10px] text-gray-500 mt-1 italic">{history.note}</p>}
                          </div>
                        ))
                      ) : (
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1.5 w-[23px] h-[23px] bg-white border-2 border-gray-200 rounded-full flex items-center justify-center z-10">
                            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Placed</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">
                            {new Date(selectedOrderDetails.createdAt).toLocaleString('en-GB', { 
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Middle Column: Order Items */}
                <div className="space-y-8">
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ShoppingBag size={14} /> Order Items
                      </h4>
                      <span className="text-[10px] font-bold text-gray-900">{selectedOrderDetails.items.reduce((acc, item) => acc + item.quantity, 0)} Units</span>
                    </div>
                    <div className="space-y-4">
                      {selectedOrderDetails.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl bg-white hover:border-gray-200 transition-all">
                          <div className="h-16 w-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-gray-400">N/A</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-1">{item.category}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-[10px] text-gray-500">Qty: <span className="font-bold text-gray-900">{item.quantity}</span></p>
                              <p className="text-[10px] font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-gray-900">{formatCurrency(selectedOrderDetails.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                        <span className="text-gray-400">Shipping</span>
                        <span className="text-emerald-600">FREE</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2">
                        <span className="text-gray-900">Total Amount</span>
                        <span className="text-black">{formatCurrency(selectedOrderDetails.totalAmount)}</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: Dispatch Workflow */}
                <div className="space-y-8">
                  <section>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Truck size={14} /> Dispatch Workflow
                    </h4>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Courier Name</label>
                          <input
                            type="text"
                            value={dispatchInfo.courierName}
                            onChange={(e) => setDispatchInfo({ ...dispatchInfo, courierName: e.target.value })}
                            placeholder="e.g. BlueDart, Delhivery"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Dispatch Date</label>
                          <input
                            type="date"
                            value={dispatchInfo.dispatchDate}
                            onChange={(e) => setDispatchInfo({ ...dispatchInfo, dispatchDate: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tracking ID</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={dispatchInfo.trackingId}
                              onChange={(e) => setDispatchInfo({ ...dispatchInfo, trackingId: e.target.value })}
                              placeholder="Enter tracking number"
                              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                            />
                            {dispatchInfo.trackingId && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(dispatchInfo.trackingId);
                                  alert('Tracking ID copied');
                                }}
                                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-black transition-all"
                                title="Copy Tracking ID"
                              >
                                <ArrowRightLeft size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Dispatch Note (Customer Visible)</label>
                          <textarea
                            value={dispatchInfo.dispatchNote}
                            onChange={(e) => setDispatchInfo({ ...dispatchInfo, dispatchNote: e.target.value })}
                            placeholder="Note for the customer..."
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Internal Remarks</label>
                          <textarea
                            value={dispatchInfo.internalRemarks}
                            onChange={(e) => setDispatchInfo({ ...dispatchInfo, internalRemarks: e.target.value })}
                            placeholder="Private notes for team..."
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black resize-none"
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={handleSaveDispatchInfo}
                        className="w-full py-3 bg-black text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-900 transition-all shadow-lg shadow-black/10"
                      >
                        Save Dispatch Details
                      </button>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to mark this order as Verified?')) {
                            handleUpdateStatus(selectedOrderDetails.id, { verificationStatus: 'verified' });
                          }
                        }}
                        className="p-3 border border-gray-200 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:border-black transition-all flex flex-col items-center gap-2"
                      >
                        <ShieldCheck size={16} /> Verify
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to mark this order as Packed?')) {
                            handleUpdateStatus(selectedOrderDetails.id, { status: 'packed' });
                          }
                        }}
                        className="p-3 border border-gray-200 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:border-black transition-all flex flex-col items-center gap-2"
                      >
                        <Box size={16} /> Pack
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Create DTDC Shipment for this order?')) {
                            try {
                              const res = await fetch('/api/dtdc/create-shipment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  orderId: selectedOrderDetails.id,
                                  shipmentData: {
                                    receiverName: selectedOrderDetails.shippingAddress?.fullName,
                                    phone: selectedOrderDetails.shippingAddress?.phone,
                                    address: selectedOrderDetails.shippingAddress?.addressLine1,
                                    pincode: selectedOrderDetails.shippingAddress?.postalCode,
                                    city: selectedOrderDetails.shippingAddress?.city,
                                    state: selectedOrderDetails.shippingAddress?.state,
                                    codAmount: 0,
                                    parcelWeight: 1.5,
                                    invoiceValue: selectedOrderDetails.totalAmount
                                  }
                                })
                              });
                              const data = await res.json();
                              if (data.success) {
                                handleUpdateStatus(selectedOrderDetails.id, { 
                                  status: 'shipped',
                                  trackingId: data.trackingId,
                                  courierName: 'DTDC'
                                });
                                alert(`Shipment created! Tracking ID: ${data.trackingId}`);
                              } else {
                                alert('Failed to create shipment');
                              }
                            } catch (err) {
                              console.error(err);
                              alert('Error creating shipment');
                            }
                          }
                        }}
                        className="p-3 border border-gray-200 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:border-black transition-all flex flex-col items-center gap-2"
                      >
                        <Send size={16} /> DTDC Ship
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to mark this order as Delivered?')) {
                            handleUpdateStatus(selectedOrderDetails.id, { status: 'delivered' });
                          }
                        }}
                        className="p-3 border border-gray-200 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:border-black transition-all flex flex-col items-center gap-2"
                      >
                        <Truck size={16} /> Deliver
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shrink-0">
              <button 
                onClick={() => setSelectedOrderDetails(null)}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:border-black hover:text-black transition-all"
              >
                Close View
              </button>
              <button 
                onClick={() => window.print()}
                className="px-8 py-3 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-900 transition-all flex items-center gap-2"
              >
                <Printer size={16} /> Print Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
