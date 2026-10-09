"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { MOVE_URL } from "@/lib/move-url";

export function StudioHeader({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("Navigation");
  function changeLanguage(value: string) {
    document.cookie = `NEXT_LOCALE=${value}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => router.refresh());
  }
  return (
    <header className="studio-header">
      <Link href="/" className="studio-wordmark" aria-label="Descobreix — Home">descobreix<span>↗</span></Link>
      <nav className={`studio-nav ${open ? "is-open" : ""}`} id="studio-navigation" aria-label={t("home")}>
        <a href="#projects" onClick={() => setOpen(false)}>{t("projectes")}</a>
        <Link href="/v/preview/sobre-mi" onClick={() => setOpen(false)}>{t("about_me")}</Link>
        <Link href="/v/preview/webs" onClick={() => setOpen(false)}>{t("webs")}</Link>
        <a href={MOVE_URL} onClick={() => setOpen(false)}>Move<ArrowUpRight size={12} /></a>
        <Link href="/v/preview/cv" className="nav-cv" onClick={() => setOpen(false)}>{t("cv")}<ArrowUpRight size={14} /></Link>
      </nav>
      <div className="header-controls">
        <label className="sr-only" htmlFor="studio-language">{locale === "es" ? "Idioma" : "Language"}</label>
        <select id="studio-language" value={locale} disabled={pending} onChange={e => changeLanguage(e.target.value)}>
          <option value="ca">CA</option><option value="es">ES</option><option value="en">EN</option><option value="fr">FR</option>
        </select>
        <button className="studio-menu" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="studio-navigation" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </header>
  );
}
