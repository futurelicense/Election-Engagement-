import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { UploadIcon, XIcon } from 'lucide-react';
interface FileUploadProps {
  label?: string;
  accept?: string;
  value?: string;
  onChange: (file: File | null, preview: string | null) => void;
}
export function FileUpload({
  label,
  accept = 'image/*',
  value,
  onChange
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress image to reduce base64 size
        const compressedDataUrl = await compressImage(file);
        setPreview(compressedDataUrl);
        onChange(file, compressedDataUrl);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPreview(result);
          onChange(file, result);
        };
        reader.readAsDataURL(file);
      }
    }
  };
  const handleRemove = () => {
    setPreview(null);
    onChange(null, null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>}

      {preview ? <div className="relative inline-block">
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200" />
          <button type="button" onClick={handleRemove} className="absolute -top-2 -right-2 p-1 bg-african-red text-white rounded-full hover:bg-red-600 transition-colors">
            <XIcon className="w-4 h-4" />
          </button>
        </div> : <div>
          <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="sr-only" id="file-upload" />
          <label htmlFor="file-upload">
            <Button type="button" variant="secondary" size="md" onClick={() => inputRef.current?.click()} className="cursor-pointer">
              <UploadIcon className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </label>
        </div>}
    </div>;
}