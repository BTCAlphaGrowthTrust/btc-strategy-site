export function VerificationBadge({ state }: { state: string }) {
  const dual = state === "dual_verified";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
        dual ? "border-accent/40 text-accent" : "border-border text-text-muted"
      }`}
      title={
        dual
          ? "Engine backtest reconciled against an independent TradingView reference"
          : "Validated by the keyless engine backtest"
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dual ? "bg-accent" : "bg-text-muted"}`} />
      {dual ? "dual-verified" : "engine-tested"}
    </span>
  );
}
