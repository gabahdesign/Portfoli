"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Copy, Lock, Star, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminTrabajos() {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const supabase = createClient();
  const router = useRouter();

  const fetchWorks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("works")
      .select("*, companies(name)")
      .order("created_at", { ascending: false });
    if (data) setWorks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el trabajo "${title}" permanentemente?`)) return;
    await supabase.from("works").delete().eq("id", id);
    fetchWorks();
  };

  const handleDuplicate = async (work: any) => {
    if (!confirm(`¿Duplicar el trabajo "${work.title}"?`)) return;
    
    const newWork = {
      ...work,
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
      companies: undefined,
      slug: `${work.slug}-copia-${Date.now()}`,
      title: `${work.title} (Copia)`,
      status: 'draft'
    };
    
    Object.keys(newWork).forEach(key => newWork[key] === undefined && delete newWork[key]);

    const { error } = await supabase.from("works").insert([newWork]);
    if (error) {
      alert("Error duplicando: " + error.message);
    } else {
      fetchWorks();
    }
  };

  const filteredWorks = works.filter((wk) => {
    if (statusFilter !== "all" && wk.status !== statusFilter) return false;
    if (companyFilter !== "all" && (wk.company_id || "none") !== companyFilter) return false;
    return true;
  });

  const uniqueCompanies = Array.from(new Set(works.map(w => w.company_id || "none")));

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-3xl font-display font-bold text-[var(--color-text)]">Llistat de Projectes i Treballs</h1>
        <button onClick={() => router.push("/admin/trabajos/nuevo/editar")} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-5 py-2.5 rounded-lg flex items-center justify-center transition-colors font-bold shadow-lg shadow-[var(--color-accent-glow)]">
          <Plus className="w-5 h-5 mr-2" /> Nou Treball
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg focus:outline-none focus:border-[var(--color-accent)] text-sm font-medium"
        >
          <option value="all">Tots els estats</option>
          <option value="published">Publicats</option>
          <option value="draft">Esborranys</option>
          <option value="archived">Arxivats</option>
        </select>

        <select 
          value={companyFilter} 
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg focus:outline-none focus:border-[var(--color-accent)] text-sm font-medium"
        >
          <option value="all">Totes les empreses</option>
          {uniqueCompanies.map((id) => {
            const name = id === "none" ? "Sense associar" : works.find(w => w.company_id === id)?.companies?.name || "Desconeguda";
            return <option key={id} value={id}>{name}</option>;
          })}
        </select>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xl">
         {loading ? (
           <div className="p-12 text-center text-[var(--color-muted)]">Carregant treballs...</div>
         ) : filteredWorks.length === 0 ? (
           <div className="p-12 text-center text-[var(--color-muted)] flex flex-col items-center">
             <div className="w-16 h-16 bg-[var(--color-bg)] rounded-full flex items-center justify-center mb-4 border border-[var(--color-border)]">
               <svg className="w-8 h-8 text-[var(--color-border)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </div>
             No hi ha treballs que coincideixin amb els filtres.
           </div>
         ) : (
           <table className="w-full text-left text-sm">
             <thead className="bg-[var(--color-bg)] text-[var(--color-muted)] border-b border-[var(--color-border)]">
               <tr>
                 <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Títol i Empresa</th>
                 <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Estat</th>
                 <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] hidden sm:table-cell">Visibilitat</th>
                 <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">Accions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[var(--color-border)]">
                {filteredWorks.map((wk) => (
                  <tr key={wk.id} className="hover:bg-[var(--color-surface-2)] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[var(--color-text)] mb-0.5">{wk.title}</p>
                      <p className="text-[var(--color-muted)] text-xs font-medium">{wk.companies?.name || "Sense associar"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        wk.status === 'published' 
                         ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' 
                         : wk.status === 'archived' 
                         ? 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' 
                         : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
                      }`}>
                        {wk.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                       <div className="flex gap-2">
                         {wk.featured && <span title="Destacat"><Star className="w-4 h-4 text-[var(--color-accent)] fill-[var(--color-accent)]" /></span>}
                         {wk.protected && <span title="Protegit amb PIN"><Lock className="w-4 h-4 text-[var(--color-muted)]" /></span>}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] mr-4 transition-colors opacity-50 group-hover:opacity-100" title="Vista Prèvia">
                        <Eye className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => handleDuplicate(wk)} className="text-[var(--color-muted)] hover:text-blue-500 mr-4 transition-colors opacity-50 group-hover:opacity-100" title="Duplicar">
                        <Copy className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => router.push(`/admin/trabajos/${wk.id}/editar`)} className="text-[var(--color-muted)] hover:text-[var(--color-accent)] mr-4 transition-colors opacity-50 group-hover:opacity-100" title="Editar">
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(wk.id, wk.title)} className="text-[var(--color-muted)] hover:text-red-500 transition-colors opacity-50 group-hover:opacity-100" title="Eliminar">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
             </tbody>
           </table>
         )}
      </div>
    </div>
  );
}
