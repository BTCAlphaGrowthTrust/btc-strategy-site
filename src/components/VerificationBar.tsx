"use client";

import { usePathname } from "next/navigation";

/**
 * The top verification bar reports the SIGNAL-STRATEGY dual-verified count. Gaia is a
 * different product (backtested cycle accumulation, engine-verified, NOT dual-verified) with its own
 * status line + verification language — so the bar would misread as a claim about it. It is suppressed there.
 *
 * The "dual-verified" copy is built HERE (client side) from numeric props, so on /gaia the
 * component returns null before the string exists — the phrase never enters that page's payload.
 */
export default function VerificationBar({ dv, total }: { dv: number | null; total: number | null }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/gaia")) return null;
  const text =
    dv != null && total != null
      ? `Signal strategies: ${dv} of ${total} dual-verified · backtested/modelled · independent forward verification underway`
      : "Signal strategies: most dual-verified · backtested/modelled · independent forward verification underway";
  return (
    <div className="border-b border-accent/20 bg-accent/[0.06]">
      <p className="mx-auto max-w-6xl px-6 py-1.5 text-center font-mono text-[11px] tracking-wide text-accent/90">
        {text}
      </p>
    </div>
  );
}
