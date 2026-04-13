"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Sparkles, ChevronLeft, ShieldCheck, KeyRound } from "lucide-react";
import Link from "next/link";

export default function TokensAccess() {
  const [token, setToken] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      router.push(`/v/${token.trim()}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center relative overflow-hidden selection:bg-[var(--color-accent)] selection:text-white">
      
      {/* 1. ANIMATED BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(132, 58, 234, 0.15) 0%, transparent 70%)', transition: 'duration 4.0s' }}
        />
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(132, 58, 234, 0.08) 0%, transparent 70%)', transition: 'duration 5.0s' }}
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] invert" />
      </div>

      <div className="z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-lg w-full px-6">
        
        {/* ENHANCED BACK BUTTON */}
        <Link 
          href="/" 
          className="mb-12 flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/5 transition-all group"
        >
           <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
           Tornar a l'Inici
        </Link>

        {/* Access Card */}
        <div 
          className="w-full relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated border glow */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-[var(--color-accent)]/30 via-[var(--color-accent)]/5 to-[var(--color-accent)]/30 rounded-[48px] blur-2xl transition-opacity duration-1000 ${isHovered ? 'opacity-100' : 'opacity-40'}`} />
          
          <div className="relative bg-[#141416]/40 border border-white/10 p-10 md:p-14 rounded-[48px] backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden">
            
            {/* Header Content */}
            <div className="flex flex-col items-center text-center mb-12">
               <div className="relative mb-8">
                  <div className="absolute inset-0 bg-[var(--color-accent)]/20 blur-xl rounded-full scale-150 animate-pulse" />
                  <div className="relative w-20 h-20 bg-black border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                     <KeyRound className="w-8 h-8 text-[var(--color-accent)]" />
                  </div>
               </div>
               
               <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                 Àrea Privada
               </h2>
               <p className="text-base text-white/40 leading-relaxed max-w-[280px]">
                 Introdueix el teu token d'accés per desbloquejar els projectes confidencials.
               </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAccess} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ID de sessió personalitzat"
                  autoFocus
                  className="w-full bg-black/40 border border-white/10 text-white placeholder-white/20 rounded-2xl px-6 py-6 focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all font-mono text-center tracking-[0.2em] text-xl"
                />
                {!token && (
                   <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Sparkles className="w-5 h-5 text-white/10" />
                   </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={!token.trim()}
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-black py-6 rounded-2xl transition-all disabled:opacity-20 disabled:grayscale shadow-[0_20px_40px_rgba(132,58,234,0.3)] hover:shadow-[0_25px_50px_rgba(132,58,234,0.4)] flex items-center justify-center gap-4 group active:scale-95"
              >
                <span className="uppercase tracking-[0.2em] text-xs">Validar Access</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
              </button>
            </form>
            
            {/* Footer Badge */}
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
               <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  Encriptació de punta a punta
               </div>
               <p className="text-[9px] text-white/10 max-w-[200px] text-center uppercase tracking-widest leading-loose">
                  Si no tens un token, pots sol·licitar-ne un via LinkedIn.
               </p>
            </div>
          </div>
        </div>

        {/* Bottom subtle text */}
        <p className="mt-12 text-white/10 text-[9px] uppercase font-black tracking-[0.4em]">
          &copy; 2026 Descobreix &middot; Estàndard de Seguretat Professional
        </p>

      </div>
    </div>
  );
}
