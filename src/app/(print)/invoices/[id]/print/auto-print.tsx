"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Triggers the browser's native print dialog once on mount, but only if the URL
 * includes ?print=1 (so the page can also be viewed for preview without it firing).
 */
export function AutoPrint() {
  const params = useSearchParams();
  const auto = params.get("print") === "1";

  useEffect(() => {
    if (!auto) return;
    // Small delay so fonts and the QR image have a chance to load.
    const t = setTimeout(() => {
      window.print();
    }, 350);
    return () => clearTimeout(t);
  }, [auto]);

  return null;
}

export function PrintTriggerButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-[hsl(158,64%,32%)] px-5 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-[hsl(158,64%,28%)] print:hidden"
      type="button"
    >
      {label}
    </button>
  );
}
