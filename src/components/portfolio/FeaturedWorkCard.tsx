"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, ArrowUpRight, FileText } from "lucide-react";
import { useLocale } from "next-intl";
import { useRef, useState } from "react";

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
  const [isHovered, setIsHovered] = useState(false);

  const isVideo = coverUrl?.match(/\.(mp4|webm|mov)$/i);
  const isPdf = coverUrl?.match(/\.pdf$/i);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="group flex flex-col animate-in fade-in duration-700">
      {/* 1. Mèdia (The Shot) */}
      <Link 
        href={`/v/${token}/trabajo/${slug}`}
        className="relative aspect-video rounded-3xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl group block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {coverUrl ? (
          <div className="relative w-full h-full min-h-[200px] overflow-hidden">
            {isVideo ? (
              <video
                ref={videoRef}
                src={coverUrl}
                muted
                loop
                playsInline
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : isPdf ? (
              <div className="relative w-full h-full bg-[var(--color-surface-2)] flex items-center justify-center">
                <object 
                  data={`${coverUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                  type="application/pdf" 
                  className="w-full h-full pointer-events-none scale-110 opacity-70"
                >
                   <div className="flex flex-col items-center gap-2">
                     <FileText className="w-8 h-8 opacity-20" />
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Document</span>
                   </div>
                </object>
              </div>
            ) : (
              <img
                src={coverUrl}
                alt={title}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </div>
        ) : pdfUrl ? (
          <div className="relative w-full aspect-[3/4] bg-[var(--color-surface-2)] flex items-center justify-center overflow-hidden">
             {/* PDF Preview Frame (using object to show first page) */}
             <object 
               data={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
               type="application/pdf" 
               className="w-full h-full pointer-events-none scale-110 opacity-60 group-hover:opacity-100 transition-opacity"
             >
                <div className="flex flex-col items-center gap-3 p-8 text-center text-[var(--color-muted)]">
                   <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                   <span className="text-[10px] font-black uppercase tracking-widest">Document PDF</span>
                </div>
             </object>
             <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/80 to-transparent" />
          </div>
        ) : (
          <div className="w-full aspect-video flex items-center justify-center text-[var(--color-border)]">
             <div className="flex flex-col items-center gap-2 opacity-20">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest">No Content</span>
             </div>
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
            {new Date(workDate).toLocaleDateString(locale === 'ca' ? 'ca-ES' : 'en-US', { month: 'short', year: 'numeric' })}
          </div>
        )}

        <p className="text-sm text-[var(--color-muted)] mt-2 line-clamp-2 leading-relaxed opacity-80">
          {summary}
        </p>
      </div>
    </div>
  );
}
