import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { storage } from '../utils/localStorage';

export default function CraftsmanshipPage() {
  const { scrollY } = useScroll();
  const [content, setContent] = useState(storage.getSiteContent().craftsmanship);

  useEffect(() => {
    setContent(storage.getSiteContent().craftsmanship);
  }, []);

  // Desktop Parallax for Visual Depth Section
  const depthY1 = useTransform(scrollY, [0, 1500], [0, 150]);
  const depthY2 = useTransform(scrollY, [0, 1500], [0, 50]);

  // 3D Hover Effect for Desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-brand-black selection:bg-brand-black selection:text-brand-white">
      
      {/* 1. HERO SECTION (FEEL-FELT-FOUND) */}
      <section className="relative min-h-screen w-full flex flex-col md:flex-row items-center bg-brand-white border-b border-brand-black/10 pt-24 md:pt-0">
        
        {/* Left: Text Content */}
        <div className="w-full md:w-1/2 px-6 md:px-16 lg:px-24 flex flex-col justify-center z-10 py-12 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="w-8 h-[1px] bg-brand-black"></span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-black">The Luxardo Standard</span>
            </div>
            
            <div className="space-y-8 md:space-y-12">
              <p className="text-xl md:text-3xl font-display leading-tight text-brand-black">
                {content.hero?.feel}
              </p>
              <p className="text-lg md:text-2xl font-display leading-tight text-brand-secondary/60 italic font-light">
                {content.hero?.felt}
              </p>
              <p className="text-lg md:text-2xl font-display leading-tight text-brand-black font-medium">
                {content.hero?.found}
              </p>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link 
                to="/collections" 
                className="px-8 py-4 bg-brand-black text-brand-white text-[10px] uppercase tracking-[0.3em] font-bold text-center hover:bg-brand-black/90 transition-colors"
              >
                {content.cta?.primary || "Explore Collection"}
              </Link>
              <Link 
                to="/prime-membership" 
                className="px-8 py-4 border border-brand-black/20 text-brand-black text-[10px] uppercase tracking-[0.3em] font-bold text-center hover:border-brand-black transition-colors"
              >
                {content.cta?.secondary || "Join Prime"}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right: Premium Visual */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden">
          <motion.img 
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={content.hero?.image} 
            alt="Craftsmanship" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* 2. VISUAL DEPTH SECTION */}
      <section className="relative h-[60vh] md:h-[90vh] w-full overflow-hidden bg-brand-black">
        {/* Mobile: Static Optimized Image */}
        <div className="md:hidden absolute inset-0">
          <img 
            src={content.visualDepth?.mobileImage} 
            alt="Crafting Detail" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Desktop: Layered Parallax */}
        <div className="hidden md:block absolute inset-0">
          <motion.div style={{ y: depthY1 }} className="absolute inset-0 z-0">
            <img src={content.visualDepth?.layer1} alt="Fabric Layer" className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
          </motion.div>
          <motion.div style={{ y: depthY2 }} className="absolute inset-0 z-10 mix-blend-overlay">
            <img src={content.visualDepth?.layer2} alt="Detail Layer" className="w-full h-full object-cover opacity-50 grayscale" referrerPolicy="no-referrer" />
          </motion.div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-brand-black z-20" />
      </section>

      {/* 3. PROCESS SECTION (4 STEPS) */}
      <section className="py-20 md:py-40 bg-brand-white px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {content.process?.map((step: any, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group flex flex-col"
              >
                <div 
                  className="aspect-[3/4] overflow-hidden mb-6 bg-brand-black/5 transition-all duration-500 ease-out"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-sm md:text-base font-display tracking-widest uppercase text-brand-black mb-3">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm font-sans text-brand-secondary/80 font-light leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DIFFERENTIATION SECTION */}
      <section className="py-24 md:py-48 bg-[#F5F5F5] px-6 text-center border-y border-brand-black/5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-6xl lg:text-7xl font-display tracking-tight leading-[1.1] text-brand-black mb-6 md:mb-10">
            {content.differentiation?.title}
          </h2>
          <p className="text-sm md:text-xl font-sans text-brand-secondary/80 font-light leading-relaxed max-w-2xl mx-auto">
            {content.differentiation?.description}
          </p>
        </motion.div>
      </section>

      {/* 5. PRIME / LIMITED EDITION SECTION */}
      <section className="py-24 md:py-40 bg-brand-black text-brand-white px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-8 h-[1px] bg-brand-white/50"></span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-white/80">Exclusive Access</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display tracking-tight mb-8">
              {content.prime?.title}
            </h2>
            <p className="text-sm md:text-lg font-sans text-brand-white/70 font-light leading-relaxed max-w-md">
              {content.prime?.description}
            </p>
          </div>
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <Link 
              to="/prime-membership" 
              className="group flex items-center justify-center w-40 h-40 md:w-56 md:h-56 rounded-full border border-brand-white/20 hover:border-brand-white transition-colors duration-500"
            >
              <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-center px-4 group-hover:scale-105 transition-transform">
                Unlock<br/>Prime
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. IDENTITY STATEMENT & 7. FINAL CTA */}
      <section className="py-32 md:py-48 bg-brand-white text-center px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          <h2 className="text-2xl md:text-5xl lg:text-6xl font-display tracking-tight text-brand-black leading-tight">
            "{content.identity}"
          </h2>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/collections" 
              className="group relative px-8 py-4 bg-brand-black text-brand-white overflow-hidden flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-brand-secondary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
              <span className="relative flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold">
                {content.cta?.primary} <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              to="/prime-membership" 
              className="px-8 py-4 border border-brand-black/20 hover:border-brand-black transition-colors duration-500 flex items-center justify-center"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-black">
                {content.cta?.secondary}
              </span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

