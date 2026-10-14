import { NextRequest, NextResponse } from 'next/server';
import {isLocale,localePath,stripLocale} from '@/lib/locales';
import { createServerClient } from '@supabase/ssr';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export async function proxy(request: NextRequest) {
  const rawPath = request.nextUrl.pathname;
  // The calendar owns every route, asset and server function under /move.
  // Do not localize these URLs or run the portfolio's auth middleware on them.
  if (rawPath === '/move' || rawPath.startsWith('/move/')) return NextResponse.next();
  const prefix = rawPath.split('/')[1];
  const preferred = request.nextUrl.searchParams.get('lang') || request.headers.get('x-descobreix-locale') || request.cookies.get('NEXT_LOCALE')?.value;
  const locale = isLocale(prefix) ? prefix : isLocale(preferred) ? preferred : 'ca';
  const localized = isLocale(prefix);
  const path = localized ? stripLocale(rawPath) : rawPath;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-descobreix-locale', locale);
  requestHeaders.set('x-descobreix-path', path);
  const destination = request.nextUrl.clone();
  destination.pathname = path;
  // Preserve the browser's origin: Next dev normalizes 127.0.0.1 to
  // localhost, which would turn this into an external rewrite and loop.
  const incomingHost = request.headers.get('host');
  if (incomingHost) destination.host = incomingHost;
  const makeResponse = () => localized ? NextResponse.rewrite(destination,{request:{headers:requestHeaders}}) : NextResponse.next({request:{headers:requestHeaders}});
  let response = makeResponse();

  const hostname = request.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'descobreix.com';
  const url = request.nextUrl;
  const pathname = path;

  // -------------------------------------------------------------------------
  // 1. SUBDOMAIN REWRITES (Move & Impostor)
  // -------------------------------------------------------------------------
  const isMoveSubdomain = hostname.startsWith('move.');
  const isImpostorSubdomain = hostname.startsWith('impostor.');

  if (isMoveSubdomain) {
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/v/preview/move', request.url));
    }
    if (!pathname.startsWith('/v/preview/move')) {
      return NextResponse.rewrite(new URL(`/v/preview/move${pathname}`, request.url));
    }
  }

  if (isImpostorSubdomain) {
    if (pathname === '/' || pathname === '/index.html') {
      return NextResponse.rewrite(new URL('/webs/impostor/index.html', request.url));
    }
    if (!pathname.startsWith('/webs/impostor')) {
      return NextResponse.rewrite(new URL(`/webs/impostor${pathname}`, request.url));
    }
  }

  // Language URLs never rewrite API calls or bundled assets.
  if (!localized && !isLocale(request.headers.get('x-descobreix-locale')) && !pathname.startsWith('/api/') && !pathname.startsWith('/webs/') && !pathname.includes('.')) {
    const localizedUrl = request.nextUrl.clone();
    localizedUrl.pathname = localePath(locale, pathname);
    localizedUrl.searchParams.delete('lang');
    return NextResponse.redirect(localizedUrl);
  }
  response.cookies.set('NEXT_LOCALE',locale,{path:'/',maxAge:31536000,sameSite:'lax'});

  // -------------------------------------------------------------------------
  // 2. SUPABASE AUTH & SESSION (Extracted from old proxy.ts)
  // -------------------------------------------------------------------------
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { 'x-portfolio-token': pathname.match(/^\/v\/([^/]+)/)?.[1] || '' } },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = makeResponse();
          response.cookies.set("NEXT_LOCALE",locale,{path:"/",maxAge:31536000,sameSite:"lax"});
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Restore the personal context on every public page, never in administration.
  const remembered = request.cookies.get('about_access')?.value;
  if (remembered && /^[a-f0-9]{24,64}$/.test(remembered) && user?.id !== 'a899bd7c-d921-4bf4-a3d6-63ff0460e418' && (pathname === '/' || pathname === '/v/preview' || pathname.startsWith('/v/preview/'))) {
    const destination = new URL(request.url);
    destination.pathname = pathname === '/' ? `/v/${remembered}` : pathname.replace('/v/preview', `/v/${remembered}`);
    // The destination's regular token validation checks revocation and expiry.
    return NextResponse.redirect(destination);
  }

  // Redirect /admin users without auth
  if (pathname.startsWith('/admin') && pathname !== '/admin' && user?.id !== 'a899bd7c-d921-4bf4-a3d6-63ff0460e418') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Token interception for /v/[token]
  const tokenMatch = pathname.match(/^\/v\/([^\/]+)/);
  if (tokenMatch) {
    const token = tokenMatch[1];
    
    // Bypass for preview mode
    if (token === 'preview') {
      response.cookies.set('current_token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 });
    } else {
      // Server validation step against Supabase
      const { data: tokenData, error } = await supabase
        .from('access_tokens')
        .select('id, active, expires_at')
        .eq('token', token)
        .single();

      if (error || !tokenData || !tokenData.active) {
        if (remembered === token) {
          const fallback = NextResponse.redirect(new URL(pathname.replace(`/v/${token}`, '/v/preview'), request.url));
          fallback.cookies.set('about_access', '', {path:'/', maxAge:0});
          return fallback;
        }
        request.nextUrl.pathname = '/404';
        return NextResponse.rewrite(request.nextUrl);
      }

      if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
        if (remembered === token) {
          const fallback = NextResponse.redirect(new URL(pathname.replace(`/v/${token}`, '/v/preview'), request.url));
          fallback.cookies.set('about_access', '', {path:'/', maxAge:0});
          return fallback;
        }
        request.nextUrl.pathname = '/404';
        return NextResponse.rewrite(request.nextUrl);
      }
      
      response.cookies.set('current_token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 });
    }
  }

  // -------------------------------------------------------------------------
  // 3. SECURITY HEADERS (CSP, etc.)
  // -------------------------------------------------------------------------
  const headers = response.headers;
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  const cspValue = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google-analytics.com https://*.googletagmanager.com https://unpkg.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com;
    img-src 'self' blob: data: https://*.supabase.co https://*.googleusercontent.com https://drive.google.com https://*.tile.openstreetmap.org https://unpkg.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com;
    frame-src 'self' https://www.youtube.com;
    object-src 'self' https://*.supabase.co;
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim();
  headers.set('Content-Security-Policy', cspValue);

  return response;
}
