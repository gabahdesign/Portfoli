"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
type RequestRow={id:string;name:string;email:string;linkedin:string;reason:string;status:string;created_at:string;access_tokens:{token:string}|null};

export default function AccessRequests() {
  const supabase=useMemo(()=>createClient(),[]);
  const [requests,setRequests]=useState<RequestRow[]>([]);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState<string|null>(null);
  const [copied,setCopied]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{
    const {data,error}=await supabase.from("access_requests").select("*,access_tokens(token)").order("created_at",{ascending:false}).limit(100);
    if(error) setError("No s’han pogut carregar les sol·licituds."); else setRequests(data||[]);
    setLoading(false);
  },[supabase]);
  useEffect(()=>{void load(); const id=setInterval(()=>{if(document.visibilityState==="visible") void load();},30000); return()=>clearInterval(id);},[load]);
  async function review(id:string,approve:boolean) {
    setBusy(id);setError("");
    const {error}=await supabase.rpc("review_about_request",{request_id:id,approve});
    setBusy(null);
    if(error) setError("No s’ha pogut revisar la petició. Actualitza la llista i torna-ho a provar.");
    else { await load(); window.dispatchEvent(new Event("access-links-changed")); }
  }
  return <section className="access-requests" id="sollicituds">
    <div className="flex justify-between gap-4 items-center mb-5"><div><h2 className="text-2xl">Sol·licituds de Sobre mi <span className="text-[var(--color-muted)]">({requests.filter(r=>r.status==="pending").length})</span></h2><p className="text-sm text-[var(--color-muted)] mt-2">Les peticions noves apareixen aquí. Acceptar crea un accés personal de 60 dies.</p></div><button onClick={()=>void load()} className="access-secondary">Actualitzar</button></div>
    {error&&<p role="alert" className="mb-4">{error}</p>}
    {loading ? <p>Carregant sol·licituds…</p> : !requests.length ? <p className="text-[var(--color-muted)] py-5">No hi ha sol·licituds.</p> : <div className="grid gap-3">{requests.map(r=><article key={r.id} className="border border-[var(--color-border)] rounded-xl p-5">
      <div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{r.name}</h3><a className="text-sm underline" href={`mailto:${r.email}`}>{r.email}</a></div><span className="text-xs text-[var(--color-muted)]">{r.status==="pending" ? "Pendent" : r.status==="approved" ? "Acceptada" : "Rebutjada"} · {new Date(r.created_at).toLocaleDateString("ca-ES")}</span></div>
      {r.linkedin&&<p className="text-sm mt-3 break-words">{r.linkedin}</p>}<p className="text-sm text-[var(--color-muted)] mt-3 whitespace-pre-wrap break-words">{r.reason}</p>
      {r.status==="pending"&&<div className="flex gap-3 mt-5"><button className="access-primary" disabled={busy===r.id} onClick={()=>review(r.id,true)}>Acceptar</button><button className="access-secondary" disabled={busy===r.id} onClick={()=>review(r.id,false)}>Rebutjar</button></div>}
      {r.status==="approved"&&r.access_tokens&&<div className="mt-4"><button className="access-secondary" onClick={async()=>{try {await navigator.clipboard.writeText(`${location.origin}/v/${r.access_tokens!.token}/sobre-mi`);setCopied(r.id);}catch{setError("No s’ha pogut copiar l’enllaç.");}}}>{copied===r.id ? "Enllaç copiat" : "Copiar enllaç d’accés"}</button><p className="text-xs text-[var(--color-muted)] mt-2">Comparteix aquest enllaç amb la persona. No s’envia cap correu automàticament.</p></div>}
    </article>)}</div>}
  </section>;
}
