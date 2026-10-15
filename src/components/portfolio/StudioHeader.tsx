"use client";

import { useUiTranslation } from "@/lib/fixed-ui-client";
import {LOCALES,LANGUAGE_NAMES,stripLocale,localePath,rememberLocale,calendarLocaleUrl} from "@/lib/locales";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowUpRight, LayoutGrid, Lock, Calendar, FileText, ChevronDown, Settings, Home, DoorOpen, Quote, Eye, Tags, Layers, Inbox, KeyRound, Users, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SettingsPanel } from "./Navbar";
import { LanguageFlag } from "@/components/ui/LanguageFlag";
import { MOVE_URL } from "@/lib/move-url";
import { wordpressBlogUrl, wordpressPageUrl } from "@/lib/blog-url";

function WhatsAppMark() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20l.8-4.7A8.5 8.5 0 1 1 20.5 11.8Z"/><path d="M8.7 7.8c.3-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.7c-.2.2-.2.4 0 .7.7 1.1 1.5 1.9 2.7 2.5.2.1.5.1.7-.1l.8-.9c.2-.2.4-.3.7-.2l1.7.8c.3.1.4.3.4.5 0 .3-.2 1.3-.8 1.8-.5.5-1.3.8-2 .7-1.2-.2-2.6-.8-4.1-2.1-1.7-1.5-2.8-3.4-3.1-4.6-.3-1.1.1-1.9.7-2.2Z"/></svg>;
}

export function StudioHeader({ locale, token = "preview", isAdmin = false }: { locale: string; token?: string; isAdmin?: boolean }) {
 const ui = useUiTranslation();




  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    if (!settingsOpen || !window.matchMedia('(max-width:767px)').matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setSettingsOpen(false); };
    window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', close); };
  }, [settingsOpen]);
  const [pending] = useTransition();
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = stripLocale(usePathname() || "/");
  const sectionActive = (section: string) => pathname?.includes(`/v/${token}/${section}`);
  const adminSection = pathname.startsWith("/admin/trabajos") || pathname === "/admin/webs" ? ui("Projectes") : pathname.startsWith("/admin/blog") ? ui("Blog") : pathname.startsWith("/admin/sobre-mi") || pathname.startsWith("/admin/cv") ? ui("Sobre mi") : ui("Inici");
  const t = useTranslations("Navigation");
  useEffect(() => {
    const savedTheme = localStorage.getItem("studio-theme");
    if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.studioTheme = savedTheme;
    const openSettings = () => setSettingsOpen(true);
    window.addEventListener("open-portfolio-settings", openSettings);
    return () => window.removeEventListener("open-portfolio-settings", openSettings);
  }, []);
  const c = {
    collapse: ui("Minimitza la navegació"),
    expand: ui("Amplia la navegació"),
    language: ui("Idioma"),
    open: ui("Obre el menú"),
    close: ui("Tanca el menú"),
  };
  const languages = LOCALES.map(code=>({code,label:LANGUAGE_NAMES[code]}));
  function changeLanguage(value: string) {
    setLanguageOpen(false);
    rememberLocale(value);
    window.location.assign(localePath(value, pathname) + window.location.search + window.location.hash);
  }
  async function logout() {
    setLoggingOut(true);
    setLogoutError("");
    const { error } = await createClient().auth.signOut();
    if (error) { setLogoutError("No s’ha pogut tancar la sessió. Torna-ho a provar."); setLoggingOut(false); return; }
    // A full navigation clears the authenticated page cache and private link context.
    document.cookie = "current_token=; path=/; max-age=0; SameSite=Lax";
    await fetch('/api/about/access',{method:'DELETE'});
    window.location.assign("/");
  }
  return (
    <><header className={`studio-header ${isAdmin ? "is-admin" : ""} ${collapsed && !settingsOpen ? "is-collapsed" : ""} ${settingsOpen ? "is-settings-open" : ""}`} onMouseEnter={() => setCollapsed(false)} onMouseLeave={() => {if(!settingsOpen)setCollapsed(true);}} onFocus={() => setCollapsed(false)} onBlur={e => {if (!settingsOpen && !e.currentTarget.contains(e.relatedTarget)) setCollapsed(true);}}>
      {isAdmin && <div className="studio-admin-mobile-bar">
        <Link href="/admin/dashboard" className="studio-admin-mobile-logo" aria-label={ui("Descobreix")}><img src="/descobreix-logo.png" alt="Descobreix" width="500" height="200" /></Link>
        <span className="studio-admin-current-section">{adminSection}</span>
        <button type="button" className="studio-admin-mobile-toggle" aria-label={ui(open ? c.close : c.open)} aria-controls="studio-admin-mobile-panel" aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>}
      <Link href={isAdmin ? "/admin/dashboard" : token === "preview" ? "/" : `/v/${token}`} className="studio-wordmark" aria-label="Descobreix"><span className="studio-logo-mark" aria-hidden="true"><img src="/descobreix-logo.png" alt="" width="500" height="200" className="descobreix-brand-image" /></span><span className="studio-logo-full"><img src="/descobreix-logo.png" alt="Descobreix" width="500" height="200" className="descobreix-brand-image" /></span></Link>
      <nav className={`studio-nav ${open ? "is-open" : ""}`} id="studio-navigation" aria-label={t("home")}>
        <Link href={isAdmin ? "/admin/dashboard" : token === "preview" ? "/" : `/v/${token}`} aria-current={pathname === "/" || pathname === `/v/${token}` || pathname === "/admin/dashboard" ? "page" : undefined} aria-label={t("home")} title={t("home")} onClick={() => setOpen(false)}><Home size={19}/><span>{t("home")}</span></Link>
        <Link href={isAdmin ? "/admin/trabajos" : `/v/${token}/projectes`} aria-current={sectionActive("projectes") || pathname?.startsWith("/admin/trabajos") || pathname === "/admin/webs" ? "page" : undefined} aria-label={t("projectes")} title={t("projectes")} onClick={() => setOpen(false)}><LayoutGrid size={19}/><span>{t("projectes")}</span></Link>
        {isAdmin ? (
          <details className="studio-nav-group" open>
            <summary aria-label="Move" title="Move"><Calendar size={19}/><span>Move</span><ChevronDown className="studio-move-chevron" size={14}/></summary>
            <div className="studio-nav-submenu">
              {[
                { label: "Plans", tab: "plans", icon: Calendar },
                { label: "Activitats", tab: "types", icon: Tags },
                { label: "Categories", tab: "communities", icon: Layers },
                { label: "Sol·licituds", tab: "requests", icon: Inbox },
                { label: "Accessos", tab: "access", icon: KeyRound },
                { label: "Usuaris", tab: "users", icon: Users },
              ].map(({ label, tab, icon: Icon }) => (
                <a key={tab} href={calendarLocaleUrl(`${MOVE_URL.replace(/\/$/, "")}/admin?sso=descobreix&tab=${tab}`, locale)} onClick={() => setOpen(false)}>
                  <Icon size={16}/><span>{ui(label)}</span>
                </a>
              ))}
            </div>
          </details>
        ) : (
          <a href={calendarLocaleUrl(MOVE_URL,locale)} aria-label="Move" title="Move" onClick={() => setOpen(false)}><Calendar size={19}/><span>Move</span><ArrowUpRight className="studio-link-arrow" size={12} /></a>
        )}
        <a href={wordpressBlogUrl(locale, isAdmin)} aria-current={sectionActive("blog") || pathname?.startsWith("/admin/blog") ? "page" : undefined} aria-label="Blog" title="Blog" onClick={() => setOpen(false)}><FileText size={20}/><span>Blog</span></a>
        <Link href={isAdmin ? "/admin/sobre-mi" : `/v/${token}/sobre-mi`} aria-current={sectionActive("sobre-mi") || pathname === "/admin/sobre-mi" || pathname === "/admin/cv" ? "page" : undefined} aria-label={t("about_me")} title={t("about_me")} onClick={() => setOpen(false)}><Lock size={20}/><span>{t("about_me")}</span></Link>
        {!isAdmin && <a href={wordpressPageUrl(locale,"/les-quotes/")} aria-label="Les Quotes" title="Les Quotes" onClick={() => setOpen(false)}><Quote size={20}/><span>Les Quotes</span></a>}
      </nav>
      <div className="header-controls">
        <div className={`studio-language ${languageOpen ? "is-open" : ""}`} onMouseEnter={() => setLanguageOpen(true)} onMouseLeave={() => setLanguageOpen(false)} onFocus={e => {if (e.target.matches(":focus-visible")) setLanguageOpen(true);}} onBlur={e => {if (!e.currentTarget.contains(e.relatedTarget)) setLanguageOpen(false);}} onKeyDown={e => { if(e.key === "Escape") setLanguageOpen(false); }}>
          <button className="studio-language-trigger" aria-label={`${ui(c.language)}: ${languages.find(l=>l.code === locale)?.label || "Català"}`} aria-expanded={languageOpen} aria-controls="studio-language-options" disabled={pending} onClick={() => setLanguageOpen(!languageOpen)}><LanguageFlag code={locale}/><span>{languages.find(l => l.code === locale)?.label || "Català"}</span><ChevronDown size={12}/></button>
          <div id="studio-language-options" className="studio-language-options">{languages.map(l=><button key={l.code} aria-pressed={locale === l.code} disabled={pending} onClick={()=>changeLanguage(l.code)}><LanguageFlag code={l.code}/><span>{l.label}</span></button>)}</div>
        </div>
        <button className="studio-settings-trigger" aria-label={t("settings")} title={t("settings")} aria-expanded={settingsOpen} onClick={() => {setOpen(false);setSettingsOpen(!settingsOpen);setCollapsed(false);}}><Settings size={19}/><span>{t("settings")}</span></button>
        {isAdmin && <a className="studio-settings-trigger" href={localePath(locale, "/")} target="_blank" rel="noopener noreferrer" aria-label={ui("Veure el web")} title={ui("Veure el web")}><Eye size={19}/><span>{ui("Veure el web")}</span></a>}
        {isAdmin && <button className="studio-settings-trigger" aria-label={ui("Tancar sessió")} title={ui("Tancar sessió")} disabled={loggingOut} onClick={logout}><DoorOpen size={19}/><span>{loggingOut ? ui("Tancant sessió…") : ui("Tancar sessió")}</span></button>}
        {!isAdmin && token !== "preview" && <button className="studio-settings-trigger" aria-label={ui("Tancar l’accés de Sobre mi")} title={ui("Tancar l’accés de Sobre mi")} onClick={async()=>{const result=await fetch('/api/about/access',{method:'DELETE'});if(result.ok)window.location.assign('/v/preview/sobre-mi');}}><DoorOpen size={19}/><span>{ui("Tancar accés")}</span></button>}
        {logoutError && <p role="alert">{logoutError}</p>}

      </div>
      {settingsOpen && <div className="studio-settings-inline"><SettingsPanel currentLocale={locale} token={token} onClose={() => setSettingsOpen(false)}/></div>}
      <div className="studio-social-links" aria-label={ui("Xarxes socials")}><a href="https://instagram.com/descobreix.cat" aria-label="Instagram" title="Instagram" target="_blank" rel="noopener noreferrer"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg><span>Instagram</span></a><a href="https://chat.whatsapp.com/GsZIxybVssmC1Sl1yESHe4" aria-label="El Cercle · Move a WhatsApp" title="El Cercle · Move a WhatsApp" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}><WhatsAppMark/><span>WhatsApp</span></a><a href="https://tiktok.com/@descobreix" aria-label="TikTok" title="TikTok" target="_blank" rel="noopener noreferrer"><svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.6 7.2a6.2 6.2 0 0 1-3.8-1.3v8.3a5.8 5.8 0 1 1-5-5.7v3.2a2.7 2.7 0 1 0 1.8 2.6V2.5h3.2c.2 2.2 1.7 4 3.8 4.4v.3Z"/></svg><span>TikTok</span></a></div>
    </header>
    {isAdmin && open && <>
      <button type="button" className="studio-admin-mobile-backdrop" aria-label={ui(c.close)} onClick={() => setOpen(false)} />
      <aside id="studio-admin-mobile-panel" className="studio-admin-mobile-panel" aria-label={ui("Administració")}>
        <nav className="studio-admin-mobile-links">
          <Link href="/admin/dashboard" aria-current={pathname === "/admin/dashboard" ? "page" : undefined} onClick={() => setOpen(false)}><Home size={19}/><span>{ui("Inici")}</span></Link>
          <Link href="/admin/trabajos" aria-current={pathname.startsWith("/admin/trabajos") || pathname === "/admin/webs" ? "page" : undefined} onClick={() => setOpen(false)}><LayoutGrid size={19}/><span>{ui("Projectes")}</span></Link>
          <div className="studio-admin-mobile-group"><div><Calendar size={19}/><span>Move</span></div>{[
            { label: "Plans", tab: "plans", icon: Calendar }, { label: "Activitats", tab: "types", icon: Tags }, { label: "Categories", tab: "communities", icon: Layers }, { label: "Sol·licituds", tab: "requests", icon: Inbox }, { label: "Accessos", tab: "access", icon: KeyRound }, { label: "Usuaris", tab: "users", icon: Users },
          ].map(({ label, tab, icon: Icon }) => <a key={tab} href={calendarLocaleUrl(`${MOVE_URL.replace(/\/$/, "")}/admin?sso=descobreix&tab=${tab}`, locale)}><Icon size={16}/><span>{ui(label)}</span></a>)}</div>
          <a href={wordpressBlogUrl(locale, true)} aria-current={pathname.startsWith("/admin/blog") ? "page" : undefined} onClick={() => setOpen(false)}><FileText size={19}/><span>{ui("Blog")}</span></a>
          <Link href="/admin/sobre-mi" aria-current={pathname.startsWith("/admin/sobre-mi") || pathname.startsWith("/admin/cv") ? "page" : undefined} onClick={() => setOpen(false)}><Lock size={19}/><span>{ui("Sobre mi")}</span></Link>
        </nav>
        <div className="studio-admin-mobile-actions">
          <button type="button" onClick={() => {setOpen(false);setSettingsOpen(true);setCollapsed(false);}}><Settings size={19}/><span>{ui("Ajustos")}</span></button>
          <a href={localePath(locale, "/")} target="_blank" rel="noopener noreferrer"><Eye size={19}/><span>{ui("Veure el web")}</span></a>
          <button type="button" onClick={() => {setOpen(false);void logout();}} disabled={loggingOut}><DoorOpen size={19}/><span>{loggingOut ? ui("Tancant sessió…") : ui("Tancar sessió")}</span></button>
        </div>
      </aside>
    </>}
    </>
  );
}
