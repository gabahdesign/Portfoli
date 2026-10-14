import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state");
  if (!state || !/^[a-f0-9]{64}$/.test(state)) return new NextResponse("Sol·licitud no vàlida", { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL(`/admin?calendar_state=${state}`, request.url));
  if (user.id !== "a899bd7c-d921-4bf4-a3d6-63ff0460e418") return new NextResponse("Accés no autoritzat", { status: 403 });
  const calendarOrigin = "https://elcalendario.lovable.app/move";
  const local = process.env.NODE_ENV !== "production";
  const portfolioOrigin = local ? "http://127.0.0.1:3000" : "https://descobreix.com";
  const callback = new URL("/move/auth", portfolioOrigin);
  const lang = request.cookies.get("NEXT_LOCALE")?.value || "ca";
  callback.searchParams.set("sso", "descobreix");
  callback.searchParams.set("lang", ["ca","es","en","fr","oc","ast","gl","an","eu"].includes(lang) ? lang : "ca");
  // Read the session token only after getUser has validated the current owner.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new NextResponse("Torna a iniciar sessió", { status: 401 });
  let tokenHash: string;
  try {
    const exchangeOrigin = (process.env.CALENDAR_SSO_EXCHANGE_ORIGIN || (process.env.CALENDAR_UPSTREAM_URL ? `${process.env.CALENDAR_UPSTREAM_URL.replace(/\/$/, "")}/move` : local ? "http://127.0.0.1:3001/move" : calendarOrigin)).replace(/\/$/, "");
    const exchange = await fetch(`${exchangeOrigin}/api/auth/descobreix`, {
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
