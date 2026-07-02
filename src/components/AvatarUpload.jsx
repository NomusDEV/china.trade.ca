import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Loader2 } from 'lucide-react';

export default function AvatarUpload({ currentAvatar, onUploaded, size = 'lg', lang = 'ru' }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatar || '');

  const sizeClass = size === 'lg' ? 'w-24 h-24' : 'w-12 h-12';
  const iconSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPreview(file_url);
      onUploaded(file_url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={`${sizeClass} rounded-full overflow-hidden border-2 border-black/10 dark:border-white/10 flex items-center justify-center bg-black/5 dark:bg-white/5 group relative`}
      >
        {preview ? (
          <img src={preview} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <Camera className={`${iconSize} text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30`} />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className={`${iconSize} text-white`} />
        </div>
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}