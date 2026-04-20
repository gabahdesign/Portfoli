"use client";

import { useState } from "react";
import { X, Lock, Send, Link2, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName?: string;
}

export function RequestAccessModal({ isOpen, onClose, sectionName }: RequestAccessModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: submitError } = await supabase
        .from("access_requests")
        .insert([{
          name: formData.name,
          email: formData.email,
          linkedin: formData.linkedin,
          reason: `Sol·licitud per a: ${sectionName || "General"}. Missatge: ${formData.reason}`,
          status: 'pending'
        }]);

      if (submitError) throw submitError;

      setSuccess(true);
    } catch (err: unknown) {
      console.error("Error submitting request:", err);
      setError("Hi ha hagut un error al enviar la sol·licitud. Torna-ho a provar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--color-bg)] overflow-y-auto animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div 
        className="min-h-screen w-full flex flex-col max-w-4xl mx-auto relative px-6 py-12 md:py-24"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 md:top-12 md:right-6 p-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:scale-105 transition-all z-10 flex items-center gap-2"
        >
          <span className="text-[10px] font-black uppercase tracking-widest pl-2 hidden md:block">Tancar</span>
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
        


        <div className="p-8 md:p-10">
          {!success ? (
            <>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12">
                <div className="w-16 h-16 rounded-3xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] shadow-[0_0_30px_var(--color-accent-glow)] shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-display font-black text-[var(--color-text)] tracking-tight">Accés Restringit</h2>
                  <p className="text-[var(--color-muted)] text-xs font-bold uppercase tracking-widest mt-0.5">
                    Secció: <span className="text-[var(--color-accent)]">{sectionName || "Privada"}</span>
                  </p>
                </div>
              </div>

              <p className="text-[var(--color-muted)] text-base md:text-lg leading-relaxed mb-12 max-w-xl">
                El contingut d&apos;aquesta secció és confidencial. Si vols veure la meva feina estratègica o el meu CV complet, sol·licita un token d&apos;accés omplint aquest formulari.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2 ml-1">Nom Complet</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-all"
                      placeholder="Marc G."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2 ml-1">Email Professional</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-all"
                      placeholder="hola@empresa.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2 ml-1">LinkedIn (Opcional)</label>
                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-all"
                      placeholder="linkedin.com/in/usuari"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2 ml-1">Motiu de la consulta</label>
                  <textarea
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-all resize-none"
                    placeholder="Explica'm breument quins projectes t'interessa veure..."
                  ></textarea>
                </div>

                {error && <p className="text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                  <div className="pt-4 flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-[var(--color-accent-glow)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Enviar Sol·licitud
                    </button>
                    
                    <a 
                      href="https://www.linkedin.com/in/gabahdesign/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-[#0077b5]/10 border border-[#0077b5]/20 text-[#0077b5] font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-[#0077b5]/20 hover:scale-[1.02]"
                    >
                      <Link2 className="w-4 h-4" />
                      Demanar accés via LinkedIn
                    </a>
                  </div>
              </form>
            </>
          ) : (
            <div className="py-10 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 mb-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-display font-black text-[var(--color-text)] tracking-tight mb-4">Sol·licitud Enviada</h2>
              <p className="text-[var(--color-muted)] leading-relaxed max-w-sm mx-auto mb-10">
                Gràcies per l&apos;interès! Revisaré la teva sol·licitud i et contactaré el més aviat possible a <span className="text-[var(--color-text)] font-bold">{formData.email}</span>.
              </p>
              <button 
                onClick={onClose}
                className="px-10 py-4 bg-[var(--color-surface-2)] text-[var(--color-text)] font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-[var(--color-surface)] border border-[var(--color-border)] transition-all"
              >
                Tancar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
