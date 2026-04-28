import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Edit2, Trash2, Image as ImageIcon, Check, X } from 'lucide-react';
import { ImageUploadInput } from '../../components/admin/ImageUploadInput';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

interface Collection {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  bannerImageUrl: string;
  heroImageUrl: string;
  isVisible: boolean;
  sortOrder: number;
}

const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'tuxedos',
    name: 'Premium Tuxedos',
    slug: 'tuxedos',
    shortDescription: 'Make a statement at your next formal event.',
    longDescription: 'Our Premium Tuxedos are designed for those who demand the best. Impeccable tailoring and luxurious fabrics ensure you look your absolute best.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae46af504?auto=format&fit=crop&q=80&w=2000',
    heroImageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae46af504?auto=format&fit=crop&q=80&w=800',
    isVisible: true,
    sortOrder: 1,
  },
  {
    id: 'suits',
    name: 'Premium Suits',
    slug: 'suits',
    shortDescription: 'Structured silhouettes and sharp lines for the discerning modern gentleman.',
    longDescription: 'The Suit collection is an exercise in discipline. We strip away the unnecessary to reveal the power of perfect proportions and superior construction.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=2000',
    heroImageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=800',
    isVisible: true,
    sortOrder: 2,
  },
  {
    id: 'koti-kurta',
    name: 'Premium Koti Kurta',
    slug: 'koti-kurta',
    shortDescription: 'A refined fusion of traditional silhouettes and contemporary tailoring.',
    longDescription: 'Koti Kurta sets bridge the gap between ceremony and celebration. They offer a versatile elegance that transitions seamlessly from formal rituals to social gatherings.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1621335829175-95f437384d7c?auto=format&fit=crop&q=80&w=2000',
    heroImageUrl: 'https://images.unsplash.com/photo-1621335829175-95f437384d7c?auto=format&fit=crop&q=80&w=800',
    isVisible: true,
    sortOrder: 3,
  },
  {
    id: 'kurta-pajama',
    name: 'Premium Kurta Pajama',
    slug: 'kurta-pajama',
    shortDescription: 'Timeless elegance redefined through meticulous craftsmanship and selected fabrics.',
    longDescription: 'The Kurta Pajama sets represent the soul of Luxardo. Each piece is a dialogue between heritage and modernity, designed for the man who values quiet confidence.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=2000',
    heroImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800',
    isVisible: true,
    sortOrder: 4,
  },
  {
    id: 'bomber-jackets',
    name: 'Premium Bomber Jackets',
    slug: 'bomber-jackets',
    shortDescription: 'Elevated casual wear featuring precision finishing and premium materials.',
    longDescription: 'The Bomber Jackets redefine luxury leisure. They are designed for the man whose life is in constant motion but whose standards never waver.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=2000',
    heroImageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
    isVisible: true,
    sortOrder: 5,
  },
];

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Collection | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('luxardo_admin_collections');
    if (stored) {
      try {
        setCollections(JSON.parse(stored));
      } catch (e) {
        setCollections(DEFAULT_COLLECTIONS);
      }
    } else {
      setCollections(DEFAULT_COLLECTIONS);
      localStorage.setItem('luxardo_admin_collections', JSON.stringify(DEFAULT_COLLECTIONS));
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (collection: Collection) => {
    setEditingId(collection.id);
    setIsAdding(false);
    setFormData({ ...collection });
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      id: Date.now().toString(),
      name: '',
      slug: '',
      shortDescription: '',
      longDescription: '',
      bannerImageUrl: '',
      heroImageUrl: '',
      isVisible: true,
      sortOrder: collections.length + 1,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData(null);
  };

  const handleSave = () => {
    if (!formData) return;

    let updatedCollections;
    if (isAdding) {
      updatedCollections = [...collections, formData];
    } else {
      updatedCollections = collections.map(c => 
        c.id === formData.id ? formData : c
      );
    }
    
    // Sort by sortOrder
    updatedCollections.sort((a, b) => a.sortOrder - b.sortOrder);

    try {
      localStorage.setItem('luxardo_admin_collections', JSON.stringify(updatedCollections));
      setCollections(updatedCollections);
      setEditingId(null);
      setIsAdding(false);
      setFormData(null);
    } catch (error: any) {
      console.error('Error saving collections:', error);
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        alert('Storage limit exceeded. The uploaded images are too large. Please use smaller images or image URLs.');
      } else {
        alert('Failed to save collection.');
      }
    }
    showToast(isAdding ? 'Collection added successfully' : 'Collection saved successfully');
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const updatedCollections = collections.filter(c => c.id !== itemToDelete);
      setCollections(updatedCollections);
      localStorage.setItem('luxardo_admin_collections', JSON.stringify(updatedCollections));
      showToast('Collection deleted successfully');
      setItemToDelete(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'sortOrder') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-none shadow-lg z-50 flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span className="font-sans text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-display mb-2">Collections</h1>
          <p className="text-brand-secondary font-sans tracking-wide">Manage your product collections and categories.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="px-6 py-3 bg-brand-black text-white text-xs font-sans tracking-widest uppercase hover:bg-brand-black/90 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Collection
        </button>
      </div>

      <div className="space-y-6">
        {isAdding && formData && (
          <div className="bg-white border border-brand-divider p-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center border-b border-brand-divider pb-4 mb-4">
                <h3 className="font-display text-xl">Add New Collection</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-sans tracking-widest uppercase text-brand-secondary hover:text-brand-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-sans tracking-widest uppercase bg-brand-black text-white hover:bg-brand-black/90 transition-colors flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Collection Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-brand-divider px-4 py-2 font-sans text-sm focus:outline-none focus:border-brand-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Slug</label>
                    <input 
                      type="text" 
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full border border-brand-divider px-4 py-2 font-sans text-sm focus:outline-none focus:border-brand-black transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Sort Order</label>
                      <input 
                        type="number" 
                        name="sortOrder"
                        value={formData.sortOrder}
                        onChange={handleChange}
                        className="w-full border border-brand-divider px-4 py-2 font-sans text-sm focus:outline-none focus:border-brand-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Visibility</label>
                      <select
                        name="isVisible"
                        value={formData.isVisible ? "true" : "false"}
                        onChange={(e) => setFormData({...formData, isVisible: e.target.value === "true"})}
                        className="w-full border border-brand-divider px-4 py-2 font-sans text-sm focus:outline-none focus:border-brand-black transition-colors"
                      >
                        <option value="true">Visible</option>
                        <option value="false">Hidden</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Short Description</label>
                    <textarea 
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleChange}
                      rows={2}
                      className="w-full border border-brand-divider px-4 py-2 font-sans text-sm focus:outline-none focus:border-brand-black transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Long Description</label>
                    <textarea 
                      name="longDescription"
                      value={formData.longDescription}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border border-brand-divider px-4 py-2 font-sans text-sm focus:outline-none focus:border-brand-black transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brand-divider">
                <div>
                  <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Banner Image URL</label>
                  <div className="mb-4">
                    <ImageUploadInput 
                      value={formData.bannerImageUrl}
                      onChange={(val) => setFormData({ ...formData, bannerImageUrl: val })}
                    />
                  </div>
                  <div className="aspect-[21/9] bg-brand-bg border border-brand-divider relative overflow-hidden flex items-center justify-center">
                    {formData.bannerImageUrl ? (
                      <img src={formData.bannerImageUrl} alt="Banner Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                      <div className="text-brand-secondary flex flex-col items-center">
                        <ImageIcon size={24} className="mb-2 opacity-50" />
                        <span className="text-xs uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Hero Image URL</label>
                  <div className="mb-4">
                    <ImageUploadInput 
                      value={formData.heroImageUrl}
                      onChange={(val) => setFormData({ ...formData, heroImageUrl: val })}
                    />
                  </div>
                  <div className="aspect-[4/3] bg-brand-bg border border-brand-divider relative overflow-hidden flex items-center justify-center">
                    {formData.heroImageUrl ? (
                      <img src={formData.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                      <div className="text-brand-secondary flex flex-col items-center">
                        <ImageIcon size={24} className="mb-2 opacity-50" />
                        <span className="text-xs uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {collections.map((collection) => (
          <div key={collection.id} className="bg-white border border-brand-divider p-6">
            {editingId === collection.id && formData ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center border-b border-brand-divider pb-4 mb-4">
                  <h3 className="font-display text-xl">Edit Collection</h3>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm font-sans tracking-widest uppercase text-brand-secondary hover:text-brand-black transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="px-4 py-2 text-sm font-sans tracking-widest uppercase bg-brand-black text-white hover:bg-brand-black/90 transition-colors flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Collection Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-brand-divider px-4 py-2 font-sans text-sm focus:outline-none focus:border-brand-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Slug</label>
                      <input 
                        type="text" 
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className="w-full border border-brand-divider px-4 py-2 font-sans text-sm focus:outline-none focus:border-brand-black transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Sort Order</label>
                        <input 
                          type="number" 
                          name="sortOrder"
                          value={formData.sortOrder}
                          onChange={handleChange}
                          className="w-full border border-brand-divider px-4 py-2 font-sans text-sm focus:outline-none focus:border-brand-black transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Visibility</label>
                        <select
                          name="isVisible"
                          value={formData.isVisible ? "true" : "false"}
                          onChange={(e) => setFormData({...formData, isVisible: e.target.value === "true"})}
                          className="w-full border border-brand-divider px-4 py-2 font-sans text-sm focus:outline-none focus:border-brand-black transition-colors"
                        >
                          <option value="true">Visible</option>
                          <option value="false">Hidden</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Short Description</label>
                      <textarea 
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        rows={2}
                        className="w-full border border-brand-divider px-4 py-2 font-sans text-sm focus:outline-none focus:border-brand-black transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Long Description</label>
                      <textarea 
                        name="longDescription"
                        value={formData.longDescription}
                        onChange={handleChange}
                        rows={4}
                        className="w-full border border-brand-divider px-4 py-2 font-sans text-sm focus:outline-none focus:border-brand-black transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brand-divider">
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Banner Image URL</label>
                    <div className="mb-4">
                      <ImageUploadInput 
                        value={formData.bannerImageUrl}
                        onChange={(val) => setFormData({ ...formData, bannerImageUrl: val })}
                      />
                    </div>
                    <div className="aspect-[21/9] bg-brand-bg border border-brand-divider relative overflow-hidden flex items-center justify-center">
                      {formData.bannerImageUrl ? (
                        <img src={formData.bannerImageUrl} alt="Banner Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      ) : (
                        <div className="text-brand-secondary flex flex-col items-center">
                          <ImageIcon size={24} className="mb-2 opacity-50" />
                          <span className="text-xs uppercase tracking-widest">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-sans tracking-widest uppercase text-brand-secondary mb-2">Hero Image URL</label>
                    <div className="mb-4">
                      <ImageUploadInput 
                        value={formData.heroImageUrl}
                        onChange={(val) => setFormData({ ...formData, heroImageUrl: val })}
                      />
                    </div>
                    <div className="aspect-[4/3] bg-brand-bg border border-brand-divider relative overflow-hidden flex items-center justify-center">
                      {formData.heroImageUrl ? (
                        <img src={formData.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      ) : (
                        <div className="text-brand-secondary flex flex-col items-center">
                          <ImageIcon size={24} className="mb-2 opacity-50" />
                          <span className="text-xs uppercase tracking-widest">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-24 h-24 bg-brand-bg border border-brand-divider shrink-0 overflow-hidden">
                  {collection.heroImageUrl ? (
                    <img src={collection.heroImageUrl} alt={collection.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-secondary">
                      <ImageIcon size={20} className="opacity-50" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-xl">{collection.name}</h3>
                    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest ${collection.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {collection.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-sm text-brand-secondary font-sans tracking-wide mb-2">/{collection.slug}</p>
                  <p className="text-sm font-sans line-clamp-2">{collection.shortDescription}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center px-4 border-r border-brand-divider">
                    <span className="block text-xs text-brand-secondary uppercase tracking-widest mb-1">Order</span>
                    <span className="font-sans text-lg">{collection.sortOrder}</span>
                  </div>
                  <button 
                    onClick={() => handleEdit(collection)}
                    className="p-2 text-brand-secondary hover:text-brand-black transition-colors"
                    title="Edit Collection"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(collection.id)}
                    className="p-2 text-brand-secondary hover:text-red-600 transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Collection"
        message="Are you sure you want to delete this collection? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
