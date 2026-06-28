"use client";

import { usePathname } from "next/navigation";

/**
 * The top verification bar reports the SIGNAL-STRATEGY dual-verified count. The Buy Program is a
 * different product (backtested accumulator, engine-verified, NOT dual-verified) with its own status
 * line + verification language — so the bar would misread as a claim about it. Suppress it there.
 */
export default function VerificationBar({ text }: { text: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/buy-program")) return null;
  return (
    <div className="border-b border-accent/20 bg-accent/[0.06]">
      <p className="mx-auto max-w-6xl px-6 py-1.5 text-center font-mono text-[11px] tracking-wide text-accent/90">
        {text}
      </p>
    </div>
  );
}
