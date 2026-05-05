"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { clsx } from "clsx";

export type ToastType = "success" | "error" | "loading";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (type !== "loading") {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [type, onClose, duration]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={18} />,
    error: <AlertCircle className="text-red-500" size={18} />,
    loading: <Loader2 className="text-[var(--color-accent)] animate-spin" size={18} />,
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={clsx(
        "flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[300px]",
        type === "success" && "bg-emerald-500/20 border-emerald-500/30",
        type === "error" && "bg-red-500/20 border-red-500/30",
        type === "loading" && "bg-[var(--color-surface)] border-[var(--color-border)] shadow-[var(--color-accent-glow)]"
      )}>
        <div className="shrink-0">{icons[type]}</div>
        <p className="flex-1 text-sm font-bold text-[var(--color-text)] tracking-tight">{message}</p>
        {type !== "loading" && (
          <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
            <X size={14} className="text-[var(--color-muted)]" />
          </button>
        )}
      </div>
    </div>
  );
}
