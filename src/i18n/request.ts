import {getRequestConfig} from 'next-intl/server';
import {cookies, headers} from 'next/headers';

export const locales = ['ca', 'es', 'en', 'fr'];
export const defaultLocale = 'ca';

export default getRequestConfig(async () => {
  let locale = defaultLocale;
  
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  
  if (localeCookie && locales.includes(localeCookie)) {
    locale = localeCookie;
  } else {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';
    
    // Simple basic locale detection from Accept-Language header
    const langs = acceptLanguage.split(',').map(l => l.split(';')[0].trim().substring(0,2).toLowerCase());
    for (const l of langs) {
      if (locales.includes(l)) {
        locale = l;
        break;
      }
    }
  }

  return {
    locale,
    messages: (await import(`../lib/i18n/${locale}.json`)).default
  };
});
