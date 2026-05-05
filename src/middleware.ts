import { NextRequest, NextResponse } from 'next/server';

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

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Define domains - You can change these if your domain is different
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'descobreix.com';
  
  // Detection logic
  const isMoveSubdomain = hostname.startsWith('move.');
  const isImpostorSubdomain = hostname.startsWith('impostor.');

  // 1. Handle MOVE subdomain
  if (isMoveSubdomain) {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/v/preview/move', req.url));
    }
    // Avoid double rewrites if path already starts with /v/preview/move
    if (url.pathname.startsWith('/v/preview/move')) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL(`/v/preview/move${url.pathname}`, req.url));
  }

  // 2. Handle IMPOSTOR subdomain
  if (isImpostorSubdomain) {
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return NextResponse.rewrite(new URL('/webs/impostor/index.html', req.url));
    }
    if (url.pathname.startsWith('/webs/impostor')) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL(`/webs/impostor${url.pathname}`, req.url));
  }

  // 3. Default: Portfolio on descobreix.com
  return NextResponse.next();
}
