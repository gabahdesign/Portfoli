"use client";

import { wordpressBlogUrl } from "@/lib/blog-url";
import { wordpressPageUrl } from "@/lib/blog-url";
import { useUiTranslation } from "@/lib/fixed-ui-client";
import {LOCALES,LANGUAGE_NAMES,rememberLocale,localePath} from "@/lib/locales";
import {LanguageFlag} from "@/components/ui/LanguageFlag";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Home, User, LayoutGrid, FileText,
  Settings, Sun, Moon, X, ChevronRight, ShieldCheck, BookOpen, Lock, Pencil, Calendar, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { RequestAccessModal } from "./RequestAccessModal";
import { MOVE_URL } from "@/lib/move-url";

const languages = LOCALES.map(code=>({code,label:LANGUAGE_NAMES[code],Flag:()=> <LanguageFlag code={code}/> }));

function WebIcon({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center font-black rounded-lg border-2 border-current transition-all ${className}`} style={{ width: '20px', height: '20px', fontSize: '11px', lineHeight: '1' }}>
      W
    </div>
  );
}

export function SettingsPanel({ onClose, currentLocale }: { onClose: () => void; currentLocale: string; token?: string }) {
 const ui = useUiTranslation();
 const t = useTranslations("Settings");
 const toggleTheme = () => {
   const next = document.documentElement.dataset.studioTheme === "dark" ? "light" : "dark";
   document.documentElement.classList.toggle("light", next === "light");
   document.documentElement.dataset.studioTheme = next;
   localStorage.setItem("theme", next);
   localStorage.setItem("studio-theme", next);
 };
 const pages = [
   { label: t("privacy_policy"), slug: "/politica-de-privacitat/" },
   { label: t("terms_of_use"), slug: "/termes-i-condicions/" },
   { label: t("cookie_policy"), slug: "/politica-de-cookies/" },
   { label: ui("Contacte"), slug: "/contacte/" },
 ];
 const changeLanguage = (code: string) => {
   if (code === currentLocale) return;
   rememberLocale(code);
   window.location.assign(localePath(code,window.location.pathname)+window.location.search+window.location.hash);
 };
 return <div className="studio-settings-content">
   <div className="studio-settings-heading"><span>{ui("Aparença")}</span><button onClick={onClose} aria-label={ui("Tancar els ajustos")}><X size={16}/></button></div>
   <button type="button" className="studio-appearance-button" aria-label={ui("Canviar aparença")} onClick={toggleTheme}>
     <span className="studio-appearance-icon"><Sun className="studio-theme-light-icon" size={18}/><Moon className="studio-theme-dark-icon" size={18}/></span>
     <span className="studio-appearance-copy"><strong>{t("dark_mode")}</strong><small className="studio-theme-light-label">{ui("Mode clar")}</small><small className="studio-theme-dark-label">{ui("Mode fosc")}</small></span>
     <span className="studio-appearance-switch" aria-hidden="true"><i/></span>
   </button>
   <div className="studio-mobile-settings-languages"><p>{t("language")}</p>{languages.map(item=><button key={item.code} type="button" aria-pressed={item.code===currentLocale} onClick={()=>changeLanguage(item.code)}><LanguageFlag code={item.code}/><span>{item.label}</span></button>)}</div>
   <div className="studio-settings-links" aria-label={ui("Informació legal i contacte")}>
     {pages.map(item=><a key={item.slug} href={wordpressPageUrl(currentLocale,item.slug)} onClick={onClose}><span>{item.label}</span><ChevronRight size={15}/></a>)}
   </div>
   <a className="studio-settings-access" href="/admin" onClick={onClose}><ShieldCheck size={16}/><span>{t("client_access")}</span><ChevronRight size={15}/></a>
 </div>;
}

export function Navbar({ token, locale = "ca", isAdmin = false }: { token: string; locale?: string; isAdmin?: boolean }) {
 const ui = useUiTranslation();




  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const t = useTranslations("Navigation");
  useEffect(() => {
    setCollapsed(localStorage.getItem("navigation-collapsed") === "true");
  }, []);
  function toggleCollapsed() {
    localStorage.setItem("navigation-collapsed", String(!collapsed));
    setCollapsed(!collapsed);
  }

  const isPreview = token === "preview";
  const restrictedSections = ["blog"];

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
    { href: wordpressBlogUrl(locale, isAdmin), label: "Blog", icon: BookOpen },
    { href: MOVE_URL, label: t("move"), icon: Calendar },
    { href: `/v/${token}/webs`, label: t("webs"), icon: WebIcon },
  ];
  // On small screens put the two main destinations first, then the portfolio
  // and editorial sections. Keep the desktop sidebar in its established order.
  const mobileLinks = [links[0], links[5], links[2], links[4], links[1], links[3], links[6]];

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
        className={`legacy-sidebar hidden md:flex flex-col fixed left-0 top-0 h-screen z-50 overflow-hidden ${collapsed && !settingsOpen ? "legacy-collapsed" : ""}`}
        style={{
          width: settingsOpen ? "320px" : collapsed ? "80px" : "240px",
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {settingsOpen ? (
          <SettingsPanel onClose={() => setSettingsOpen(false)} currentLocale={locale} token={token} />
        ) : (
          <div className="flex flex-col h-full py-8 px-4">
            <button className="legacy-collapse p-2 mb-4 self-end" aria-label={collapsed ? ui("Amplia la navegació") : ui("Minimitza la navegació")} aria-expanded={!collapsed} onClick={toggleCollapsed}>{collapsed ? <PanelLeftOpen size={19}/> : <PanelLeftClose size={19}/>}</button>
            {/* Logo */}
            <Link
              href={`/v/${token}`}
              className="text-[var(--color-text)] text-xl font-black tracking-tight px-2 mb-10 hover:text-[var(--color-accent)] transition-colors block" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }} > descobreix <span style={{ color: "var(--color-accent)" }}>.</span>
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
                    <span className={isLocked ? "opacity-30" : ''}>{label}</span>

                    {isLocked && (
                      <div className="absolute right-3 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                        <Lock className="w-3 h-3 text-[var(--color-accent)]" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Settings & Admin Triggers */}
            <div className="flex flex-col gap-2">
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold w-full transition-all text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] shadow-lg shadow-[var(--color-accent-glow)]/20"
                >
                  <span className="flex items-center gap-3"><Pencil className="w-4 h-4" /> {ui("Administrar")}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </Link>
              )}
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold w-full transition-all"
                style={{ color: "var(--color-muted)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; (e.currentTarget as HTMLElement).style.background = "var(--color-accent-subtle)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span className="flex items-center gap-3"><Settings className="w-4 h-4" /> {t("settings")}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </div>
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
        {mobileLinks.map(({ href, label, icon: Icon }) => {
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
        <div className="flex items-center gap-2 -mr-2">
          <Link
            href={`/v/${token}/webs`}
            className={`p-2 transition-colors ${pathname.includes('/webs') ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`}
          >
            <WebIcon />
          </Link>
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="p-2 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 rounded-full transition-colors flex items-center justify-center relative"
            >
              <Pencil className="w-5 h-5" />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent-glow)] border border-[var(--color-bg)]" />
            </Link>
          )}
          <button
            onClick={() => setMobileSettingsOpen(true)}
            className="p-2 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
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
