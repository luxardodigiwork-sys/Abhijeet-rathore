import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, LogOut, Wallet, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../admin/NotificationCenter';

export default function AnalysisLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/backend');
  };

  const navItems = [
    { path: '/analysis/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/accounts/dashboard', label: 'Accounts', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-divider flex flex-col hidden md:flex">
        <div className="p-6 border-b border-brand-divider">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-brand-black text-white p-1.5 rounded-lg">
              <BarChart3 size={18} />
            </div>
            <h1 className="font-display text-xl tracking-widest uppercase">Luxardo</h1>
          </div>
          <p className="text-[10px] text-brand-secondary uppercase tracking-[0.2em] font-bold">Analysis Portal</p>
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
          <h1 className="font-display text-xl tracking-widest uppercase">Luxardo Analysis</h1>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <button onClick={handleLogout} className="text-brand-secondary p-2">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-brand-divider p-4 justify-end items-center">
          <NotificationCenter />
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10">
          <Outlet />
        </div>

        {/* Footer Status */}
        <footer className="bg-white border-t border-brand-divider py-3 px-6 flex justify-between items-center text-[10px] text-brand-secondary uppercase tracking-widest font-bold">
          <div>Luxardo Analysis Portal v1.0</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> System Online</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
