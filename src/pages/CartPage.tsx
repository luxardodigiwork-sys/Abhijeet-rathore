import React from 'react';
import { Link, useOutletContext, useLocation } from 'react-router-dom';
import { Country } from '../types';
import { X, Minus, Plus, Package, Scissors, Info, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';

export default function CartPage() {
  const { selectedCountry } = useOutletContext<{ selectedCountry: Country | null }>();
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  const displaySubtotal = cartSubtotal;

  return (
    <div className="section-padding max-w-[1800px] mx-auto min-h-[70vh]">
      <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
        <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-brand-secondary">Your Selection</p>
        <h1 className="text-5xl font-display">Shopping Cart</h1>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="text-center space-y-8 py-20">
          <p className="font-sans text-brand-secondary">Your cart is currently empty.</p>
          <Link to="/collections" className="btn-primary inline-block px-12">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-8 space-y-12">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-6 border-b border-brand-divider text-[10px] uppercase tracking-[0.25em] font-bold text-brand-secondary">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
            
            {cartItems.map((item) => (
              <div key={item.product.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-8 border-b border-brand-divider">
                <div className="col-span-1 md:col-span-6 flex gap-8">
                  <div className="w-32 h-40 bg-brand-divider shrink-0 overflow-hidden">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col justify-center space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-secondary">{item.product.category}</p>
                    <h3 className="font-display text-2xl">{item.product.name}</h3>
                    <p className="text-xs font-sans text-brand-secondary">Format: Ready-to-Stitch Box</p>
                    {item.size && <p className="text-xs font-sans text-brand-secondary font-bold">Size: {item.size}</p>}
                    <button onClick={() => removeFromCart(item.product.id, item.size)} className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-secondary hover:text-brand-black transition-colors text-left flex items-center gap-2 mt-4">
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-3 flex justify-between md:justify-center items-center">
                  <span className="md:hidden text-[10px] uppercase tracking-[0.25em] font-bold text-brand-secondary">Quantity</span>
                  <div className="flex items-center border border-brand-divider bg-brand-white">
                    <button onClick={() => updateQuantity(item.product.id, -1, item.size)} className="p-4 hover:bg-brand-divider transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="w-12 text-center font-sans font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1, item.size)} className="p-4 hover:bg-brand-divider transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-3 flex justify-between md:justify-end items-center">
                  <span className="md:hidden text-[10px] uppercase tracking-[0.25em] font-bold text-brand-secondary">Total</span>
                  <span className="font-sans text-xl text-brand-black">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
            
            <div className="bg-brand-white p-12 border border-brand-divider space-y-12">
              <div className="space-y-4">
                <h4 className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-black">The Luxardo Experience</h4>
                <p className="text-lg font-display italic text-brand-secondary">Every order is an invitation into our world of modern ethnic luxury.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brand-divider pb-3">
                    <Package size={18} className="text-brand-black" />
                    <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-black">Signature Presentation</h5>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-sans text-brand-secondary leading-relaxed">
                      Arrives in our signature LUXARDO matte black presentation box, featuring acid-free archival tissue and a hand-pressed wax seal.
                    </p>
                    <ul className="text-[11px] uppercase tracking-widest font-bold text-brand-secondary space-y-3">
                      <li className="flex items-center gap-2"><Check size={12} /> Premium packaging included</li>
                      <li className="flex items-center gap-2"><Check size={12} /> Signature garment cover</li>
                      <li className="flex items-center gap-2"><Check size={12} /> Hand-signed thank-you note</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brand-divider pb-3">
                    <Scissors size={18} className="text-brand-black" />
                    <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-black">Master Tailor's Blueprint</h5>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-sans text-brand-secondary leading-relaxed">
                      Includes our proprietary Stitch Style Template; a comprehensive technical blueprint for your local artisan.
                    </p>
                    <ul className="text-[11px] uppercase tracking-widest font-bold text-brand-secondary space-y-3">
                      <li className="flex items-center gap-2"><Check size={12} /> Stitch style template included</li>
                      <li className="flex items-center gap-2"><Check size={12} /> Detailed care instructions</li>
                      <li className="flex items-center gap-2"><Check size={12} /> Alteration guidance card</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4">
            <div className="bg-brand-white p-10 border border-brand-divider space-y-10 sticky top-32">
              <h3 className="text-3xl font-display border-b border-brand-divider pb-8">Order Summary</h3>
              
              <div className="space-y-6 font-sans text-brand-secondary">
                <div className="flex justify-between">
                  <span className="text-sm uppercase tracking-widest">Subtotal</span>
                  <span className="text-brand-black font-medium">{formatCurrency(displaySubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm uppercase tracking-widest">Shipping</span>
                  <span className="text-xs italic">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t border-brand-divider pt-8 flex justify-between items-end">
                <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-black">Estimated Total</span>
                <span className="text-3xl font-sans text-brand-black">
                  {formatCurrency(displaySubtotal)}
                </span>
              </div>
              
              <div className="space-y-6 pt-4">
                {user ? (
                  <Link to="/checkout" className="btn-primary w-full block text-center py-5">PROCEED TO CHECKOUT</Link>
                ) : (
                  <Link to="/login" state={{ from: location }} className="btn-primary w-full block text-center py-5">LOGIN TO CHECKOUT</Link>
                )}
                <div className="flex gap-3 p-4 bg-brand-bg border border-brand-divider">
                  <Info size={16} className="text-brand-secondary shrink-0" />
                  <p className="text-[10px] font-sans text-brand-secondary leading-relaxed uppercase tracking-wider">
                    Shipping and taxes calculated at checkout. Standard orders include ready-to-stitch garments only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
