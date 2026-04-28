import React, { useState, useEffect, useRef } from 'react';
import { Bell, Package, User } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, User as UserType } from '../../types';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Listen to recent orders
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5)), (snapshot) => {
      const newOrders = snapshot.docs.map(doc => {
        const data = doc.data() as Order;
        return {
          id: `order-${doc.id}`,
          type: 'order',
          title: 'New Order',
          message: `Order #${doc.id.split('-')[0]} placed by ${data.userName}`,
          time: new Date(data.createdAt),
          read: false,
          icon: Package,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      });
      
      setNotifications(prev => {
        const merged = [...newOrders, ...prev.filter(n => n.type !== 'order')];
        return merged.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);
      });
    });

    // Listen to recent users
    const unsubUsers = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5)), (snapshot) => {
      const newUsers = snapshot.docs.map(doc => {
        const data = doc.data() as UserType;
        return {
          id: `user-${doc.id}`,
          type: 'user',
          title: 'New User',
          message: `${data.name || data.email} joined`,
          time: new Date(data.createdAt || Date.now()),
          read: false,
          icon: User,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50'
        };
      });

      setNotifications(prev => {
        const merged = [...newUsers, ...prev.filter(n => n.type !== 'user')];
        return merged.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);
      });
    });

    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-brand-secondary hover:text-brand-black transition-colors rounded-full hover:bg-gray-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-brand-divider rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-brand-divider flex justify-between items-center bg-gray-50">
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-black">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] uppercase tracking-widest text-brand-secondary hover:text-brand-black font-bold"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-brand-divider">
                {notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <div 
                      key={notification.id} 
                      className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 ${!notification.read ? 'bg-blue-50/10' : ''}`}
                    >
                      <div className={`p-2 rounded-full shrink-0 h-fit ${notification.bgColor} ${notification.color}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-black">{notification.title}</p>
                        <p className="text-xs text-brand-secondary mt-0.5">{notification.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">
                          {formatDistanceToNow(notification.time, { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5 ml-auto"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-brand-secondary">
                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
