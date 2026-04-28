import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { storage } from '../utils/localStorage';
import { User } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

import firebaseConfig from '../../firebase-applet-config.json';

const isDummyConfig = firebaseConfig.projectId === 'remixed-project-id';

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAuthReady: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginAdmin: (email: string, password?: string) => Promise<void>;
  register: (userData: Partial<User> & { password?: string }) => Promise<void>;
  socialLogin: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  upgradeToPrime: () => Promise<void>;
  updateUserPreferences: (prefs: { country?: string; language?: string; currency?: string }) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          
          setUser({ 
            ...data.user, 
            id: data.user.id.toString(), 
            name: data.user.full_name || data.user.name,
            isPrimeMember: data.user.role === 'customer' ? false : true, 
            forcePasswordReset: !!data.user.force_password_reset,
            permissions: data.user.permissions || {}
          });
          setIsAuthReady(true);
          return true;
        }
      } catch (err) {
        console.error('Auth check failed', err);
      }
      return false;
    };

    checkAuth().then((hasApiSession) => {
      if (!hasApiSession) {
        if (isDummyConfig) {
          setIsAuthReady(true);
          return;
        }

        try {
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              const userDocRef = doc(db, 'users', firebaseUser.uid);
              try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                  setUser(userDoc.data() as User);
                } else {
                  console.warn('User document does not exist for UID:', firebaseUser.uid);
                }
              } catch (error) {
                console.error('Error fetching user profile:', error);
              }
            } else {
              setUser(null);
            }
            setIsAuthReady(true);
          }, (error) => {
            console.error("Firebase auth error in onAuthStateChanged:", error);
            setIsAuthReady(true);
            setUser(null);
          });

          return () => unsubscribe();
        } catch (e) {
          console.error("Firebase Auth failed to initialize listener:", e);
          setIsAuthReady(true);
        }
      }
    });
  }, []);

  // Real-time user profile updates
  useEffect(() => {
    if (!auth.currentUser || user?.role === 'super_admin' || user?.role === 'admin' || ['dispatch', 'owner', 'analysis', 'accounts'].includes(user?.role || '')) return;

    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        setUser(doc.data() as User);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
    });

    return () => unsubscribe();
  }, [isAuthReady, user?.role]);

  const register = useCallback(async (userData: Partial<User> & { password?: string }) => {
    try {
      // Try API first
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          phone: userData.phone,
          country: userData.country
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser({
          ...data.user,
          id: data.user.id.toString(),
          name: data.user.full_name || data.user.name,
          isPrimeMember: false,
          role: 'customer',
          createdAt: new Date().toISOString()
        });
        return;
      }

      // If API fails, try Firebase
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth, 
        userData.email!, 
        userData.password!
      );

      const localCountry = localStorage.getItem('luxardo_country');
      const localLang = localStorage.getItem('luxardo_lang');
      const localCurrency = localStorage.getItem('luxardo_currency');

      const newUser: User = {
        id: firebaseUser.uid,
        name: userData.name || 'Luxardo Client',
        email: userData.email!,
        phone: userData.phone || '',
        country: userData.country || localCountry || 'US',
        language: userData.language || localLang || 'English (US)',
        currency: userData.currency || localCurrency || 'USD',
        createdAt: new Date().toISOString(),
        isPrimeMember: false,
        role: 'customer',
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      setUser(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, []);

  const loginAdmin = useCallback(async (email: string, password?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // STRICT SEPARATION: Admin login does NOT allow 'customer' role
      if (data.user.role === 'customer') {
        throw new Error('Access denied. Customer accounts cannot access the administrative portal.');
      }
      
      setUser({ 
        ...data.user, 
        id: data.user.id.toString(), 
        name: data.user.full_name || data.user.name,
        isPrimeMember: true, 
        forcePasswordReset: !!data.user.force_password_reset,
        permissions: data.user.permissions
      });
      setIsAuthReady(true);
      storage.logoutAdmin(); // Clear any old local storage admin flags
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    try {
      // Try API first (for SQLite users like the test customer)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // STRICT SEPARATION: Customer login only allows 'customer' role
        if (data.user.role !== 'customer') {
          throw new Error('This account is not authorized for customer login. Please use the administrative portal.');
        }
        
        setUser({ 
          ...data.user, 
          id: data.user.id.toString(), 
          name: data.user.full_name || data.user.name,
          isPrimeMember: false,
          forcePasswordReset: !!data.user.force_password_reset
        });
        return;
      }

      // If API fails, try Firebase
      await signInWithEmailAndPassword(auth, email, password!);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const socialLogin = useCallback(async (provider: 'google' | 'apple') => {
    if (provider === 'apple') {
      throw new Error('Apple login not implemented in this environment.');
    }

    try {
      const googleProvider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const localCountry = localStorage.getItem('luxardo_country');
        const localLang = localStorage.getItem('luxardo_lang');
        const localCurrency = localStorage.getItem('luxardo_currency');

        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Google Client',
          email: firebaseUser.email!,
          phone: firebaseUser.phoneNumber || '',
          country: localCountry || 'US',
          language: localLang || 'English (US)',
          currency: localCurrency || 'USD',
          createdAt: new Date().toISOString(),
          isPrimeMember: false,
          role: 'customer',
        };
        await setDoc(userDocRef, newUser);
        setUser(newUser);
      }
    } catch (error) {
      console.error('Social login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (user?.role === 'super_admin' || user?.role === 'admin' || ['dispatch', 'owner', 'analysis', 'accounts'].includes(user?.role || '')) {
        await fetch('/api/auth/logout', { method: 'POST' });
      } else {
        // For firebase users, we still call our logout to clear cookies
        await fetch('/api/auth/logout', { method: 'POST' });
        await signOut(auth);
      }
      storage.logoutAdmin();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [user]);

  const upgradeToPrime = useCallback(async () => {
    if (!user || !auth.currentUser) return;

    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const updates = {
      isPrimeMember: true,
      membershipActivation: new Date().toISOString(),
      membershipExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    };

    try {
      await updateDoc(userDocRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  }, [user]);

  const updateUserPreferences = useCallback(async (prefs: { country?: string; language?: string; currency?: string }) => {
    if (!user || !auth.currentUser) return;
    if (user.role === 'admin') return; // Don't update dummy admin

    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await updateDoc(userDocRef, prefs);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  }, [user]);

  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      isAuthReady,
      login, 
      loginAdmin,
      register, 
      socialLogin, 
      logout, 
      upgradeToPrime,
      updateUserPreferences,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
