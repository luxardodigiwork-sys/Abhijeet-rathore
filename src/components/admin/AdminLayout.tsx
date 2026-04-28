import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, FileText, Shield, LogOut, Layers, Crown, Image as ImageIcon, Send, Truck, Settings, Users, BarChart3, Wallet, Menu, X, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminAssistantChatbot from './AdminAssistantChatbot';
import { AnimatePresence, motion } from 'motion/react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navGroups = [
    {
      title: 'Store',
      items: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/collections', label: 'Collections', icon: Layers },
      ]
    },
    {
      title: 'Content',
      items: [
        { path: '/admin/media', label: 'Media', icon: ImageIcon },
        { path: '/admin/content', label: 'Site Content', icon: FileText },
        { path: '/admin/prime-content', label: 'Prime Content', icon: Crown },
        { path: '/admin/policies', label: 'Policies', icon: Shield },
      ]
    },
    {
      title: 'Customers',
      items: [
        { path: '/admin/prime-members', label: 'Prime Members', icon: Users },
        { path: '/admin/bespoke-requests', label: 'Bespoke Requests', icon: Send },
        { path: '/admin/partners', label: 'Partners', icon: Wallet },
        { path: '/admin/contact-messages', label: 'Contact Messages', icon: Mail },
      ]
    },
    {
      title: 'System',
      items: [
        { path: '/admin/backend-management', label: 'Staff & Roles', icon: Shield },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminAssistantChatbot />

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-divider flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-brand-divider flex justify-between items-center">
          <div>
            <h1 className="font-display text-2xl tracking-widest uppercase">Luxardo</h1>
            <p className="text-xs text-brand-secondary uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-2 px-4">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive 
                          ? 'bg-brand-black text-white' 
                          : 'text-brand-secondary hover:bg-brand-bg hover:text-brand-black'
                      }`}
                    >
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-divider">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-brand-secondary hover:text-brand-black w-full text-left transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-brand-black/60 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-white border-r border-brand-divider flex flex-col z-50 md:hidden shadow-2xl"
            >
              <div className="p-6 border-b border-brand-divider flex justify-between items-center">
                <div>
                  <h1 className="font-display text-2xl tracking-widest uppercase">Luxardo</h1>
                  <p className="text-xs text-brand-secondary uppercase tracking-widest mt-1">Admin Panel</p>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-brand-secondary hover:text-brand-black">
                  <X size={24} />
                </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                {navGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-2 px-4">{group.title}</h3>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              isActive 
                                ? 'bg-brand-black text-white' 
                                : 'text-brand-secondary hover:bg-brand-bg hover:text-brand-black'
                            }`}
                          >
                            <item.icon size={16} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="p-4 border-t border-brand-divider">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-brand-secondary hover:text-brand-black w-full text-left transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-brand-divider p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-brand-black">
              <Menu size={24} />
            </button>
            <h1 className="font-display text-xl tracking-widest uppercase">Luxardo Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="text-brand-secondary">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
