// Per-strategy TradingView cross-check marker. "verified" → independently cross-checked;
// "provisional" → backtested, verification pending. Driven by the API's tv_status field.
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
          : "External TradingView cross-check pending — internal validation is a separate axis (see the per-strategy footnote)"
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${verified ? "bg-pos" : "bg-text-muted/60"}`} />
      {verified ? "TV-verified" : "provisional"}
    </span>
  );
}
