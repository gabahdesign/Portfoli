"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Bell, Shield, User, Globe, Loader2 } from "lucide-react";

export default function AdminAjustos() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    site_name: "Portfolio Marc",
    admin_email: "",
    notification_email: "",
    default_language: "ca",
    maintenance_mode: false,
    cv_download_active: true
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData(prev => ({ ...prev, admin_email: user.email || "" }));
      }
      setLoading(false);
    }
    loadConfig();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert("Ajustos desats correctament (Simulació)");
  };

  if (loading) return <div className="p-4 md:p-8 text-[var(--color-muted)] animate-pulse uppercase tracking-widest text-[10px] font-black">Carregant configuració...</div>;

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 w-full">
      <div className="mb-10 flex justify-between items-end border-b border-[var(--color-border)] pb-6">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-text)] tracking-tight">Ajustos del Sistema</h1>
          <p className="text-[var(--color-muted)] text-sm mt-1">Gestiona les preferències globals i el perfil de l&apos;administrador.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-[var(--color-accent-glow)] disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Desar Canvis
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent-glow)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)]'}`}
          >
            <Globe className="w-4 h-4" /> General
          </button>
          <button 
            onClick={() => setActiveTab("perfil")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'perfil' ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent-glow)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)]'}`}
          >
            <User className="w-4 h-4" /> Perfil Admin
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'notifications' ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent-glow)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)]'}`}
          >
            <Bell className="w-4 h-4" /> Notificacions
          </button>
          <button 
            onClick={() => setActiveTab("seguretat")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'seguretat' ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent-glow)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)]'}`}
          >
            <Shield className="w-4 h-4" /> Seguretat
          </button>
        </div>

        <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-inner">
          {activeTab === "general" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 mb-6">Preferències del Portal</h3>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-3">Nom del Lloc</label>
                <input 
                  type="text" 
                  value={formData.site_name} 
                  onChange={e => setFormData({...formData, site_name: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-3">Idioma Predeterminat</label>
                <select 
                  value={formData.default_language} 
                  onChange={e => setFormData({...formData, default_language: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none appearance-none"
                >
                  <option value="ca">Català</option>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                <div>
                  <p className="text-sm font-bold text-[var(--color-text)]">Mode Manteniment</p>
                  <p className="text-[10px] text-[var(--color-muted)]">Desactiva l&apos;accés públic al portfolio temporalment.</p>
                </div>
                <button 
                  onClick={() => setFormData({...formData, maintenance_mode: !formData.maintenance_mode})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.maintenance_mode ? 'bg-red-500' : 'bg-[var(--color-border)]'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.maintenance_mode ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-lg font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 mb-6">Alertes de Correu</h3>
               
               <div>
                 <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-3">Email de Recepció</label>
                 <input 
                   type="email" 
                   placeholder="on vols rebre els avisos..."
                   value={formData.notification_email} 
                   onChange={e => setFormData({...formData, notification_email: e.target.value})}
                   className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none" 
                 />
                 <p className="text-[10px] text-[var(--color-muted)] mt-2">S&apos;utilitzarà per als avisos de nous accessos per token (Resend).</p>
               </div>
            </div>
          )}

            <div className="text-center py-12">
               <Shield className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-4 opacity-20" />
               <p className="text-[var(--color-muted)] text-sm italic">Configuració del perfil d&apos;administrador d&apos;acord amb Supabase Auth.</p>
               <p className="text-[var(--color-text)] mt-2 font-bold">{formData.admin_email}</p>
            </div>
          
          {activeTab === "seguretat" && (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                 <p className="text-xs text-yellow-500 font-medium leading-relaxed">
                   La gestió de contrasenyes es realitza directament mitjançant el sistema d'identificació de Supabase.
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
