import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { SectionHeader } from '../components/SectionHeader';
import { Crown, Scissors, BookOpen, Star, ArrowRight, Clock, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/localStorage';

export default function PrimeDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState(storage.getPrimeContent());

  useEffect(() => {
    // If not a prime member, redirect to prime membership page
    if (user && !user.isPrimeMember) {
      navigate('/prime-membership');
    }
  }, [user, navigate]);

  if (!user || !user.isPrimeMember) {
    return null; // Or a loading state
  }

  const services = [
    {
      title: 'Bespoke Request',
      description: 'Commission a custom-crafted garment tailored to your exact measurements.',
      icon: Scissors,
      link: '/prime-membership/bespoke-request',
      enabled: content.settings?.bespokeEnabled
    },
    {
      title: 'Style Consultation',
      description: 'Book a one-on-one session with our expert stylists.',
      icon: Calendar,
      link: '/prime-membership/style-consultation',
      enabled: content.settings?.consultationEnabled
    },
    {
      title: 'Fabric Library',
      description: 'Explore our private vault of rare, imported fabrics.',
      icon: BookOpen,
      link: '/prime-membership/fabric-library',
      enabled: content.settings?.fabricLibraryEnabled
    }
  ];

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-black text-brand-white p-8 md:p-12 mb-12 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="text-brand-white" size={24} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Prime Member</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display mb-4">
              Welcome back, {user.name || 'Member'}
            </h1>
            <p className="text-brand-white/80 font-sans max-w-2xl text-lg">
              {content.welcomeText || 'Your exclusive atelier services are ready for your next commission.'}
            </p>
          </div>
          
          {/* Decorative background element */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-brand-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        </motion.div>

        {/* Services Grid */}
        <div className="mb-16">
          <SectionHeader title="Your Services" subtitle="Exclusive Access" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border border-brand-divider p-8 flex flex-col h-full ${
                  service.enabled ? 'bg-brand-white hover:border-brand-black transition-colors group' : 'bg-brand-bg opacity-70'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center mb-6 text-brand-black">
                  <service.icon size={24} />
                </div>
                <h3 className="text-xl font-display mb-3">{service.title}</h3>
                <p className="font-sans text-brand-secondary mb-8 flex-grow">
                  {service.description}
                </p>
                
                {service.enabled ? (
                  <Link 
                    to={service.link}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-black group-hover:gap-4 transition-all"
                  >
                    ACCESS SERVICE <ArrowRight size={14} />
                  </Link>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">
                    Currently Unavailable
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Membership Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 border border-brand-divider p-8 bg-brand-white">
            <h3 className="text-xl font-display mb-6 pb-4 border-b border-brand-divider">Recent Activity</h3>
            <div className="text-center py-12 text-brand-secondary font-sans">
              <Clock size={32} className="mx-auto mb-4 opacity-50" />
              <p>No recent bespoke requests or consultations.</p>
            </div>
          </div>
          
          <div className="border border-brand-divider p-8 bg-brand-bg">
            <h3 className="text-xl font-display mb-6 pb-4 border-b border-brand-divider">Membership Status</h3>
            <div className="space-y-4 font-sans">
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Status</span>
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <Star size={16} /> Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Member Since</span>
                <span className="text-brand-black font-medium">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Tier</span>
                <span className="text-brand-black font-medium">Prime</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-brand-divider">
              <p className="text-xs text-brand-secondary leading-relaxed">
                {content.supportingNote}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
