import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { token, event_type, work_id, duration_sec, scroll_pct } = await req.json();

    if (!token || !event_type) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = await createClient();

    // Resolve token → company
    const { data: tokenRow } = await supabase
      .from("access_tokens")
      .select("id, company_id")
      .eq("token", token)
      .single();

    await supabase.from("analytics_events").insert({
      token_id: tokenRow?.id ?? null,
      company_id: tokenRow?.company_id ?? null,
      work_id: work_id ?? null,
      event_type,
      duration_sec: duration_sec ?? null,
      scroll_pct: scroll_pct ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
