"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronRight, GripVertical, Building2, Landmark, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { Company } from "@/lib/types";

// Extended type for hierarchical display
type CompanyWithDepth = Company & { depth: number };

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [orderedEmpresas, setOrderedEmpresas] = useState<CompanyWithDepth[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sector: "",
    location: "",
    website: "",
    start_date: "",
    end_date: "",
    logo_url: "",
    description: "",
    is_freelance: false,
    parent_id: null as string | null,
  });
  const [sortBy, setSortBy] = useState<"date" | "name" | "custom">("custom");

  const supabase = createClient();

  const buildHierarchy = useCallback((flatData: Company[]) => {
    // We sort parents by name or date, but keep children under them
    const parents = flatData.filter(e => !e.parent_id).sort((a,b) => a.name.localeCompare(b.name));
    const children = flatData.filter(e => e.parent_id);
    
    const result: CompanyWithDepth[] = [];
    
    parents.forEach(parent => {
      result.push({ ...parent, depth: 0 });
      const myChildren = children.filter(c => c.parent_id === parent.id).sort((a,b) => a.name.localeCompare(b.name));
      myChildren.forEach(child => {
        result.push({ ...child, depth: 1 });
        const grandChildren = children.filter(gc => gc.parent_id === child.id).sort((a,b) => a.name.localeCompare(b.name));
        grandChildren.forEach(gc => {
          result.push({ ...gc, depth: 2 });
        });
      });
    });
    
    const activeIds = new Set(result.map(r => r.id));
    const orphans = flatData.filter(e => !activeIds.has(e.id));
    setOrderedEmpresas([...result, ...orphans]);
  }, []);

  const fetchEmpresas = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("companies").select("*");
    
    if (sortBy === "name") {
      query = query.order("name", { ascending: true });
    } else if (sortBy === "date") {
      query = query.order("start_date", { ascending: false });
    }

    const { data } = await query;
    if (data) {
      setEmpresas(data);
      if (sortBy === "custom") {
        buildHierarchy(data);
      } else {
        setOrderedEmpresas((data as Company[]).map(e => ({ ...e, depth: 0 })));
      }
    }
    setLoading(false);
  }, [supabase, sortBy, buildHierarchy]);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  // Reordering Logic
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...orderedEmpresas];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    
    setOrderedEmpresas(newOrder);
    setSortBy("custom");
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("¿Segur que vols eliminar aquesta empresa? Tots els seus treballs també podrien veure's afectats.")) return;
    await supabase.from("companies").delete().eq("id", id);
    fetchEmpresas();
  };

  const handleNew = () => {
    setEditingCompany(null);
    setFormData({
      name: "",
      slug: "",
      sector: "",
      location: "",
      website: "",
      start_date: "",
      end_date: "",
      logo_url: "",
      description: "",
      is_freelance: false,
      parent_id: null,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (emp: any) => {
    setEditingCompany(emp);
    setFormData({
      name: emp.name || "",
      slug: emp.slug || "",
      sector: emp.sector || "",
      location: emp.location || "",
      website: emp.website || "",
      start_date: emp.start_date || "",
      end_date: emp.end_date || "",
      logo_url: emp.logo_url || "",
      description: emp.description || "",
      is_freelance: emp.is_freelance || false,
      parent_id: emp.parent_id || null,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData(prev => {
      const currentSlug = prev.slug;
      const targetSlug = prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const autoSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const newSlug = (currentSlug === '' || currentSlug === targetSlug) ? autoSlug : currentSlug;
      return { ...prev, name: newName, slug: newSlug };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      ...formData,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    if (editingCompany) {
      await supabase.from("companies").update(payload).eq("id", editingCompany.id);
    } else {
      await supabase.from("companies").insert([payload]);
    }
    
    setIsSaving(false);
    setIsModalOpen(false);
    fetchEmpresas();
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[var(--color-border)] pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-text)] tracking-tight">Directori d&apos;Empreses</h1>
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => setSortBy("custom")}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${sortBy === 'custom' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
            >
              Jerarquia / Ordre
            </button>
            <button 
              onClick={() => setSortBy("name")}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${sortBy === 'name' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
            >
              Alfabètic
            </button>
            <button 
              onClick={() => setSortBy("date")}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${sortBy === 'date' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
            >
              Recent
            </button>
          </div>
        </div>
        <button onClick={handleNew} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-6 py-3 rounded-xl flex items-center justify-center transition-all font-bold shadow-lg shadow-[var(--color-accent-glow)] active:scale-95">
          <Plus className="w-5 h-5 mr-2" /> Nova Empresa
        </button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xl">
         {loading ? (
           <div className="p-12 text-center text-[var(--color-muted)]">Cargando datos...</div>
         ) : orderedEmpresas.length === 0 ? (
           <div className="p-12 text-center text-[var(--color-muted)] flex flex-col items-center">
             <div className="w-16 h-16 bg-[var(--color-bg)] rounded-full flex items-center justify-center mb-4 border border-[var(--color-border)]">
               <svg className="w-8 h-8 text-[var(--color-border)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
             </div>
             No hi ha empreses registrades.
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="bg-[var(--color-bg)] text-[var(--color-muted)] border-b border-[var(--color-border)]">
                 <tr>
                   <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] w-24">Ordre</th>
                   <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Empresa</th>
                   <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] hidden lg:table-cell">Sector</th>
                   <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">Accions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[var(--color-border)]">
                 {orderedEmpresas.map((emp, idx) => (
                   <tr 
                     key={emp.id} 
                     draggable={sortBy === 'custom'}
                     onDragStart={(e) => e.dataTransfer.setData('text/plain', idx.toString())}
                     onDragOver={(e) => e.preventDefault()}
                     onDrop={(e) => {
                       const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                       const toIdx = idx;
                       const newOrder = [...orderedEmpresas];
                       const [removed] = newOrder.splice(fromIdx, 1);
                       newOrder.splice(toIdx, 0, removed);
                       setOrderedEmpresas(newOrder);
                     }}
                     onClick={() => handleEdit(emp)}
                     className="hover:bg-[var(--color-surface-2)] transition-colors group cursor-pointer"
                   >
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={(e) => { e.stopPropagation(); moveItem(idx, 'up'); }}
                            className="p-1 hover:text-[var(--color-accent)] transition-colors"
                         >
                            <ArrowUp className="w-3 h-3" />
                         </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); moveItem(idx, 'down'); }}
                            className="p-1 hover:text-[var(--color-accent)] transition-colors"
                         >
                            <ArrowDown className="w-3 h-3" />
                         </button>
                         <div className="p-1 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4 text-[var(--color-muted)]" />
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <div 
                         className="flex items-center gap-3"
                         style={{ paddingLeft: `${emp.depth * 32}px` }}
                       >
                         {emp.depth > 0 && (
                           <ChevronRight className="w-4 h-4 text-[var(--color-accent)] opacity-40 shrink-0" />
                         )}
                         <div className={`p-2 rounded-lg ${emp.depth === 0 ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'bg-white/5 text-[var(--color-muted)]'}`}>
                           {emp.depth === 0 ? <Landmark className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                         </div>
                         <div className="flex flex-col">
                           <span className={`font-bold ${emp.depth === 0 ? 'text-[var(--color-text)] font-display' : 'text-[var(--color-muted)] text-xs'}`}>
                             {emp.name}
                           </span>
                           {emp.parent_id && (emp.depth === 1 || emp.depth === 2) && (
                             <span className="text-[9px] text-[var(--color-accent)] opacity-60 font-black uppercase tracking-widest scale-90 origin-left">Subempresa</span>
                           )}
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-[var(--color-muted)] text-xs hidden lg:table-cell">
                       {emp.sector || <span className="opacity-30">—</span>}
                     </td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-[var(--color-muted)] opacity-50 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold uppercase tracking-wider mr-2 hidden sm:block italic">Fes clic per editar</span>
                            <button onClick={(e) => handleDelete(e, emp.id)} className="p-2 hover:text-red-500 transition-colors" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
      </div>

      <div className="mt-8 p-6 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-accent)]/10 rounded-lg text-[var(--color-accent)]">
               <Sparkles className="w-4 h-4" />
            </div>
            <div>
               <p className="text-sm font-bold text-[var(--color-text)]">Consell d&apos;organització</p>
               <p className="text-xs text-[var(--color-muted)]">Pots arrossegar les files per canviar l&apos;ordre visual en el mode Jerarquia.</p>
            </div>
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in px-4">
          <div className="bg-[var(--color-bg)] w-full max-w-2xl border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-xl font-black text-[var(--color-text)] uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {editingCompany ? "Editar Empresa" : "Nova Empresa"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[var(--color-muted)] hover:text-white transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-muted)] mb-2 uppercase tracking-wider">Nom de l&apos;Empresa</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name} 
                    onChange={handleNameChange}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent)] transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-muted)] mb-2 uppercase tracking-wider">Slug (URL)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent)]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-muted)] mb-2 uppercase tracking-wider">Empresa Mare (opcional)</label>
                <div className="relative">
                    <select 
                        value={formData.parent_id || ""} 
                        onChange={e => setFormData({...formData, parent_id: e.target.value || null})}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent)] appearance-none"
                    >
                        <option value="">Cap (Empresa Independent)</option>
                        {empresas.filter(e => e.id !== editingCompany?.id).map(e => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-muted)] mb-2 uppercase tracking-wider">Sector</label>
                  <input 
                    type="text" 
                    value={formData.sector} 
                    onChange={e => setFormData({...formData, sector: e.target.value})}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent)]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-muted)] mb-2 uppercase tracking-wider">Ubicació</label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent)]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-muted)] mb-2 uppercase tracking-wider">Inici de relació</label>
                  <input 
                    type="date" 
                    value={formData.start_date} 
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent)] [color-scheme:dark]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-muted)] mb-2 uppercase tracking-wider">Final de relació</label>
                  <input 
                    type="date" 
                    value={formData.end_date} 
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent)] [color-scheme:dark]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-muted)] mb-2 uppercase tracking-wider">Sitio Web</label>
                <input 
                  type="text" 
                  value={formData.website} 
                  onChange={e => setFormData({...formData, website: e.target.value})}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent)]" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-muted)] mb-2 uppercase tracking-wider">Logo URL</label>
                <input 
                  type="text" 
                  value={formData.logo_url} 
                  onChange={e => setFormData({...formData, logo_url: e.target.value})}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent)]" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-muted)] mb-2 uppercase tracking-wider">Descripció Pública</label>
                <textarea 
                  rows={3}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent)] resize-none" 
                  placeholder="Explica breument la feina feta o la relació amb aquesta empresa..."
                />
              </div>


            </form>
            <div className="p-6 border-t border-[var(--color-border)] flex justify-end gap-3 bg-[var(--color-surface)]">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 rounded-xl font-bold text-[var(--color-muted)] border border-[var(--color-border)] bg-[var(--color-bg)] hover:text-[var(--color-text)] transition-all active:scale-95"
              >
                Cancel·lar
              </button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 rounded-xl font-bold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-all shadow-lg shadow-[var(--color-accent-glow)] active:scale-95 disabled:opacity-50"
              >
                {isSaving ? "Guardant..." : (editingCompany ? "Guardar Canvis" : "Crear Empresa")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
