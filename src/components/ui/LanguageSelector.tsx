"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "ca", label: "CA" },
    { code: "es", label: "ES" },
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
  ];

  const handleLanguageChange = (newLocale: string) => {
    setIsOpen(false);
    if (newLocale === locale) return;

    // Save language preference in cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    
    startTransition(() => {
      // Refresh the current route to apply the new locale server-side
      router.refresh();
    });
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className="inline-flex w-full justify-center gap-x-1.5 px-3 py-2 text-sm font-medium text-color-muted hover:text-white transition-colors duration-200"
          id="menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {locale.toUpperCase()}
          <svg className="-mr-1 size-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div 
          className="absolute right-0 z-10 mt-2 w-24 origin-top-right rounded-md bg-color-surface ring-1 shadow-lg ring-color-border focus:outline-hidden" 
          role="menu" 
          aria-orientation="vertical" 
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {languages.map((lng) => (
              <button
                key={lng.code}
                onClick={() => handleLanguageChange(lng.code)}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                  locale === lng.code ? 'text-color-accent font-bold' : 'text-color-text hover:bg-color-bg hover:text-white'
                }`}
                role="menuitem"
              >
                {lng.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
