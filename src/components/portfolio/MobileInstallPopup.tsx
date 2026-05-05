"use client";

import { useState, useEffect } from "react";
import { Download, X, Zap } from "lucide-react";
import Image from "next/image";

interface MobileInstallPopupProps {
  locale: string;
}

export function MobileInstallPopup({ locale }: MobileInstallPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    // Also check window width as fallback
    const isSmallScreen = window.innerWidth < 768;

    if (isMobile || isSmallScreen) {
      // Show after a short delay
      const timer = setTimeout(() => {
        const hasDismissed = localStorage.getItem("install-popup-dismissed");
        if (!hasDismissed) {
          setIsVisible(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem("install-popup-dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[200] animate-in slide-in-from-bottom-full duration-700">
      <div className="relative bg-[var(--color-surface)] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-2">
          <button 
            onClick={dismiss}
            className="p-2 text-[var(--color-muted)] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg">
            <Image 
              src="/webs/impostor/icons/logo.svg" 
              alt="Logo" 
              width={40} 
              height={40} 
              className="dark:invert-0"
            />
          </div>
          
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-black text-white uppercase tracking-tight">
              {locale === 'ca' ? "Instal·la l'App" : "Install the App"}
            </h4>
            <p className="text-[11px] text-[var(--color-muted)] font-medium leading-tight">
              {locale === 'ca' 
                ? "Gaudeix del Joc de l'Impostor i el meu Portfoli amb l'experiència nativa." 
                : "Enjoy the Impostor Game and my Portfolio with a native experience."}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button 
            onClick={dismiss}
            className="flex-1 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            {locale === 'ca' ? "Entesos" : "Got it"}
          </button>
        </div>
        
        {/* Progress Decoration */}
        <div className="absolute bottom-0 left-0 h-1 bg-[var(--color-accent)] animate-progress" style={{ width: '100%' }} />
      </div>
    </div>
  );
}
