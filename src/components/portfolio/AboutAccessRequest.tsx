"use client";
import { useUiTranslation } from "@/lib/fixed-ui-client";
import { useState } from "react";
import { LockKeyhole, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AboutAccessRequest() {
 const ui = useUiTranslation();




  const [busy,setBusy]=useState(false);
  const [sent,setSent]=useState(false);
  const [error,setError]=useState("");
  const [codeError,setCodeError]=useState("");
  const [unlocking,setUnlocking]=useState(false);
  async function unlock(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();setUnlocking(true);setCodeError("");
    const form=new FormData(e.currentTarget);
    try {
      const response=await fetch("/api/about/access",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:form.get("code"),remember:form.get("remember")==="on"})});
      const result=await response.json();
      if(!response.ok) setCodeError(result.error); else window.location.assign(result.path);
    } catch {setCodeError("No s’ha pogut connectar. Torna-ho a provar.");}
    setUnlocking(false);
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    const form = new FormData(e.currentTarget);
    if (form.get("website")) { setSent(true); setBusy(false); return; }
    const {error} = await createClient().from("access_requests").insert({
      name: String(form.get("name")).trim(), email:String(form.get("email")).trim(),
      linkedin:String(form.get("linkedin") || "").trim(), reason:String(form.get("reason") || "").trim(), status:"pending",
    });
    setBusy(false);
    if(error) setError("No s’ha pogut enviar la sol·licitud. Torna-ho a provar."); else setSent(true);
  }
  return <section className="about-request max-w-2xl mx-auto px-6 py-16">
    <LockKeyhole size={28}/><p className="studio-eyebrow mt-6">{ui("Espai privat")}</p><h1 className="text-4xl sm:text-6xl mt-3">{ui("Sobre mi")}</h1>
    <p className="text-[var(--color-muted)] mt-5 mb-9">{ui("Introdueix el teu codi per accedir a la meva trajectòria i al currículum, o sol·licita’n un.")}</p>
    <form onSubmit={unlock} className="space-y-4 border border-[var(--color-border)] rounded-xl p-6 mb-9">
      <label className="block">{ui("Codi d’accés")}<input name="code" autoComplete="off" autoCapitalize="none" spellCheck={false} required maxLength={80}/></label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="remember" defaultChecked style={{width:"auto"}}/>{ui("Recordar l’accés en aquest navegador")}</label>
      {codeError&&<p role="alert">{ui(codeError)}</p>}
      <button disabled={unlocking} className="access-primary">{unlocking?ui("Comprovant…"):ui("Accedir a Sobre mi")}</button>
    </form>
    <h2 className="text-xl mb-5">{ui("Sol·licitar un codi")}</h2>
    {sent ? <div role="status" className="border border-[var(--color-border)] rounded-xl p-6"><h2 className="text-xl">{ui("Sol·licitud enviada")}</h2><p className="mt-3 text-[var(--color-muted)]">{ui("La teva petició ja és al meu panell de control. Et contactaré al correu que has indicat quan la revisi.")}</p></div> : <form onSubmit={submit} className="space-y-5">
      <label className="block">{ui("Nom i cognoms")}<input name="name" autoComplete="name" required minLength={2} maxLength={120}/></label>
      <label className="block">{ui("Correu electrònic")}<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
      <label className="block">{ui("Empresa o perfil de LinkedIn")} <span className="text-[var(--color-muted)]">{ui("(opcional)")}</span><input name="linkedin" maxLength={500}/></label>
      <label className="block">{ui("Motiu de la sol·licitud")}<textarea name="reason" required maxLength={2000} rows={4}/></label>
      <div hidden aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off"/></div>
      <p className="text-xs text-[var(--color-muted)]">{ui("Faré servir aquestes dades per gestionar la teva sol·licitud.")} <a href="/v/preview/legal/privacitat" className="underline">{ui("Privacitat")}</a></p>
      {error && <p role="alert">{ui(error)}</p>}
      <button disabled={busy} className="access-primary">{busy ? ui("Enviant…") : ui("Sol·licitar accés")}<ArrowUpRight size={17}/></button>
    </form>}
  </section>;
}
