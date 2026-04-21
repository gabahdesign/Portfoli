"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Copy, Check, EyeOff, Eye, MousePointerClick } from "lucide-react";
import { AccessToken } from "@/lib/types";

// Extended type for UI with visit count
type TokenWithStats = AccessToken & { visits: number };

export default function AdminTokens() {
  const [tokens, setTokens] = useState<TokenWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTokens = useCallback(async () => {
    // Prevent synchronous state update inside effect
    await Promise.resolve();
    setLoading(true);
    const { data } = await supabase
      .from("access_tokens")
      .select(`
        *,
        analytics_events ( id )
      `)
      .order("created_at", { ascending: false });
      
    if (data) {
      const tokensWithCount = data.map(t => ({
        ...t,
        visits: t.analytics_events ? t.analytics_events.length : 0
      }));
      setTokens(tokensWithCount);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleCreateToken = async () => {
    const rawLabel = window.prompt("Nombre de la Empresa o Reclutador (Ej: Google, Netflix...)");
    if (!rawLabel) return;

    const baseSlug = rawLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const customToken = `${baseSlug}-${randomSuffix}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    const { error } = await supabase.from("access_tokens").insert([{
      token: customToken,
      label: rawLabel,
      expires_at: expiresAt.toISOString(),
      active: true,
      welcome_message: { 
        ca: `Benvinguts a l'espai confidencial preparat especialment per a l'equip de ${rawLabel}.`, 
        es: `Bienvenido al espacio confidencial diseñado en exclusiva para el equipo de ${rawLabel}.`, 
        en: `Welcome to the confidential space prepared exclusively for the ${rawLabel} team.` 
      }
    }]);

    if (error) alert("Error: " + error.message);
    else fetchTokens();
  };

  const handleCopy = (tokenStr: string) => {
    const url = `${window.location.origin}/v/${tokenStr}`;
    navigator.clipboard.writeText(url);
    setCopied(tokenStr);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleActive = async (id: string, currentVal: boolean) => {
    await supabase.from("access_tokens").update({ active: !currentVal }).eq("id", id);
    fetchTokens();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este link? Dejará de funcionar de inmediato.")) return;
    await supabase.from("access_tokens").delete().eq("id", id);
    fetchTokens();
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-3xl font-display font-bold text-[var(--color-text)]">Gestió d&apos;Enllaços d&apos;Accés</h1>
        <button onClick={handleCreateToken} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-5 py-2.5 rounded-lg flex items-center justify-center transition-colors font-bold shadow-lg shadow-[var(--color-accent-glow)]">
          <Plus className="w-5 h-5 mr-2" /> Nou Enllaç
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-[var(--color-muted)]">Carregant enllaços...</div>
        ) : tokens.length === 0 ? (
          <div className="col-span-full text-center text-[var(--color-muted)] border border-dashed border-[var(--color-border)] py-12 rounded-xl">
             No hi ha enllaços generats.
          </div>
        ) : (
          tokens.map((token) => {
            const isExpired = token.expires_at && new Date(token.expires_at) < new Date();
            
            return (
              <div key={token.id} className={`bg-[var(--color-surface)] border p-6 rounded-2xl transition-all hover:border-[var(--color-accent)]/50 group ${token.active && !isExpired ? 'border-[var(--color-border)] shadow-xl' : 'border-[var(--color-border)]/30 opacity-60'}`}>
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-[var(--color-text)] font-display font-bold text-lg truncate pr-2">{token.label}</h3>
                  <button 
                    onClick={() => toggleActive(token.id, token.active)}
                    className={`shrink-0 p-2 rounded-xl transition-all ${token.active ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/20 shadow-neon-subtle' : 'bg-[var(--color-bg)] text-[var(--color-muted)] border border-[var(--color-border)]'}`}
                    title="Activar o desactivar"
                  >
                    {token.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4 bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]/50 group-hover:border-[var(--color-accent)]/30 transition-colors">
                  <span className="text-[var(--color-muted)] font-mono text-sm truncate flex-1">
                    .../v/{token.token?.substring(0, 8)}...
                  </span>
                  <button 
                    onClick={() => handleCopy(token.token)} 
                    className="p-1.5 bg-[var(--color-surface-2)] hover:text-[var(--color-accent)] text-[var(--color-muted)] rounded-lg transition-colors shrink-0"
                  >
                    {copied === token.token ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-2 mb-6 text-[13px]">
                  <div className="flex justify-between">
                    <p className="text-xs text-yellow-500 font-medium leading-relaxed">
                      La gestió de contrasenyes es realitza directament mitjançant el sistema d&apos;identificació de Supabase.
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Visites Registrades:</span>
                    <span className="text-[var(--color-accent)] font-bold flex items-center gap-1">
                      {token.visits} <MousePointerClick className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Creat:</span>
                    <span className="text-[var(--color-text)] font-semibold"> {new Date(token.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Caduca:</span>
                    <span className={`font-bold ${isExpired ? 'text-red-500' : 'text-[var(--color-accent)]'}`}>
                      {token.expires_at ? new Date(token.expires_at).toLocaleDateString() : 'Mai'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)] text-[var(--color-muted)]">Notificacions:</span>
                    <span className="text-[var(--color-text)] font-semibold"> {token.notify_email ? 'Sí' : 'No'}</span>
                  </div>
                </div>

                <div className="mt-auto border-t border-[var(--color-border)] pt-4 flex justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleDelete(token.id)} className="text-[var(--color-muted)] hover:text-red-500 text-xs font-bold uppercase tracking-wider transition-colors">Eliminar</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
