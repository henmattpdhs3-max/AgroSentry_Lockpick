"use client";

import { useEffect, useState } from "react";
import { isDemoModeActive, subscribeDemoMode } from "@/lib/demo-mode";

// Renders nothing until we actually know demo mode is on
export function DemoModeBanner() {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActive(isDemoModeActive());
    return subscribeDemoMode(setActive);
  }, []);

  if (!mounted || !active) return null;

  return (
    <div className="border-b border-asp-escalate/20 bg-asp-escalate/10 px-6 py-2 text-center text-xs text-asp-escalate">
      Mode demo — backend belum terhubung, data yang ditampilkan adalah simulasi
    </div>
  );
}
