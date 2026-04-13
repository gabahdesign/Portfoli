"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

interface WelcomeBannerProps {
  message?: string;
}

export function WelcomeBanner({ message }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  // Only show on the token home page: /v/[token] (not on /v/[token]/xxx)
  const segments = pathname.split('/').filter(Boolean);
  const isHomePage = segments.length === 2 && segments[0] === 'v';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!message || !isHomePage) return null;

  return (
    <div 
      className={`flex justify-center py-4 px-4 transition-all duration-700 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-1000">
        <Sparkles className="w-4 h-4 text-[var(--color-accent)] animate-pulse" />
        <p className="text-sm font-sans font-medium text-white/90 tracking-wide text-center">
          {message}
        </p>
      </div>
    </div>
  );
}
