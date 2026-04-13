"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, User, Mail, Phone, MapPin, Link2, Globe, Upload, Camera, Trash2, FileText } from "lucide-react";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import Image from "next/image";

const ADMIN_PROFILE_ID = "00000000-0000-0000-0000-000000000000";
const LANGUAGES = [
  { code: "ca", label: "Català" },
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

export default function AdminSobreMi() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeLang, setActiveLang] = useState("ca");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    photo_url: "",
    bio: { ca: null, es: null, en: null, fr: null },
    email: "",
    phone: "",
    location: "",
    social_links: { linkedin: "", github: "", twitter: "", instagram: "" }
  });

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from("about_me").select("*").eq("id", ADMIN_PROFILE_ID).maybeSingle();
      if (data) {
        setFormData({
          name: data.name || "",
          tagline: data.tagline || "",
          photo_url: data.photo_url || "",
          bio: data.bio || { ca: null, es: null, en: null, fr: null },
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          social_links: data.social_links || { linkedin: "", github: "", twitter: "", instagram: "" }
        });
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("about_me").upsert({
      id: ADMIN_PROFILE_ID,
      ...formData,
      updated_at: new Date().toISOString()
    });
    if (!error) alert("Informació guardada correctament!");
    else alert("Error: " + error.message);
    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `profile-${Date.now()}.${ext}`;
      const filePath = `profile/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("portfolio-media")
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, photo_url: publicUrl }));
    } catch (err: any) {
      alert("Error pujant la imatge: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-4 md:p-8 text-[var(--color-muted)] animate-pulse">Carregant informació personal...</div>;

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 w-full pb-32">
      {/* Header */}
      <div className="mb-10 border-b border-[var(--color-border)] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-[var(--color-text)] tracking-tight">Sobre Mi</h1>
          <p className="text-[var(--color-muted)] text-sm mt-1">Gestiona el teu perfil públic, foto i dades de contacte.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold text-white transition-all shadow-xl shadow-[var(--color-accent-glow)] hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--color-accent)" }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Informació
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA ESQUERRA: Foto i Dades Bàsiques */}
        <div className="lg:col-span-1 space-y-6">
          {/* FOTO CARD */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm overflow-hidden">
             <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] mb-6 flex items-center gap-2">
               <Camera className="w-3 h-3" /> Foto de Perfil
             </h2>
             
             <div className="relative group mx-auto w-48 h-48 mb-6">
                <div className="w-full h-full rounded-3xl overflow-hidden bg-[var(--color-bg)] border-2 border-[var(--color-border)] relative">
                  {formData.photo_url ? (
                    <Image src={formData.photo_url} alt="Profile" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[var(--color-muted)]">
                      <User className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-3 bg-[var(--color-accent)] text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
             </div>

             <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1.5 ml-1">Nom Públic</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Marc G."
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-1.5 ml-1">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={e => setFormData({...formData, tagline: e.target.value})}
                    placeholder="Dissenyador Professional"
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors"
                  />
                </div>
             </div>
          </div>

          {/* CONTACTE CARD */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm">
             <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] mb-6 flex items-center gap-2">
               <Mail className="w-3 h-3" /> Canals de Contacte
             </h2>
             <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="Email"
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="Telèfon"
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    placeholder="Ubicació"
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors"
                  />
                </div>
             </div>
          </div>
        </div>

        {/* COLUMNA DRETA: Biografia i Xarxes */}
        <div className="lg:col-span-2 space-y-8">
          {/* BIOGRAFIA (TipTap) */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-1 shadow-sm flex flex-col min-h-[600px]">
             <div className="p-5 flex items-center justify-between border-b border-[var(--color-border)] flex-col sm:flex-row gap-4">
               <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] flex items-center gap-2">
                 <FileText className="w-3 h-3" /> Biografia Professional
               </h2>
               <div className="flex gap-2">
                 {LANGUAGES.map(lang => (
                   <button
                     key={lang.code}
                     onClick={(e) => { e.preventDefault(); setActiveLang(lang.code); }}
                     className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeLang === lang.code ? 'bg-[var(--color-accent)] text-white shadow-md' : 'bg-[var(--color-bg)] text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'}`}
                   >
                     {lang.label}
                   </button>
                 ))}
               </div>
             </div>
             
             <div className="flex-1 p-4">
                <TipTapEditor 
                  key={activeLang}
                  content={(formData.bio as any)[activeLang]} 
                  onChange={(json) => setFormData({
                    ...formData,
                    bio: { ...formData.bio, [activeLang]: json }
                  })}
                />
             </div>
          </div>

          {/* XARXES SOCIALS */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm">
             <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] mb-6 flex items-center gap-2">
               <Globe className="w-3 h-3" /> Presència Digital
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] ml-1">LinkedIn</label>
                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                    <input
                      type="text"
                      value={formData.social_links.linkedin}
                      onChange={e => setFormData({...formData, social_links: { ...formData.social_links, linkedin: e.target.value }})}
                      placeholder="https://..."
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] ml-1">GitHub</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                    <input
                      type="text"
                      value={formData.social_links.github}
                      onChange={e => setFormData({...formData, social_links: { ...formData.social_links, github: e.target.value }})}
                      placeholder="https://..."
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors"
                    />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper icons (FileText is missing in the imports but usable if you import it)
function FileTextIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
  );
}
