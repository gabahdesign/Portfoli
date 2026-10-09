import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
function sameOrigin(request:NextRequest){try{return new URL(request.headers.get('origin')||'').host===request.headers.get('host');}catch{return false;}}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({error:"Sol·licitud no vàlida"},{status:403});
  const body = await request.json().catch(()=>null);
  const code = typeof body?.code === "string" ? body.code.replace(/[\s-]/g, "").toLowerCase() : "";
  if (!/^[a-f0-9]{24,64}$/.test(code)) return NextResponse.json({error:"Codi incorrecte o caducat."},{status:400});
  const supabase = await createClient(code);
  const {data,error} = await supabase.from("access_tokens").select("active,expires_at").eq("token",code).maybeSingle();
  if(error || !data?.active || (data.expires_at && Date.parse(data.expires_at)<=Date.now())) return NextResponse.json({error:"Codi incorrecte o caducat."},{status:401});
  const response = NextResponse.json({path:`/v/${code}/sobre-mi`});
  response.headers.set("Cache-Control","no-store");
  response.cookies.set("about_access",code,{httpOnly:true,secure:request.nextUrl.protocol==="https:",sameSite:"lax",path:"/",...(body.remember ? {maxAge:Math.max(1,Math.min(60*86400,data.expires_at ? Math.floor((Date.parse(data.expires_at)-Date.now())/1000) : 60*86400))} : {})});
  return response;
}

export async function DELETE(request:NextRequest) {
  if(!sameOrigin(request)) return new NextResponse(null,{status:403});
  const response=NextResponse.json({ok:true});
  response.cookies.set("about_access","",{path:"/",maxAge:0});
  return response;
}
