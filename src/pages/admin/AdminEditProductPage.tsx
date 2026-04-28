import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storage } from '../../utils/localStorage';
import { Product } from '../../types';
import { ImageUploadInput } from '../../components/admin/ImageUploadInput';

export default function AdminEditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Product | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  const categories = [
    'Premium Tuxedos',
    'Premium Suits',
    'Premium Koti Kurta',
    'Premium Kurta Pajama',
    'Premium Bomber Jackets'
  ];

  useEffect(() => {
    const fetchProduct = () => {
      if (!id) return;
      try {
        const products = storage.getProducts();
        const product = products.find(p => p.id === id);
        if (product) {
          // Ensure all new fields exist
          setFormData({
            ...product,
            slug: product.slug || '',
            collection: product.collection || '',
            images: product.images || [],
            productStory: product.productStory || '',
            stock: product.stock !== undefined ? product.stock : 10,
            lowStockThreshold: product.lowStockThreshold !== undefined ? product.lowStockThreshold : 5,
            visibility: product.visibility || 'public',
            featured: product.featured || false,
            readyToStitch: product.readyToStitch || false,
            readyToStitchInfo: product.readyToStitchInfo || ''
          });
        } else {
          navigate('/admin/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddImage = () => {
    if (formData && newImageUrl && !(formData.images || []).includes(newImageUrl)) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), newImageUrl]
      });
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    if (formData && formData.images) {
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      setFormData({
        ...formData,
        images: newImages
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent, visibilityOverride?: 'public' | 'hidden') => {
    e.preventDefault();
    if (!id || !formData) return;
    setIsSaving(true);

    try {
      const products = storage.getProducts();
      const updatedProducts = products.map(p => 
        p.id === id ? { 
          ...formData, 
          price: Number(formData.price), 
          stock: Number(formData.stock),
          visibility: visibilityOverride || formData.visibility,
          updatedAt: new Date().toISOString()
        } : p
      );
      storage.saveProducts(updatedProducts);
      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        alert('Storage limit exceeded. The uploaded images are too large. Please use smaller images or image URLs.');
      } else {
        alert('Failed to update product.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-divider border-t-brand-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/admin/products" className="p-2 hover:bg-brand-bg rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tight">Edit Product</h1>
          <p className="text-brand-secondary font-sans">Update {formData.name}</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="bg-white p-6 border border-brand-divider shadow-sm space-y-6">
            <h3 className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-divider pb-4">Basic Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Product ID (Read-only)</label>
                <input
                  type="text"
                  disabled
                  value={formData.id}
                  className="w-full bg-gray-50 border border-brand-divider px-4 py-3 font-sans text-brand-secondary cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. The Midnight Tuxedo"
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Slug (URL)</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. midnight-tuxedo"
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Story & Description */}
          <div className="bg-white p-6 border border-brand-divider shadow-sm space-y-6">
            <h3 className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-divider pb-4">Product Story & Details</h3>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Details</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the craftsmanship, fabric, and fit..."
                className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Product Story</label>
              <textarea
                rows={4}
                value={formData.productStory || ''}
                onChange={(e) => setFormData({ ...formData, productStory: e.target.value })}
                placeholder="The inspiration behind this piece..."
                className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black resize-none"
              />
            </div>
          </div>

          {/* Product Details (Accordions) */}
          <div className="bg-white p-6 border border-brand-divider shadow-sm space-y-6">
            <h3 className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-divider pb-4">Product Details</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Garment Format</label>
                <textarea
                  rows={2}
                  value={formData.garmentFormat || ''}
                  onChange={(e) => setFormData({ ...formData, garmentFormat: e.target.value })}
                  placeholder="e.g., This item is delivered as a premium ready-to-stitch fabric set..."
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Composition</label>
                <textarea
                  rows={2}
                  value={formData.composition || ''}
                  onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                  placeholder="e.g., 74% POLYESTER, 21% VISCOSE, 5% ELASTANE"
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Washing care</label>
                <textarea
                  rows={3}
                  value={formData.washingCare || ''}
                  onChange={(e) => setFormData({ ...formData, washingCare: e.target.value })}
                  placeholder="e.g., Do not wash, Do not bleach, Iron at low temperature..."
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Shipping</label>
                <textarea
                  rows={3}
                  value={formData.shipping || ''}
                  onChange={(e) => setFormData({ ...formData, shipping: e.target.value })}
                  placeholder="e.g., Home delivery: 48h/72h working days..."
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Returns</label>
                <textarea
                  rows={2}
                  value={formData.returns || ''}
                  onChange={(e) => setFormData({ ...formData, returns: e.target.value })}
                  placeholder="e.g., Items can be returned within 14 days..."
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black resize-none"
                />
              </div>
            </div>
          </div>

          {/* Ready-to-Stitch Info */}
          <div className="bg-white p-6 border border-brand-divider shadow-sm space-y-6">
            <h3 className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-divider pb-4">Ready-to-Stitch Info</h3>
            <div className="flex items-center justify-between">
              <label className="text-sm font-sans text-brand-black">Available as Ready-to-Stitch</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.readyToStitch || false}
                  onChange={(e) => setFormData({ ...formData, readyToStitch: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-black"></div>
              </label>
            </div>
            {formData.readyToStitch && (
              <div className="space-y-2 pt-4 border-t border-brand-divider">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Ready-to-Stitch Details</label>
                <textarea
                  rows={3}
                  value={formData.readyToStitchInfo || ''}
                  onChange={(e) => setFormData({ ...formData, readyToStitchInfo: e.target.value })}
                  placeholder="Provide details about the unstitched fabric, measurements, etc."
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black resize-none"
                />
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-white p-6 border border-brand-divider shadow-sm space-y-6">
            <h3 className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-divider pb-4">Images</h3>
            
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-32 flex-shrink-0">
                  <div className="aspect-[3/4] bg-brand-bg border border-brand-divider flex items-center justify-center relative overflow-hidden">
                    {formData.image ? (
                      <>
                        <img 
                          src={formData.image} 
                          alt="Primary Preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-secondary/50 hidden bg-brand-bg">
                          <ImageIcon size={24} />
                          <span className="text-[8px] uppercase tracking-widest mt-2">Invalid URL</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-brand-secondary/50">
                        <ImageIcon size={24} />
                        <span className="text-[8px] uppercase tracking-widest mt-2">No Image</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-2 block">Primary Image URL</label>
                  <ImageUploadInput
                    value={formData.image}
                    onChange={(val) => setFormData({ ...formData, image: val })}
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="text-xs text-brand-secondary font-sans mt-2">
                    This image will be used as the main thumbnail across the site. Use a 3:4 aspect ratio for best results.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-brand-divider">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-3 block">Gallery Images</label>
                <div className="flex gap-2 mb-6">
                  <div className="flex-1">
                    <ImageUploadInput
                      value={newImageUrl}
                      onChange={(val) => setNewImageUrl(val)}
                      placeholder="Add additional image URL..."
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddImage}
                    className="bg-brand-black text-white px-6 py-2 hover:bg-brand-black/90 transition-colors text-[10px] uppercase tracking-widest font-bold"
                  >
                    Add
                  </button>
                </div>
                
                {(formData.images || []).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(formData.images || []).map((img, index) => (
                      <div key={index} className="relative aspect-[3/4] bg-brand-bg border border-brand-divider group overflow-hidden">
                        <img 
                          src={img} 
                          alt={`Gallery ${index}`} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-secondary/50 hidden bg-brand-bg">
                          <ImageIcon size={20} />
                          <span className="text-[8px] uppercase tracking-widest mt-2">Invalid</span>
                        </div>
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="bg-white text-red-600 p-1.5 rounded-full hover:scale-110 transition-transform shadow-sm"
                            title="Remove Image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white p-6 border border-brand-divider shadow-sm space-y-4">
            <h3 className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-divider pb-4">Actions</h3>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'hidden')}
              disabled={isSaving}
              className="w-full bg-white text-brand-black border border-brand-black py-3 font-sans text-sm tracking-widest uppercase hover:bg-brand-bg transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'public')}
              disabled={isSaving}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? 'SAVING...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white p-6 border border-brand-divider shadow-sm space-y-6">
            <h3 className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-divider pb-4">Pricing & Stock</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Price (INR)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Stock</label>
                <input
                  type="number"
                  required
                  value={formData.stock !== undefined ? formData.stock : 10}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Low Stock Threshold</label>
                <input
                  type="number"
                  value={formData.lowStockThreshold !== undefined ? formData.lowStockThreshold : 5}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black"
                />
              </div>
            </div>
          </div>

          {/* Collection & Visibility */}
          <div className="bg-white p-6 border border-brand-divider shadow-sm space-y-6">
            <h3 className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-divider pb-4">Collection & Visibility</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Collection</label>
                <input
                  type="text"
                  value={formData.collection || ''}
                  onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                  placeholder="e.g. Summer 2026"
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black"
                />
              </div>
              
              <div className="space-y-2 pt-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Visibility Status</label>
                <select
                  value={formData.visibility || 'public'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' | 'hidden' })}
                  className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans focus:outline-none focus:border-brand-black"
                >
                  <option value="public">Public</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-brand-divider">
                <label className="text-sm font-sans text-brand-black">Featured Product</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-black"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
