import {getRequestConfig} from 'next-intl/server';
import {cookies, headers} from 'next/headers';
import {LOCALES,isLocale} from '@/lib/locales';
import ca from '@/lib/i18n/ca.json';
export const locales = [...LOCALES];
export const defaultLocale = 'ca';
export default getRequestConfig(async () => {
 const cookieStore = await cookies();
 const requestHeaders = await headers();
 const preferred = requestHeaders.get('x-descobreix-locale') || cookieStore.get('NEXT_LOCALE')?.value;
 const locale = isLocale(preferred) ? preferred : defaultLocale;
 const translated = (await import(`../lib/i18n/${locale}.json`)).default;
 const messages = Object.fromEntries(Object.entries(ca).map(([key,value])=>[key,{...value,...translated[key]}]));
 return {locale,messages};
});
