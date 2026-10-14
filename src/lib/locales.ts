export const LOCALES = ["ca", "es", "en", "fr", "oc", "ast", "gl", "an", "eu"] as const;
export type Locale = typeof LOCALES[number];
export const LANGUAGE_NAMES: Record<Locale,string> = {ca:"Català",es:"Español",en:"English",fr:"Français",oc:"Aranés",ast:"Asturianu",gl:"Galego",an:"Aragonés",eu:"Euskara"};
export function isLocale(value: string | null | undefined): value is Locale { return LOCALES.includes(value as Locale); }
export function stripLocale(path: string): string { return path.replace(/^\/(ca|es|en|fr|oc|ast|gl|an|eu)(?=\/|$)/, "") || "/"; }
export function localePath(locale: string, path: string): string { const clean = stripLocale(path); return `/${isLocale(locale) ? locale : "ca"}${clean === "/" ? "" : clean}`; }
export function rememberLocale(locale: string) { if (!isLocale(locale)) return; localStorage.setItem("descobreix-language", locale); document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`; }
export function calendarLocaleUrl(url: string, locale: string) { const relative=url.startsWith('/'); const next = new URL(url,"https://descobreix.com"); next.searchParams.set("lang",isLocale(locale) ? locale : "ca"); return relative ? next.pathname+next.search+next.hash : next.toString(); }
