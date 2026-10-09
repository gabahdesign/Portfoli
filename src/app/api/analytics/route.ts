import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export const dynamic='force-dynamic';
export async function POST(request:NextRequest){
 try{
  const body=JSON.parse(await request.text());
  const {token,event_type,page_path,work_id,duration_sec,scroll_pct}=body;
  if(typeof token!=="string"||token.length>256||!["page_enter","page_leave","page_view","work_view"].includes(event_type))return new NextResponse('Invalid event',{status:400});
  const supabase=await createClient(token);
  const {data:{user}}=await supabase.auth.getUser();
  if(user)return new NextResponse(null,{status:204});
  const publicVisit=token==='preview';
  const {data:link}=publicVisit?{data:null}:await supabase.from('access_tokens').select('id,active,expires_at').eq('token',token).maybeSingle();
  if(!publicVisit&&(!link?.active||(link.expires_at&&new Date(link.expires_at)<=new Date())))return new NextResponse('Invalid access',{status:403});
  // Paths describe the page, never store the private access token or query string.
  const prefix=`/v/${token}`;
  const path=publicVisit&&page_path==='/'?'/':typeof page_path==='string'&&(page_path===prefix||page_path.startsWith(prefix+'/'))?(page_path.slice(prefix.length).split('?')[0]||'/'):null;
  if(event_type==='page_enter'&&(!path||path.length>500))return new NextResponse('Invalid page',{status:400});
  const resource_id=typeof work_id==='string'&&/^[a-f0-9-]{36}$/i.test(work_id)?work_id:null;
  const {error}=await supabase.from('analytics_events').insert({token_id:link?.id||null,event_type,page_path:path,resource_id,duration_sec:Math.min(86400,Math.max(0,Math.round(Number(duration_sec)||0))),scroll_pct:Math.min(100,Math.max(0,Math.round(Number(scroll_pct)||0)))});
  return new NextResponse(error?'Analytics unavailable':'OK',{status:error?500:200});
 }catch{return new NextResponse('Invalid event',{status:400});}
}
