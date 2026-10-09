import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
export async function GET(){
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(user?.id!=='a899bd7c-d921-4bf4-a3d6-63ff0460e418')return new NextResponse(null,{status:403});
 const {data:{session}}=await supabase.auth.getSession();
 if(!session)return new NextResponse(null,{status:401});
 try{
  const origin='https://elcalendario.lovable.app';
  const response=await fetch(`${origin}/api/auth/descobreix-stats`,{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok)return NextResponse.json({error:'No s’han pogut carregar les dades del calendari.'},{status:502});
  return NextResponse.json(await response.json(),{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'El calendari no està disponible temporalment.'},{status:502});}
}
