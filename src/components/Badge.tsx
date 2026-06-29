// Per-strategy verification marker. "verified" → independent forward verification complete;
// "provisional" → engine logic reproduces the verified TradingView Pine; forward live-window check is
// the remaining axis. Driven by the API's tv_status field.
export function VerificationBadge({ status }: { status: string }) {
  const verified = status === "verified";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
        verified ? "border-pos/40 text-pos" : "border-border text-text-muted"
      }`}
      title={
        verified
          ? "External TradingView cross-check complete (internal validation is a separate axis)"
          : "Independent forward verification in progress — engine logic reproduces the verified TradingView Pine; the forward live-window check is the remaining axis."
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${verified ? "bg-pos" : "bg-text-muted/60"}`} />
      {verified ? "TV-verified" : "provisional"}
    </span>
  );
}
