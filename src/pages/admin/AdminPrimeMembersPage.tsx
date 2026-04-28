import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../../utils/localStorage';
import { User } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  Mail,
  Phone,
  Shield,
  ArrowRight,
  ChevronRight,
  X,
  Plus,
  Minus,
  MessageSquare,
  Scissors,
  Library,
  Zap,
  UserCheck,
  UserMinus,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPrimeMembersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(() => storage.getPrimeGlobalSettings());

  useEffect(() => {
    loadUsers();
  }, []);

  const handleGlobalToggle = () => {
    const newSettings = { ...globalSettings, isLive: !globalSettings.isLive };
    setGlobalSettings(newSettings);
    storage.savePrimeGlobalSettings(newSettings);
  };

  const handleGlobalMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...globalSettings, offlineMessage: e.target.value };
    setGlobalSettings(newSettings);
    storage.savePrimeGlobalSettings(newSettings);
  };

  const loadUsers = () => {
    const allUsers = storage.getUsers();
    setUsers(allUsers);
  };

  const getMembershipStatus = (user: User) => {
    if (!user.isPrimeMember) return 'inactive';
    if (!user.membershipExpiry) return 'inactive';
    
    const expiryDate = new Date(user.membershipExpiry);
    if (expiryDate < new Date()) return 'expired';
    
    return 'active';
  };

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => getMembershipStatus(u) === 'active').length;
    const expired = users.filter(u => getMembershipStatus(u) === 'expired').length;
    const inactive = users.filter(u => getMembershipStatus(u) === 'inactive').length;
    return { total, active, expired, inactive };
  }, [users]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getMembershipStatus(user);
    const matchesFilter = filterStatus === 'all' || status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleTogglePrime = (user: User) => {
    const updatedUser: User = {
      ...user,
      isPrimeMember: !user.isPrimeMember,
      membershipActivation: !user.isPrimeMember ? new Date().toISOString() : undefined,
      membershipExpiry: !user.isPrimeMember ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      primePrivileges: !user.isPrimeMember ? {
        consultation: true,
        bespoke: true,
        fabricLibrary: true,
        prioritySupport: true
      } : undefined
    };
    storage.updateUser(updatedUser);
    loadUsers();
    if (selectedUser?.id === user.id) setSelectedUser(updatedUser);
  };

  const handleExtendMembership = (user: User) => {
    if (!user.membershipExpiry) return;
    
    const currentExpiry = new Date(user.membershipExpiry);
    const newExpiry = new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000); // Add 30 days
    
    const updatedUser: User = {
      ...user,
      membershipExpiry: newExpiry.toISOString()
    };
    storage.updateUser(updatedUser);
    loadUsers();
    if (selectedUser?.id === user.id) setSelectedUser(updatedUser);
  };

  const handleMarkExpired = (user: User) => {
    const updatedUser: User = {
      ...user,
      membershipExpiry: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Set to yesterday
    };
    storage.updateUser(updatedUser);
    loadUsers();
    if (selectedUser?.id === user.id) setSelectedUser(updatedUser);
  };

  const handleTogglePrivilege = (user: User, privilege: keyof NonNullable<User['primePrivileges']>) => {
    if (!user.primePrivileges) return;
    
    const updatedUser: User = {
      ...user,
      primePrivileges: {
        ...user.primePrivileges,
        [privilege]: !user.primePrivileges[privilege]
      }
    };
    storage.updateUser(updatedUser);
    loadUsers();
    if (selectedUser?.id === user.id) setSelectedUser(updatedUser);
  };

  const handleToggleAllPrivileges = (user: User, active: boolean) => {
    const updatedUser: User = {
      ...user,
      primePrivileges: {
        consultation: active,
        bespoke: active,
        fabricLibrary: active,
        prioritySupport: active
      }
    };
    storage.updateUser(updatedUser);
    loadUsers();
    if (selectedUser?.id === user.id) setSelectedUser(updatedUser);
  };

  const handleUpdateNotes = (user: User, notes: string) => {
    const updatedUser: User = {
      ...user,
      notes
    };
    storage.updateUser(updatedUser);
    loadUsers();
    if (selectedUser?.id === user.id) setSelectedUser(updatedUser);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            Inactive
          </span>
        );
    }
  };

  const PrivilegeSummary = ({ user }: { user: User }) => {
    if (!user.isPrimeMember || !user.primePrivileges) return <span className="text-[10px] text-brand-secondary uppercase tracking-tighter opacity-40">—</span>;
    
    const privileges = [
      { id: 'consultation', icon: MessageSquare, label: 'Consultation' },
      { id: 'bespoke', icon: Scissors, label: 'Bespoke' },
      { id: 'fabricLibrary', icon: Library, label: 'Library' },
      { id: 'prioritySupport', icon: Zap, label: 'Priority' }
    ];

    return (
      <div className="flex items-center gap-2">
        {privileges.map((p) => {
          const isActive = user.primePrivileges?.[p.id as keyof NonNullable<User['primePrivileges']>];
          const Icon = p.icon;
          return (
            <div 
              key={p.id} 
              className={`p-1.5 rounded-sm border ${isActive ? 'bg-brand-black text-white border-brand-black' : 'bg-transparent text-brand-secondary/30 border-brand-divider'}`}
              title={p.label}
            >
              <Icon size={12} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-4 border-b border-brand-divider">
        <div className="space-y-1.5">
          <h1 className="text-4xl font-display tracking-tight text-brand-black">Prime Members</h1>
          <p className="text-brand-secondary text-sm font-sans max-w-md leading-relaxed">
            Oversee the exclusive circle of Luxardo Prime members, managing their status, privileges, and bespoke service access.
          </p>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="group">
            <div className="text-2xl font-display text-brand-black group-hover:scale-110 transition-transform duration-500">{stats.active}</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-emerald-600 font-bold mt-1">Active Circle</div>
          </div>
          <div className="w-px h-8 bg-brand-divider opacity-50" />
          <div className="group">
            <div className="text-2xl font-display text-brand-black group-hover:scale-110 transition-transform duration-500">{stats.expired}</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-amber-600 font-bold mt-1">Expired</div>
          </div>
          <div className="w-px h-8 bg-brand-divider opacity-50" />
          <div className="group">
            <div className="text-2xl font-display text-brand-black group-hover:scale-110 transition-transform duration-500">{stats.total}</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-brand-secondary font-bold mt-1">Total Members</div>
          </div>
        </div>
      </div>

      {/* Global Prime Member Control */}
      <div className="bg-white border border-brand-divider shadow-sm p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-display tracking-tight text-brand-black flex items-center gap-3">
              <Shield size={20} className={globalSettings.isLive ? 'text-emerald-600' : 'text-amber-600'} />
              Global Prime Member Control
            </h2>
            <p className="text-sm text-brand-secondary font-sans max-w-xl">
              Instantly pause or resume all Prime Member benefits on the public website. When paused, members cannot access exclusive services or join Prime.
            </p>
          </div>
          
          <div className="flex items-center gap-6 shrink-0">
            <div className="flex flex-col items-end">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${globalSettings.isLive ? 'text-emerald-600' : 'text-amber-600'}`}>
                {globalSettings.isLive ? 'Prime Benefits Live' : 'Prime Benefits Paused'}
              </span>
              <span className="text-[9px] text-brand-secondary uppercase tracking-widest mt-1">Website Status</span>
            </div>
            
            <button
              onClick={handleGlobalToggle}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none shadow-inner ${
                globalSettings.isLive ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                  globalSettings.isLive ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {!globalSettings.isLive && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 border-t border-brand-divider">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-3">
                  Offline Message (Shown to users)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={16} />
                  <input
                    type="text"
                    value={globalSettings.offlineMessage}
                    onChange={handleGlobalMessageChange}
                    className="w-full pl-12 pr-4 py-3 bg-brand-bg/50 border border-brand-divider focus:border-brand-black outline-none transition-all text-sm font-sans"
                    placeholder="Enter message to display when Prime is paused..."
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-black transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, or identifier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white border border-brand-divider focus:border-brand-black outline-none transition-all text-sm font-sans shadow-sm"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-white px-4 py-3 border border-brand-divider shadow-sm min-w-[180px]">
            <Filter size={14} className="text-brand-secondary" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-transparent text-[10px] font-bold outline-none focus:ring-0 cursor-pointer uppercase tracking-widest w-full"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="expired">Expired Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-brand-divider shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg/30 border-b border-brand-divider">
                <th className="px-8 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Member Profile</th>
                <th className="px-8 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Status</th>
                <th className="px-8 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Membership Period</th>
                <th className="px-8 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Privileges</th>
                <th className="px-8 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {filteredUsers.map((user) => {
                const status = getMembershipStatus(user);
                return (
                  <tr key={user.id} className="hover:bg-brand-bg/10 transition-colors group">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-brand-black text-white flex items-center justify-center text-sm font-medium tracking-tighter shrink-0 shadow-inner">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="text-base font-medium text-brand-black truncate leading-tight">{user.name}</div>
                          <div className="text-xs text-brand-secondary truncate font-sans mt-1 opacity-70">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-8 py-8">
                      {user.membershipActivation ? (
                        <div className="text-[11px] font-sans space-y-2">
                          <div className="flex items-center gap-3 text-brand-secondary">
                            <span className="w-14 text-[8px] uppercase tracking-widest opacity-40 font-bold">Activated</span>
                            <span className="text-brand-black font-medium">{format(new Date(user.membershipActivation), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-3 text-brand-secondary">
                            <span className="w-14 text-[8px] uppercase tracking-widest opacity-40 font-bold">Expires</span>
                            <span className={`${status === 'expired' ? 'text-amber-600' : 'text-brand-black'} font-medium`}>
                              {user.membershipExpiry ? format(new Date(user.membershipExpiry), 'MMM d, yyyy') : 'Indefinite'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[9px] text-brand-secondary uppercase tracking-widest opacity-30 font-bold italic">No active record</span>
                      )}
                    </td>
                    <td className="px-8 py-8">
                      <PrivilegeSummary user={user} />
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDetailsOpen(true);
                          }}
                          className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-black border border-brand-divider hover:bg-brand-black hover:text-white hover:border-brand-black transition-all duration-300 shadow-sm"
                        >
                          Manage
                        </button>
                        
                        <div className="relative group/menu">
                          <button className="p-2.5 text-brand-secondary hover:text-brand-black transition-colors rounded-full hover:bg-brand-bg">
                            <MoreVertical size={18} />
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-brand-divider shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 py-2">
                            <div className="px-4 py-2 border-b border-brand-divider mb-1">
                              <div className="text-[8px] uppercase tracking-widest text-brand-secondary font-bold">Quick Actions</div>
                            </div>
                            {user.isPrimeMember ? (
                              <button
                                onClick={() => handleTogglePrime(user)}
                                className="w-full text-left px-4 py-2.5 text-[11px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                              >
                                <UserMinus size={14} />
                                Deactivate Prime
                              </button>
                            ) : (
                              <button
                                onClick={() => handleTogglePrime(user)}
                                className="w-full text-left px-4 py-2.5 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 flex items-center gap-3 transition-colors"
                              >
                                <UserCheck size={14} />
                                Activate Prime
                              </button>
                            )}
                            {user.isPrimeMember && (
                              <>
                                <button
                                  onClick={() => handleExtendMembership(user)}
                                  className="w-full text-left px-4 py-2.5 text-[11px] font-medium text-brand-black hover:bg-brand-bg flex items-center gap-3 transition-colors"
                                >
                                  <Plus size={14} />
                                  Extend 30 Days
                                </button>
                                <button
                                  onClick={() => handleMarkExpired(user)}
                                  className="w-full text-left px-4 py-2.5 text-[11px] font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-3 transition-colors"
                                >
                                  <AlertCircle size={14} />
                                  Mark as Expired
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-brand-secondary">
                      <Users size={32} className="opacity-20" />
                      <p className="text-sm italic font-sans">No members found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Slide-over */}
      <AnimatePresence>
        {isDetailsOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-black/40 backdrop-blur-sm"
              onClick={() => setIsDetailsOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
            >
              {/* Slide-over Header */}
              <div className="p-8 border-b border-brand-divider flex items-center justify-between bg-brand-bg/30">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-brand-black text-white flex items-center justify-center text-xl font-medium tracking-tighter">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-display tracking-tight text-brand-black">{selectedUser.name}</h2>
                    <div className="mt-1">
                      <StatusBadge status={getMembershipStatus(selectedUser)} />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-2 hover:bg-white border border-transparent hover:border-brand-divider transition-all"
                >
                  <X size={24} />
                </button>
              </div>              {/* Slide-over Content */}
              <div className="flex-1 overflow-y-auto p-12 space-y-16">
                {/* Member Info */}
                <section className="space-y-8">
                  <div className="flex items-center justify-between border-b border-brand-divider pb-4">
                    <div className="flex flex-col">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Member Profile</h3>
                      <p className="text-[9px] text-brand-secondary/50 font-sans mt-0.5 italic">Core identification and contact details</p>
                    </div>
                    <Users size={14} className="text-brand-secondary opacity-30" />
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    <div className="flex items-start gap-6 group">
                      <div className="p-3 bg-brand-bg border border-brand-divider rounded-sm group-hover:border-brand-black transition-colors">
                        <Mail size={18} className="text-brand-secondary" />
                      </div>
                      <div>
                        <div className="text-[8px] uppercase tracking-widest text-brand-secondary font-bold mb-1.5">Primary Email</div>
                        <div className="text-base text-brand-black font-medium">{selectedUser.email}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-6 group">
                      <div className="p-3 bg-brand-bg border border-brand-divider rounded-sm group-hover:border-brand-black transition-colors">
                        <Phone size={18} className="text-brand-secondary" />
                      </div>
                      <div>
                        <div className="text-[8px] uppercase tracking-widest text-brand-secondary font-bold mb-1.5">Contact Number</div>
                        <div className="text-base text-brand-black font-medium">{selectedUser.phone || 'Not provided'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-6 group">
                      <div className="p-3 bg-brand-bg border border-brand-divider rounded-sm group-hover:border-brand-black transition-colors">
                        <Calendar size={18} className="text-brand-secondary" />
                      </div>
                      <div>
                        <div className="text-[8px] uppercase tracking-widest text-brand-secondary font-bold mb-1.5">Account Registration</div>
                        <div className="text-base text-brand-black font-medium">
                          {selectedUser.createdAt ? format(new Date(selectedUser.createdAt), 'MMMM d, yyyy') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Membership Status */}
                <section className="space-y-8">
                  <div className="flex items-center justify-between border-b border-brand-divider pb-4">
                    <div className="flex flex-col">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Membership Lifecycle</h3>
                      <p className="text-[9px] text-brand-secondary/50 font-sans mt-0.5 italic">Control activation and validity periods</p>
                    </div>
                    <Shield size={14} className="text-brand-secondary opacity-30" />
                  </div>
                  
                  <div className="bg-brand-bg p-8 border border-brand-divider space-y-10 shadow-sm">
                    {/* Status Indicator */}
                    <div className="flex items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="text-[8px] uppercase tracking-widest text-brand-secondary font-bold">Current Standing</div>
                        <StatusBadge status={getMembershipStatus(selectedUser)} />
                      </div>
                      <button
                        onClick={() => handleTogglePrime(selectedUser)}
                        className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border shadow-sm ${
                          selectedUser.isPrimeMember 
                            ? 'bg-white border-red-100 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600' 
                            : 'bg-brand-black border-brand-black text-white hover:bg-brand-black/90'
                        }`}
                      >
                        {selectedUser.isPrimeMember ? 'Deactivate Membership' : 'Activate Membership'}
                      </button>
                    </div>

                    {/* Manual Date Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-brand-divider/30">
                      <div className="space-y-3">
                        <label className="text-[8px] uppercase tracking-widest text-brand-secondary font-bold flex items-center gap-2.5">
                          <Calendar size={12} className="opacity-50" />
                          Activation Date
                        </label>
                        <input
                          type="date"
                          value={selectedUser.membershipActivation ? selectedUser.membershipActivation.split('T')[0] : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                            const updatedUser = { ...selectedUser, membershipActivation: date };
                            storage.updateUser(updatedUser);
                            loadUsers();
                            setSelectedUser(updatedUser);
                          }}
                          className="w-full bg-white border border-brand-divider px-4 py-3 text-sm font-sans outline-none focus:border-brand-black transition-all shadow-inner"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[8px] uppercase tracking-widest text-brand-secondary font-bold flex items-center gap-2.5">
                          <Clock size={12} className="opacity-50" />
                          Expiration Date
                        </label>
                        <input
                          type="date"
                          value={selectedUser.membershipExpiry ? selectedUser.membershipExpiry.split('T')[0] : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                            const updatedUser = { ...selectedUser, membershipExpiry: date };
                            storage.updateUser(updatedUser);
                            loadUsers();
                            setSelectedUser(updatedUser);
                          }}
                          className="w-full bg-white border border-brand-divider px-4 py-3 text-sm font-sans outline-none focus:border-brand-black transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {selectedUser.isPrimeMember && (
                      <div className="space-y-5 pt-6 border-t border-brand-divider/30">
                        <div className="text-[8px] uppercase tracking-widest text-brand-secondary font-bold">Renewal Adjustments</div>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { label: '+30 Days', days: 30 },
                            { label: '+90 Days', days: 90 },
                            { label: '+1 Year', days: 365 }
                          ].map((opt) => (
                            <button
                              key={opt.label}
                              onClick={() => {
                                if (!selectedUser.membershipExpiry) return;
                                const currentExpiry = new Date(selectedUser.membershipExpiry);
                                const newExpiry = new Date(currentExpiry.getTime() + opt.days * 24 * 60 * 60 * 1000);
                                const updatedUser = { ...selectedUser, membershipExpiry: newExpiry.toISOString() };
                                storage.updateUser(updatedUser);
                                loadUsers();
                                setSelectedUser(updatedUser);
                              }}
                              className="px-4 py-2 bg-white border border-brand-divider text-[9px] font-bold uppercase tracking-widest hover:bg-brand-black hover:text-white hover:border-brand-black transition-all duration-300 shadow-sm"
                            >
                              {opt.label}
                            </button>
                          ))}
                          <button
                            onClick={() => handleMarkExpired(selectedUser)}
                            className="px-4 py-2 bg-white border border-amber-100 text-[9px] font-bold uppercase tracking-widest text-amber-600 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all duration-300 shadow-sm"
                          >
                            Mark Expired
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Service Access */}
                <section className="space-y-8">
                  <div className="flex items-center justify-between border-b border-brand-divider pb-4">
                    <div className="flex flex-col">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Privilege Management</h3>
                      <p className="text-[9px] text-brand-secondary/50 font-sans mt-0.5 italic">Toggle individual member service access</p>
                    </div>
                    <Zap size={14} className="text-brand-secondary opacity-30" />
                  </div>
                  
                  {!selectedUser.isPrimeMember ? (
                    <div className="p-10 border border-dashed border-brand-divider text-center bg-brand-bg/20">
                      <p className="text-xs text-brand-secondary italic font-sans opacity-60">Membership must be active to manage privileges.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-end gap-6">
                        <button 
                          onClick={() => handleToggleAllPrivileges(selectedUser, true)}
                          className="text-[8px] font-bold uppercase tracking-widest text-brand-black hover:underline underline-offset-4 decoration-brand-divider"
                        >
                          Enable All
                        </button>
                        <button 
                          onClick={() => handleToggleAllPrivileges(selectedUser, false)}
                          className="text-[8px] font-bold uppercase tracking-widest text-brand-secondary hover:underline underline-offset-4 decoration-brand-divider"
                        >
                          Disable All
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { id: 'consultation', label: 'Style Consultation', description: 'Personalized wardrobe guidance and styling', icon: MessageSquare },
                          { id: 'bespoke', label: 'Bespoke Requests', description: 'Custom tailoring and unique design commissions', icon: Scissors },
                          { id: 'fabricLibrary', label: 'Fabric Library', description: 'Exclusive access to premium textile archives', icon: Library },
                          { id: 'prioritySupport', label: 'Priority Support', description: 'Dedicated concierge for all inquiries', icon: Zap }
                        ].map((priv) => {
                          const Icon = priv.icon;
                          const isActive = selectedUser.primePrivileges?.[priv.id as keyof NonNullable<User['primePrivileges']>];
                          return (
                            <div key={priv.id} className="flex items-center justify-between p-6 bg-white border border-brand-divider group hover:border-brand-black transition-all duration-300 shadow-sm">
                              <div className="flex items-center gap-5">
                                <div className={`p-3 rounded-sm transition-all duration-500 ${isActive ? 'bg-brand-black text-white shadow-md' : 'bg-brand-bg text-brand-secondary'}`}>
                                  <Icon size={18} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-brand-black tracking-tight">{priv.label}</span>
                                  <span className="text-[10px] text-brand-secondary font-sans opacity-70">{priv.description}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleTogglePrivilege(selectedUser, priv.id as any)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none shadow-inner ${
                                  isActive ? 'bg-brand-black' : 'bg-slate-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                                    isActive ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>

                {/* Internal Notes */}
                <section className="space-y-8">
                  <div className="flex items-center justify-between border-b border-brand-divider pb-4">
                    <div className="flex flex-col">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Administrative Notes</h3>
                      <p className="text-[9px] text-brand-secondary/50 font-sans mt-0.5 italic">Internal records for client preferences and history</p>
                    </div>
                    <AlertCircle size={14} className="text-brand-secondary opacity-30" />
                  </div>
                  <div className="relative group">
                    <textarea
                      value={selectedUser.notes || ''}
                      onChange={(e) => handleUpdateNotes(selectedUser, e.target.value)}
                      placeholder="Record bespoke preferences, sizing details, or special client requirements..."
                      className="w-full h-48 p-8 bg-brand-bg/30 border border-brand-divider group-hover:border-brand-black focus:bg-white focus:border-brand-black outline-none transition-all text-sm font-sans resize-none leading-relaxed shadow-inner"
                    />
                    <div className="absolute bottom-4 right-4 text-[8px] uppercase tracking-widest text-brand-secondary font-bold opacity-30 group-hover:opacity-100 transition-opacity">
                      Auto-saving
                    </div>
                  </div>
                </section>
              </div>

              {/* Slide-over Footer */}
              <div className="p-8 border-t border-brand-divider bg-brand-bg/30">
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-full py-4 bg-brand-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-brand-black/90 transition-all shadow-lg"
                >
                  Close Member Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
