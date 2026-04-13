"use client";

import { useState, useTransition, useEffect } from "react";
import { Settings, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function SettingsOverlay({ currentLocale = 'ca' }: { currentLocale?: string }) {
  const [theme, setTheme] = useState<string>('dark');
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    // Detect current theme on mount
    if (typeof window !== "undefined") {
        setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark');
    }
  }, []);

  const languages = [
    { code: "ca", label: "Català", short: "CA" },
    { code: "es", label: "Castellano", short: "ES" },
    { code: "en", label: "English", short: "EN" },
    { code: "fr", label: "Français", short: "FR" },
  ];

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    startTransition(() => {
      router.refresh();
      setTimeout(() => setIsOpen(false), 300);
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 text-color-muted hover:text-color-accent hover:bg-color-text/5 w-full md:w-auto md:justify-start justify-center"
      >
        <Settings className="w-5 h-5" />
        <span className="font-semibold hidden md:inline">Ajustes</span>
      </button>

      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col justify-end md:justify-center md:items-center transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      >
        {/* Sheet / Modal */}
        <div 
          onClick={e => e.stopPropagation()}
          className={`bg-color-surface w-full md:w-[400px] md:rounded-[32px] rounded-t-[32px] md:rounded-b-[32px] p-6 pb-12 md:pb-6 shadow-2xl border border-color-border transition-transform duration-400 ease-out ${
            isOpen ? "translate-y-0" : "translate-y-full md:translate-y-8 md:scale-95"
          }`}
        >
          {/* Dragger mobile */}
          <div className="w-12 h-1.5 bg-color-border rounded-full mx-auto mb-6 md:hidden"></div>
          
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-black text-color-text tracking-tight font-montserrat">Ajustes</h2>
            <button onClick={() => setIsOpen(false)} className="p-2 bg-color-bg text-color-muted hover:text-color-accent rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-color-muted mb-8">Preferencias de navegación</p>

          <div className="space-y-6">
            {/* Language Section directly inspired by the 'Move' HTML */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-color-muted mb-3 px-1">Idioma</div>
              <div className="bg-color-bg border border-color-border rounded-2xl p-2 flex flex-col gap-1">
                {languages.map((lng) => {
                  const isSel = currentLocale === lng.code;
                  return (
                    <button
                      key={lng.code}
                      onClick={() => handleLanguageChange(lng.code)}
                      disabled={isPending}
                      className={`flex justify-between items-center w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                        isSel 
                          ? 'bg-color-accent/10 border-color-accent/50 text-color-text font-bold' 
                          : 'hover:bg-color-surface text-color-muted hover:text-color-accent border-transparent'
                      } border`}
                    >
                      <span>{lng.label}</span>
                      <span className={`text-xs font-black px-2 py-1 rounded-md ${isSel ? 'bg-color-accent text-white' : 'bg-color-surface'}`}>
                        {lng.short}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Toggle */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-color-muted mb-3 px-1">Tema Visual</div>
              <button 
                onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
                className="w-full bg-color-bg border border-color-border rounded-2xl p-4 flex items-center justify-between hover:border-color-accent transition-colors"
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-sm font-bold text-color-text">Mode {theme === 'dark' ? 'Fosc' : 'Clar'}</span>
                  <span className="text-xs text-color-muted">Fes clic per canviar</span>
                </div>
                <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${theme === 'light' ? 'bg-color-accent' : 'bg-color-surface border border-color-border'}`}>
                  <div className={`absolute top-1 bottom-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === 'light' ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
