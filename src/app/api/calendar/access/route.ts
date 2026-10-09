import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state");
  if (!state || !/^[a-f0-9]{64}$/.test(state)) return new NextResponse("Sol·licitud no vàlida", { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL(`/admin?calendar_state=${state}`, request.url));
  if (user.id !== "a899bd7c-d921-4bf4-a3d6-63ff0460e418") return new NextResponse("Accés no autoritzat", { status: 403 });
  const calendarOrigin = "https://elcalendario.lovable.app";
  const callback = new URL(process.env.CALENDAR_SSO_CALLBACK_URL || `${calendarOrigin}/auth`);
  const local = process.env.NODE_ENV !== "production" && callback.origin === "http://127.0.0.1:3001";
  if ((!local && callback.origin !== calendarOrigin) || callback.pathname !== "/auth" || callback.search || callback.hash) return new NextResponse("Configuració no vàlida", { status: 503 });
  // Read the session token only after getUser has validated the current owner.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new NextResponse("Torna a iniciar sessió", { status: 401 });
  let tokenHash: string;
  try {
    const exchange = await fetch(`${local ? callback.origin : calendarOrigin}/api/auth/descobreix`, {
      method: "POST", headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000),
    });
    if (!exchange.ok) return new NextResponse("No s’ha pogut connectar l’accés del calendari. Torna-ho a provar.", { status: exchange.status === 403 ? 403 : 502 });
    const result = await exchange.json();
    if (typeof result.token_hash !== "string" || !/^[a-f0-9]{40,64}$/.test(result.token_hash)) return new NextResponse("Resposta d’accés no vàlida", { status: 502 });
    tokenHash = result.token_hash;
  } catch {
    return new NextResponse("El servei d’accés no està disponible. Torna-ho a provar.", { status: 502 });
  }
  // One-use Supabase token in a fragment: never sent to the calendar web server.
  callback.hash = new URLSearchParams({ sso_token_hash: tokenHash, sso_state: state }).toString();
  const response = NextResponse.redirect(callback);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
