import { Product, Order, User, MediaItem, BackendUser, BackendSettings } from '../types';
import { PRODUCTS } from '../constants';
import { DEFAULT_SITE_CONTENT } from '../constants/homeContent';
import { DEFAULT_PRIME_CONTENT } from '../constants/primeContent';
import { SHIPPING_POLICY, RETURNS_POLICY, PRIVACY_POLICY, TERMS_POLICY, MEMBERSHIP_TERMS } from '../policies';
import { db } from '../firebase';
import { collection, doc, getDocs, getDoc, setDoc, writeBatch } from 'firebase/firestore';

// Initial mocks that serve as default seeding if Firebase is empty
const INITIAL_USERS: User[] = [
  {
    id: 'user1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    role: 'customer',
    isPrimeMember: true,
    membershipActivation: new Date(Date.now() - 86400000 * 30).toISOString(),
    membershipExpiry: new Date(Date.now() + 86400000 * 335).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    primePrivileges: { consultation: true, bespoke: true, fabricLibrary: true, prioritySupport: true }
  }
];

const INITIAL_ORDERS: Order[] = [];

const INITIAL_POLICIES = {
  shipping: { title: 'Shipping Policy', content: SHIPPING_POLICY, secondaryNote: 'Standard delivery times may vary based on location and order complexity.' },
  returns: { title: 'Returns Policy', content: RETURNS_POLICY, secondaryNote: 'Bespoke and customized items are generally non-returnable.' },
  privacy: { title: 'Privacy Policy', content: PRIVACY_POLICY, secondaryNote: 'Your data security is our priority. We never sell your information.' },
  terms: { title: 'Terms & Conditions', content: TERMS_POLICY, secondaryNote: 'By using our services, you agree to these terms.' },
  'membership-terms': { title: 'Membership Terms', content: MEMBERSHIP_TERMS, secondaryNote: 'Membership benefits are subject to active subscription status.' }
};

const DEFAULT_BACKEND_SETTINGS: BackendSettings = {
  defaultStatuses: ['verified', 'packed', 'shipped', 'delivered'],
  verificationWorkflow: 'simple',
  courierFieldsVisible: true,
  trackingIdRequired: true,
  dispatchNotesEnabled: true,
  courierIntegration: { enabled: false, provider: 'DTDC', apiKey: '', clientId: '', environment: 'sandbox', originPincode: '' }
};

const INITIAL_BACKEND_USERS: BackendUser[] = [
  {
    id: 'dispatch-1',
    fullName: 'Arjun Singh',
    username: 'arjun_dispatch',
    email: 'arjun@luxardo.com',
    password: 'dispatch123',
    role: 'dispatch',
    status: 'active',
    accessScope: ['all_orders'],
    createdAt: new Date().toISOString(),
    permissions: {
      dashboard: true, orders: true, products: true, collections: true, media: true, content: true, backend_management: true, settings: true, dispatch_actions: true, accounts_finance: false, analysis_reports: false, customer_details: true, export_data: true, tracking_controls: true, delivery_update_controls: true
    }
  }
];

// Memory cache synced with Firebase
const memoryCache = {
  products: [] as Product[],
  orders: [] as Order[],
  users: [] as User[],
  siteContent: DEFAULT_SITE_CONTENT,
  primeContent: DEFAULT_PRIME_CONTENT,
  policies: INITIAL_POLICIES,
  bespokeRequests: [] as any[],
  wholesaleInquiries: [] as any[],
  contactMessages: [] as any[],
  media: [] as MediaItem[],
  backendUsers: [] as BackendUser[],
  backendSettings: DEFAULT_BACKEND_SETTINGS,
  primeGlobalSettings: { isLive: true, offlineMessage: 'Prime Member access is currently unavailable' }
};

let initialized = false;

async function syncToFirebase(collectionName: string, items: any[], idField = 'id') {
  if (firebaseConfig.projectId === 'remixed-project-id') return;
  try {
    const batch = writeBatch(db);
    const existingSnap = await getDocs(collection(db, collectionName));
    const existingIds = new Set(existingSnap.docs.map(doc => doc.id));

    items.forEach(item => {
      if (item[idField]) {
        const docRef = doc(db, collectionName, item[idField]);
        batch.set(docRef, item);
        existingIds.delete(item[idField]);
      }
    });

    existingIds.forEach(id => {
      const docRef = doc(db, collectionName, id);
      batch.delete(docRef);
    });

    await batch.commit();
  } catch (error) {
    console.error(`Error syncing ${collectionName} to Firebase:`, error);
  }
}

async function syncDoc(path: string, data: any) {
  if (firebaseConfig.projectId === 'remixed-project-id') return;
  try {
    await setDoc(doc(db, path), data);
  } catch (error) {
    console.error(`Error syncing ${path} to Firebase:`, error);
  }
}

import firebaseConfig from '../../firebase-applet-config.json';
export const initFirebaseStorage = async () => {
  if (initialized) return;

  if (firebaseConfig.projectId === 'remixed-project-id') {
    console.warn("Skipping Firestore initialization due to remixed dummy config");
    initialized = true;
    return;
  }

  try {
    const withTimeout = <T>(promise: Promise<T>, ms: number = 3000): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
      ]);
    };

    const fetchCollection = async (coll: string, defaultData: any[], idField = 'id') => {
      try {
        const snap = await withTimeout(getDocs(collection(db, coll)), 3000);
        if (!snap.empty) {
           return snap.docs.map(d => d.data());
        }
        if (defaultData.length > 0) {
          syncToFirebase(coll, defaultData, idField); // fire and forget
        }
        return defaultData;
      } catch (e) {
        console.warn(`Failed to fetch ${coll}:`, e);
        return defaultData;
      }
    };

    const fetchDoc = async (path: string, defaultData?: any) => {
      try {
        const docSnap = await withTimeout(getDoc(doc(db, path)), 3000);
        if (docSnap.exists()) return docSnap.data();
      } catch (e) {
        console.warn(`Failed to fetch doc ${path}:`, e);
      }
      return defaultData;
    };

    const [
      products, orders, users, backendUsers, media, bespokeRequests, wholesaleInquiries, contactMessages,
      siteContent, primeContent, policies, backendSettings, primeGlobalSettings
    ] = await Promise.all([
      fetchCollection('products', PRODUCTS),
      fetchCollection('orders', INITIAL_ORDERS),
      fetchCollection('users', INITIAL_USERS),
      fetchCollection('backend_users', INITIAL_BACKEND_USERS),
      fetchCollection('media', []),
      fetchCollection('bespoke_requests', []),
      fetchCollection('wholesale_inquiries', []),
      fetchCollection('contact_messages', []),
      fetchDoc('settings/siteContent', DEFAULT_SITE_CONTENT),
      fetchDoc('settings/primeContent', DEFAULT_PRIME_CONTENT),
      fetchDoc('settings/policies', INITIAL_POLICIES),
      fetchDoc('settings/backendSettings', DEFAULT_BACKEND_SETTINGS),
      fetchDoc('settings/primeGlobalSettings', { isLive: true, offlineMessage: 'Prime Member access is currently unavailable' })
    ]);

    memoryCache.products = products;
    memoryCache.orders = orders;
    memoryCache.users = users;
    memoryCache.backendUsers = backendUsers;
    memoryCache.media = media as MediaItem[];
    memoryCache.bespokeRequests = bespokeRequests;
    memoryCache.wholesaleInquiries = wholesaleInquiries;
    memoryCache.contactMessages = contactMessages;
    
    // Docs
    memoryCache.siteContent = siteContent as any;
    memoryCache.primeContent = primeContent as any;
    memoryCache.policies = policies as any;
    memoryCache.backendSettings = backendSettings as any;
    memoryCache.primeGlobalSettings = primeGlobalSettings as any;
  } catch (e) {
    console.error("Firebase Initialization Failed (fallback offline state):", e);
  } finally {
    initialized = true;
  }
};

export const storage = {
  getProducts: () => memoryCache.products,
  saveProducts: (products: Product[]) => {
    memoryCache.products = products;
    syncToFirebase('products', products);
  },

  getOrders: () => memoryCache.orders,
  saveOrders: (orders: Order[]) => {
    memoryCache.orders = orders;
    syncToFirebase('orders', orders);
  },
  addOrder: (order: Order) => {
    memoryCache.orders.unshift(order);
    syncToFirebase('orders', memoryCache.orders);
  },

  getUsers: () => memoryCache.users,
  saveUsers: (users: User[]) => {
    memoryCache.users = users;
    syncToFirebase('users', users);
  },
  updateUser: (updatedUser: User) => {
    const index = memoryCache.users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      memoryCache.users[index] = updatedUser;
      syncToFirebase('users', memoryCache.users);
    }
  },

  getSiteContent: () => memoryCache.siteContent,
  saveSiteContent: (content: any) => {
    memoryCache.siteContent = content;
    syncDoc('settings/siteContent', content);
  },
  resetSiteContent: () => {
    memoryCache.siteContent = DEFAULT_SITE_CONTENT;
    syncDoc('settings/siteContent', DEFAULT_SITE_CONTENT);
  },

  getPrimeContent: () => memoryCache.primeContent,
  savePrimeContent: (content: any) => {
    memoryCache.primeContent = content;
    syncDoc('settings/primeContent', content);
  },
  resetPrimeContent: () => {
    memoryCache.primeContent = DEFAULT_PRIME_CONTENT;
    syncDoc('settings/primeContent', DEFAULT_PRIME_CONTENT);
  },

  getPrimeGlobalSettings: () => memoryCache.primeGlobalSettings,
  savePrimeGlobalSettings: (settings: any) => {
    memoryCache.primeGlobalSettings = settings;
    syncDoc('settings/primeGlobalSettings', settings);
  },

  getPolicies: () => memoryCache.policies,
  savePolicies: (policies: any) => {
    memoryCache.policies = policies;
    syncDoc('settings/policies', policies);
  },

  getBespokeRequests: () => memoryCache.bespokeRequests,
  saveBespokeRequests: (requests: any[]) => {
    memoryCache.bespokeRequests = requests;
    syncToFirebase('bespoke_requests', requests);
  },
  addBespokeRequest: (request: any) => {
    memoryCache.bespokeRequests.unshift(request);
    syncToFirebase('bespoke_requests', memoryCache.bespokeRequests);
  },

  getWholesaleInquiries: () => memoryCache.wholesaleInquiries,
  saveWholesaleInquiries: (inquiries: any[]) => {
    memoryCache.wholesaleInquiries = inquiries;
    syncToFirebase('wholesale_inquiries', inquiries);
  },
  addWholesaleInquiry: (inquiry: any) => {
    memoryCache.wholesaleInquiries.unshift(inquiry);
    syncToFirebase('wholesale_inquiries', memoryCache.wholesaleInquiries);
  },

  getContactMessages: () => memoryCache.contactMessages,
  saveContactMessages: (messages: any[]) => {
    memoryCache.contactMessages = messages;
    syncToFirebase('contact_messages', messages);
  },
  addContactMessage: (message: any) => {
    memoryCache.contactMessages.unshift(message);
    syncToFirebase('contact_messages', memoryCache.contactMessages);
  },

  getDashboardStats: () => {
    const orders = memoryCache.orders;
    const products = memoryCache.products;
    const users = memoryCache.users;
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const activeMembers = users.filter(u => u.isPrimeMember && u.membershipExpiry && new Date(u.membershipExpiry) > new Date()).length;

    return { totalRevenue, totalOrders, totalProducts, activeMembers, recentOrders: orders.slice(0, 5) };
  },

  isAdminLoggedIn: () => localStorage.getItem('luxardo_dummy_admin') === 'true',
  loginAdmin: () => localStorage.setItem('luxardo_dummy_admin', 'true'),
  logoutAdmin: () => localStorage.removeItem('luxardo_dummy_admin'),

  getSavedAddress: (userId: string) => {
    const data = localStorage.getItem(`luxardo_saved_address_${userId}`);
    return data ? JSON.parse(data) : null;
  },
  saveAddress: (userId: string, address: any) => {
    localStorage.setItem(`luxardo_saved_address_${userId}`, JSON.stringify(address));
  },

  getMedia: () => memoryCache.media,
  saveMedia: (media: MediaItem[]) => {
    memoryCache.media = media;
    syncToFirebase('media', media);
  },
  addMedia: (item: MediaItem) => {
    memoryCache.media.unshift(item);
    syncToFirebase('media', memoryCache.media);
  },
  updateMedia: (updatedItem: MediaItem) => {
    const index = memoryCache.media.findIndex(m => m.id === updatedItem.id);
    if (index !== -1) {
      memoryCache.media[index] = updatedItem;
      syncToFirebase('media', memoryCache.media);
    }
  },
  deleteMedia: (id: string) => {
    memoryCache.media = memoryCache.media.filter(m => m.id !== id);
    syncToFirebase('media', memoryCache.media);
  },
  replaceMediaUrl: (oldUrl: string, newUrl: string) => {
    let productsChanged = false;
    memoryCache.products = memoryCache.products.map(p => {
      let changed = false;
      let mainImage = p.image;
      if (mainImage === oldUrl) { mainImage = newUrl; changed = true; }
      const extraImages = p.images?.map(img => {
        if (img === oldUrl) { changed = true; return newUrl; }
        return img;
      });
      if (changed) { productsChanged = true; return { ...p, image: mainImage, images: extraImages }; }
      return p;
    });
    if (productsChanged) syncToFirebase('products', memoryCache.products);

    const siteContentStr = JSON.stringify(memoryCache.siteContent);
    if (siteContentStr.includes(oldUrl)) {
      memoryCache.siteContent = JSON.parse(siteContentStr.split(oldUrl).join(newUrl));
      syncDoc('settings/siteContent', memoryCache.siteContent);
    }

    memoryCache.media = memoryCache.media.map(m => m.url === oldUrl ? { ...m, url: newUrl } : m);
    syncToFirebase('media', memoryCache.media);
  },
  isMediaInUse: (url: string) => {
    const locations: string[] = [];
    memoryCache.products.forEach(p => {
      if (p.image === url || p.images?.includes(url)) locations.push(`Product: ${p.name}`);
    });
    if (JSON.stringify(memoryCache.siteContent).includes(url)) locations.push('Site Content');
    return { inUse: locations.length > 0, locations };
  },

  getBackendUsers: () => memoryCache.backendUsers,
  saveBackendUsers: (users: BackendUser[]) => {
    memoryCache.backendUsers = users;
    syncToFirebase('backend_users', users);
  },
  getBackendSettings: () => memoryCache.backendSettings,
  saveBackendSettings: (settings: BackendSettings) => {
    memoryCache.backendSettings = settings;
    syncDoc('settings/backendSettings', settings);
  }
};
