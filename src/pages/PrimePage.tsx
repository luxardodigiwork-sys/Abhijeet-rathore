import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { storage } from '../utils/localStorage';
import { Check, X, Shield, Star, Clock, Crown, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function PrimePage() {
  const { user } = useAuth();
  const location = useLocation();
  const [content, setContent] = useState(storage.getPrimeContent());
  const [globalSettings, setGlobalSettings] = useState(storage.getPrimeGlobalSettings());
  const [selectedBenefit, setSelectedBenefit] = useState<any>(null);

  useEffect(() => {
    setContent(storage.getPrimeContent());
    setGlobalSettings(storage.getPrimeGlobalSettings());
  }, []);

  if (!globalSettings.isLive) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <h1 className="text-3xl md:text-5xl font-display tracking-[0.2em] uppercase text-brand-black">
          Coming Soon
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* 1. Hero Section */}
      <section className="section-padding bg-brand-black text-brand-white text-center relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30 bg-cover bg-center" 
          style={{ backgroundImage: `url('${content.hero.imageUrl}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-transparent" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-12 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-display tracking-wide mb-6">{content.hero.heading}</h1>
            <p className="text-xl md:text-2xl font-sans text-brand-white/80 max-w-2xl mx-auto leading-relaxed">
              {content.hero.subheading}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="text-3xl font-display mb-8">
              {formatCurrency(content.hero.price)} <span className="text-lg font-sans text-brand-white/60">/ year</span>
            </div>
            
            {user?.isPrimeMember ? (
              <Link to="/prime-dashboard" className="inline-block px-12 py-5 bg-brand-white text-brand-black text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-brand-bg transition-colors">
                GO TO PRIME DASHBOARD
              </Link>
            ) : content.settings?.salesEnabled ? (
              user ? (
                <Link to="/prime-membership/checkout" className="btn-secondary inline-block px-12 py-5">
                  {content.hero.ctaLabel}
                </Link>
              ) : (
                <Link to="/login" state={{ from: location }} className="btn-secondary inline-block px-12 py-5">
                  LOGIN TO JOIN PRIME
                </Link>
              )
            ) : (
              <div className="inline-block px-12 py-5 bg-brand-white/10 border border-brand-white/20 text-brand-white text-[11px] uppercase tracking-[0.25em] font-bold">
                Prime Member access is currently unavailable.
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 2. ClarityStrip */}
      <section className="bg-brand-white border-b border-brand-divider py-8">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-brand-divider">
            <div className="space-y-2">
              <Crown className="w-6 h-6 mx-auto text-brand-black" />
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-black">Annual Membership</h4>
            </div>
            <div className="space-y-2">
              <Shield className="w-6 h-6 mx-auto text-brand-black" />
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-black">Exclusive Access</h4>
            </div>
            <div className="space-y-2">
              <Star className="w-6 h-6 mx-auto text-brand-black" />
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-black">Bespoke Tailoring</h4>
            </div>
            <div className="space-y-2">
              <Clock className="w-6 h-6 mx-auto text-brand-black" />
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-black">Priority Support</h4>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BenefitsGrid */}
      <section className="section-padding max-w-[1400px] mx-auto">
        <SectionHeader title="Membership Benefits" subtitle="Exclusive Privileges" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {content.benefits.map((benefit: any, i: number) => (
            <motion.div 
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              onClick={() => setSelectedBenefit(benefit)}
              className="bg-brand-white p-8 md:p-10 border border-brand-divider space-y-6 hover:border-brand-black transition-colors cursor-pointer group relative"
            >
              <div className="w-12 h-12 rounded-full bg-brand-black flex items-center justify-center text-brand-white font-display text-xl">
                0{i + 1}
              </div>
              <h3 className="text-xl md:text-2xl font-display pr-8">{benefit.title}</h3>
              <p className="font-sans text-brand-secondary leading-relaxed">{benefit.desc}</p>
              
              <div className="absolute top-10 right-8 opacity-0 group-hover:opacity-100 transition-opacity text-brand-black">
                <ChevronRight size={24} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefit Details Modal */}
      <AnimatePresence>
        {selectedBenefit && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBenefit(null)}
              className="fixed inset-0 bg-brand-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-brand-white z-50 p-8 md:p-12 border border-brand-divider shadow-2xl"
            >
              <button 
                onClick={() => setSelectedBenefit(null)}
                className="absolute top-6 right-6 text-brand-secondary hover:text-brand-black transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-full bg-brand-black flex items-center justify-center text-brand-white font-display text-xl mb-8">
                  <Star size={20} />
                </div>
                <h3 className="text-3xl md:text-4xl font-display">{selectedBenefit.title}</h3>
                <p className="text-xl font-sans text-brand-secondary leading-relaxed border-b border-brand-divider pb-6">
                  {selectedBenefit.desc}
                </p>
                <div className="pt-2">
                  <p className="font-sans text-brand-black leading-loose">
                    {selectedBenefit.details || 'More details about this benefit will be available soon.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Comparison */}
      <section className="section-padding bg-brand-white border-y border-brand-divider">
        <div className="max-w-4xl mx-auto">
          <SectionHeader title="The Luxardo Standard" subtitle="Compare Membership Tiers" />
          
          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-6 border-b border-brand-divider w-1/2"></th>
                  <th className="p-6 border-b border-brand-divider text-center">
                    <span className="text-[11px] uppercase tracking-widest font-bold text-brand-secondary">Standard</span>
                  </th>
                  <th className="p-6 border-b border-brand-divider text-center bg-brand-bg">
                    <span className="text-[11px] uppercase tracking-widest font-bold text-brand-black">Prime Member</span>
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans text-sm">
                {[
                  { feature: 'Access to Ready-to-Stitch Collections', standard: true, prime: true },
                  { feature: 'Standard Customer Support', standard: true, prime: true },
                  { feature: 'Personal Style Consultation', standard: false, prime: true },
                  { feature: 'Bespoke Tailoring Requests', standard: false, prime: true },
                  { feature: 'Exclusive Fabric Library Access', standard: false, prime: true },
                  { feature: 'Priority Production Queue', standard: false, prime: true },
                  { feature: 'Dedicated Concierge', standard: false, prime: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-brand-divider last:border-0">
                    <td className="p-6 text-brand-black font-medium">{row.feature}</td>
                    <td className="p-6 text-center text-brand-secondary">
                      {row.standard ? <Check className="w-5 h-5 mx-auto" /> : <X className="w-5 h-5 mx-auto opacity-30" />}
                    </td>
                    <td className="p-6 text-center bg-brand-bg text-brand-black">
                      {row.prime ? <Check className="w-5 h-5 mx-auto" /> : <X className="w-5 h-5 mx-auto opacity-30" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. HowItWorks */}
      <section className="section-padding max-w-[1400px] mx-auto">
        <SectionHeader title="How It Works" subtitle="Your Journey to Bespoke Elegance" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
          {[
            { step: '01', title: 'Join Prime', desc: 'Secure your annual membership to unlock exclusive privileges.' },
            { step: '02', title: 'Consultation', desc: 'Meet with our master stylists to define your unique aesthetic.' },
            { step: '03', title: 'Commission', desc: 'Select from our private fabric library and request bespoke tailoring.' },
            { step: '04', title: 'Creation', desc: 'Our artisans craft your masterpiece with priority production.' }
          ].map((item, i) => (
            <div key={i} className="relative space-y-6 text-center md:text-left">
              <div className="text-6xl font-display text-brand-divider">{item.step}</div>
              <h3 className="text-xl font-display">{item.title}</h3>
              <p className="font-sans text-brand-secondary text-sm leading-relaxed">{item.desc}</p>
              {i < 3 && (
                <div className="hidden md:block absolute top-8 right-0 w-full h-[1px] bg-brand-divider -z-10 translate-x-1/2" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Trust */}
      <section className="py-24 bg-brand-black text-brand-white text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <Star className="w-12 h-12 mx-auto text-brand-white/50" />
          <blockquote className="text-2xl md:text-4xl font-display leading-snug">
            "Luxardo Prime is not just a membership; it is an initiation into a world where craftsmanship and personal expression converge flawlessly."
          </blockquote>
          <div className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-white/60">
            — The Luxardo Standard
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="section-padding text-center bg-brand-bg">
        <div className="max-w-2xl mx-auto space-y-12 px-6">
          <h2 className="text-4xl font-display">Begin Your Journey</h2>
          <p className="font-sans text-brand-secondary leading-relaxed">
            Step into the inner circle of LUXARDO. Experience the pinnacle of modern ethnic luxury through our Prime Member Services.
          </p>
          <div className="pt-8">
            {user?.isPrimeMember ? (
              <Link to="/prime-dashboard" className="btn-outline inline-block px-16 py-5">
                GO TO PRIME DASHBOARD
              </Link>
            ) : content.settings?.salesEnabled ? (
              user ? (
                <Link to="/prime-membership/checkout" className="btn-primary inline-block px-16 py-5">
                  {content.hero.ctaLabel}
                </Link>
              ) : (
                <Link to="/login" state={{ from: location }} className="btn-primary inline-block px-16 py-5">
                  LOGIN TO JOIN PRIME
                </Link>
              )
            ) : (
              <div className="inline-block px-16 py-5 bg-brand-white border border-brand-divider text-brand-secondary text-[11px] uppercase tracking-[0.25em] font-bold">
                Currently Unavailable
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
