"use client";

import { useState, useEffect } from "react";
import { X, Maximize2 } from "lucide-react";

interface PinterestGalleryProps {
  items: string[];
}

export function PinterestGallery({ items }: PinterestGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [selectedImage]);

  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {items.map((url, idx) => (
          <div 
            key={idx} 
            className="break-inside-avoid rounded-2xl overflow-hidden border border-white/5 shadow-lg group relative cursor-zoom-in bg-[var(--color-surface)]"
            onClick={() => setSelectedImage(url)}
          >
            <img 
              src={url} 
              className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]" 
              alt="" 
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
                    <Maximize2 size={20} />
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[310] border border-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X size={24} />
          </button>
          
          <img 
            src={selectedImage} 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
