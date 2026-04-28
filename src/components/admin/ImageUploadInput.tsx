import React, { useState } from 'react';

export const ImageUploadInput = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    setIsUploading(true);
    try {
      const compressedBase64 = await compressImage(file);
      onChange(compressedBase64);
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Failed to process image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder || "Image URL or upload..."} 
        className="w-full bg-brand-bg border border-brand-divider px-4 py-3 font-sans text-sm focus:outline-none focus:border-brand-black"
      />
      <button 
        type="button" 
        onClick={() => fileInputRef.current?.click()} 
        disabled={isUploading}
        className="px-6 bg-brand-black text-white text-[10px] uppercase tracking-widest font-bold whitespace-nowrap hover:bg-brand-black/90 transition-colors disabled:opacity-50"
      >
        {isUploading ? 'Processing...' : 'Upload'}
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileSelect} 
      />
    </div>
  );
};
