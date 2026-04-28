import React, { useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { SectionHeader } from '../components/SectionHeader';
import { COLLECTIONS } from '../constants';
import { storage } from '../utils/localStorage';
import { ProductCard } from '../components/ProductCard';
import { Country } from '../types';
import { motion } from 'motion/react';
import { SlidersHorizontal } from 'lucide-react';

export default function CollectionDetailPage() {
  const { category } = useParams<{ category: string }>();
  const { selectedCountry } = useOutletContext<{ selectedCountry: Country | null }>();
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'recommended'>('featured');

  const collection = COLLECTIONS.find(c => c.id === category);
  const products = storage.getProducts();
  
  let filteredProducts = products.filter(p => p.category === collection?.fullName);

  // Sorting logic for luxury curation
  if (sortBy === 'newest') {
    // In a real app, this would use a date field. For now, we reverse the array to simulate newest first.
    filteredProducts = [...filteredProducts].reverse();
  } else if (sortBy === 'recommended') {
    // Simulated recommendation logic (e.g., by ID or some other stable factor)
    filteredProducts = [...filteredProducts].sort((a, b) => a.id.localeCompare(b.id));
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Category Banner */}
      <section className="relative h-[50vh] overflow-hidden bg-brand-black">
        <img 
          src={collection?.image || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2000&auto=format&fit=crop"} 
          alt={collection?.fullName} 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/40 via-brand-black/20 to-brand-black/80 z-10 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center text-brand-white text-center px-6 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <p className="text-[13px] uppercase tracking-[0.4em] font-bold mb-6 opacity-70">Collection</p>
            <h1 className="text-6xl md:text-8xl font-display tracking-wide mb-8">{collection?.fullName}</h1>
            <p className="text-xl md:text-2xl font-display italic opacity-90 max-w-2xl mx-auto leading-relaxed">
              {collection?.descriptor}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="section-padding">
        <div className="max-w-[1800px] mx-auto">
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 border-b border-brand-divider pb-8 gap-6">
            <div className="flex items-center gap-4 text-brand-secondary">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Filter & Sort</span>
            </div>
            
            <div className="flex gap-8">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-sans text-[11px] uppercase tracking-[0.1em] border-none focus:ring-0 cursor-pointer text-brand-secondary hover:text-brand-black transition-colors"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="recommended">Recommended</option>
              </select>
            </div>
          </div>

          <div className="w-full">
            {/* Product Grid */}
            <div>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                    />
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center">
                  <p className="text-xl font-display text-brand-secondary italic">No pieces found in this collection.</p>
                  <button className="mt-8 btn-outline" onClick={() => window.history.back()}>Go Back</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
