"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Home, User, LayoutGrid, FileText, Mail,
  Settings, Globe, Sun, Moon, X, ChevronRight, ShieldCheck, BookOpen, Lock
} from "lucide-react";
import { RequestAccessModal } from "./RequestAccessModal";

const languages = [
  { code: "ca", label: "Català", short: "CA" },
  { code: "es", label: "Castellano", short: "ES" },
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
];

function SettingsPanel({ onClose, currentLocale, token }: { onClose: () => void; currentLocale: string; token: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
  }, []);

  const handleLang = (code: string) => {
    if (code === currentLocale) return;
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;
    startTransition(() => { router.refresh(); });
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    localStorage.setItem("theme", next);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)]">
        <span className="text-sm font-bold text-[var(--color-text)] tracking-wide uppercase" style={{ fontFamily: "var(--font-display)" }}>Ajustos</span>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* iPhone Style List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 bg-[var(--color-bg)]">
        {/* Language & Theme Group */}
        <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] divide-y divide-[var(--color-border)]/50">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold">Idioma</span>
            </div>
            <div className="relative group/lang">
              <button
                disabled={isPending}
                className="bg-[var(--color-surface-2)] text-[var(--color-text)] text-xs font-bold px-4 py-2 rounded-xl outline-none border border-[var(--color-border)] flex items-center gap-2 hover:border-[var(--color-accent)] transition-all min-w-[120px] justify-between"
              >
                <span>{languages.find(l => l.code === currentLocale)?.label}</span>
                <ChevronRight className={`w-3 h-3 transition-transform duration-300 group-hover/lang:rotate-90`} />
              </button>
              
              <div className="absolute right-0 bottom-full mb-2 w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl overflow-hidden opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all duration-300 z-[60] shadow-2xl">
                {languages.map((lng) => (
                  <button
                    key={lng.code}
                    onClick={() => handleLang(lng.code)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-[var(--color-accent)] hover:text-white transition-colors ${currentLocale === lng.code ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}
                  >
                    {lng.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <span className="text-sm font-semibold">Mode Fosc</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${theme === "dark" ? "bg-[var(--color-accent)]" : "bg-zinc-700"}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${theme === "dark" ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </div>

        {/* Admin Access Group */}
        <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] divide-y divide-[var(--color-border)]/50">
          <Link
            href="/admin"
            className="p-4 flex items-center justify-between hover:bg-[var(--color-surface-2)] transition-all"
            onClick={onClose}
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold">Accés Client</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />
          </Link>
        </div>

        {/* Legal Group */}
        <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] divide-y divide-[var(--color-border)]/50">
          {[
            { label: "Política de Privacitat", slug: "privacitat" },
            { label: "Política de Cookies", slug: "cookies" },
            { label: "Condicions d'Ús", slug: "condicions" },
            { label: "Avís Legal", slug: "avis-legal" }
          ].map((item) => (
            <Link
              key={item.slug}
              href={`/v/${token}/legal/${item.slug}`}
              onClick={onClose}
              className="p-4 flex items-center justify-between hover:bg-[var(--color-surface-2)] transition-all"
            >
              <span className="text-sm font-medium text-[var(--color-muted)]">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-[var(--color-muted)]/50" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Navbar({ token, locale = "ca" }: { token: string; locale?: string }) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const t = useTranslations("Navigation");

  const isPreview = token === "preview";
  const restrictedSections = ["projectes", "cv", "blog"];

  useEffect(() => {
    const handleOpenSettings = () => setMobileSettingsOpen(true);
    window.addEventListener("open-portfolio-settings", handleOpenSettings);
    return () => window.removeEventListener("open-portfolio-settings", handleOpenSettings);
  }, []);

  const links = [
    { href: isPreview ? `/` : `/v/${token}`, label: t("home"), icon: Home },
    { href: `/v/${token}/sobre-mi`, label: t("about_me"), icon: User },
    { href: `/v/${token}/projectes`, label: t("projectes"), icon: LayoutGrid },
    { href: `/v/${token}/cv`, label: t("cv"), icon: FileText },
    { href: `/v/${token}/blog`, label: "Blog", icon: BookOpen },
  ];

  const isActive = (href: string) => {
    if (isPreview && href === "/") {
      return pathname === "/";
    }
    return href === `/v/${token}` ? pathname === href : pathname.startsWith(href);
  };

  return (
    <>
      {/* ═══════════════ DESKTOP SIDEBAR ═══════════════ */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen z-50 overflow-hidden"
        style={{
          width: settingsOpen ? "320px" : "240px",
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {settingsOpen ? (
          <SettingsPanel onClose={() => setSettingsOpen(false)} currentLocale={locale} token={token} />
        ) : (
          <div className="flex flex-col h-full py-8 px-4">
            {/* Logo */}
            <Link
              href={`/v/${token}`}
              className="text-[var(--color-text)] text-xl font-black tracking-tight px-2 mb-10 hover:text-[var(--color-accent)] transition-colors block"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}
            >
              descobreix
              <span style={{ color: "var(--color-accent)" }}>.</span>
            </Link>

            {/* Nav Links */}
            <nav className="flex flex-col gap-1 flex-1">
              {links.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                const sectionKey = href.split('/').pop() || "";
                const isLocked = isPreview && restrictedSections.includes(sectionKey);

                const handleClick = (e: React.MouseEvent) => {
                  if (isLocked) {
                    e.preventDefault();
                    setSelectedSection(label);
                    setRequestModalOpen(true);
                  }
                };

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${isLocked ? 'cursor-default' : ''}`}
                    style={{
                      background: active ? "var(--color-accent)" : "transparent",
                      color: active ? "#fff" : "var(--color-muted)",
                      boxShadow: active ? "0 4px 20px var(--color-accent-glow)" : "none",
                    }}
                    onMouseEnter={(e) => { if (!active && !isLocked) { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; (e.currentTarget as HTMLElement).style.background = "var(--color-accent-subtle)"; } }}
                    onMouseLeave={(e) => { if (!active && !isLocked) { (e.currentTarget as HTMLElement).style.color = "var(--color-muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isLocked ? 'opacity-30' : ''}`} />
                    <span className={isLocked ? 'opacity-30' : ''}>{label}</span>
                    
                    {isLocked && (
                      <div className="absolute right-3 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                        <Lock className="w-3 h-3 text-[var(--color-accent)]" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Settings Trigger */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold w-full transition-all"
              style={{ color: "var(--color-muted)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; (e.currentTarget as HTMLElement).style.background = "var(--color-accent-subtle)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span className="flex items-center gap-3"><Settings className="w-4 h-4" /> Ajustos</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>
          </div>
        )}
      </aside>

      {/* ═══════════════ MOBILE BOTTOM NAV ═══════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 h-16"
        style={{
          background: "var(--color-surface)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          const sectionKey = href.split('/').pop() || "";
          const isLocked = isPreview && restrictedSections.includes(sectionKey);

          const handleClick = (e: React.MouseEvent) => {
            if (isLocked) {
              e.preventDefault();
              setSelectedSection(label);
              setRequestModalOpen(true);
            }
          };

          return (
            <Link
              key={href}
              href={href}
              onClick={handleClick}
              className="flex flex-col items-center justify-center h-full w-full gap-1 transition-all duration-200 relative"
              style={{ color: active ? "var(--color-accent)" : "var(--color-muted)" }}
            >
              <div
                className="p-1.5 rounded-xl transition-all relative"
                style={{ background: active ? "var(--color-accent-subtle)" : "transparent" }}
              >
                <Icon className={`w-5 h-5 ${isLocked ? 'opacity-30' : ''}`} />
                {isLocked && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full flex items-center justify-center">
                    <Lock className="w-2 h-2 text-[var(--color-accent)]" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ═══════════════ MOBILE TOP NAV / HEADER ═══════════════ */}
      <header className="md:hidden fixed top-0 left-0 w-full h-16 flex items-center justify-between px-6 z-[45] bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
        <Link
          href={`/v/${token}`}
          className="text-[var(--color-text)] text-lg font-black tracking-tight"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}
        >
          descobreix<span style={{ color: "var(--color-accent)" }}>.</span>
        </Link>
        <button
          onClick={() => setMobileSettingsOpen(true)}
          className="p-2 -mr-2 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>
      {mobileSettingsOpen && (
        <div
          className="md:hidden fixed inset-0 z-[100] flex flex-col bg-[var(--color-bg)] animate-in slide-in-from-bottom duration-500 ease-out"
          onClick={() => setMobileSettingsOpen(false)}
        >
          <div
            className="flex-1 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SettingsPanel onClose={() => setMobileSettingsOpen(false)} currentLocale={locale} token={token} />
          </div>
        </div>
      )}

      <RequestAccessModal 
        isOpen={requestModalOpen} 
        onClose={() => setRequestModalOpen(false)} 
        sectionName={selectedSection}
      />
    </>
  );
}
