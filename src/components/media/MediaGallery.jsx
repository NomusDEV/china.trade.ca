import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Package, Play } from 'lucide-react';

export default function MediaGallery({ images = [], videos = [], alt = '', fallbackIcon: FallbackIcon = Package, aspect = 'aspect-square' }) {
  const media = [
    ...images.filter(Boolean).map((url) => ({ type: 'image', url })),
    ...videos.filter(Boolean).map((url) => ({ type: 'video', url })),
  ];
  const [active, setActive] = useState(0);
  const current = media[active];

  if (media.length === 0) {
    return (
      <div className={`${aspect} rounded-2xl bg-gradient-to-br from-[#C5A059]/15 to-[#E61D25]/10 flex items-center justify-center`}>
        <FallbackIcon className="w-16 h-16 text-[#C5A059]/60" />
      </div>
    );
  }

  const go = (step) => setActive((active + step + media.length) % media.length);

  return (
    <div>
      <div className={`relative ${aspect} rounded-2xl overflow-hidden bg-[#F0F0F0] dark:bg-[#111111] mb-3`}>
        {current.type === 'video' ? (
          <video src={current.url} controls playsInline className="w-full h-full object-contain bg-black" />
        ) : (
          <img src={current.url} alt={alt} className="w-full h-full object-cover" />
        )}
        {media.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {media.map((item, i) => (
            <button
              key={`${item.type}-${i}`}
              onClick={() => setActive(i)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                i === active ? 'border-[#E61D25]' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {item.type === 'video' ? (
                <>
                  <video src={item.url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </span>
                </>
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}