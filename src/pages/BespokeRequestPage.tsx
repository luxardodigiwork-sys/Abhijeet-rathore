import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Scissors, ArrowRight, ChevronLeft, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { storage } from '../utils/localStorage';

export default function BespokeRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content] = useState(storage.getPrimeContent());
  const [globalSettings, setGlobalSettings] = useState(storage.getPrimeGlobalSettings());
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    setGlobalSettings(storage.getPrimeGlobalSettings());
  }, []);

  const isBespokeEnabled = content.settings?.bespokeEnabled && user?.primePrivileges?.bespoke && globalSettings.isLive;
  const [formData, setFormData] = useState({
    garmentType: 'Sherwani',
    occasionDate: '',
    notes: '',
    referenceImage: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, referenceImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user?.isPrimeMember || !isBespokeEnabled) {
    return (
      <div className="min-h-screen bg-brand-bg pt-32 pb-20 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-brand-white border border-brand-divider p-12 text-center space-y-8">
          <Scissors size={48} className="mx-auto text-brand-divider" />
          <h2 className="text-3xl font-display">
            {!user?.isPrimeMember ? 'Prime Access Only' : 'Service Unavailable'}
          </h2>
          <p className="font-sans text-brand-secondary leading-relaxed">
            {!user?.isPrimeMember 
              ? 'Bespoke tailoring services are reserved exclusively for our Prime Members.'
              : !globalSettings.isLive 
                ? globalSettings.offlineMessage 
                : 'Bespoke request service is currently unavailable for your account.'}
          </p>
          {!user?.isPrimeMember ? (
            <Link to="/prime-membership" className="btn-primary w-full block">
              JOIN PRIME MEMBERSHIP
            </Link>
          ) : (
            <Link to="/prime-membership" className="btn-primary w-full block">
              BACK TO PRIME MEMBER
            </Link>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const requestData = {
        id: `BSK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        userId: user.id,
        userEmail: user.email,
        userName: user.name || 'Anonymous',
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      storage.addBespokeRequest(requestData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting bespoke request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-bg pt-32 pb-20 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full bg-brand-white border border-brand-divider p-12 md:p-20 text-center space-y-12">
          <div className="w-20 h-20 bg-brand-black text-brand-white rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-display">Request Received</h2>
            <p className="font-sans text-brand-secondary text-lg leading-relaxed">
              Your bespoke commission request has been submitted to our master tailors. A dedicated concierge will contact you within 24 hours to discuss the next steps.
            </p>
          </div>
          <button onClick={() => navigate('/account')} className="btn-primary px-12">
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/prime-membership" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-secondary hover:text-brand-black mb-12">
          <ChevronLeft size={14} /> Back to Prime Member
        </Link>

        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-display tracking-tight">Bespoke Request</h1>
            <p className="font-sans text-brand-secondary text-lg max-w-2xl leading-relaxed">
              Begin the journey of creating a one-of-a-kind garment, tailored to your exact vision and measurements.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-black">Garment Details</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Garment Type</label>
                    <select 
                      value={formData.garmentType}
                      onChange={(e) => setFormData({ ...formData, garmentType: e.target.value })}
                      className="w-full bg-brand-white border border-brand-divider px-4 py-4 font-sans focus:outline-none focus:border-brand-black appearance-none"
                    >
                      <option>Sherwani</option>
                      <option>Bandhgala</option>
                      <option>Kurta Set</option>
                      <option>Indo-Western</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Occasion Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.occasionDate}
                      onChange={(e) => setFormData({ ...formData, occasionDate: e.target.value })}
                      className="w-full bg-brand-white border border-brand-divider px-4 py-4 font-sans focus:outline-none focus:border-brand-black" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-black">Design Vision</h3>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Notes & Preferences</label>
                  <textarea 
                    rows={6}
                    required
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-brand-white border border-brand-divider p-4 font-sans focus:outline-none focus:border-brand-black resize-none"
                    placeholder="Describe your vision, preferred colors, or specific fabric interests..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-black">Inspiration</h3>
                <label className="border-2 border-dashed border-brand-divider p-12 text-center space-y-4 hover:border-brand-black transition-colors cursor-pointer block relative overflow-hidden">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,application/pdf" 
                    onChange={handleImageUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {formData.referenceImage ? (
                    <div className="space-y-4">
                      <img src={formData.referenceImage} alt="Reference" className="max-h-32 mx-auto object-contain" />
                      <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-600">Image Uploaded</p>
                      <p className="text-xs font-sans text-brand-secondary">Click to change</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-brand-divider" size={32} />
                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-widest font-bold">Upload Reference Images</p>
                        <p className="text-xs font-sans text-brand-secondary">PDF, JPG, PNG (Max 10MB)</p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              <div className="bg-brand-white p-8 border border-brand-divider space-y-6">
                <h4 className="text-[11px] uppercase tracking-widest font-bold">Next Steps</h4>
                <ul className="space-y-4 text-xs font-sans text-brand-secondary leading-relaxed">
                  <li className="flex gap-3"><span className="w-1.5 h-1.5 bg-brand-black rounded-full mt-1 shrink-0" /> Review by Master Tailor</li>
                  <li className="flex gap-3"><span className="w-1.5 h-1.5 bg-brand-black rounded-full mt-1 shrink-0" /> Design Consultation Call</li>
                  <li className="flex gap-3"><span className="w-1.5 h-1.5 bg-brand-black rounded-full mt-1 shrink-0" /> Fabric Selection & Quotation</li>
                </ul>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary w-full py-5 flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" size={18} /> SUBMITTING...</>
                ) : (
                  <>SUBMIT REQUEST <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
