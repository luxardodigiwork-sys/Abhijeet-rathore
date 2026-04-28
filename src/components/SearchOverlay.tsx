import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Package, Grid, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/localStorage';
import { COLLECTIONS } from '../constants';
import { Product } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGES = [
  { title: 'Home', path: '/', type: 'page' },
  { title: 'All Collections', path: '/collections', type: 'page' },
  { title: 'Prime Membership', path: '/prime-membership', type: 'page' },
  { title: 'Craftsmanship', path: '/craftsmanship', type: 'page' },
  { title: 'Our Story', path: '/our-story', type: 'page' },
  { title: 'Contact', path: '/contact', type: 'page' },
];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setProducts(storage.getProducts());
      setQuery('');
      // Small delay to ensure the element is rendered before focusing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  // Filter logic
  const normalizedQuery = query.toLowerCase().trim();
  
  const filteredProducts = normalizedQuery 
    ? products.filter(p => 
        p.name.toLowerCase().includes(normalizedQuery) || 
        p.category.toLowerCase().includes(normalizedQuery) ||
        p.description.toLowerCase().includes(normalizedQuery)
      ).slice(0, 4)
    : [];

  const filteredCollections = normalizedQuery
    ? COLLECTIONS.filter(c => 
        c.fullName.toLowerCase().includes(normalizedQuery) || 
        c.shortName.toLowerCase().includes(normalizedQuery)
      ).slice(0, 3)
    : [];

  const filteredPages = normalizedQuery
    ? PAGES.filter(p => p.title.toLowerCase().includes(normalizedQuery)).slice(0, 3)
    : [];

  const hasResults = filteredProducts.length > 0 || filteredCollections.length > 0 || filteredPages.length > 0;
  const isSearching = normalizedQuery.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Search Panel */}
          <div 
            className="fixed inset-0 z-[101] flex items-start justify-center md:pt-24 md:px-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full md:h-auto md:max-w-[720px] bg-brand-bg md:shadow-2xl md:border border-brand-divider md:rounded-3xl overflow-hidden flex flex-col md:max-h-[75vh]"
            >
              {/* Search Input Area */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (filteredProducts.length > 0) {
                    handleNavigate(`/product/${filteredProducts[0].id}`);
                  } else if (filteredCollections.length > 0) {
                    handleNavigate(`/collections/${filteredCollections[0].id}`);
                  } else if (filteredPages.length > 0) {
                    handleNavigate(filteredPages[0].path);
                  }
                }}
                className="flex items-center px-6 py-5 border-b border-brand-divider shrink-0 bg-white"
              >
                <Search className="w-5 h-5 text-brand-secondary mr-4" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products, collections..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-sans text-brand-black placeholder:text-brand-black/30 focus:outline-none"
                />
                <button 
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors ml-4"
                >
                  <X className="w-5 h-5 text-brand-black" />
                </button>
              </form>

              {/* Results Area */}
              <div className="overflow-y-auto p-6 bg-brand-bg">
                {!isSearching ? (
                  <div className="text-center py-10 opacity-50">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Start typing to search</p>
                  </div>
                ) : !hasResults ? (
                  <div className="text-center py-10 opacity-50">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold">No results found for "{query}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Products */}
                    <div className="md:col-span-2 space-y-5">
                      {filteredProducts.length > 0 && (
                        <>
                          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-secondary flex items-center gap-2 mb-4">
                            <Package className="w-3 h-3" /> Products
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredProducts.map(product => (
                              <div 
                                key={product.id}
                                onClick={() => handleNavigate(`/product/${product.id}`)}
                                className="group flex gap-4 cursor-pointer p-2 -m-2 hover:bg-white transition-colors rounded-sm"
                              >
                                <div className="w-16 h-20 bg-brand-divider overflow-hidden flex-shrink-0">
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover   transition-all duration-500"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex flex-col justify-center">
                                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-secondary mb-1">{product.category}</p>
                                  <h4 className="text-sm font-sans font-medium text-brand-black group-hover:text-brand-secondary transition-colors line-clamp-2 leading-tight">{product.name}</h4>
                                  <p className="text-xs font-sans text-brand-secondary mt-1.5">₹{product.price.toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right Column: Collections & Pages */}
                    <div className="md:col-span-1 space-y-8">
                      {filteredCollections.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-secondary flex items-center gap-2 mb-3">
                            <Grid className="w-3 h-3" /> Collections
                          </h3>
                          <div className="space-y-1">
                            {filteredCollections.map(collection => (
                              <div 
                                key={collection.id}
                                onClick={() => handleNavigate(`/collections/${collection.id}`)}
                                className="group flex items-center justify-between cursor-pointer py-1.5 border-b border-transparent hover:border-brand-divider transition-colors"
                              >
                                <span className="text-sm font-sans text-brand-black group-hover:text-brand-secondary transition-colors">{collection.fullName}</span>
                                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-secondary" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {filteredPages.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-secondary flex items-center gap-2 mb-3">
                            <FileText className="w-3 h-3" /> Pages
                          </h3>
                          <div className="space-y-1">
                            {filteredPages.map(page => (
                              <div 
                                key={page.path}
                                onClick={() => handleNavigate(page.path)}
                                className="group flex items-center justify-between cursor-pointer py-1.5 border-b border-transparent hover:border-brand-divider transition-colors"
                              >
                                <span className="text-sm font-sans text-brand-black group-hover:text-brand-secondary transition-colors">{page.title}</span>
                                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-secondary" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
