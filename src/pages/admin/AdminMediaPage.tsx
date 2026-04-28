import React, { useState, useEffect, useMemo, useRef } from 'react';
import { storage } from '../../utils/localStorage';
import { MediaItem } from '../../types';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  RefreshCw, 
  Trash2, 
  Image as ImageIcon,
  Calendar,
  Tag,
  X,
  Upload,
  CheckCircle2,
  MoreVertical,
  Download,
  Info,
  Loader2,
  FileImage,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | MediaItem['type']>('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const [itemToReplace, setItemToReplace] = useState<MediaItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  const [deleteSafetyInfo, setDeleteSafetyInfo] = useState<{ inUse: boolean; locations: string[] } | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    name: '',
    url: '',
    type: 'other' as MediaItem['type'],
    size: '',
    dimensions: ''
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMedia();
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const loadMedia = () => {
    const allMedia = storage.getMedia();
    setMedia(allMedia);
  };

  const filteredMedia = useMemo(() => {
    return media.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || item.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [media, searchTerm, filterType]);

  const compressImage = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    try {
      const compressedBase64 = await compressImage(file);
      
      // Calculate size of compressed base64 (approximate)
      const sizeInBytes = Math.round((compressedBase64.length * 3) / 4);
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      const sizeStr = `${sizeInMB} MB`;

      // Get dimensions
      const img = new Image();
      img.onload = () => {
        const dimensions = `${img.width}x${img.height}`;
        setPreviewUrl(compressedBase64);
        setUploadForm(prev => ({
          ...prev,
          url: compressedBase64,
          name: prev.name || file.name.split('.')[0],
          size: sizeStr,
          dimensions: dimensions
        }));
      };
      img.src = compressedBase64;
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Failed to process image.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name || !uploadForm.url) return;

    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      if (replaceMode && itemToReplace) {
        // Replace Mode
        const updatedItem: MediaItem = {
          ...itemToReplace,
          name: uploadForm.name,
          url: uploadForm.url,
          type: uploadForm.type,
          uploadDate: new Date().toISOString(),
          dimensions: uploadForm.dimensions || itemToReplace.dimensions,
          size: uploadForm.size || itemToReplace.size
        };

        // Propagate changes to other storage keys
        storage.replaceMediaUrl(itemToReplace.url, uploadForm.url);
        storage.updateMedia(updatedItem);
      } else {
        // Normal Upload Mode
        const newItem: MediaItem = {
          id: `media-${Date.now()}`,
          name: uploadForm.name,
          url: uploadForm.url,
          type: uploadForm.type,
          uploadDate: new Date().toISOString(),
          dimensions: uploadForm.dimensions || '1920x1080',
          size: uploadForm.size || '0.5 MB'
        };

        storage.addMedia(newItem);
      }

      loadMedia();
      setIsUploading(false);
      setUploadSuccess(true);

      // Reset after success message
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(false);
        setUploadForm({ name: '', url: '', type: 'other', size: '', dimensions: '' });
        setPreviewUrl(null);
        setReplaceMode(false);
        setItemToReplace(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error saving media:', error);
      setIsUploading(false);
      if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
        alert('Storage limit exceeded. The uploaded images are too large. Please use smaller images or image URLs.');
      } else {
        alert('Failed to save media.');
      }
    }
  };

  const handleDelete = (item: MediaItem) => {
    const safety = storage.isMediaInUse(item.url);
    setDeleteSafetyInfo(safety);
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      storage.deleteMedia(itemToDelete.id);
      loadMedia();
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteSafetyInfo(null);
    }
  };

  const handleReplace = (item: MediaItem) => {
    setReplaceMode(true);
    setItemToReplace(item);
    setUploadForm({
      name: item.name,
      url: item.url,
      type: item.type,
      size: item.size || '',
      dimensions: item.dimensions || ''
    });
    setPreviewUrl(item.url);
    setIsUploadModalOpen(true);
  };

  const TypeBadge = ({ type }: { type: MediaItem['type'] }) => {
    const styles = {
      product: 'bg-blue-50/50 text-blue-700 border-blue-100/50',
      homepage: 'bg-emerald-50/50 text-emerald-700 border-emerald-100/50',
      content: 'bg-purple-50/50 text-purple-700 border-purple-100/50',
      other: 'bg-slate-50/50 text-slate-700 border-slate-100/50'
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.15em] border backdrop-blur-sm ${styles[type]}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-32 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 pt-4 border-b border-brand-divider -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-bg border border-brand-divider rounded-full">
            <div className="w-1.5 h-1.5 bg-brand-black rounded-full animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-secondary">System Asset Manager</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display tracking-tight text-brand-black">Media Assets</h1>
          <p className="text-brand-secondary text-sm sm:text-base font-sans max-w-2xl leading-relaxed">
            Centralized management for all visual assets. Upload, organize, and monitor image usage across the Luxardo platform with precision and ease.
          </p>
        </div>
        
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="group relative flex items-center justify-center gap-3 px-10 py-5 bg-brand-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-black/90 transition-all shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <Upload size={16} className="relative z-10" />
          <span className="relative z-10">Upload New Asset</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="sticky top-[140px] lg:top-[120px] z-20 flex flex-col lg:flex-row gap-6 items-stretch lg:items-center bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-brand-divider/50 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-black transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search assets by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-brand-divider focus:border-brand-black outline-none transition-all text-sm font-sans shadow-sm rounded-lg"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-5 py-4 border border-brand-divider shadow-sm min-w-[220px] rounded-lg group focus-within:border-brand-black transition-colors">
            <Filter size={16} className="text-brand-secondary" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-transparent text-[10px] font-bold outline-none focus:ring-0 cursor-pointer uppercase tracking-[0.15em] w-full"
            >
              <option value="all">All Categories</option>
              <option value="product">Products</option>
              <option value="homepage">Homepage</option>
              <option value="content">Content</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 px-4 py-4 bg-white border border-brand-divider rounded-lg shadow-sm">
            <ImageIcon size={16} className="text-brand-secondary" />
            <span className="text-[10px] font-bold text-brand-black uppercase tracking-widest">{filteredMedia.length} Assets</span>
          </div>

          {(searchTerm || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="px-4 py-4 text-[10px] font-bold text-red-600 uppercase tracking-widest hover:bg-red-50 transition-colors rounded-lg border border-red-100"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-brand-bg animate-pulse border border-brand-divider rounded-sm" />
          ))
        ) : filteredMedia.map((item, index) => (
          <motion.div
            layout
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white border border-brand-divider overflow-hidden hover:border-brand-black transition-all duration-700 shadow-sm hover:shadow-2xl rounded-sm"
          >
            {/* Image Preview */}
            <div className="relative aspect-[4/5] overflow-hidden bg-brand-bg">
              <img
                src={item.url}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Type Badge Overlay */}
              <div className="absolute top-4 left-4 z-10 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                <TypeBadge type={item.type} />
              </div>

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsPreviewModalOpen(true);
                    }}
                    className="p-4 bg-white text-brand-black rounded-full hover:bg-brand-black hover:text-white transition-all transform translate-y-8 group-hover:translate-y-0 duration-500 shadow-xl"
                    title="View Full Size"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => handleReplace(item)}
                    className="p-4 bg-white text-brand-black rounded-full hover:bg-brand-black hover:text-white transition-all transform translate-y-8 group-hover:translate-y-0 duration-500 delay-75 shadow-xl"
                    title="Replace Asset"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(item)}
                  className="flex items-center gap-2 px-6 py-2 bg-red-500/10 text-red-100 border border-red-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all transform translate-y-8 group-hover:translate-y-0 duration-500 delay-150"
                >
                  <Trash2 size={12} />
                  Delete Asset
                </button>
              </div>
            </div>

            {/* Info Area */}
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-bold text-brand-black uppercase tracking-widest truncate flex-1">{item.name}</h3>
                <div className="flex items-center gap-1 text-[9px] text-brand-secondary font-mono">
                  <ImageIcon size={10} />
                  {item.dimensions || 'N/A'}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[9px] text-brand-secondary uppercase tracking-widest font-medium border-t border-brand-divider/50 pt-3">
                <div className="flex items-center gap-1.5">
                  <Calendar size={10} />
                  {format(new Date(item.uploadDate), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-1.5">
                  <Info size={10} />
                  {item.size || 'N/A'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredMedia.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white border border-brand-divider border-dashed">
            <div className="flex flex-col items-center gap-4 text-brand-secondary">
              <ImageIcon size={48} className="opacity-10" />
              <p className="text-sm italic font-sans">No media assets found matching your search.</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
              onClick={() => {
                if (!isUploading) setIsUploadModalOpen(false);
              }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-brand-divider flex items-center justify-between bg-brand-bg/30">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-brand-black text-white rounded-sm">
                    {replaceMode ? <RefreshCw size={16} /> : <Upload size={16} />}
                  </div>
                  <h2 className="text-xl font-display tracking-tight">
                    {replaceMode ? 'Replace Asset' : 'Upload New Asset'}
                  </h2>
                </div>
                {!isUploading && (
                  <button 
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      setPreviewUrl(null);
                      setUploadForm({ name: '', url: '', type: 'other', size: '', dimensions: '' });
                      setReplaceMode(false);
                      setItemToReplace(null);
                    }} 
                    className="p-2 hover:bg-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {uploadSuccess ? (
                <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 size={32} />
                  </motion.div>
                  <h3 className="text-xl font-display">
                    {replaceMode ? 'Asset Replaced' : 'Upload Successful'}
                  </h3>
                  <p className="text-brand-secondary text-sm font-sans">
                    {replaceMode 
                      ? 'The asset has been updated across the platform.' 
                      : 'The asset has been added to your library.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleUpload} className="p-8 space-y-6">
                  {/* Dropzone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative aspect-video border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
                      isDragging 
                        ? 'border-brand-black bg-brand-bg' 
                        : 'border-brand-divider hover:border-brand-black bg-brand-bg/30'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />

                    {previewUrl ? (
                      <div className="absolute inset-0 group">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-[10px] font-bold uppercase tracking-widest">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2 p-8">
                        <div className="w-12 h-12 bg-white border border-brand-divider rounded-full flex items-center justify-center mx-auto shadow-sm">
                          <Upload size={20} className="text-brand-secondary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-brand-black">Drag and drop or click to upload</p>
                          <p className="text-[10px] text-brand-secondary uppercase tracking-wider">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Asset Name</label>
                      <input
                        type="text"
                        required
                        value={uploadForm.name}
                        onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                        placeholder="e.g., Summer Collection Hero"
                        className="w-full px-4 py-3 bg-brand-bg/30 border border-brand-divider focus:border-brand-black outline-none transition-all text-sm font-sans"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Usage Category</label>
                      <select
                        value={uploadForm.type}
                        onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as any })}
                        className="w-full px-4 py-3 bg-brand-bg/30 border border-brand-divider focus:border-brand-black outline-none transition-all text-sm font-sans cursor-pointer"
                      >
                        <option value="product">Product</option>
                        <option value="homepage">Homepage</option>
                        <option value="content">Content</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Or use Image URL</label>
                    <input
                      type="url"
                      value={uploadForm.url.startsWith('data:') ? '' : uploadForm.url}
                      onChange={(e) => {
                        setUploadForm({ ...uploadForm, url: e.target.value });
                        setPreviewUrl(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-3 bg-brand-bg/30 border border-brand-divider focus:border-brand-black outline-none transition-all text-sm font-sans"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isUploading || !uploadForm.url}
                      className="w-full py-4 bg-brand-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-brand-black/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          {replaceMode ? 'Replacing...' : 'Uploading...'}
                        </>
                      ) : (
                        replaceMode ? 'Update Asset' : 'Add to Library'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && itemToDelete && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white overflow-hidden shadow-2xl"
              >
                <div className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-display tracking-tight">Delete Asset?</h3>
                    <p className="text-brand-secondary text-sm font-sans">
                      Are you sure you want to remove <span className="font-medium text-brand-black">"{itemToDelete.name}"</span>? This action cannot be undone.
                    </p>
                  </div>

                  {deleteSafetyInfo?.inUse && (
                    <div className="p-4 bg-amber-50 border border-amber-100 text-left space-y-2 rounded-sm">
                      <div className="flex items-center gap-2 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                        <AlertTriangle size={14} />
                        Warning: Asset is in use
                      </div>
                      <div className="text-[11px] text-amber-800/80 font-sans leading-relaxed">
                        This image is currently referenced in:
                        <ul className="mt-1 list-disc list-inside opacity-80">
                          {deleteSafetyInfo.locations.map((loc, idx) => (
                            <li key={idx}>{loc}</li>
                          ))}
                        </ul>
                        Deleting it will result in broken images at these locations.
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="flex-1 py-4 border border-brand-divider text-[10px] font-bold uppercase tracking-widest hover:bg-brand-bg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="flex-1 py-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewModalOpen && selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 lg:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
              onClick={() => setIsPreviewModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] lg:max-h-full flex flex-col lg:flex-row bg-white overflow-hidden shadow-2xl rounded-sm"
            >
              {/* Image View */}
              <div className="flex-1 bg-brand-bg flex items-center justify-center overflow-hidden min-h-[300px] lg:min-h-0">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.name}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain p-4 lg:p-0"
                />
              </div>

              {/* Details Sidebar */}
              <div className="w-full lg:w-96 bg-white p-6 lg:p-10 space-y-8 border-t lg:border-t-0 lg:border-l border-brand-divider overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-display tracking-tight">Asset Details</h2>
                  <button onClick={() => setIsPreviewModalOpen(false)} className="p-2 hover:bg-brand-bg transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase tracking-widest text-brand-secondary font-bold">Name</div>
                    <div className="text-sm text-brand-black font-medium">{selectedItem.name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase tracking-widest text-brand-secondary font-bold">Category</div>
                    <TypeBadge type={selectedItem.type} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase tracking-widest text-brand-secondary font-bold">Upload Date</div>
                    <div className="text-sm text-brand-black font-medium">{format(new Date(selectedItem.uploadDate), 'MMMM d, yyyy')}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase tracking-widest text-brand-secondary font-bold">Dimensions</div>
                    <div className="text-sm text-brand-black font-medium">{selectedItem.dimensions || 'N/A'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase tracking-widest text-brand-secondary font-bold">URL</div>
                    <div className="text-[10px] text-brand-secondary break-all font-mono bg-brand-bg p-3 border border-brand-divider">
                      {selectedItem.url}
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedItem.url);
                      setShowCopyToast(true);
                      setTimeout(() => setShowCopyToast(false), 2000);
                    }}
                    className="w-full py-4 bg-brand-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-brand-black/90 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} className={showCopyToast ? 'block' : 'hidden'} />
                    {showCopyToast ? 'URL Copied' : 'Copy Asset URL'}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedItem)}
                    className="w-full py-4 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
