import React, { useState } from 'react';
import { useOutletContext, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Country } from '../types';
import { storage } from '../utils/localStorage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  Plus,
  Minus,
  X,
  Info,
  Share2,
  Bell
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCountry } = useOutletContext<{ selectedCountry: Country | null }>();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  
  const products = storage.getProducts();
  const product = products.find(p => p.id === id) || products[0];

  const [openSection, setOpenSection] = useState<string | null>('description');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const galleryImages = [
    product.image,
    ...(product.images ? product.images.filter(img => img !== product.image) : [])
  ];

  const [page, setPage] = useState([0, 0]);
  const currentIndex = Math.abs(page[0] % galleryImages.length);
  const direction = page[1];

  const paginate = (newDirection: number) => {
    setPage([page[0] + newDirection, newDirection]);
  };

  const setSpecificImage = (index: number) => {
    const newDirection = index > currentIndex ? 1 : -1;
    setPage([index, newDirection]);
  };

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} at Luxardo`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const [isNotifying, setIsNotifying] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);

  React.useEffect(() => {
    const checkSubscription = async () => {
      if (isLoggedIn && auth.currentUser) {
        try {
          const docRef = doc(db, 'lowStockNotifications', `${auth.currentUser.uid}_${product.id}`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setHasSubscribed(true);
          }
        } catch (error) {
          console.error("Error checking subscription:", error);
        }
      }
    };
    checkSubscription();
  }, [isLoggedIn, product.id]);

  const handleNotifyLowStock = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }
    
    setIsNotifying(true);
    try {
      if (!auth.currentUser) throw new Error("User not found");
      
      const docRef = doc(db, 'lowStockNotifications', `${auth.currentUser.uid}_${product.id}`);
      
      if (hasSubscribed) {
        await deleteDoc(docRef);
        setHasSubscribed(false);
        setNotificationMessage("You have been unsubscribed from low stock notifications.");
      } else {
        await setDoc(docRef, {
          userId: auth.currentUser.uid,
          productId: product.id,
          productName: product.name,
          email: auth.currentUser.email,
          createdAt: new Date().toISOString(),
          notified: false
        });
        setHasSubscribed(true);
        setNotificationMessage("You will be notified when stock drops below 5.");
      }
      setTimeout(() => setNotificationMessage(null), 3000);
    } catch (error) {
      console.error("Error toggling notification:", error);
      setNotificationMessage("An error occurred. Please try again.");
      setTimeout(() => setNotificationMessage(null), 3000);
    } finally {
      setIsNotifying(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 3000);
      return;
    }
    setSizeError(false);
    setIsAdding(true);
    addToCart(product, 1, selectedSize);
    setTimeout(() => setIsAdding(false), 1000);
  };

  // Sizes based on reference image
  const sizes = ['38', '40', '42', '44', '46', '48', '50', '52', '54', '56', '58', '60'];

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="px-4 md:px-8 py-4 text-[11px] font-sans uppercase tracking-widest text-black border-b border-gray-200">
        <Link to="/" className="hover:opacity-70 underline decoration-1 underline-offset-4">Home</Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to="/collections" className="hover:opacity-70 underline decoration-1 underline-offset-4">Shop</Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to="/collections" className="hover:opacity-70 underline decoration-1 underline-offset-4">{product.category}</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-500">{product.name}</span>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">
          
          {/* Left: Image Gallery (8 cols) */}
          <div className="lg:col-span-8 flex flex-col md:flex-row">
            {/* Thumbnails (Desktop) */}
            <div className="hidden md:flex flex-col gap-3 p-4 md:pl-8 lg:pl-12 w-32 shrink-0 z-10">
              {galleryImages.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSpecificImage(idx)}
                  className={`aspect-[3/4] border transition-all ${currentIndex === idx ? 'border-black opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="w-full bg-[#F5F5F5] relative overflow-hidden flex items-center justify-center aspect-[3/4] md:aspect-[5/6]">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={currentIndex}
                  src={galleryImages[currentIndex]}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 120, damping: 25 },
                    opacity: { duration: 0.4 }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                  className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              
              {/* Dots for mobile */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden z-10">
                {galleryImages.map((_, idx) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? 'bg-black' : 'bg-gray-300'}`} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Right: Product Info (4 cols) */}
          <div className="lg:col-span-4 px-4 py-6 md:py-12 lg:py-16 lg:pr-12 xl:pr-24 lg:pl-0">
            <div className="sticky top-12 space-y-10">
              
              {/* Header */}
              <div className="space-y-5">
                <p className="text-[12px] font-sans uppercase tracking-widest text-gray-500 font-bold">READY-TO-STITCH FABRIC</p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-sans uppercase tracking-widest text-black leading-tight">
                  {product.name}
                </h1>
                <p className="text-xl lg:text-2xl font-sans text-black">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-[13px] font-sans text-gray-500">
                  Tax included. <span className="underline cursor-pointer hover:text-black">Shipping</span> calculated at checkout.
                </p>
              </div>

              {/* Size Selection */}
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <p className="text-[13px] font-sans uppercase tracking-widest font-bold text-black">SIZE: {selectedSize || ''}</p>
                  {sizeError && <p className="text-[11px] font-sans text-red-500 font-bold animate-pulse">PLEASE SELECT A SIZE</p>}
                </div>
                <div className="grid grid-cols-6 gap-y-4 gap-x-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      className={`text-[13px] font-sans py-3 text-center transition-colors ${
                        selectedSize === size 
                          ? 'border-b-2 border-black text-black font-bold' 
                          : 'text-gray-500 hover:text-black border-b-2 border-transparent'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-6">
                  <button 
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-[13px] font-sans text-brand-black hover:text-brand-secondary transition-colors underline decoration-1 underline-offset-4"
                  >
                    What is my size?
                  </button>
                  <span className="text-[11px] font-sans text-brand-secondary font-medium">
                    Available Stock: {product.stock !== undefined ? product.stock : 10}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-6 pt-6">
                <div className="bg-gray-50 p-4 flex items-start gap-4">
                  <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-[13px] font-sans text-gray-600 leading-relaxed">
                    <strong>Ready-to-Stitch:</strong> You are purchasing a premium unstitched fabric set. Tailoring is required.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="btn-primary flex-1 py-5"
                  >
                    {isAdding ? 'ADDING...' : 'ADD TO CART'}
                  </button>
                  <button 
                    onClick={handleWishlistToggle}
                    className="p-5 border border-brand-divider rounded-full hover:border-brand-black transition-colors flex items-center justify-center shrink-0"
                    title="Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-black text-black' : 'text-black stroke-[1.5]'}`} />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-5 border border-brand-divider rounded-full hover:border-brand-black transition-colors flex items-center justify-center shrink-0"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5 text-black stroke-[1.5]" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={handleNotifyLowStock}
                    disabled={isNotifying}
                    className={`btn-outline w-full py-4 ${
                      hasSubscribed 
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-50 hover:border-emerald-500' 
                        : ''
                    }`}
                  >
                    <Bell size={16} className={hasSubscribed ? 'fill-emerald-600' : ''} />
                    {isNotifying ? 'PROCESSING...' : hasSubscribed ? 'NOTIFICATIONS ENABLED' : 'NOTIFY ME ON LOW STOCK'}
                  </button>
                  {notificationMessage && (
                    <p className="text-[11px] font-sans text-center text-brand-secondary animate-in fade-in slide-in-from-top-1">
                      {notificationMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-10 border-t border-gray-100">
                <p className="text-[12px] font-sans text-gray-400 mb-8">58129_502_06.42</p>

                {/* Accordions */}
                <div className="border-t border-gray-200">
                  {[
                    { id: 'description', title: 'Details', content: product.description },
                    { id: 'format', title: 'Garment Format', content: product.garmentFormat || 'This item is delivered as a premium ready-to-stitch fabric set in our signature presentation box. Please note that stitching is not included.' },
                    { id: 'composition', title: 'Composition', content: product.composition || `Fabric Origin: ${product.fabricOrigin || 'Imported'}. Premium blend selected for structure and comfort.` },
                    { id: 'washing', title: 'Washing care', content: product.washingCare || 'Dry clean only. Iron on low heat. Do not bleach.' },
                    { id: 'shipping', title: 'Shipping', content: product.shipping || 'Standard orders are processed within 3-5 business days.' },
                    { id: 'returns', title: 'Returns', content: product.returns || 'Items can be returned within 14 days in original condition.' }
                  ].map((section) => (
                    <div key={section.id} className="border-b border-gray-200">
                      <button 
                        onClick={() => toggleSection(section.id)}
                        className="w-full py-5 flex justify-between items-center text-left hover:opacity-70 transition-opacity"
                      >
                        <span className="text-[14px] font-sans font-bold text-black">{section.title}</span>
                        {openSection === section.id ? <Minus className="w-5 h-5 text-black" /> : <Plus className="w-5 h-5 text-black" />}
                      </button>
                      <AnimatePresence>
                        {openSection === section.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-5 font-sans text-gray-700 text-[14px] leading-relaxed whitespace-pre-wrap">
                              {section.content}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16 border-t border-gray-200 pt-16 px-4 md:px-8 pb-24">
          <div className="text-center space-y-4 mb-12">
            <h3 className="text-2xl font-sans uppercase tracking-widest text-black">You May Also Like</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.filter(p => p.id !== product.id).slice(0, 4).map(relatedProduct => (
              <Link to={`/product/${relatedProduct.id}`} key={relatedProduct.id} className="group cursor-pointer">
                <div className="aspect-[3/4] overflow-hidden bg-[#F5F5F5] mb-4">
                  <img 
                    src={relatedProduct.image} 
                    alt={relatedProduct.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-sans uppercase tracking-widest text-black">{relatedProduct.name}</h4>
                  <p className="text-sm font-sans text-gray-500">
                    {formatCurrency(relatedProduct.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {isSizeChartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeChartOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl relative z-10 p-8 md:p-12 shadow-2xl"
            >
              <button 
                onClick={() => setIsSizeChartOpen(false)}
                className="absolute top-6 right-6 text-black hover:opacity-70 transition-opacity"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
              
              <h2 className="text-2xl font-sans uppercase tracking-widest mb-8">Global Size Chart</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px] font-sans">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="py-4 font-bold uppercase tracking-widest">EU Size</th>
                      <th className="py-4 font-bold uppercase tracking-widest text-gray-500">US/UK Size</th>
                      <th className="py-4 font-bold uppercase tracking-widest text-gray-500">Chest (cm)</th>
                      <th className="py-4 font-bold uppercase tracking-widest text-gray-500">Waist (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { eu: '42', us: '32', chest: '84-87', waist: '72-75' },
                      { eu: '44', us: '34', chest: '88-91', waist: '76-79' },
                      { eu: '46', us: '36', chest: '92-95', waist: '80-83' },
                      { eu: '48', us: '38', chest: '96-99', waist: '84-87' },
                      { eu: '50', us: '40', chest: '100-103', waist: '88-91' },
                      { eu: '52', us: '42', chest: '104-107', waist: '92-95' },
                      { eu: '54', us: '44', chest: '108-111', waist: '96-99' },
                      { eu: '56', us: '46', chest: '112-115', waist: '100-103' },
                      { eu: '58', us: '48', chest: '116-119', waist: '104-107' },
                      { eu: '60', us: '50', chest: '120-123', waist: '108-111' },
                      { eu: '62', us: '52', chest: '124-127', waist: '112-115' },
                      { eu: '64', us: '54', chest: '128-131', waist: '116-119' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 font-bold">{row.eu}</td>
                        <td className="py-4 text-gray-600">{row.us}</td>
                        <td className="py-4 text-gray-600">{row.chest}</td>
                        <td className="py-4 text-gray-600">{row.waist}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
