import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';

interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  cartItemId?: string; // combination of productId and size
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, delta: number, size?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

import firebaseConfig from '../../firebase-applet-config.json';
const isDummyConfig = firebaseConfig.projectId === 'remixed-project-id';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('luxardo_cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    return [];
  });

  // Load from Firestore if user is logged in
  useEffect(() => {
    if (!user || isDummyConfig) return;
    
    let isMounted = true;
    const q = query(collection(db, 'carts'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isMounted) return;
      
      const firestoreItems = snapshot.docs.map(doc => {
         const data = doc.data();
         return { ...data, cartItemId: doc.id } as CartItem;
      });
      
      setCartItems(prev => {
        const merged = [...prev];
        
        // Add firestore items to local state
        firestoreItems.forEach(fi => {
          const exists = merged.find(p => p.product.id === fi.product.id && p.size === fi.size);
          if (!exists) {
            merged.push(fi);
          } else if (exists.quantity < fi.quantity) {
             exists.quantity = fi.quantity; // take higher quantity
          }
        });

        // Sync local-only items to Firestore
        prev.forEach(async (localItem) => {
          const docId = `${user.id}_${localItem.product.id}_${localItem.size || 'default'}`;
          if (!firestoreItems.some(fi => fi.cartItemId === docId)) {
            try {
              await setDoc(doc(db, 'carts', docId), {
                userId: user.id,
                ...localItem
              });
            } catch (error) {
              console.error('Error syncing local cart item to Firestore', error);
            }
          }
        });

        return merged;
      });
    }, (error) => {
      console.warn("Failed to listen to carts collection: ", error.message);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('luxardo_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product: Product, quantity: number = 1, size?: string) => {
    const docId = user ? `${user.id}_${product.id}_${size || 'default'}` : undefined;
    let newQuantity = quantity;

    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === size);
      if (existing) {
        newQuantity = existing.quantity + quantity;
        return prev.map(item => 
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      return [...prev, { product, quantity, size }];
    });

    if (user && docId && !isDummyConfig) {
      try {
        await setDoc(doc(db, 'carts', docId), {
          userId: user.id,
          product,
          quantity: newQuantity,
          size
        }, { merge: true });
      } catch (e) {
        console.error("Failed to sync cart", e);
      }
    }
  };

  const removeFromCart = async (productId: string, size?: string) => {
    setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));

    if (user && !isDummyConfig) {
      const docId = `${user.id}_${productId}_${size || 'default'}`;
      try {
        await deleteDoc(doc(db, 'carts', docId));
      } catch (error) {
        console.error("Failed to delete from cart", error);
      }
    }
  };

  const updateQuantity = async (productId: string, delta: number, size?: string) => {
    let finalQuantity = 1;

    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId && item.size === size) {
        finalQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: finalQuantity };
      }
      return item;
    }));

    if (user && !isDummyConfig) {
      const docId = `${user.id}_${productId}_${size || 'default'}`;
      try {
        await setDoc(doc(db, 'carts', docId), { quantity: finalQuantity }, { merge: true });
      } catch (error) {
         console.error("Failed to update cart quantity", error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user && !isDummyConfig) {
       try {
          const q = query(collection(db, 'carts'), where('userId', '==', user.id));
          const snap = await getDocs(q);
          const batch = snap.docs.map(d => deleteDoc(d.ref));
          await Promise.all(batch);
       } catch (e) {
          console.error("Failed to clear cart", e);
       }
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartCount,
      cartSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

