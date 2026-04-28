import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { storage } from '../../utils/localStorage';
import { 
  Users, Search, Filter, Mail, Phone, Globe, 
  Clock, CheckCircle2, XCircle, AlertCircle,
  MoreVertical, ExternalLink, Download
} from 'lucide-react';

interface WholesaleApplication {
  id: number;
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  retail_type: string;
  monthly_volume: string;
  message: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function AdminPartnersPage() {
  const [applications, setApplications] = useState<WholesaleApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<WholesaleApplication | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = storage.getWholesaleInquiries();
      setApplications(data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const inquiries = storage.getWholesaleInquiries();
      const updatedInquiries = inquiries.map(inq => 
        inq.id === id ? { ...inq, status } : inq
      );
      storage.saveWholesaleInquiries(updatedInquiries);
      
      fetchApplications();
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-700 border-green-100';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-widest">Partners & Wholesale</h1>
          <p className="text-sm text-brand-secondary mt-1">Manage global retail partnerships and inquiries</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-brand-divider text-sm hover:bg-brand-bg transition-colors">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Inquiries', value: applications.length, icon: Users, color: 'text-blue-600' },
          { label: 'Pending Review', value: applications.filter(a => a.status === 'pending').length, icon: Clock, color: 'text-amber-600' },
          { label: 'Approved Partners', value: applications.filter(a => a.status === 'approved').length, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Global Reach', value: new Set(applications.map(a => a.country)).size, icon: Globe, color: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border border-brand-divider">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 bg-brand-bg rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-display">{stat.value}</p>
            <p className="text-xs text-brand-secondary uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-brand-divider p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
          <input
            type="text"
            placeholder="Search by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-brand-bg border-none text-sm focus:ring-1 focus:ring-brand-black outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-brand-secondary" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-brand-bg border-none text-sm px-4 py-2 focus:ring-1 focus:ring-brand-black outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-brand-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg border-b border-brand-divider">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Partner Details</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Location</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Retail Type</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Volume</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brand-secondary font-sans">
                    Loading applications...
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brand-secondary font-sans">
                    No applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr 
                    key={app.id} 
                    className="hover:bg-brand-bg/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{app.company_name}</span>
                        <span className="text-xs text-brand-secondary">{app.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm">{app.city}</span>
                        <span className="text-xs text-brand-secondary">{app.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm capitalize">{app.retail_type.replace('-', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{app.monthly_volume}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical size={16} className="text-brand-secondary" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-brand-divider flex justify-between items-center">
              <div>
                <h2 className="text-xl font-display uppercase tracking-widest">Application Details</h2>
                <p className="text-xs text-brand-secondary mt-1">Submitted on {new Date(selectedApp.created_at).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-brand-bg transition-colors"
              >
                <XCircle size={24} className="text-brand-secondary" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-2">Company Information</p>
                    <h3 className="text-2xl font-display">{selectedApp.company_name}</h3>
                    <p className="text-brand-secondary">{selectedApp.retail_type.replace('-', ' ').toUpperCase()}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail size={16} className="text-brand-secondary" />
                      <span>{selectedApp.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone size={16} className="text-brand-secondary" />
                      <span>{selectedApp.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Globe size={16} className="text-brand-secondary" />
                      <span>{selectedApp.city}, {selectedApp.country}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-brand-bg p-6 space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-1">Primary Contact</p>
                    <p className="font-medium">{selectedApp.full_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-1">Order Volume</p>
                    <p className="font-medium">{selectedApp.monthly_volume}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-1">Current Status</p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mt-1 ${getStatusColor(selectedApp.status)}`}>
                      {selectedApp.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Partnership Vision</p>
                <div className="bg-brand-bg p-6 rounded-lg italic text-brand-secondary leading-relaxed">
                  "{selectedApp.message}"
                </div>
              </div>

              {/* Storefront Image */}
              {selectedApp.image && (
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Storefront / Business Image</p>
                  <div className="bg-brand-bg p-2 rounded-lg">
                    <img src={selectedApp.image} alt="Storefront" className="w-full max-h-96 object-contain" />
                  </div>
                </div>
              )}

              {/* Internal Notes Placeholder */}
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Internal Review Notes</p>
                <textarea 
                  className="w-full bg-brand-bg border-none p-4 text-sm font-sans focus:ring-1 focus:ring-brand-black outline-none resize-none"
                  placeholder="Add internal notes about this partner..."
                  rows={3}
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-brand-divider bg-brand-bg flex justify-between items-center">
              <div className="flex gap-3">
                <button 
                  onClick={() => updateStatus(selectedApp.id, 'rejected')}
                  className="px-6 py-2 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => updateStatus(selectedApp.id, 'approved')}
                  className="px-6 py-2 bg-green-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-colors"
                >
                  Approve Partner
                </button>
              </div>
              <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-secondary hover:text-brand-black transition-colors">
                <ExternalLink size={14} />
                <span>View Full Profile</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
