"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-bg)]">
      <div className="max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] p-10 rounded-2xl shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-black text-[var(--color-text)] mb-3 tracking-tight">Accés Privat</h1>
          <p className="text-[var(--color-muted)] text-sm font-medium">Identifica&apos;t per gestionar el teu portfolio.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-lg animate-shake">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] mb-2 px-1">Email de l&apos;Administrador</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-5 py-3.5 text-[var(--color-text)] font-medium focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
              placeholder="admin@descobreix.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] mb-2 px-1">Contrasenya</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-5 py-3.5 text-[var(--color-text)] font-medium focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-[var(--color-accent-glow)] hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? "Verificant..." : "Entrar al Panel d'Administració"}
          </button>
        </form>
      </div>
    </div>
  );
}
