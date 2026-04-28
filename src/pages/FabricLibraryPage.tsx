import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/localStorage';

const FABRIC_CATEGORIES = [
  {
    name: 'Occasion Fabrics',
    fabrics: [
      { name: 'Midnight Velvet', desc: 'Deep, rich texture with a subtle sheen.', use: 'Bandhgalas, Evening Jackets' },
      { name: 'Royal Brocade', desc: 'Intricately woven patterns with metallic threads.', use: 'Sherwanis, Festive Wear' }
    ]
  },
  {
    name: 'Wedding Fabrics',
    fabrics: [
      { name: 'Ivory Raw Silk', desc: 'Classic, structured silk with a natural slub.', use: 'Wedding Sherwanis, Kurta Sets' },
      { name: 'Gold Zari Tissue', desc: 'Lightweight, shimmering fabric for a regal look.', use: 'Safa, Dupatta, Accents' }
    ]
  },
  {
    name: 'Festive Textures',
    fabrics: [
      { name: 'Emerald Jacquard', desc: 'Textured weave with a subtle geometric pattern.', use: 'Indo-Western, Waistcoats' },
      { name: 'Crimson Chanderi', desc: 'Sheer, lightweight fabric with a fine texture.', use: 'Light Kurta Sets' }
    ]
  },
  {
    name: 'Refined Neutrals',
    fabrics: [
      { name: 'Charcoal Worsted Wool', desc: 'Smooth, breathable wool for structured tailoring.', use: 'Suits, Trousers' },
      { name: 'Sand Linen Blend', desc: 'Relaxed yet refined, perfect for daytime events.', use: 'Summer Jackets, Kurtas' }
    ]
  },
  {
    name: 'Statement Weaves',
    fabrics: [
      { name: 'Sapphire Ikat', desc: 'Bold, hand-dyed patterns with a modern edge.', use: 'Statement Jackets' },
      { name: 'Onyx Herringbone', desc: 'Classic pattern with a contemporary dark finish.', use: 'Winter Bandhgalas' }
    ]
  }
];

export default function FabricLibraryPage() {
  const { user } = useAuth();
  const [content] = useState(storage.getPrimeContent());
  const [globalSettings, setGlobalSettings] = useState(storage.getPrimeGlobalSettings());

  useEffect(() => {
    setGlobalSettings(storage.getPrimeGlobalSettings());
  }, []);

  const isMember = user?.isPrimeMember;
  const isFabricLibraryEnabled = content.settings?.fabricLibraryEnabled && user?.primePrivileges?.fabricLibrary && globalSettings.isLive;

  if (!isMember || !isFabricLibraryEnabled) {
    return (
      <div className="section-padding max-w-4xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
        <SectionHeader title="Fabric Library" subtitle={!isMember ? "Exclusive Member Access" : "Service Unavailable"} />
        <div className="bg-brand-white p-12 border border-brand-divider space-y-8 max-w-2xl mx-auto w-full">
          <p className="text-xl font-sans text-brand-secondary leading-relaxed">
            {!isMember 
              ? 'The Fabric Library is reserved exclusively for our Prime Members.'
              : !globalSettings.isLive 
                ? globalSettings.offlineMessage 
                : 'The Fabric Library is currently unavailable for your account.'}
          </p>
          <div className="pt-4">
            {!isMember ? (
              <Link to="/prime-membership" className="btn-primary inline-block">
                JOIN PRIME MEMBERSHIP
              </Link>
            ) : (
              <Link to="/prime-membership" className="btn-primary inline-block">
                BACK TO PRIME MEMBER
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding max-w-[1400px] mx-auto min-h-[70vh]">
      <SectionHeader title="Fabric Library" subtitle="Selected fabric directions for our members." />
      
      <div className="space-y-24">
        {FABRIC_CATEGORIES.map((category, catIndex) => (
          <div key={category.name} className="space-y-12">
            <h3 className="text-3xl font-display border-b border-brand-divider pb-4">{category.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.fabrics.map((fabric, i) => (
                <motion.div 
                  key={fabric.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-brand-white p-8 border border-brand-divider space-y-4"
                >
                  <h4 className="text-2xl font-display">{fabric.name}</h4>
                  <p className="font-sans text-brand-secondary leading-relaxed">{fabric.desc}</p>
                  <div className="pt-4 border-t border-brand-divider">
                    <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-black block mb-2">Suggested Use</span>
                    <span className="font-sans text-brand-secondary text-sm">{fabric.use}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-24 text-center">
        <Link to="/prime-membership/style-consultation" className="btn-primary inline-block px-16">
          REQUEST FABRIC GUIDANCE
        </Link>
      </div>
    </div>
  );
}
