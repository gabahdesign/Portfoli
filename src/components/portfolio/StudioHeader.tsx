"use client";

import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, ArrowUpRight, LayoutGrid, LockKeyhole, Calendar, FileText, ChevronDown, Settings, Home, BookOpen, Pencil, DoorOpen, LayoutDashboard, Globe, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SettingsPanel } from "./Navbar";
import { LanguageFlag } from "@/components/ui/LanguageFlag";
import { MOVE_URL } from "@/lib/move-url";

export function StudioHeader({ locale, token = "preview", isAdmin = false }: { locale: string; token?: string; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const sectionActive = (section: string) => pathname?.includes(`/v/${token}/${section}`);
  const t = useTranslations("Navigation");
  useEffect(() => {
    const savedTheme = localStorage.getItem("studio-theme");
    if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.studioTheme = savedTheme;
    const openSettings = () => setSettingsOpen(true);
    window.addEventListener("open-portfolio-settings", openSettings);
    return () => window.removeEventListener("open-portfolio-settings", openSettings);
  }, []);
  const c = ({
    ca: { collapse: "Minimitza la navegació", expand: "Amplia la navegació", language: "Idioma", open: "Obre el menú", close: "Tanca el menú" },
    es: { collapse: "Minimizar navegación", expand: "Ampliar navegación", language: "Idioma", open: "Abrir menú", close: "Cerrar menú" },
    en: { collapse: "Minimize navigation", expand: "Expand navigation", language: "Language", open: "Open menu", close: "Close menu" },
    fr: { collapse: "Réduire la navigation", expand: "Développer la navigation", language: "Langue", open: "Ouvrir le menu", close: "Fermer le menu" },
  }[locale as "ca" | "es" | "en" | "fr"] || { collapse: "Minimitza la navegació", expand: "Amplia la navegació", language: "Idioma", open: "Obre el menú", close: "Tanca el menú" });
  const languages = [{code:"ca",label:"Català"},{code:"es",label:"Español"},{code:"en",label:"English"},{code:"fr",label:"Français"}];
  function changeLanguage(value: string) {
    setLanguageOpen(false);
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${value}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => router.refresh());
  }
  async function logout() {
    setLoggingOut(true);
    setLogoutError("");
    const { error } = await createClient().auth.signOut();
    if (error) { setLogoutError("No s’ha pogut tancar la sessió. Torna-ho a provar."); setLoggingOut(false); return; }
    // A full navigation clears the authenticated page cache and private link context.
    document.cookie = "current_token=; path=/; max-age=0; SameSite=Lax";
    window.location.assign("/");
  }
  return (
    <><header className={`studio-header ${collapsed ? "is-collapsed" : ""}`} onMouseEnter={() => setCollapsed(false)} onMouseLeave={() => setCollapsed(true)} onFocus={() => setCollapsed(false)} onBlur={e => {if (!e.currentTarget.contains(e.relatedTarget)) setCollapsed(true);}}>
      <Link href={isAdmin ? "/admin/dashboard" : token === "preview" ? "/" : `/v/${token}`} className="studio-wordmark" aria-label="Descobreix"><span className="studio-logo-mark">d</span><span className="studio-logo-full">descobreix</span></Link>
      <nav className={`studio-nav ${open ? "is-open" : ""}`} id="studio-navigation" aria-label={t("home")}>
        <Link href={isAdmin ? "/admin/dashboard" : token === "preview" ? "/" : `/v/${token}`} aria-current={pathname === "/" || pathname === `/v/${token}` || pathname === "/admin/dashboard" ? "page" : undefined} aria-label={t("home")} title={t("home")} onClick={() => setOpen(false)}><Home size={19}/><span>{t("home")}</span></Link>
        <Link href={isAdmin ? "/admin/trabajos" : `/v/${token}/projectes`} aria-current={sectionActive("projectes") || pathname?.startsWith("/admin/trabajos") || pathname === "/admin/webs" ? "page" : undefined} aria-label={t("projectes")} title={t("projectes")} onClick={() => setOpen(false)}><LayoutGrid size={19}/><span>{t("projectes")}</span></Link>
        <a href={isAdmin ? `${MOVE_URL.replace(/\/$/, "")}/auth?sso=descobreix` : MOVE_URL} aria-label="Move" title="Move" onClick={() => setOpen(false)}><Calendar size={19}/><span>Move</span><ArrowUpRight className="studio-link-arrow" size={12} /></a>
        <Link href={isAdmin ? "/admin/blog" : `/v/${token}/blog`} aria-current={sectionActive("blog") || pathname?.startsWith("/admin/blog") ? "page" : undefined} aria-label="Blog" title="Blog" onClick={() => setOpen(false)}><BookOpen size={19}/><span>Blog</span></Link>
        <Link href={isAdmin ? "/admin/sobre-mi" : `/v/${token}/sobre-mi`} aria-current={sectionActive("sobre-mi") || pathname === "/admin/sobre-mi" || pathname === "/admin/cv" ? "page" : undefined} aria-label={t("about_me")} title={t("about_me")} onClick={() => setOpen(false)}><LockKeyhole size={19}/><span>{t("about_me")}</span></Link>
      </nav>
      <div className="header-controls">
        <div className="studio-language" onKeyDown={e => { if(e.key === "Escape") setLanguageOpen(false); }}>
          <button className="studio-language-trigger" aria-label={`${c.language}: ${languages.find(l=>l.code === locale)?.label || "Català"}`} aria-expanded={languageOpen} aria-controls="studio-language-options" disabled={pending} onClick={() => setLanguageOpen(!languageOpen)}><LanguageFlag code={locale}/><span>{locale.toUpperCase()}</span><ChevronDown size={12}/></button>
          {languageOpen && <div id="studio-language-options" className="studio-language-options">{languages.map(l=><button key={l.code} aria-pressed={locale === l.code} disabled={pending} onClick={()=>changeLanguage(l.code)}><LanguageFlag code={l.code}/><span>{l.label}</span></button>)}</div>}
        </div>
        <button className="studio-settings-trigger" aria-label={t("settings")} title={t("settings")} onClick={() => {setOpen(false);if (isAdmin) router.push("/admin/ajustos"); else setSettingsOpen(true);}}><Settings size={19}/><span>{t("settings")}</span></button>
        {isAdmin && <button className="studio-settings-trigger" aria-label="Tancar sessió i veure el web públic" title="Tancar sessió i veure el web públic" disabled={loggingOut} onClick={logout}><DoorOpen size={19}/><span>{loggingOut ? "Tancant sessió…" : "Tancar sessió"}</span></button>}
        {!isAdmin && token !== "preview" && <button className="studio-settings-trigger" aria-label="Tancar l’accés de Sobre mi" title="Tancar l’accés de Sobre mi" onClick={async()=>{const result=await fetch('/api/about/access',{method:'DELETE'});if(result.ok)window.location.assign('/v/preview/sobre-mi');}}><DoorOpen size={19}/><span>Tancar accés</span></button>}
        {logoutError && <p role="alert">{logoutError}</p>}
        <button className="studio-menu" aria-label={open ? c.close : c.open} aria-expanded={open} aria-controls="studio-navigation" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </header>
    {settingsOpen && <div className="studio-settings-backdrop" onClick={() => setSettingsOpen(false)}><section className="studio-settings-panel" role="dialog" aria-modal="true" aria-label={t("settings")} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key === "Escape")setSettingsOpen(false);}}><SettingsPanel currentLocale={locale} token={token} onClose={() => setSettingsOpen(false)}/></section></div>}
    </>
  );
}
