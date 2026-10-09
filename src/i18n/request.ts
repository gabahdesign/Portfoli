import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export const locales = ['ca', 'es', 'en', 'fr'];
export const defaultLocale = 'ca';

export default getRequestConfig(async () => {
  let locale = defaultLocale;
  
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  
  if (localeCookie && locales.includes(localeCookie)) {
    locale = localeCookie;
  }

  return {
    locale,
    messages: (await import(`../lib/i18n/${locale}.json`)).default
  };
});
