import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Calendar, ArrowRight, ChevronLeft, CheckCircle2, Clock, Video, User } from 'lucide-react';
import { storage } from '../utils/localStorage';

export default function StyleConsultationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content] = useState(storage.getPrimeContent());
  const [globalSettings, setGlobalSettings] = useState(storage.getPrimeGlobalSettings());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setGlobalSettings(storage.getPrimeGlobalSettings());
  }, []);

  const isConsultationEnabled = content.settings?.consultationEnabled && user?.primePrivileges?.consultation && globalSettings.isLive;

  if (!user?.isPrimeMember || !isConsultationEnabled) {
    return (
      <div className="min-h-screen bg-brand-bg pt-32 pb-20 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-brand-white border border-brand-divider p-12 text-center space-y-8">
          <Calendar size={48} className="mx-auto text-brand-divider" />
          <h2 className="text-3xl font-display">
            {!user?.isPrimeMember ? 'Prime Access Only' : 'Service Unavailable'}
          </h2>
          <p className="font-sans text-brand-secondary leading-relaxed">
            {!user?.isPrimeMember 
              ? 'Style consultations are reserved exclusively for our Prime Members.'
              : !globalSettings.isLive 
                ? globalSettings.offlineMessage 
                : 'Style consultation service is currently unavailable for your account.'}
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-bg pt-32 pb-20 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full bg-brand-white border border-brand-divider p-12 md:p-20 text-center space-y-12">
          <div className="w-20 h-20 bg-brand-black text-brand-white rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-display">Consultation Requested</h2>
            <p className="font-sans text-brand-secondary text-lg leading-relaxed">
              Your request for a private style consultation has been received. Our concierge will reach out via WhatsApp or Email to confirm your preferred time slot.
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
            <h1 className="text-5xl md:text-7xl font-display tracking-tight">Style Consultation</h1>
            <p className="font-sans text-brand-secondary text-lg max-w-2xl leading-relaxed">
              Book a private session with our master stylists to curate your wardrobe and explore bespoke possibilities.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-black">Session Type</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'video', label: 'Video Consultation', icon: <Video size={18} />, desc: '30-minute virtual styling session.' },
                    { id: 'in-person', label: 'Atelier Visit', icon: <User size={18} />, desc: 'Private session at our Mumbai atelier.' }
                  ].map((type) => (
                    <label key={type.id} className="relative flex items-center gap-4 p-6 border border-brand-divider bg-brand-white cursor-pointer hover:border-brand-black transition-colors">
                      <input type="radio" name="consultation_type" className="sr-only" defaultChecked={type.id === 'video'} />
                      <div className="text-brand-black">{type.icon}</div>
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-widest font-bold">{type.label}</p>
                        <p className="text-xs font-sans text-brand-secondary">{type.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-black">Preferred Timing</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Preferred Date</label>
                    <input type="date" className="w-full bg-brand-white border border-brand-divider px-4 py-4 font-sans focus:outline-none focus:border-brand-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Time Slot</label>
                    <select className="w-full bg-brand-white border border-brand-divider px-4 py-4 font-sans focus:outline-none focus:border-brand-black appearance-none">
                      <option>Morning (10:00 - 12:00)</option>
                      <option>Afternoon (14:00 - 16:00)</option>
                      <option>Evening (17:00 - 19:00)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-black">Consultation Focus</h3>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">What would you like to discuss?</label>
                  <textarea 
                    rows={6}
                    className="w-full bg-brand-white border border-brand-divider p-4 font-sans focus:outline-none focus:border-brand-black resize-none"
                    placeholder="Wedding wardrobe planning, fabric selection, style advice..."
                  />
                </div>
              </div>

              <div className="bg-brand-white p-8 border border-brand-divider space-y-6">
                <div className="flex items-center gap-4 text-brand-black">
                  <Clock size={20} />
                  <h4 className="text-[11px] uppercase tracking-widest font-bold">Member Privilege</h4>
                </div>
                <p className="text-xs font-sans text-brand-secondary leading-relaxed">
                  As a Prime Member, your first three consultations per year are complimentary. Subsequent sessions may be subject to a nominal fee.
                </p>
              </div>

              <button type="submit" className="btn-primary w-full py-5 flex items-center justify-center gap-4">
                REQUEST CONSULTATION <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
