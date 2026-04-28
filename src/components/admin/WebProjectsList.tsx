"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Globe, Plus, Trash2, Edit2, Zap, Monitor, Cpu, 
  ExternalLink, Download, Save, X, GripVertical 
} from "lucide-react";
import { useRouter } from "next/navigation";

interface WebProject {
  id: string;
  title: string;
  description_ca: string;
  description_es: string;
  description_en: string;
  url: string;
  download_url: string;
  type: string;
  order: number;
  is_active: boolean;
}

export function WebProjectsList({ initialProjects }: { initialProjects: WebProject[] }) {
  const [projects, setProjects] = useState<WebProject[]>(initialProjects);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description_ca: "",
    description_es: "",
    description_en: "",
    url: "",
    download_url: "",
    type: "ia",
    is_active: true
  });

  const handleEdit = (project: WebProject) => {
    setIsEditing(project.id);
    setFormData({
      title: project.title,
      description_ca: project.description_ca || "",
      description_es: project.description_es || "",
      description_en: project.description_en || "",
      url: project.url,
      download_url: project.download_url || "",
      type: project.type,
      is_active: project.is_active
    });
  };

  const handleSave = async (id?: string) => {
    setLoading(true);
    try {
      if (id) {
        // Update
        const { error } = await supabase
          .from("web_projects")
          .update(formData)
          .eq("id", id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from("web_projects")
          .insert([{ ...formData, order: projects.length + 1 }]);
        if (error) throw error;
      }
      
      setIsEditing(null);
      setIsAdding(false);
      router.refresh();
      
      // Refresh local state (simplified)
      const { data } = await supabase.from("web_projects").select("*").order("order", { ascending: true });
      if (data) setProjects(data);
      
    } catch (err) {
      console.error("Error saving project:", err);
      alert("Error en desar el projecte");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Estàs segur que vols eliminar aquest projecte?")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("web_projects")
        .delete()
        .eq("id", id);
      if (error) throw error;
      
      setProjects(projects.filter(p => p.id !== id));
      router.refresh();
    } catch (err) {
      console.error("Error deleting project:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => { setIsAdding(true); setFormData({ title: "", description: "", url: "", download_url: "", type: "ia", is_active: true }); }}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[var(--color-accent-glow)]/20"
        >
          <Plus size={18} /> Nou Projecte Web
        </button>
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-accent)]/50 rounded-[2rem] p-8 animate-in slide-in-from-top duration-300 shadow-2xl shadow-[var(--color-accent-glow)]/10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            {isAdding ? <Plus size={20} /> : <Edit2 size={20} />}
            {isAdding ? "Afegir Nou Projecte" : "Editar Projecte"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1.5 ml-1">Títol</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  placeholder="Ex: Impostor Game"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1.5 ml-1">Descripció</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] min-h-[100px]"
                  placeholder="Breu descripció del projecte..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1.5 ml-1">URL del Web</label>
                <input 
                  type="text" 
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  placeholder="/webs/..."
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1.5 ml-1">URL de Descàrrega (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.download_url}
                  onChange={e => setFormData({...formData, download_url: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  placeholder="/webs/.../*.zip"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1.5 ml-1">Tipus</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] appearance-none"
                  >
                    <option value="ia">AI Project</option>
                    <option value="manual">Development</option>
                  </select>
                </div>
                <div className="flex items-end pb-3">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        className={`w-10 h-5 rounded-full transition-colors relative ${formData.is_active ? 'bg-[var(--color-accent)]' : 'bg-zinc-700'}`}
                        onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.is_active ? 'left-6' : 'left-1'}`} />
                      </div>
                      <span className="text-xs font-bold text-[var(--color-muted)] group-hover:text-[var(--color-text)] transition-colors">Actiu</span>
                   </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--color-border)]">
            <button 
              onClick={() => { setIsEditing(null); setIsAdding(false); }}
              className="px-6 py-3 bg-[var(--color-surface-2)] text-[var(--color-muted)] font-bold rounded-xl hover:text-[var(--color-text)] transition-all"
            >
              Cancel·lar
            </button>
            <button 
              disabled={loading}
              onClick={() => handleSave(isEditing || undefined)}
              className="flex items-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Desant..." : <><Save size={18} /> Desar Canvis</>}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <div 
            key={project.id}
            className={`bg-[var(--color-surface)] border rounded-2xl p-5 flex items-center justify-between group transition-all ${!project.is_active ? 'opacity-50 grayscale border-dashed' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/30'}`}
          >
            <div className="flex items-center gap-6">
              <div className="text-[var(--color-muted)] cursor-grab">
                <GripVertical size={20} />
              </div>
              
              <div className={`p-3 rounded-xl ${project.type === 'ia' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                {project.type === 'ia' ? <Cpu size={20} /> : <Monitor size={20} />}
              </div>
              
              <div>
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                  {project.title}
                  {!project.is_active && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">Inactiu</span>}
                </h3>
                <p className="text-xs text-[var(--color-muted)] mt-0.5 line-clamp-1 max-w-md">{project.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <a 
                href={project.url} 
                target="_blank" 
                className="p-2 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
                title="Veure web"
              >
                <ExternalLink size={18} />
              </a>
              {project.download_url && (
                <div className="p-2 text-[var(--color-muted)]" title="Té descàrrega">
                  <Download size={18} />
                </div>
              )}
              <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />
              <button 
                onClick={() => handleEdit(project)}
                className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => handleDelete(project.id)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {projects.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-[2rem]">
            <Globe size={40} className="mx-auto text-[var(--color-muted)] mb-4 opacity-20" />
            <p className="text-[var(--color-muted)] font-medium">No hi ha projectes web registrats.</p>
          </div>
        )}
      </div>
    </div>
  );
}
