import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Product } from '../types';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [added, setAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col"
    >
      <div className="aspect-[3/4] overflow-hidden bg-[#F5F5F5] relative">
        <Link to={`/product/${product.id}`} className="block w-full h-full relative overflow-hidden">
          {/* Main Image - Full View */}
          <img 
            src={product.image} 
            alt={product.name} 
            className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out group-hover:opacity-0"
            referrerPolicy="no-referrer"
          />
          
          {/* Secondary Image - Closeup View */}
          {product.images && product.images.length > 1 && (
            <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out">
              <img 
                src={product.images[1]} 
                alt={`${product.name} closeup`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </Link>
        
        <button 
          onClick={toggleWishlist}
          className="absolute top-4 right-4 p-2 transition-transform hover:scale-110 z-10"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-black text-black' : 'text-black stroke-[1.5]'}`} />
        </button>
      </div>

      <Link to={`/product/${product.id}`} className="mt-4 flex flex-col space-y-1 text-left">
        <h3 className="text-[11px] md:text-[12px] font-sans uppercase tracking-widest text-black">{product.name}</h3>
        <p className="text-[11px] md:text-[12px] font-sans text-black">{formatCurrency(product.price)}</p>
      </Link>
    </motion.div>
  );
};
