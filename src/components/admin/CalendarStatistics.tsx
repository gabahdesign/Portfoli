"use client";
import { useUiTranslation } from "@/lib/fixed-ui-client";
import {useEffect,useState} from 'react';
import Link from "next/link";
import { MOVE_URL } from "@/lib/move-url";
import {ActivityChart} from './ActivityChart';
type Data={visits:number;days:{date:string;count:number}[];groups:{id:string;name_ca:string;kind:string;views:number;whatsapp:number;location:number;plans_week:number;plans_month:number}[];topPlans:{id:string;title:string;community:string;views:number;whatsapp:number;location:number}[];pendingRequests:number};
export default function CalendarStatistics(){
 const ui = useUiTranslation();




 const [data,setData]=useState<Data|null>(null),[error,setError]=useState(''),[kind,setKind]=useState('all');
 async function load(){setError('');try{const r=await fetch('/api/calendar/stats');if(!r.ok)throw new Error();setData(await r.json());}catch{setError('No s’han pogut carregar les estadístiques del calendari.');}}
 useEffect(()=>{void load();},[]);
 const chart=Array.from({length:30},(_,i)=>{const d=new Date();d.setDate(d.getDate()-29+i);return{date:d.toLocaleDateString('ca-ES',{day:'numeric',month:'short'}),count:data?.days.find(x=>x.date===d.toISOString().slice(0,10))?.count||0};});
 const requestsUrl=`${MOVE_URL}/admin?sso=descobreix&tab=requests&lang=${encodeURIComponent(ui.locale)}`;
 return <section className="p-4 md:p-8 space-y-6"><div><p className="studio-eyebrow">{ui("Move · Últims 30 dies")}</p><h2 className="text-3xl mt-2">{ui("Estadístiques del calendari")}</h2><p className="text-sm text-[var(--color-muted)] mt-3">{ui("Les visites generals i les obertures de plans es registren des d’aquesta actualització. Les interaccions de WhatsApp, ubicació i comunitats conserven l’historial disponible.")}</p></div>{error?<div role="alert">{ui(error)} <button className="access-secondary" onClick={()=>void load()}>{ui("Tornar-ho a provar")}</button></div>:!data?<p>{ui("Carregant les dades de Move…")}</p>:<>
 <div className="flex flex-wrap items-center justify-between gap-4 border border-[var(--color-border)] rounded-xl p-5"><div><p className="text-sm text-[var(--color-muted)]">{ui("Sol·licituds pendents de comunitats")}</p><p className="text-2xl font-semibold mt-1">{data.pendingRequests}</p></div><Link className="access-secondary" href={requestsUrl} aria-label={ui("Sol·licituds pendents de comunitats")}>{ui("Sol·licituds")}</Link></div>
 <div className="border border-[var(--color-border)] rounded-xl p-6"><p className="text-3xl mb-5">{data.visits} <span className="text-base">{ui("pàgines vistes al calendari")}</span></p><ActivityChart data={chart}/></div>
 <div className="border border-[var(--color-border)] rounded-xl p-6"><h3 className="text-xl mb-5">{ui("Plans més oberts")}</h3>{data.topPlans.length?data.topPlans.map((p,i)=><div key={p.id} className="py-4 border-b border-[var(--color-border)]"><p className="font-semibold">{i+1}. {p.title}</p><p className="text-sm text-[var(--color-muted)] mt-2">{p.community} · {p.views} {ui("obertures ·")} {p.whatsapp} {ui("clics a WhatsApp ·")} {p.location} {ui("clics a ubicació")}</p></div>):<p>{ui("Encara no hi ha obertures de plans registrades.")}</p>}</div>
 <div><h3 className="text-xl mb-4">{ui("Comunitats i categories")}</h3><label>{ui("Categoria")}<select className="block p-3 border rounded-lg bg-[var(--color-surface)] my-4" value={kind} onChange={e=>setKind(e.target.value)}><option value="all">{ui("Totes")}</option>{[...new Set(data.groups.map(g=>g.kind))].map(k=><option key={k} value={k}>{k==='community'?ui("Comunitats"):k==='popular_culture'?ui("Cultura popular"):k==='advertising'?ui("Publicitat"):k}</option>)}</select></label><div className="grid md:grid-cols-2 gap-4">{data.groups.filter(g=>kind==='all'||g.kind===kind).map(g=><article key={g.id} className="border border-[var(--color-border)] rounded-xl p-5"><h4 className="font-semibold">{g.name_ca}</h4><p className="text-sm mt-3">{g.views} {ui("visites ·")} {g.whatsapp} {ui("WhatsApp ·")} {g.location} {ui("ubicació")}</p><p className="text-sm text-[var(--color-muted)] mt-2">{ui("Plans:")} {g.plans_week} {ui("des de fa 7 dies ·")} {g.plans_month} {ui("des de fa 30 dies")}</p></article>)}</div></div>
 </>}</section>;
}
