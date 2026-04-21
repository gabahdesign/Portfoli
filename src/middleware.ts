import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // 1. Private Access Token Validation
  // Matches /v/[token] paths
  const viewerMatch = pathname.match(/^\/v\/([^/]+)/)
  if (viewerMatch) {
    const token = viewerMatch[1]

    // Skip validation for preview mode
    if (token !== 'preview') {
      const { data, error } = await supabase
        .from('access_tokens')
        .select('id, active, expires_at')
        .eq('token', token)
        .maybeSingle()

      const now = new Date()
      const isExpired = data?.expires_at && new Date(data.expires_at) < now

      if (error || !data || !data.active || isExpired) {
        // Token invalid, expired or inactive
        console.warn(`Invalid or expired token access attempt: ${token}`)
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  // 2. Admin Protection (Optional but recommended if not using RLS only)
  if (pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
