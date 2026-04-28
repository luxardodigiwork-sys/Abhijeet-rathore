import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SectionHeader } from '../components/SectionHeader';
import { ArrowRight, Quote } from 'lucide-react';
import { storage } from '../utils/localStorage';

export default function OurStoryPage() {
  const siteContent = storage.getSiteContent();
  const [content, setContent] = useState(siteContent.ourStory);

  useEffect(() => {
    const updatedSiteContent = storage.getSiteContent();
    setContent(updatedSiteContent.ourStory);
  }, []);
  return (
    <div className="min-h-screen bg-brand-bg text-brand-black">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-brand-black">
        <div className="absolute inset-0 opacity-50">
          <img 
            src={content.hero.imageUrl} 
            alt="Luxardo Story" 
            className="w-full h-full object-cover "
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/40 via-transparent to-brand-black/80" />
        <div className="relative z-10 text-center space-y-12 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <img src="https://www.luxardofashion.in/Img/LOGOn.png" alt="Luxardo" className="h-16 md:h-24 invert brightness-0" />
          </motion.div>
          <div className="space-y-6">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[11px] uppercase tracking-[0.5em] font-bold text-brand-white/80"
            >
              {content.hero.subtitle}
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-9xl font-display text-brand-white tracking-tighter"
            >
              {content.hero.title}
            </motion.h1>
          </div>
        </div>
      </section>

      {/* The Problem (Feel) */}
      <section className="section-padding max-w-5xl mx-auto space-y-16">
        <div className="space-y-8 text-center">
          <p className="text-[11px] uppercase tracking-widest font-bold text-brand-secondary">The Observation</p>
          <h2 className="text-4xl md:text-6xl font-display leading-tight tracking-tight">
            {content.observation.heading}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center pt-12">
          <div className="space-y-8">
            <p className="text-xl font-sans text-brand-secondary leading-relaxed">
              {content.observation.content1}
            </p>
            <p className="text-xl font-sans text-brand-secondary leading-relaxed">
              {content.observation.content2}
            </p>
          </div>
          <div className="aspect-square bg-brand-white border border-brand-divider overflow-hidden">
            <img 
              src={content.observation.imageUrl} 
              alt="The Problem" 
              className="w-full h-full object-cover "
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* The Gap (Felt) */}
      <section className="section-padding bg-brand-white border-y border-brand-divider">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="aspect-[4/5] overflow-hidden lg:order-last">
            <img 
              src={content.gap.imageUrl} 
              alt="The Gap" 
              className="w-full h-full object-cover "
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-12">
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-widest font-bold text-brand-secondary">{content.gap.label}</p>
              <h2 className="text-4xl md:text-6xl font-display tracking-tight">{content.gap.heading}</h2>
            </div>
            <div className="space-y-8">
              <p className="text-xl font-sans text-brand-secondary leading-relaxed">
                {content.gap.content1}
              </p>
              <p className="text-xl font-sans text-brand-secondary leading-relaxed">
                {content.gap.content2}
              </p>
            </div>
            <div className="p-8 bg-brand-bg border-l-4 border-brand-black italic font-display text-2xl text-brand-secondary">
              "{content.gap.quote}"
            </div>
          </div>
        </div>
      </section>

      {/* The Solution (Found) */}
      <section className="section-padding max-w-[1400px] mx-auto space-y-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest font-bold text-brand-secondary">{content.discovery.label}</p>
          <h2 className="text-4xl md:text-7xl font-display tracking-tight">{content.discovery.heading}</h2>
          <p className="text-xl font-sans text-brand-secondary leading-relaxed">
            {content.discovery.text}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {content.discovery.points.map((item: any, i: number) => (
            <div key={i} className="space-y-6 p-12 border border-brand-divider bg-brand-white text-center">
              <h3 className="text-2xl font-display">{item.title}</h3>
              <p className="text-sm font-sans text-brand-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Narrative Summary */}
      <section className="section-padding bg-brand-black text-brand-white">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <Quote size={48} className="mx-auto opacity-20" />
          <h2 className="text-3xl md:text-5xl font-display leading-tight">
            {content.narrative.heading}
          </h2>
          <div className="w-24 h-px bg-brand-white/20 mx-auto" />
          <p className="text-xl font-sans text-brand-white/60 leading-relaxed">
            {content.narrative.text}
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding text-center space-y-16">
        <div className="space-y-4">
          <h2 className="text-4xl font-display">Join the Maison</h2>
          <p className="font-sans text-brand-secondary text-lg">Experience the difference of disciplined luxury.</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-8">
          <Link to="/collections" className="btn-primary px-16 py-6 flex items-center justify-center gap-4">
            EXPLORE COLLECTIONS <ArrowRight size={18} />
          </Link>
          <Link to="/prime-membership" className="btn-outline px-16 py-6 flex items-center justify-center gap-4">
            REQUEST MEMBERSHIP
          </Link>
        </div>
      </section>
    </div>
  );
}
