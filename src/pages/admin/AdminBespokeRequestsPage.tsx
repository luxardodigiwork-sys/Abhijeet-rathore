import React, { useState, useEffect } from 'react';
import { storage } from '../../utils/localStorage';
import { Search, Scissors, Calendar, Mail, User } from 'lucide-react';

export default function AdminBespokeRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = () => {
      const data = storage.getBespokeRequests();
      setRequests(data);
      setIsLoading(false);
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => 
    req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.garmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id: string, newStatus: string) => {
    const updatedRequests = requests.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    );
    storage.saveBespokeRequests(updatedRequests);
    setRequests(updatedRequests);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display uppercase tracking-tight">Bespoke Requests</h1>
        <p className="text-brand-secondary font-sans mt-1">Manage custom tailoring commissions</p>
      </div>

      <div className="bg-white border border-brand-divider shadow-sm">
        <div className="p-6 border-b border-brand-divider">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
            <input
              type="text"
              placeholder="Search by ID, name, email or garment..."
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
                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Request ID</th>
                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Customer</th>
                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Garment</th>
                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Reference</th>
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
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center font-sans text-brand-secondary">
                    No bespoke requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-6 font-mono text-sm">{req.id}</td>
                    <td className="p-6">
                      <div>
                        <p className="font-medium text-brand-black">{req.userName}</p>
                        <p className="text-xs font-sans text-brand-secondary">{req.userEmail}</p>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Scissors size={14} className="text-brand-secondary" />
                        <span className="font-sans text-sm">{req.garmentType}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      {req.referenceImage ? (
                        <a href={req.referenceImage} target="_blank" rel="noopener noreferrer" className="block w-12 h-12 border border-brand-divider overflow-hidden hover:border-brand-black transition-colors">
                          <img src={req.referenceImage} alt="Reference" className="w-full h-full object-cover" />
                        </a>
                      ) : (
                        <span className="text-xs text-brand-secondary italic">None</span>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-brand-secondary text-sm">
                        <Calendar size={14} />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-6">
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-none focus:ring-1 focus:ring-brand-black cursor-pointer ${
                          req.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
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
