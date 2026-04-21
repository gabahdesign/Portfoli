"use client";

import Link from "next/link";
import { Lock, ArrowUpRight, FileText } from "lucide-react";
import { useLocale } from "next-intl";
import { useRef } from "react";

interface FeaturedWorkCardProps {
  slug: string;
  title: string;
  coverUrl?: string;
  summary: string;
  tags: string[];
  protectedNode?: boolean;
  token: string;
  workDate?: string;
  pdfUrl?: string;
}

export function FeaturedWorkCard({
  slug,
  title,
  coverUrl,
  summary,
  tags,
  protectedNode = false,
  token,
  workDate,
  pdfUrl,
}: FeaturedWorkCardProps) {
  const locale = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);


  const isVideo = coverUrl?.match(/\.(mp4|webm|mov)$/i);
  const isPdf = coverUrl?.match(/\.pdf$/i);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="group flex flex-col animate-in fade-in duration-700">
      {/* 1. Mèdia (The Shot) - Hidden if no coverUrl and no pdfUrl */}
      {(coverUrl || pdfUrl) && (
        <Link 
          href={`/v/${token}/trabajo/${slug}`}
          className="relative rounded-3xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl group block transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-6"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {coverUrl ? (
            <div className="relative w-full h-full overflow-hidden">
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={coverUrl}
                  muted
                  loop
                  playsInline
                  className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                />
              ) : isPdf ? (
                <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface)] flex flex-col items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative flex flex-col items-center gap-6 p-8 transition-transform duration-500 group-hover:scale-105">
                     <div className="w-20 h-20 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] shadow-2xl border border-[var(--color-accent)]/20">
                        <FileText className="w-10 h-10" />
                     </div>
                     <div className="text-center space-y-2">
                        <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-muted)] opacity-60">Projecte PDF</span>
                        <span className="block text-xs font-bold text-[var(--color-text)] opacity-80 max-w-[200px] line-clamp-1">{title}</span>
                     </div>
                  </div>
                  {/* Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent blur-3xl opacity-30" />
                </div>
              ) : (
                <img
                  src={coverUrl}
                  alt={title}
                  className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
          ) : (
            <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface)] flex flex-col items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative flex flex-col items-center gap-6 p-8 transition-transform duration-500 group-hover:scale-105">
                   <div className="w-20 h-20 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] shadow-2xl border border-[var(--color-accent)]/20">
                      <FileText className="w-10 h-10" />
                   </div>
                   <div className="text-center space-y-2">
                      <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-muted)] opacity-60">Projecte PDF</span>
                      <span className="block text-xs font-bold text-[var(--color-text)] opacity-80 max-w-[200px] line-clamp-1">{title}</span>
                   </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/80 to-transparent pointer-events-none" />
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
             <div className="p-3 bg-white text-black rounded-full scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                <ArrowUpRight className="w-5 h-5" />
             </div>
          </div>

          {pdfUrl && (
            <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
              PDF Doc
            </div>
          )}

          {protectedNode && (
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-xl p-2 rounded-xl border border-white/20 shadow-xl">
               <Lock className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </Link>
      )}

      {/* 2. Info (The Metadata) */}
      <div className="mt-6 px-2">
        <div className="flex justify-between items-start gap-4">
          <Link href={`/v/${token}/trabajo/${slug}`} className="hover:text-[var(--color-accent)] transition-colors">
            <h3 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
              {title}
            </h3>
          </Link>
          <div className="flex gap-1 pt-1">
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-[var(--color-muted)] border border-[var(--color-border)] px-2 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {workDate && (
          <div className="flex items-center gap-1.5 mt-2.5 mb-1 text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest opacity-40">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
            {workDate.endsWith('-01-01') 
              ? workDate.split('-')[0]
              : new Date(workDate).toLocaleDateString(locale === 'ca' ? 'ca-ES' : 'en-US', { month: 'short', year: 'numeric' })}
          </div>
        )}

        <p className="text-sm text-[var(--color-muted)] mt-2 line-clamp-2 leading-relaxed opacity-80">
          {summary}
        </p>
      </div>
    </div>
  );
}
