import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { COLLECTIONS } from '../constants';
import { Search, X } from 'lucide-react';
import { storage } from '../utils/localStorage';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function CollectionsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState<'All' | 'Newly' | 'Regular' | 'Limited Edition'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const collections = COLLECTIONS.map(col => ({
    id: col.id,
    title: col.fullName,
    path: `/collections/${col.id}`,
    img: col.image,
    descriptor: col.descriptor
  }));

  const allProducts = storage.getProducts();

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Filter by Condition (Mock logic mapping for newly, regular, limited edition based on IDs or Price)
    if (conditionFilter === 'Newly') {
      // Simulate "Newly" by dropping some older products (e.g. reverse and take first half)
      result = [...result].reverse().slice(0, Math.ceil(result.length * 0.7));
    } else if (conditionFilter === 'Limited Edition') {
      // Simulate "Limited Edition" based on price > 150000 or specific names
      result = result.filter(p => (p.price && p.price > 150000) || p.name.toLowerCase().includes('limited'));
    } else if (conditionFilter === 'Regular') {
      // Simulate "Regular" by taking items that aren't overly expensive
      result = result.filter(p => !p.name.toLowerCase().includes('limited') && (!p.price || p.price <= 150000));
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Prime member restrictions
    if (!user?.isPrimeMember) {
      result = result.filter(p => p.readyToStitch);
    }

    return result;
  }, [allProducts, searchQuery, conditionFilter, user, selectedCategory]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(allProducts.map(p => p.category)));
    return cats;
  }, [allProducts]);

  return (
    <div className="min-h-screen bg-brand-bg pb-32">
      {/* Editorial Hero Section */}
      <div className="pt-24 pb-12 md:pt-32 md:pb-16 px-4 md:px-12 max-w-[1800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2 md:space-y-4"
        >
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold text-brand-secondary">
            The Archive
          </span>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-display tracking-tight text-brand-black">
            COLLECTIONS
          </h1>
        </motion.div>
      </div>

      {/* Sticky Controls Bar */}
      <div className="sticky top-[73px] z-40 bg-white/60 backdrop-blur-2xl backdrop-saturate-[1.5] border-b border-gray-200 py-3 px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[11px] font-sans uppercase tracking-widest text-black">
          
          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide py-1">
            {['All', 'Newly', 'Regular', 'Limited Edition'].map(condition => (
              <button
                key={condition}
                onClick={() => setConditionFilter(condition as any)}
                className={`flex-shrink-0 !py-2 !px-6 ${
                  conditionFilter === condition 
                    ? 'btn-primary' 
                    : 'btn-outline !text-brand-secondary'
                }`}
              >
                {condition}
              </button>
            ))}
          </div>

          {/* Right: Count */}
          <div className="flex items-center gap-8 shrink-0 py-2">
            <span className="font-bold text-brand-secondary">{filteredProducts.length} Products</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-transparent">
        {/* Main Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedCategory || 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
                {filteredProducts.map((product, idx) => (
                  <div key={product.id} className="border-r border-b border-transparent hover:border-gray-100 transition-colors">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-48 text-center bg-white">
                <p className="text-xl font-sans uppercase tracking-widest text-gray-500 mb-8">
                  No pieces found.
                </p>
                <button 
                  className="text-[11px] uppercase tracking-widest border-b border-black pb-1" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
