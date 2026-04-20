"use client";

import { useEffect, useRef } from "react";

/**
 * useTracker — invisible hook that fires an analytics POST on page unload.
 * Include it on /v/[token] and /v/[token]/trabajo/[slug] pages.
 */
export function useTracker(token: string, eventType: "page_view" | "work_view", workId?: string) {
  const startTime = useRef<number | null>(null);
  const maxScroll = useRef(0);

  useEffect(() => {
    if (startTime.current === null) {
      startTime.current = Date.now();
    }
    const trackScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.round((scrolled / total) * 100);
      if (pct > maxScroll.current) maxScroll.current = pct;
    };

    window.addEventListener("scroll", trackScroll, { passive: true });

    const send = () => {
      const start = startTime.current ?? Date.now();
      const duration = Math.round((Date.now() - start) / 1000);
      navigator.sendBeacon(
        "/api/analytics",
        JSON.stringify({
          token,
          event_type: eventType,
          work_id: workId ?? null,
          duration_sec: duration,
          scroll_pct: maxScroll.current,
        })
      );
    };

    // Fire on unload
    window.addEventListener("beforeunload", send);
    // Also fire when user hides the tab
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") send();
    });

    return () => {
      window.removeEventListener("scroll", trackScroll);
      window.removeEventListener("beforeunload", send);
    };
  }, [token, eventType, workId]);
}
