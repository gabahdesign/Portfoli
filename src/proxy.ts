import { NextRequest, NextResponse } from 'next/server';
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
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const hostname = request.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'descobreix.com';
  const url = request.nextUrl;
  const pathname = url.pathname;

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

  // -------------------------------------------------------------------------
  // 2. SUPABASE AUTH & SESSION (Extracted from old proxy.ts)
  // -------------------------------------------------------------------------
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Redirect /admin users without auth
  if (pathname.startsWith('/admin') && pathname !== '/admin' && !session) {
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
        request.nextUrl.pathname = '/404';
        return NextResponse.rewrite(request.nextUrl);
      }

      if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
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
