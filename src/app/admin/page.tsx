"use client";
import { useUiTranslation } from "@/lib/fixed-ui-client";
import {useState} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowUpRight,Sun,Moon} from "lucide-react";
import {createClient} from "@/lib/supabase/client";
import {useLocale} from "next-intl";
import {localePath} from "@/lib/locales";
import {LanguageSelector} from "@/components/ui/LanguageSelector";
export default function AdminLogin(){
 const ui = useUiTranslation();




 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(false),[dark,setDark]=useState(false);
 const locale=useLocale();
 async function login(e:React.FormEvent){
  e.preventDefault();setLoading(true);setError("");
  try {
   const {error:authError}=await createClient().auth.signInWithPassword({email:email.trim(),password});
   if(authError){
    console.warn("Admin sign-in failed", JSON.stringify({code:authError.code,status:authError.status,message:authError.message}));
    setError(authError.status===402 ? "El servei d’accés està bloquejat perquè s’ha superat la quota d’emmagatzematge." : authError.code==='invalid_credentials' ? "El correu o la contrasenya no són correctes. Torna-ho a provar." : authError.code==='email_not_confirmed' ? "Confirma el teu correu abans d’iniciar sessió." : authError.status===429 ? "Massa intents. Espera uns minuts i torna-ho a provar." : "No s’ha pogut connectar amb el servei d’accés.");
    return;
   }
   const state=new URLSearchParams(location.search).get("calendar_state");
   location.assign(state&&/^[a-f0-9]{64}$/.test(state) ? `/api/calendar/access?state=${state}` : localePath(locale,"/admin/dashboard"));
  } catch {setError("No s’ha pogut connectar amb el servei d’accés.");}
  finally {setLoading(false);}
 }
 return <div className="descobreix-access"><div className="absolute top-6 right-6 flex gap-3 items-center"><LanguageSelector/><button type="button" aria-label={ui("Canviar aparença")} onClick={()=>{const value=document.documentElement.dataset.studioTheme!=="dark";document.documentElement.dataset.studioTheme=value?"dark":"light";localStorage.setItem("studio-theme",value?"dark":"light");setDark(value);}} className="access-secondary">{dark?<Sun size={17}/>:<Moon size={17}/>}</button></div><section className="descobreix-access-intro"><Link href="/" className="flex gap-2 items-center text-sm"><ArrowLeft size={17}/>{ui("Tornar al web")}</Link><div><p className="text-sm uppercase tracking-widest text-[var(--color-muted)] mb-5">Descobreix</p><h1 className="text-5xl sm:text-6xl leading-tight">{ui("El teu espai.")}<br/>{ui("Tot connectat.")}</h1><p className="text-[var(--color-muted)] mt-6 max-w-sm">{ui("Gestiona els projectes, el blog i el teu perfil. Accedeix al calendari Move amb el mateix compte.")}</p></div><p className="text-xs text-[var(--color-muted)] mt-6">{ui("Disseny · Comunitat · Trajectòria")}</p></section><section className="descobreix-access-card"><p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">{ui("Administració")}</p><h2 className="text-3xl mt-3">{ui("Benvingut de nou")}</h2><p className="text-sm text-[var(--color-muted)] mt-3 mb-8">{ui("Inicia sessió per editar Descobreix.")}</p><form onSubmit={login} className="space-y-5"><label className="block text-sm" htmlFor="admin-email">{ui("Correu electrònic")}<input id="admin-email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="block text-sm" htmlFor="admin-password">{ui("Contrasenya")}<input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p role="alert" className="text-sm">{ui(error)}</p>}<button disabled={loading} className="access-primary w-full">{loading?ui("Verificant…"):ui("Iniciar sessió")}<ArrowUpRight size={17}/></button></form></section></div>;
}
