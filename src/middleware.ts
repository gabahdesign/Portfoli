import { createServerClient, type NextRequest, type NextResponse } from '@supabase/ssr'
import { NextResponse as Response } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = Response.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. SUPABASE SESSION REFRESH
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = Response.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  // 2. SECURITY HEADERS (Non-blocking)
  const headers = response.headers
  
  // HSTS - Force HTTPS
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')
  
  // Prevent clickjacking (sameorigin allowed for admin)
  headers.set('X-Frame-Options', 'SAMEORIGIN')
  
  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')

  // [USER REQUEST] Per-request CSP (Optimized for no breakage)
  // Allowing Google, Supabase, Vercel, and Leaflet
  const cspValue = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google-analytics.com https://*.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com;
    img-src 'self' blob: data: https://*.supabase.co https://*.googleusercontent.com https://drive.google.com https://*.tile.openstreetmap.org https://unpkg.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com;
    frame-src 'self' https://www.youtube.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim();

  headers.set('Content-Security-Policy', cspValue)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
