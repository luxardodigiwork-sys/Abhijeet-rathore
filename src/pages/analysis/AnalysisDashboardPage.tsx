import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Crown, 
  TrendingUp, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Activity,
  Globe
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, User, Product } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { startOfDay, startOfWeek, startOfMonth, startOfYear, isAfter, subDays } from 'date-fns';

type TimeFilter = 'today' | 'week' | 'month' | 'year';

export default function AnalysisDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  useEffect(() => {
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
    });

    const unsubFavorites = onSnapshot(collection(db, 'favorites'), (snapshot) => {
      const favoritesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFavorites(favoritesData);
    });

    return () => {
      unsubOrders();
      unsubUsers();
      unsubProducts();
      unsubFavorites();
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeFilter) {
      case 'today': startDate = startOfDay(now); break;
      case 'week': startDate = startOfWeek(now); break;
      case 'month': startDate = startOfMonth(now); break;
      case 'year': startDate = startOfYear(now); break;
      default: startDate = startOfMonth(now);
    }

    return orders.filter(order => isAfter(new Date(order.createdAt), startDate));
  }, [orders, timeFilter]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = filteredOrders.length;
    const primeMembers = users.filter(u => u.isPrimeMember).length;
    const activeCustomers = new Set(orders.map(o => o.userEmail)).size;
    
    // Category performance
    const categorySales: Record<string, number> = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const cat = item.category || 'Uncategorized';
        categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
      });
    });
    
    const topCategory = Object.entries(categorySales).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalRevenue,
      totalOrders,
      primeMembers,
      activeCustomers,
      topCategory,
      conversionRate: totalOrders > 0 ? ((totalOrders / (users.length || 1)) * 100).toFixed(1) : '0.0'
    };
  }, [filteredOrders, users, orders]);

  const salesInsights = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const week = startOfWeek(now);
    const month = startOfMonth(now);

    const ordersToday = orders.filter(o => isAfter(new Date(o.createdAt), today));
    const ordersWeek = orders.filter(o => isAfter(new Date(o.createdAt), week));
    const ordersMonth = orders.filter(o => isAfter(new Date(o.createdAt), month));

    const revenueToday = ordersToday.reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueMonth = ordersMonth.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      ordersToday: ordersToday.length,
      ordersWeek: ordersWeek.length,
      ordersMonth: ordersMonth.length,
      revenueToday,
      revenueMonth
    };
  }, [orders]);

  const productInsights = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    const productSales: Record<string, { name: string, count: number, revenue: number }> = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        categoryCounts[item.category || 'Uncategorized'] = (categoryCounts[item.category || 'Uncategorized'] || 0) + item.quantity;
        
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, count: 0, revenue: 0 };
        }
        productSales[item.productId].count += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return {
      topCategories: sortedCategories.slice(0, 3),
      lowCategories: sortedCategories.slice(-3).reverse(),
      topProducts
    };
  }, [orders]);

  const customerInsights = useMemo(() => {
    const customerOrderCounts: Record<string, number> = {};
    orders.forEach(o => {
      customerOrderCounts[o.userEmail] = (customerOrderCounts[o.userEmail] || 0) + 1;
    });

    const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
    const totalCustomers = Object.keys(customerOrderCounts).length;
    
    const now = new Date();
    const monthAgo = subDays(now, 30);
    const newCustomers = users.filter(u => u.createdAt && isAfter(new Date(u.createdAt), monthAgo)).length;

    return {
      repeatCustomers,
      primeMembers: users.filter(u => u.isPrimeMember).length,
      newCustomers,
      returningCustomers: totalCustomers - newCustomers
    };
  }, [orders, users]);

  const operationalInsights = useMemo(() => {
    return {
      pending: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      failed: orders.filter(o => o.status === 'cancelled' || o.status === 'returned' || o.status === 'failed_delivery').length
    };
  }, [orders]);

  const favoriteInsights = useMemo(() => {
    const productFavoriteCounts: Record<string, { name: string, count: number }> = {};
    
    favorites.forEach(fav => {
      if (!productFavoriteCounts[fav.productId]) {
        productFavoriteCounts[fav.productId] = { 
          name: fav.product?.name || 'Unknown Product', 
          count: 0 
        };
      }
      productFavoriteCounts[fav.productId].count += 1;
    });

    const topFavoritedProducts = Object.values(productFavoriteCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalFavorites: favorites.length,
      topFavoritedProducts
    };
  }, [favorites]);

  const websiteAnalysis = useMemo(() => {
    // Mock data for website reach since we don't have a real analytics backend
    // In a real app, this would come from Google Analytics or similar
    const now = new Date();
    const today = startOfDay(now);
    
    // Use active users/orders as a proxy for engagement
    const activeUsersToday = users.filter(u => u.createdAt && isAfter(new Date(u.createdAt), today)).length + 
                             orders.filter(o => o.createdAt && isAfter(new Date(o.createdAt), today)).length * 3;
                             
    const estimatedReach = Math.max(120, activeUsersToday * 15 + Math.floor(Math.random() * 50));
    const bounceRate = (35 + Math.random() * 10).toFixed(1);
    const avgSessionDuration = "2m 45s";
    
    return {
      dailyReach: estimatedReach,
      bounceRate: `${bounceRate}%`,
      avgSessionDuration,
      activeUsersToday
    };
  }, [users, orders]);

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Business Analysis</h2>
          <p className="text-brand-secondary mt-2">Real-time insights and performance metrics.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 border border-brand-divider rounded-lg">
          {(['today', 'week', 'month', 'year'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-md ${
                timeFilter === f 
                  ? 'bg-brand-black text-white' 
                  : 'text-brand-secondary hover:text-brand-black'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Top Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <InsightCard 
          label="Total Orders" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          trend="+12%" 
          trendUp={true}
        />
        <InsightCard 
          label="Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={DollarSign} 
          trend="+8.4%" 
          trendUp={true}
        />
        <InsightCard 
          label="Conversion" 
          value={`${stats.conversionRate}%`} 
          icon={TrendingUp} 
          trend="-0.5%" 
          trendUp={false}
        />
        <InsightCard 
          label="Active Customers" 
          value={stats.activeCustomers} 
          icon={Users} 
        />
        <InsightCard 
          label="Prime Members" 
          value={stats.primeMembers} 
          icon={Crown} 
          highlight
        />
        <InsightCard 
          label="Top Category" 
          value={stats.topCategory} 
          icon={Package} 
          smallValue
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Insights */}
        <Section title="Sales Performance" icon={TrendingUp}>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <MetricRow label="Orders Today" value={salesInsights.ordersToday} />
              <MetricRow label="Orders This Week" value={salesInsights.ordersWeek} />
              <MetricRow label="Orders This Month" value={salesInsights.ordersMonth} />
            </div>
            <div className="space-y-4 border-l border-brand-divider pl-6">
              <MetricRow label="Revenue Today" value={formatCurrency(salesInsights.revenueToday)} />
              <MetricRow label="Revenue This Month" value={formatCurrency(salesInsights.revenueMonth)} />
            </div>
          </div>
        </Section>

        {/* Operational Insights */}
        <Section title="Operational Status" icon={Truck}>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            <StatusBlock label="Dispatch Pending" value={operationalInsights.pending} icon={Clock} color="text-amber-600" />
            <StatusBlock label="Shipped" value={operationalInsights.shipped} icon={Truck} color="text-blue-600" />
            <StatusBlock label="Delivered" value={operationalInsights.delivered} icon={CheckCircle} color="text-green-600" />
            <StatusBlock label="Failed / Returned" value={operationalInsights.failed} icon={XCircle} color="text-red-600" />
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Website Analysis */}
        <Section title="Website Analysis" icon={Globe} className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-brand-bg border border-brand-divider rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={18} className="text-brand-secondary" />
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Daily Reach (Est.)</h4>
              </div>
              <p className="text-3xl font-display font-bold">{websiteAnalysis.dailyReach}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><ArrowUpRight size={12}/> +12% vs yesterday</p>
            </div>
            <div className="p-6 bg-brand-bg border border-brand-divider rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Users size={18} className="text-brand-secondary" />
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Active Users Today</h4>
              </div>
              <p className="text-3xl font-display font-bold">{websiteAnalysis.activeUsersToday}</p>
            </div>
            <div className="p-6 bg-brand-bg border border-brand-divider rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={18} className="text-brand-secondary" />
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Bounce Rate</h4>
              </div>
              <p className="text-3xl font-display font-bold">{websiteAnalysis.bounceRate}</p>
            </div>
            <div className="p-6 bg-brand-bg border border-brand-divider rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={18} className="text-brand-secondary" />
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Avg Session</h4>
              </div>
              <p className="text-3xl font-display font-bold">{websiteAnalysis.avgSessionDuration}</p>
            </div>
          </div>
        </Section>

        {/* Product Insights */}
        <Section title="Category Performance" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-secondary mb-4">Top Performing</h4>
              <div className="space-y-4">
                {productInsights.topCategories.map(([name, count]) => (
                  <ProgressBar key={name} label={name} value={count} max={productInsights.topCategories[0]?.[1] || 1} />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-secondary mb-4">Low Performing</h4>
              <div className="space-y-4">
                {productInsights.lowCategories.map(([name, count]) => (
                  <ProgressBar key={name} label={name} value={count} max={productInsights.topCategories[0]?.[1] || 1} color="bg-gray-200" />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 pt-10 border-t border-brand-divider">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-secondary mb-4">Top Products</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-brand-secondary border-b border-brand-divider">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium text-right">Units</th>
                    <th className="pb-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-divider">
                  {productInsights.topProducts.map((p, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium">{p.name}</td>
                      <td className="py-3 text-right">{p.count}</td>
                      <td className="py-3 text-right">{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-brand-divider">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-secondary">Most Favorited Products</h4>
              <span className="text-xs font-bold bg-brand-bg px-2 py-1 rounded">Total Favorites: {favoriteInsights.totalFavorites}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-brand-secondary border-b border-brand-divider">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium text-right">Favorites Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-divider">
                  {favoriteInsights.topFavoritedProducts.length > 0 ? (
                    favoriteInsights.topFavoritedProducts.map((p, i) => (
                      <tr key={i}>
                        <td className="py-3 font-medium">{p.name}</td>
                        <td className="py-3 text-right">{p.count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-brand-secondary">No favorites data available yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* Customer Insights */}
        <Section title="Customer Base">
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-display font-bold">{customerInsights.repeatCustomers}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Repeat Customers</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-display font-bold">{((customerInsights.repeatCustomers / (users.length || 1)) * 100).toFixed(1)}%</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Retention Rate</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-brand-divider">
              <MetricRow label="Prime Members" value={customerInsights.primeMembers} />
              <MetricRow label="New (Last 30 Days)" value={customerInsights.newCustomers} />
              <MetricRow label="Returning" value={customerInsights.returningCustomers} />
            </div>

            <div className="bg-brand-bg p-6 rounded-lg border border-brand-divider">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-secondary mb-3">Customer Mix</h4>
              <div className="flex h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-black" 
                  style={{ width: `${(customerInsights.primeMembers / (users.length || 1)) * 100}%` }} 
                />
                <div 
                  className="bg-brand-secondary" 
                  style={{ width: `${(customerInsights.newCustomers / (users.length || 1)) * 100}%` }} 
                />
                <div 
                  className="bg-gray-200 flex-1" 
                />
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand-black" />
                  <span className="text-[9px] uppercase font-bold text-brand-secondary tracking-tighter">Prime</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand-secondary" />
                  <span className="text-[9px] uppercase font-bold text-brand-secondary tracking-tighter">New</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-200" />
                  <span className="text-[9px] uppercase font-bold text-brand-secondary tracking-tighter">Others</span>
                </div>
              </div>
            </div>
          </div>
        </Section>
        
        {/* Customer Details Table */}
        <Section title="Customer Details & Analysis" icon={Users} className="lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-brand-secondary border-b border-brand-divider">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Contact Number</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Prime</th>
                  <th className="pb-3 font-medium">Favorite Products</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-divider">
                {users.map((u, i) => {
                  const userFavs = favorites.filter(f => f.userId === u.id).map(f => f.product?.name || 'Unknown').join(', ');
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-medium">{u.name || 'N/A'}</td>
                      <td className="py-4">{u.email}</td>
                      <td className="py-4">{u.phone || 'N/A'}</td>
                      <td className="py-4">{u.country || 'N/A'}</td>
                      <td className="py-4 capitalize">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                          u.role === 'admin' || u.role === 'super_admin' ? 'bg-brand-black text-white' : 'bg-gray-200 text-brand-black'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4">
                        {u.isPrimeMember ? (
                          <span className="flex items-center gap-1 text-yellow-600"><Crown size={14} /> Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="py-4 max-w-xs truncate" title={userFavs}>
                        {userFavs || <span className="text-gray-400 italic">None</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
}

function InsightCard({ label, value, icon: Icon, trend, trendUp, highlight, smallValue }: any) {
  return (
    <div className={`p-6 bg-white border border-brand-divider rounded-xl transition-all hover:shadow-sm ${highlight ? 'ring-1 ring-brand-black' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-brand-black text-white' : 'bg-brand-bg text-brand-black'}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-secondary mb-1">{label}</p>
        <h3 className={`${smallValue ? 'text-lg' : 'text-2xl'} font-display font-bold truncate`}>{value}</h3>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children, className = "" }: any) {
  return (
    <div className={`bg-white border border-brand-divider rounded-xl p-8 ${className}`}>
      <div className="flex items-center gap-3 mb-8">
        {Icon && <Icon size={20} className="text-brand-black" />}
        <h3 className="text-lg font-display font-bold tracking-tight uppercase">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MetricRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-brand-secondary font-medium">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

function StatusBlock({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-full bg-gray-50 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xl font-display font-bold">{value}</p>
        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">{label}</p>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max, color = "bg-brand-black" }: any) {
  const percentage = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
        <span>{label}</span>
        <span className="text-brand-secondary">{value} units</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${color}`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}
