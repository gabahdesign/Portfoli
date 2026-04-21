"use client";

import { useTracker } from "@/hooks/useTracker";

interface TrackerProps {
  token: string;
  eventType: "page_view" | "work_view";
  workId?: string;
}

export function Tracker({ token, eventType, workId }: TrackerProps) {
  useTracker(token, eventType, workId);
  return null;
}
