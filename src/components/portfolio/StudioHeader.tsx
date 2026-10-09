"use client";

import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, ArrowUpRight, LayoutGrid, User, Globe, Calendar, FileText, PanelLeftClose, PanelLeftOpen, ChevronDown, Settings, Home, BookOpen } from "lucide-react";
import { SettingsPanel } from "./Navbar";
import { RequestAccessModal } from "./RequestAccessModal";
import { LanguageFlag } from "@/components/ui/LanguageFlag";
import { MOVE_URL } from "@/lib/move-url";

export function StudioHeader({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("Navigation");
  useEffect(() => {
    // Restore the visitor's navigation preference after hydration.
    setCollapsed(localStorage.getItem("navigation-collapsed") === "true");
    const savedTheme = localStorage.getItem("studio-theme");
    if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.studioTheme = savedTheme;
  }, []);
  function toggleCollapsed() {
    localStorage.setItem("navigation-collapsed", String(!collapsed));
    setCollapsed(!collapsed);
  }
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
  return (
    <><header className={`studio-header ${collapsed ? "is-collapsed" : ""}`}>
      <Link href="/" className="studio-wordmark" aria-label="Descobreix"><span className="studio-logo-mark">d↗</span><span className="studio-logo-full">descobreix ↗</span></Link>
      <button className="studio-collapse" aria-label={collapsed ? c.expand : c.collapse} title={collapsed ? c.expand : c.collapse} aria-expanded={!collapsed} aria-controls="studio-navigation" onClick={toggleCollapsed}>{collapsed ? <PanelLeftOpen size={19}/> : <PanelLeftClose size={19}/>}</button>
      <nav className={`studio-nav ${open ? "is-open" : ""}`} id="studio-navigation" aria-label={t("home")}>
        <Link href="/" aria-label={t("home")} title={t("home")} onClick={() => setOpen(false)}><Home size={19}/><span>{t("home")}</span></Link>
        <a href="#projects" aria-label={t("projectes")} title={t("projectes")} onClick={() => setOpen(false)}><LayoutGrid size={19}/><span>{t("projectes")}</span></a>
        <Link href="/v/preview/sobre-mi" aria-label={t("about_me")} title={t("about_me")} onClick={() => setOpen(false)}><User size={19}/><span>{t("about_me")}</span></Link>
        <Link href="/v/preview/webs" aria-label={t("webs")} title={t("webs")} onClick={() => setOpen(false)}><Globe size={19}/><span>{t("webs")}</span></Link>
        <a href={MOVE_URL} aria-label="Move" title="Move" onClick={() => setOpen(false)}><Calendar size={19}/><span>Move</span><ArrowUpRight className="studio-link-arrow" size={12} /></a>
        <Link href="/v/preview/cv" aria-label={t("cv")} title={t("cv")} className="nav-cv" onClick={() => setOpen(false)}><FileText size={19}/><span>{t("cv")}</span></Link>
        <button aria-label="Blog" title="Blog" onClick={() => {setOpen(false);setRequestOpen(true);}}><BookOpen size={19}/><span>Blog</span></button>
        <button aria-label={t("settings")} title={t("settings")} onClick={() => {setOpen(false);setSettingsOpen(true);}}><Settings size={19}/><span>{t("settings")}</span></button>
      </nav>
      <div className="header-controls">
        <div className="studio-language" onKeyDown={e => { if(e.key === "Escape") setLanguageOpen(false); }}>
          <button className="studio-language-trigger" aria-label={`${c.language}: ${languages.find(l=>l.code === locale)?.label || "Català"}`} aria-expanded={languageOpen} aria-controls="studio-language-options" disabled={pending} onClick={() => setLanguageOpen(!languageOpen)}><LanguageFlag code={locale}/><span>{locale.toUpperCase()}</span><ChevronDown size={12}/></button>
          {languageOpen && <div id="studio-language-options" className="studio-language-options">{languages.map(l=><button key={l.code} aria-pressed={locale === l.code} disabled={pending} onClick={()=>changeLanguage(l.code)}><LanguageFlag code={l.code}/><span>{l.label}</span></button>)}</div>}
        </div>
        <button className="studio-menu" aria-label={open ? c.close : c.open} aria-expanded={open} aria-controls="studio-navigation" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </header>
    {settingsOpen && <div className="studio-settings-backdrop" onClick={() => setSettingsOpen(false)}><section className="studio-settings-panel" role="dialog" aria-modal="true" aria-label={t("settings")} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key === "Escape")setSettingsOpen(false);}}><SettingsPanel currentLocale={locale} token="preview" onClose={() => setSettingsOpen(false)}/></section></div>}
    <RequestAccessModal isOpen={requestOpen} onClose={() => setRequestOpen(false)} sectionName="Blog"/>
    </>
  );
}
