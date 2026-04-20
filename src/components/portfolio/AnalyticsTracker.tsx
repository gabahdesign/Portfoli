"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface DropTrackerProps {
  token: string;
}

export function AnalyticsTracker({ token }: DropTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Notify Access (Resend) if it's the first time
    const notifyAccess = async () => {
      try {
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } catch {
        // fail silently for telemetry
      }
    };
    notifyAccess();
  }, [token]);

  useEffect(() => {
    if (!pathname) return;

    const startTime = Date.now();
    let maxScroll = 0;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const pct = Math.round((window.scrollY / scrollHeight) * 100);
        if (pct > maxScroll) maxScroll = pct;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Page view event
    const sendPageView = () => {
      // Determine what was viewed from pathname
      // /v/token/trabajo/abc -> work view
      // /v/token/cv -> cv view 
      // /v/token -> home view
      // /v/token/trabajo/abc -> work view
      // /v/token/cv -> cv view 
      // /v/token -> home view

      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          event_type: "page_enter",
          page_path: pathname
        }),
      });
    };
    
    sendPageView();

    // Send leave event on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      const durationSec = Math.round((Date.now() - startTime) / 1000);
      
      const blob = new Blob([JSON.stringify({
        token,
        event_type: "page_leave",
        page_path: pathname,
        duration_sec: durationSec,
        scroll_pct: maxScroll
      })], { type: 'application/json' });
      
      // Use sendBeacon for reliable leave events
      navigator.sendBeacon("/api/analytics", blob);
    };
  }, [pathname, token]);

  return null;
}
