import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Crown, LogOut, Shield, BarChart3, Wallet, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function OwnerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/backend');
  };

  const navItems = [
    { path: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analysis/dashboard', label: 'Analysis', icon: BarChart3 },
    { path: '/accounts/dashboard', label: 'Accounts', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-divider flex flex-col hidden md:flex">
        <div className="p-6 border-b border-brand-divider">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-brand-black text-white p-1.5 rounded-lg">
              <Shield size={18} />
            </div>
            <h1 className="font-display text-xl tracking-widest uppercase">Luxardo</h1>
          </div>
          <p className="text-[10px] text-brand-secondary uppercase tracking-[0.2em] font-bold">Owner Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-lg ${
                  isActive 
                    ? 'bg-brand-black text-white' 
                    : 'text-brand-secondary hover:bg-brand-bg hover:text-brand-black'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-divider">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-brand-secondary hover:text-red-600 w-full text-left transition-colors rounded-lg"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-brand-divider p-4 flex justify-between items-center">
          <h1 className="font-display text-xl tracking-widest uppercase">Luxardo Owner</h1>
          <button onClick={handleLogout} className="text-brand-secondary">
            <LogOut size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10">
          <Outlet />
        </div>

        {/* Footer Status */}
        <footer className="bg-white border-t border-brand-divider py-3 px-6 flex justify-between items-center text-[10px] text-brand-secondary uppercase tracking-widest font-bold">
          <div>Luxardo Owner Portal v1.0</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> System Online</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
