import React, { useState, useEffect } from 'react';
import { storage } from '../../utils/localStorage';
import { Search, Mail, Calendar, User } from 'lucide-react';

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = () => {
      // Simulate network request
      setTimeout(() => {
        const data = storage.getContactMessages();
        setMessages(data);
        setIsLoading(false);
      }, 500);
    };

    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(msg => 
    (msg.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (msg.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (msg.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (msg.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id: number, newStatus: string) => {
    const updatedMessages = messages.map(msg => 
      msg.id === id ? { ...msg, status: newStatus } : msg
    );
    storage.saveContactMessages(updatedMessages);
    setMessages(updatedMessages);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display uppercase tracking-tight">Contact Messages</h1>
        <p className="text-brand-secondary font-sans mt-1">Manage customer inquiries and support requests</p>
      </div>

      <div className="bg-white border border-brand-divider shadow-sm">
        <div className="p-6 border-b border-brand-divider">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
            <input
              type="text"
              placeholder="Search by name, email or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-bg border border-brand-divider pl-12 pr-4 py-3 font-sans focus:outline-none focus:border-brand-black transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg border-b border-brand-divider">
                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Customer</th>
                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Subject</th>
                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Message</th>
                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Date</th>
                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-brand-divider border-t-brand-black rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center font-sans text-brand-secondary">
                    No contact messages found.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-6">
                      <div>
                        <p className="font-medium text-brand-black">{msg.firstName} {msg.lastName}</p>
                        <p className="text-xs font-sans text-brand-secondary">{msg.email}</p>
                        <p className="text-xs font-sans text-brand-secondary mt-1">{msg.phone}</p>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-brand-secondary" />
                        <span className="font-sans text-sm capitalize">{msg.subject}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-sans text-brand-secondary max-w-xs truncate" title={msg.message}>
                        {msg.message}
                      </p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-brand-secondary text-sm">
                        <Calendar size={14} />
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-6">
                      <select
                        value={msg.status || 'pending'}
                        onChange={(e) => handleStatusChange(msg.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-none focus:ring-1 focus:ring-brand-black cursor-pointer ${
                          msg.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                          msg.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          msg.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
