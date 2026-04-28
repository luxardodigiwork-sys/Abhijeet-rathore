import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface BackendSidebarProps {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  icon: LucideIcon;
}

export default function BackendSidebar({ title, subtitle, navItems, icon: Icon }: BackendSidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-brand-divider flex flex-col hidden md:flex">
      <div className="p-6 border-b border-brand-divider">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-brand-black text-white p-1.5 rounded-lg">
            <Icon size={18} />
          </div>
          <h1 className="font-display text-xl tracking-widest uppercase">{title}</h1>
        </div>
        <p className="text-[10px] text-brand-secondary uppercase tracking-[0.2em] font-bold">{subtitle}</p>
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
    </aside>
  );
}
