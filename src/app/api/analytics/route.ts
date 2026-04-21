import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {

  try {
    // navigator.sendBeacon sends data as a string or Blob
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);
    const { token, event_type, work_id, duration_sec, scroll_pct } = body;

    if (!token) return new NextResponse('Token missing', { status: 400 });

    const supabase = await createClient();

    // 1. Get token ID
    const { data: tokenData } = await supabase
      .from('access_tokens')
      .select('id')
      .eq('token', token)
      .maybeSingle();

    if (!tokenData) return new NextResponse('Invalid token', { status: 400 });

    // 2. Insert event
    const { error } = await supabase
      .from('analytics_events')
      .insert([{
        token_id: tokenData.id,
        event_type,
        work_id: work_id || null,
        duration_sec: duration_sec || 0,
        scroll_pct: scroll_pct || 0
      }]);

    if (error) {
      console.error('Analytics error:', error.message);
      return new NextResponse('DB Error', { status: 500 });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('Analytics request error:', err);
    return new NextResponse('Error', { status: 500 });
  }
}
