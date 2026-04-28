import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { Plus, Search, Edit2, Trash2, ExternalLink, Eye, EyeOff, Star, Image as ImageIcon, Filter, Copy, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storage } from '../../utils/localStorage';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCollection, setFilterCollection] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = () => {
      const productsData = storage.getProducts();
      setProducts(productsData);
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const updatedProducts = products.filter(p => p.id !== itemToDelete);
      storage.saveProducts(updatedProducts);
      setProducts(updatedProducts);
      setItemToDelete(null);
    }
  };

  const handleDuplicate = (id: string) => {
    const productToDuplicate = products.find(p => p.id === id);
    if (!productToDuplicate) return;

    const newId = `${productToDuplicate.id}-copy-${Date.now().toString().slice(-4)}`;
    const duplicatedProduct: Product = {
      ...productToDuplicate,
      id: newId,
      name: `${productToDuplicate.name} (Copy)`,
      visibility: 'hidden', // Safe default for duplicates
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedProducts = [duplicatedProduct, ...products];
    storage.saveProducts(updatedProducts);
    setProducts(updatedProducts);
  };

  const toggleVisibility = (id: string) => {
    const updatedProducts = products.map(p => {
      if (p.id === id) {
        return { ...p, visibility: p.visibility === 'hidden' ? 'public' : 'hidden' as 'public' | 'hidden' };
      }
      return p;
    });
    storage.saveProducts(updatedProducts);
    setProducts(updatedProducts);
  };

  const toggleFeatured = (id: string) => {
    const updatedProducts = products.map(p => {
      if (p.id === id) {
        return { ...p, featured: !p.featured };
      }
      return p;
    });
    storage.saveProducts(updatedProducts);
    setProducts(updatedProducts);
  };

  const collections = useMemo(() => {
    const cols = new Set<string>();
    products.forEach(p => {
      if (p.collection) cols.add(p.collection);
    });
    return Array.from(cols).sort();
  }, [products]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;

      // Collection
      const matchesCollection = filterCollection === 'all' || 
                                product.collection === filterCollection;
      
      // Visibility
      const matchesVisibility = filterVisibility === 'all' || 
                                product.visibility === filterVisibility;
      
      // Stock
      let matchesStock = true;
      if (filterStock === 'in_stock') matchesStock = product.stock !== undefined && product.stock > 0;
      if (filterStock === 'low_stock') matchesStock = product.stock !== undefined && product.stock > 0 && product.stock < 5;
      if (filterStock === 'out_of_stock') matchesStock = product.stock === 0;

      // Featured
      const matchesFeatured = filterFeatured === 'all' || 
                              (filterFeatured === 'featured' ? product.featured : !product.featured);

      return matchesSearch && matchesCategory && matchesCollection && matchesVisibility && matchesStock && matchesFeatured;
    });
  }, [products, searchTerm, filterCategory, filterCollection, filterVisibility, filterStock, filterFeatured]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tight">Product Catalog</h1>
          <p className="text-brand-secondary font-sans mt-1">Manage your luxury inventory</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 px-6 py-3">
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      <div className="bg-white border border-brand-divider shadow-sm">
        <div className="p-6 border-b border-brand-divider space-y-4">
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-bg border border-brand-divider pl-12 pr-10 py-3 font-sans focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-black"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-brand-secondary" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Filters:</span>
            </div>
            
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-brand-bg border border-brand-divider px-3 py-2 font-sans text-xs focus:outline-none focus:border-brand-black"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={filterCollection}
              onChange={(e) => setFilterCollection(e.target.value)}
              className="bg-brand-bg border border-brand-divider px-3 py-2 font-sans text-xs focus:outline-none focus:border-brand-black"
            >
              <option value="all">All Collections</option>
              {collections.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value)}
              className="bg-brand-bg border border-brand-divider px-3 py-2 font-sans text-xs focus:outline-none focus:border-brand-black"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="hidden">Hidden</option>
            </select>

            <select 
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="bg-brand-bg border border-brand-divider px-3 py-2 font-sans text-xs focus:outline-none focus:border-brand-black"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select 
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value)}
              className="bg-brand-bg border border-brand-divider px-3 py-2 font-sans text-xs focus:outline-none focus:border-brand-black"
            >
              <option value="all">All Featured Status</option>
              <option value="featured">Featured</option>
              <option value="standard">Standard</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg/50 border-b border-brand-divider">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary whitespace-nowrap">Product</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary whitespace-nowrap">Collection</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary whitespace-nowrap">Price</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary whitespace-nowrap">Stock</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary whitespace-nowrap">Visibility</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary whitespace-nowrap">Featured</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary whitespace-nowrap">Last Updated</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-secondary text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-brand-divider border-t-brand-black rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-20 text-center font-sans text-brand-secondary">
                    No products found matching your search and filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-bg/30 transition-colors group">
                    <td className="px-6 py-4 min-w-[280px]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-brand-bg overflow-hidden flex-shrink-0 border border-brand-divider relative flex items-center justify-center">
                          {product.image ? (
                            <>
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center text-brand-secondary/30 hidden bg-brand-bg">
                                <ImageIcon size={16} />
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-brand-secondary/30 bg-brand-bg">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-display text-base text-brand-black line-clamp-1">{product.name}</p>
                          <p className="text-[10px] font-sans text-brand-secondary mt-1">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-sans text-brand-black">
                        {product.collection || product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-sans text-sm text-brand-black whitespace-nowrap">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${product.stock === 0 ? 'bg-red-500' : product.stock && product.stock < 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className={`font-sans text-xs ${product.stock === 0 ? 'text-red-600' : product.stock && product.stock < 5 ? 'text-amber-600' : 'text-brand-black'}`}>
                          {product.stock !== undefined ? `${product.stock} in stock` : 'Unlimited'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleVisibility(product.id)}
                        className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-2 py-1 border transition-colors ${
                          product.visibility === 'hidden' 
                            ? 'bg-brand-bg text-brand-secondary border-brand-divider hover:border-brand-black' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400'
                        }`}
                        title={product.visibility === 'hidden' ? "Make Public" : "Hide Product"}
                      >
                        {product.visibility === 'hidden' ? <EyeOff size={12} /> : <Eye size={12} />}
                        {product.visibility === 'hidden' ? 'Hidden' : 'Public'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleFeatured(product.id)}
                        className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-2 py-1 border transition-colors ${
                          product.featured 
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400' 
                            : 'bg-brand-bg text-brand-secondary border-brand-divider hover:border-brand-black'
                        }`}
                        title={product.featured ? "Remove from Featured" : "Mark as Featured"}
                      >
                        <Star size={12} className={product.featured ? "fill-amber-500 text-amber-500" : ""} />
                        {product.featured ? 'Featured' : 'Standard'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs font-sans text-brand-secondary whitespace-nowrap">
                      {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : (product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A')}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1">
                        <Link 
                          to={`/product/${product.id}`} 
                          target="_blank"
                          className="p-2 rounded-md text-brand-secondary hover:bg-gray-100 hover:text-brand-black transition-colors"
                          title="View on Site"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDuplicate(product.id)}
                          className="p-2 rounded-md text-brand-secondary hover:bg-gray-100 hover:text-brand-black transition-colors"
                          title="Duplicate Product"
                        >
                          <Copy size={16} />
                        </button>
                        <Link 
                          to={`/admin/products/${product.id}/edit`}
                          className="p-2 rounded-md text-brand-secondary hover:bg-gray-100 hover:text-brand-black transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-md text-brand-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
