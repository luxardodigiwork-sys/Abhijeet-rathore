import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Search, ShoppingBag, User, Globe, 
  Instagram, Facebook, Twitter, ArrowRight, Plus, Minus, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Country, Language } from '../types';
import { COUNTRIES, LANGUAGES, COLLECTIONS } from '../constants';
import { ALL_COUNTRIES } from '../countries';
import { Logo } from './Logo';
import { FirstVisitModal } from './FirstVisitModal';
import { SearchOverlay } from './SearchOverlay';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import { storage } from '../utils/localStorage';

function ScrollToTopOnMount() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if ((window as any).lenis) {
      (window as any).lenis.start();
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  }, [location.key]);
  
  return null;
}

export default function Layout() {
  const siteContent = storage.getSiteContent();
  const [footerContent, setFooterContent] = useState(siteContent.footer);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English (US)');
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showFirstVisitModal, setShowFirstVisitModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showCollectionsDropdown, setShowCollectionsDropdown] = useState(false);
  const [showLoginReminder, setShowLoginReminder] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);
  const [openFooterSection, setOpenFooterSection] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { isLoggedIn, user, isAuthReady, updateUserPreferences } = useAuth();

  const toggleFooterSection = (section: string) => {
    setOpenFooterSection(prev => prev === section ? null : section);
  };

  // Initialize from localStorage
  useEffect(() => {
    const updatedSiteContent = storage.getSiteContent();
    setFooterContent(updatedSiteContent.footer);
    
    const savedCountry = localStorage.getItem('luxardo_country');
    const savedLang = localStorage.getItem('luxardo_lang');
    const savedCurrency = localStorage.getItem('luxardo_currency');
    const firstVisitCompleted = localStorage.getItem('luxardo_first_visit_completed');
    
    if (savedCountry && firstVisitCompleted) {
      const country = ALL_COUNTRIES.find(c => c.code === savedCountry);
      if (country) setSelectedCountry(country);
    } else {
      // Show first visit modal
      setShowFirstVisitModal(true);
    }

    if (savedLang) {
      setSelectedLanguage(savedLang as Language);
    } else if (savedCountry) {
      const country = ALL_COUNTRIES.find(c => c.code === savedCountry);
      const defaultLang = country ? country.language : 'English (US)';
      setSelectedLanguage(defaultLang);
      localStorage.setItem('luxardo_lang', defaultLang);
    } else {
      // Default to English (US)
      setSelectedLanguage('English (US)');
      localStorage.setItem('luxardo_lang', 'English (US)');
    }

    if (!savedCurrency && savedCountry) {
      const country = ALL_COUNTRIES.find(c => c.code === savedCountry);
      if (country) {
        localStorage.setItem('luxardo_currency', country.currency.code);
      }
    }
  }, []);

  // Sync preferences with user profile
  useEffect(() => {
    if (isAuthReady && user && user.role !== 'admin') {
      let needsUpdate = false;
      const updates: { country?: string; language?: string; currency?: string } = {};

      const localCountry = localStorage.getItem('luxardo_country');
      const localLang = localStorage.getItem('luxardo_lang');
      const localCurrency = localStorage.getItem('luxardo_currency');

      if (user.country && user.country !== localCountry) {
        let country = ALL_COUNTRIES.find(c => c.code === user.country);
        if (!country) {
          country = ALL_COUNTRIES.find(c => c.name === user.country);
          if (country) {
            updates.country = country.code;
            needsUpdate = true;
          }
        }
        if (country) {
          setSelectedCountry(country);
          localStorage.setItem('luxardo_country', country.code);
          localStorage.setItem('luxardo_first_visit_completed', 'true');
          setShowFirstVisitModal(false);
        }
      } else if (!user.country && localCountry) {
        updates.country = localCountry;
        needsUpdate = true;
      }

      if (user.language && user.language !== localLang) {
        setSelectedLanguage(user.language as Language);
        localStorage.setItem('luxardo_lang', user.language);
      } else if (!user.language && localLang) {
        updates.language = localLang;
        needsUpdate = true;
      }

      if (user.currency && user.currency !== localCurrency) {
        localStorage.setItem('luxardo_currency', user.currency);
      } else if (!user.currency && localCurrency) {
        updates.currency = localCurrency;
        needsUpdate = true;
      }

      if (needsUpdate) {
        updateUserPreferences(updates);
      }
    }
  }, [isAuthReady, user, updateUserPreferences]);

  // Login Reminder Logic
  useEffect(() => {
    if (isLoggedIn || showFirstVisitModal || showLoginReminder || reminderCount >= 3) return;

    const delay = reminderCount === 0 ? 5000 : 30000;
    
    const timer = setTimeout(() => {
      setShowLoginReminder(true);
      setReminderCount(prev => prev + 1);
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        setShowLoginReminder(false);
      }, 5000);
      
    }, delay);

    return () => clearTimeout(timer);
  }, [isLoggedIn, showFirstVisitModal, reminderCount, showLoginReminder]);

  // Close menu on route change and handle scroll lock during transition
  useEffect(() => {
    setIsMenuOpen(false);
    
    // Stop lenis during page transition to prevent janky scrolling
    if ((window as any).lenis) {
      (window as any).lenis.stop();
    }
  }, [location.pathname]);

  // Handle scroll for sticky header shrink effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when any modal/overlay is open
  useEffect(() => {
    if (isMenuOpen || isSearchOpen || showFirstVisitModal || showRegionModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isSearchOpen, showFirstVisitModal, showRegionModal]);

  const handleCountrySelect = (country: Country) => {
    if (country.active) {
      setSelectedCountry(country);
      localStorage.setItem('luxardo_country', country.code);
      localStorage.setItem('luxardo_currency', country.currency.code);
      
      const defaultLang = country.language;
      setSelectedLanguage(defaultLang);
      localStorage.setItem('luxardo_lang', defaultLang);
      
      if (isLoggedIn && user && user.role !== 'admin') {
        updateUserPreferences({
          country: country.code,
          language: defaultLang,
          currency: country.currency.code
        });
      }
      
      setShowRegionModal(false);
    }
  };

  const scrollToTop = () => {
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
    localStorage.setItem('luxardo_lang', lang);
    
    if (isLoggedIn && user && user.role !== 'admin') {
      updateUserPreferences({ language: lang });
    }
  };

  const handleFirstVisitSelect = (country: Country) => {
    setSelectedCountry(country);
    localStorage.setItem('luxardo_country', country.code);
    localStorage.setItem('luxardo_currency', country.currency.code);
    
    const defaultLang = country.language;
    setSelectedLanguage(defaultLang);
    localStorage.setItem('luxardo_lang', defaultLang);
    
    localStorage.setItem('luxardo_first_visit_completed', 'true');
    
    if (isLoggedIn && user && user.role !== 'admin') {
      updateUserPreferences({
        country: country.code,
        language: defaultLang,
        currency: country.currency.code
      });
    }
    
    setShowFirstVisitModal(false);
    // Redirect to home if not already there
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'CRAFTSMANSHIP', path: '/craftsmanship' },
    { name: 'COLLECTIONS', path: '/collections' },
    { name: 'PARTNER WITH US', path: '/wholesale' },
    { name: 'PRIME MEMBER', path: '/prime-membership' },
    { name: 'CONTACT', path: '/contact' }
  ];

  const collectionItems = COLLECTIONS.map(col => ({
    name: col.shortName,
    path: `/collections/${col.id}`
  }));

  return (
    <div className="min-h-screen bg-brand-bg text-brand-black selection:bg-brand-black selection:text-brand-white flex flex-col">
      {/* First Visit Modal */}
      <AnimatePresence>
        {showFirstVisitModal && <FirstVisitModal onSelect={handleFirstVisitSelect} />}
      </AnimatePresence>

      {/* Top Bar (Layer 1) */}
      <div className="bg-brand-black text-brand-white py-1.5 md:py-2 px-4 md:px-12">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setShowRegionModal(true)} className="flex items-center gap-1.5 md:gap-2 hover:text-brand-secondary transition-colors">
              <Globe className="w-2.5 h-2.5 md:w-3 md:h-3" />
              {selectedCountry?.name || 'Select Region'}
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setShowRegionModal(true)} className="hover:text-brand-secondary transition-colors">
              {selectedLanguage}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header (Layer 2) */}
      <header className={`sticky top-0 z-40 bg-brand-bg/95 backdrop-blur-md border-b border-brand-divider transition-all duration-500 ${isScrolled ? 'py-1.5 md:py-2 shadow-sm' : 'py-2.5 md:py-3.5'}`}>
        <div className="max-w-[1800px] mx-auto px-4 md:px-12 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-1 flex items-center">
            <Link to="/" className="flex items-center">
              <Logo className={`transition-all duration-500 ${isScrolled ? 'h-[28px] md:h-[36px] w-[120px] md:w-[157px]' : 'h-[36px] md:h-[48px] w-[157px] md:w-[210px]'}`} />
            </Link>
          </div>
          
          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
              <div 
                key={item.name} 
                className="relative"
                onPointerEnter={(e) => e.pointerType === 'mouse' && item.name === 'COLLECTIONS' && setShowCollectionsDropdown(true)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && item.name === 'COLLECTIONS' && setShowCollectionsDropdown(false)}
              >
                <Link 
                  to={item.path} 
                  onClick={() => {
                    if (item.name === 'COLLECTIONS') {
                      setShowCollectionsDropdown(false);
                    }
                    if (window.location.pathname === item.path) {
                      scrollToTop();
                    }
                  }}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  {item.name}
                </Link>
                
                {/* Collections Dropdown */}
                {item.name === 'COLLECTIONS' && (
                  <AnimatePresence>
                    {showCollectionsDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5, pointerEvents: 'none' }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-64 z-50"
                      >
                        <div className="bg-brand-white border border-brand-divider p-8 shadow-2xl flex flex-col gap-4">
                          {collectionItems.map(col => {
                            const isColActive = location.pathname === col.path;
                            return (
                            <Link 
                              key={col.name} 
                              to={col.path} 
                              onClick={() => {
                                setShowCollectionsDropdown(false);
                                if (window.location.pathname === col.path) {
                                  scrollToTop();
                                }
                              }}
                              className={`text-left text-sm font-sans transition-colors ${isColActive ? 'text-brand-black font-medium' : 'text-brand-secondary hover:text-brand-black'}`}
                            >
                              {col.name}
                            </Link>
                          )})}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            )})}
          </nav>

          {/* Right: Icons & Hamburger */}
          <div className="flex-1 flex justify-end items-center gap-3 md:gap-6">
            <button onClick={() => setIsSearchOpen(true)} className="hover:text-brand-secondary transition-colors"><Search className="w-[18px] h-[18px] md:w-6 md:h-6" /></button>
            <Link to={isLoggedIn ? "/account" : "/login"} className="hover:text-brand-secondary transition-colors"><User className="w-[18px] h-[18px] md:w-6 md:h-6" /></Link>
            <Link to="/cart" className="hover:text-brand-secondary transition-colors relative">
              <ShoppingBag className="w-[18px] h-[18px] md:w-6 md:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-4 h-4 md:w-5 md:h-5 bg-brand-black text-brand-white rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden ml-1 md:ml-2">
              <Menu className="w-5 h-5 md:w-7 md:h-7" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[90] bg-brand-black/40 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer */}
            <motion.div 
              key="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-[400px] z-[100] bg-brand-bg flex flex-col shadow-2xl lg:hidden"
            >
              <div className="p-6 flex flex-col gap-4 border-b border-brand-divider">
                <div className="flex justify-between items-center">
                  <Logo className="h-6 w-auto" />
                  <button onClick={() => setIsMenuOpen(false)} className="text-brand-black hover:text-brand-secondary transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {isLoggedIn && user && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-display tracking-wide truncate text-brand-black">
                      Hello, {user.name.split(' ')[0]}
                    </span>
                    {user.isPrimeMember && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 rounded-sm">
                        <Crown size={10} /> Prime
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                {navItems.map(item => {
                  const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                  <div key={item.name} className="flex flex-col gap-4">
                    <Link 
                      to={item.path} 
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (window.location.pathname === item.path) {
                          scrollToTop();
                        }
                      }} 
                      className={`text-left text-xl font-display uppercase tracking-widest transition-colors ${isActive ? 'text-brand-black font-bold' : 'text-brand-black/70 hover:text-brand-black'}`}
                    >
                      {item.name}
                    </Link>
                    {item.name === 'COLLECTIONS' && (
                      <div className="pl-4 flex flex-col gap-4 border-l border-brand-divider">
                        {collectionItems.map(col => {
                          const isColActive = location.pathname === col.path;
                          return (
                          <Link 
                            key={col.name} 
                            to={col.path} 
                            onClick={() => {
                              setIsMenuOpen(false);
                              if (window.location.pathname === col.path) {
                                scrollToTop();
                              }
                            }} 
                            className={`text-left text-sm font-sans transition-colors ${isColActive ? 'text-brand-black font-medium' : 'text-brand-secondary hover:text-brand-black'}`}
                          >
                            {col.name}
                          </Link>
                        )})}
                      </div>
                    )}
                  </div>
                )})}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login Reminder Toast */}
      <AnimatePresence>
        {showLoginReminder && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50, pointerEvents: 'none' }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-brand-black text-brand-white p-4 shadow-2xl flex items-center justify-between cursor-pointer"
            onClick={() => {
              setShowLoginReminder(false);
              navigate('/login');
            }}
          >
            <div className="flex items-center gap-4">
              <User className="w-5 h-5" />
              <div>
                <p className="text-[11px] uppercase tracking-widest font-bold mb-1">Welcome to Luxardo</p>
                <p className="text-sm font-sans opacity-80">Please log in to access your exclusive benefits.</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowLoginReminder(false);
              }}
              className="p-2 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Region Modal */}
      <AnimatePresence>
        {showRegionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            className="fixed inset-0 z-50 bg-brand-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-white w-full max-w-2xl p-8 md:p-12 relative"
            >
              <button onClick={() => setShowRegionModal(false)} className="absolute top-6 right-6">
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-3xl font-display mb-12 text-center">Select Your Region</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-secondary mb-6 border-b border-brand-divider pb-4">Country</h3>
                  <div className="space-y-4 relative">
                    <select
                      value={selectedCountry?.code || ''}
                      onChange={(e) => {
                        const country = ALL_COUNTRIES.find(c => c.code === e.target.value);
                        if (country) handleCountrySelect(country);
                      }}
                      className="w-full py-4 px-6 text-sm font-sans tracking-[0.1em] border border-brand-divider focus:border-brand-black outline-none appearance-none bg-transparent cursor-pointer transition-colors"
                    >
                      <option value="" disabled>Select a country...</option>
                      {ALL_COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-secondary mb-6 border-b border-brand-divider pb-4">Language</h3>
                  <div className="space-y-4">
                    {LANGUAGES.filter(lang => {
                      if (!selectedCountry) return lang === 'English (US)';
                      if (selectedCountry.code === 'AE') return lang === 'Arabic' || lang === 'English (US)';
                      if (selectedCountry.code === 'FR') return lang === 'French' || lang === 'English (US)';
                      return lang === 'English (US)';
                    }).map(lang => (
                      <button 
                        key={lang}
                        onClick={() => handleLanguageSelect(lang)}
                        className={`w-full text-left font-sans hover:text-brand-secondary transition-colors ${selectedLanguage === lang ? 'font-bold' : ''}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <ScrollToTopOnMount />
            <Outlet context={{ selectedCountry, selectedLanguage }} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-brand-black text-brand-white pt-16 md:pt-24 pb-8 md:pb-8 px-6 md:px-16 relative overflow-hidden mt-auto">
        {/* Large Watermark Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] opacity-[0.03] pointer-events-none flex justify-center">
          <Logo className="w-full" dark />
        </div>

        <div className="max-w-[1800px] mx-auto flex flex-col md:grid md:grid-cols-3 md:gap-16 mb-16 md:mb-20 relative z-10">
          <div className="flex flex-col border-b border-brand-white/10 md:border-none py-4 md:py-0">
            <button 
              onClick={() => toggleFooterSection('maison')}
              className="w-full flex justify-between items-center md:pointer-events-none"
            >
              <h4 className="text-[11px] md:text-[13px] uppercase tracking-[0.25em] font-bold text-brand-white">Maison</h4>
              <div className="md:hidden text-brand-white/60">
                {openFooterSection === 'maison' ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 md:!max-h-none md:!opacity-100 md:!mt-8 ${openFooterSection === 'maison' ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
              <ul className="space-y-3 md:space-y-4 text-xs md:text-sm font-sans text-brand-white/60">
                <li><Link to="/prime-membership" className="hover:text-brand-white transition-colors">Prime Member</Link></li>
                <li><Link to="/craftsmanship" className="hover:text-brand-white transition-colors">Craftsmanship</Link></li>
                <li><Link to="/our-story" className="hover:text-brand-white transition-colors">Our Story</Link></li>
                <li><Link to="/contact" className="hover:text-brand-white transition-colors">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-brand-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col border-b border-brand-white/10 md:border-none py-4 md:py-0">
            <button 
              onClick={() => toggleFooterSection('legal')}
              className="w-full flex justify-between items-center md:pointer-events-none"
            >
              <h4 className="text-[11px] md:text-[13px] uppercase tracking-[0.25em] font-bold text-brand-white">Legal</h4>
              <div className="md:hidden text-brand-white/60">
                {openFooterSection === 'legal' ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 md:!max-h-none md:!opacity-100 md:!mt-8 ${openFooterSection === 'legal' ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
              <ul className="space-y-3 md:space-y-4 text-xs md:text-sm font-sans text-brand-white/60">
                <li><Link to="/policies/shipping" className="hover:text-brand-white transition-colors">Shipping Policy</Link></li>
                <li><Link to="/policies/returns" className="hover:text-brand-white transition-colors">Returns Policy</Link></li>
                <li><Link to="/policies/privacy" className="hover:text-brand-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/policies/terms" className="hover:text-brand-white transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/policies/membership-terms" className="hover:text-brand-white transition-colors">Membership Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col py-8 md:py-0 space-y-8 md:space-y-12">
            <div className="space-y-6 md:space-y-8">
              <h4 className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold text-brand-white">Newsletter</h4>
              <div className="flex border-b border-brand-white/20 pb-3 md:pb-4 group">
                <input type="email" placeholder="Email Address" className="bg-transparent w-full text-xs md:text-sm font-sans text-brand-white focus:outline-none placeholder:text-brand-white/40" />
                <button className="text-brand-white hover:text-brand-white/60 transition-colors">
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <h4 className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold text-brand-white">Region</h4>
              <button onClick={() => setShowRegionModal(true)} className="flex items-center gap-2 text-xs md:text-sm font-sans text-brand-white/60 hover:text-brand-white transition-colors">
                <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" /> {selectedCountry?.name || 'Select Region'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1800px] w-full mx-auto pt-8 border-t border-brand-white/10 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex-1 flex justify-center md:justify-start">
          </div>
          <p className="flex-1 text-[10px] uppercase tracking-[0.25em] font-bold text-brand-white/60 flex flex-wrap items-center justify-center gap-2 text-center">
            <span>@2015</span>
            <Logo className="h-2.5 w-auto" dark />
            <span>{footerContent?.copyrightText || 'Luxardo Maison. All rights reserved.'}</span>
          </p>
          <div className="flex-1 flex justify-center md:justify-end gap-6">
            {footerContent?.socialLinks?.instagram && (
              <a href={footerContent.socialLinks?.instagram} target="_blank" rel="noopener noreferrer" className="text-brand-white/60 hover:text-brand-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {footerContent?.socialLinks?.facebook && (
              <a href={footerContent.socialLinks?.facebook} target="_blank" rel="noopener noreferrer" className="text-brand-white/60 hover:text-brand-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {footerContent?.socialLinks?.twitter && (
              <a href={footerContent.socialLinks?.twitter} target="_blank" rel="noopener noreferrer" className="text-brand-white/60 hover:text-brand-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </footer>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
