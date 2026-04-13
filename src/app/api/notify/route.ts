import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

// Lazy init resend only when key exists
let resend: Resend | null = null;

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch token details
    const { data: tokenData, error } = await supabase
      .from("access_tokens")
      .select("id, label, notify_email")
      .eq("token", token)
      .single();

    if (error || !tokenData) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    if (tokenData.notify_email && process.env.RESEND_API_KEY) {
      if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
      
      // Setup the email receiver
      const notificationEmail = process.env.NOTIFICATION_EMAIL || "marcg@example.com"; 

      await resend.emails.send({
        from: "Notificaciones Portfolio <onboarding@resend.dev>",
        to: [notificationEmail],
        subject: `Nuevo Acceso al Portfolio: ${tokenData.label}`,
        html: `<p>El usuario con el token asignado a <strong>${tokenData.label}</strong> acaba de acceder a tu portfolio.</p>`
      });

      // Update to not notify again
      await supabase
        .from("access_tokens")
        .update({ notify_email: false })
        .eq("id", tokenData.id);
      
      return NextResponse.json({ success: true, notified: true });
    }

    return NextResponse.json({ success: true, notified: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
