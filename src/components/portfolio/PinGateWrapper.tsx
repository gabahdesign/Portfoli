"use client";

import { useState } from "react";
import { PinGate } from "@/components/portfolio/PinGate";

interface PinGateWrapperProps {
  slug: string;
  token: string;
  isProtected?: boolean;
  children: React.ReactNode;
}

export function PinGateWrapper({ slug, token, isProtected = false, children }: PinGateWrapperProps) {
  const SESSION_KEY = `pin_verified_${slug}`;
  const [unlocked, setUnlocked] = useState(() => {
    if (!isProtected) return true;
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(SESSION_KEY) === "1";
    }
    return false;
  });

  const handleUnlock = async (pin: string): Promise<boolean> => {
    const res = await fetch("/api/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, pin, token }),
    });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
      return true;
    }
    return false;
  };

  if (!unlocked) {
    return (
      <PinGate
        onUnlock={handleUnlock}
        description="Aquest contingut és confidencial i requereix un PIN d'accés proporcionat directament per Marc."
      />
    );
  }

  return <>{children}</>;
}
