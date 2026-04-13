import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { workId, pin } = await req.json();

  if (!workId || !pin) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch the stored pin_hash for this work
  const { data: work, error } = await supabase
    .from("works")
    .select("pin_hash")
    .eq("id", workId)
    .single();

  if (error || !work) {
    return NextResponse.json({ ok: false, error: "Work not found" }, { status: 404 });
  }

  // If no pin_hash is set on this work, access is open
  if (!work.pin_hash) {
    return NextResponse.json({ ok: true });
  }

  // Compare PIN using bcrypt-style check via pgcrypto
  // We use a simple hash comparison: SHA-256 hex of the entered PIN
  const crypto = await import("crypto");
  const enteredHash = crypto.createHash("sha256").update(pin).digest("hex");

  if (enteredHash === work.pin_hash) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Invalid PIN" }, { status: 401 });
}
