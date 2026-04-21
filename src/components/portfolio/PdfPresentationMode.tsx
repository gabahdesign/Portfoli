"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface WorkWithPdf {
  slug: string;
  title: string;
  pdf_url: string;
}

interface PdfPresentationModeProps {
  works: WorkWithPdf[];
}

export function PdfPresentationMode({ works }: PdfPresentationModeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const isOpen = searchParams.get("mode") === "present";
  const pdfWorks = works.filter(w => !!w.pdf_url);

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const next = () => setCurrentIndex((prev) => (prev + 1) % pdfWorks.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + pdfWorks.length) % pdfWorks.length);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen || pdfWorks.length === 0) return null;

  const currentWork = pdfWorks[currentIndex];

  return (
    <div className="fixed inset-0 z-[200] bg-[#09090b] text-white flex flex-col animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)] mb-1">Presentació de Projectes ({currentIndex + 1} / {pdfWorks.length})</span>
          <h2 className="text-xl font-bold font-display tracking-tight">{currentWork.title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 mr-6 text-[var(--color-muted)]">
            <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] border border-white/10 uppercase">Esc</kbd>
            <span className="text-[10px] font-bold uppercase tracking-wider">Per Sortir</span>
          </div>
          
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
             <button onClick={prev} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
             <div className="w-px h-4 bg-white/10 mx-1" />
             <button onClick={next} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={20} /></button>
          </div>

          <a 
            href={currentWork.pdf_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 bg-white/5 border border-white/10 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] rounded-xl transition-all"
            title="Obrir en pestanya nova"
          >
            <ExternalLink size={20} />
          </a>

          <button 
            onClick={close}
            className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
        <div className="w-full h-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-black/40 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
               <div className="flex flex-col items-center gap-4">
                 <div className="w-12 h-12 border-2 border-[var(--color-accent)]/20 border-t-[var(--color-accent)] rounded-full animate-spin" />
                 <span className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest animate-pulse">Carregant Document...</span>
               </div>
            </div>
          )}
          <iframe 
            src={`${currentWork.pdf_url}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-none relative z-10"
            onLoad={() => setLoading(false)}
          />
        </div>

        {/* Floating Nav hints */}
        <button 
          onClick={prev}
          className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-[var(--color-accent)] text-white rounded-full backdrop-blur-xl border border-white/10 opacity-0 md:opacity-100 transition-all hover:scale-110 shadow-2xl z-30"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={next}
          className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-[var(--color-accent)] text-white rounded-full backdrop-blur-xl border border-white/10 opacity-0 md:opacity-100 transition-all hover:scale-110 shadow-2xl z-30"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom Thumbnails Strip (Desktop Only) */}
      <div className="h-28 border-t border-white/5 bg-black/40 p-4 hidden md:flex items-center gap-4 overflow-x-auto no-scrollbar">
        {pdfWorks.map((w, idx) => (
          <button
            key={w.slug}
            onClick={() => { setCurrentIndex(idx); setLoading(true); }}
            className={`flex-shrink-0 w-40 h-full rounded-lg border-2 transition-all flex items-center justify-center text-left p-3 overflow-hidden ${currentIndex === idx ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-[0_0_15px_var(--color-accent-glow)]' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
          >
            <div className="flex flex-col">
               <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${currentIndex === idx ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'}`}>Projecte {idx + 1}</span>
               <span className="text-[10px] font-bold leading-tight line-clamp-2">{w.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
