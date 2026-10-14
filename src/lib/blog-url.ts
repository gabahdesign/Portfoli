import { isLocale } from "./locales";

/** WordPress remains a separate preview until the IONOS migration is ready. */
export function wordpressBlogUrl(locale: string, admin = false): string {
  const local = process.env.NODE_ENV === "development";
  const base = admin
    ? process.env.NEXT_PUBLIC_WORDPRESS_ADMIN_URL || (local ? "http://127.0.0.1:3003/wp-admin/edit.php" : "https://blog.descobreix.com/wp-admin/edit.php")
    : process.env.NEXT_PUBLIC_WORDPRESS_BLOG_URL || (local ? "http://127.0.0.1:3003/blog/" : "https://blog.descobreix.com/");
  const url = new URL(base);
  url.searchParams.set("lang", isLocale(locale) ? locale : "ca");
  return url.toString();
}

export function wordpressPageUrl(locale: string, path: string): string {
  const url = new URL(wordpressBlogUrl(locale, false));
  url.pathname = path.startsWith("/") ? path : `/${path}`;
  url.searchParams.set("lang", isLocale(locale) ? locale : "ca");
  return url.toString();
}
