import { pct1, num2 } from "@/lib/format";

type Row = { risk: number; cagr: number | null; maxDD: number; pf: number | null; sharpe: number | null };

export default function RangeTable({ rows, baseRisk }: { rows: Row[]; baseRisk: number }) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-muted">
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">Profitable risk range</span>
        <p className="mt-2">Does not exceed 10% CAGR anywhere in the 0.5–3.0% risk range.</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">
          Profitable risk range · CAGR &gt; 10%
        </span>
        <span className="font-mono text-[10px] text-text-muted/55">amber ≥ 10% · standout ≥ 15%</span>
      </div>
      <table className="mt-3 w-full font-mono text-sm tabular-nums">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-text-muted/55">
            <th className="px-5 py-2 text-left font-normal">Risk</th>
            <th className="px-3 py-2 text-right font-normal">CAGR</th>
            <th className="px-3 py-2 text-right font-normal">max-DD</th>
            <th className="px-3 py-2 text-right font-normal">PF</th>
            <th className="px-5 py-2 text-right font-normal">Sharpe</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const standout = (r.cagr ?? 0) >= 15;
            const isBase = Math.abs(r.risk - baseRisk) < 1e-9;
            return (
              <tr key={r.risk} className={`border-t border-border ${standout ? "bg-accent/[0.07]" : ""}`}>
                <td className="px-5 py-2.5 text-left text-text-muted">
                  {(r.risk * 100).toFixed(1)}%
                  {isBase && <span className="ml-1.5 text-[9px] uppercase text-text-muted/45">base</span>}
                </td>
                <td className={`px-3 py-2.5 text-right ${standout ? "font-semibold text-accent" : "text-accent"}`}>{pct1(r.cagr)}</td>
                <td className="px-3 py-2.5 text-right text-text-muted">{pct1(r.maxDD)}</td>
                <td className="px-3 py-2.5 text-right text-text">{num2(r.pf)}</td>
                <td className="px-5 py-2.5 text-right text-text">{num2(r.sharpe)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="border-t border-border px-5 py-3 font-mono text-[10px] leading-relaxed text-text-muted/55">
        CAGR &amp; drawdown scale with sizing; profit factor &amp; Sharpe are scale-invariant (unchanged).
        Rows shown only where CAGR &gt; 10%, up to a 3.0% cap. Drawdown shown beside every CAGR.
      </div>
    </div>
  );
}
