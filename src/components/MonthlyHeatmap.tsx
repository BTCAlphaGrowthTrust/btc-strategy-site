// Monthly + annual returns heatmap — the fund-standard track-record visual.
// Pure OUTCOME data (backtested monthly returns), aliases only. Honest: down months show red.
type Pt = { period: string; ret_pct: number };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function cellColor(v: number | undefined): string {
  if (v == null) return "transparent";
  const a = 0.14 + 0.62 * Math.min(1, Math.abs(v) / 25); // intensity by magnitude (cap ~25%)
  return v >= 0 ? `rgba(34,197,94,${a})` : `rgba(239,68,68,${a})`; // green up / red down
}

export default function MonthlyHeatmap({ monthly, annual }: { monthly?: Pt[]; annual?: Pt[] }) {
  if (!monthly?.length) return null;
  const byYear: Record<string, Record<number, number>> = {};
  for (const m of monthly) {
    const [y, mo] = m.period.split("-");
    (byYear[y] ??= {})[parseInt(mo, 10)] = m.ret_pct;
  }
  const annualBy: Record<string, number> = Object.fromEntries((annual ?? []).map((a) => [a.period, a.ret_pct]));
  const years = Object.keys(byYear).sort();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-[2px] text-[10px]">
        <thead>
          <tr>
            <th className="px-1 text-left font-mono text-text-muted/60"> </th>
            {MONTHS.map((m) => (
              <th key={m} className="px-1 py-1 font-mono font-normal text-text-muted/60">{m}</th>
            ))}
            <th className="px-1 py-1 font-mono text-accent">Year</th>
          </tr>
        </thead>
        <tbody>
          {years.map((y) => (
            <tr key={y}>
              <td className="pr-2 font-mono tabular-nums text-text-muted/70">{y}</td>
              {MONTHS.map((_, i) => {
                const v = byYear[y]?.[i + 1];
                return (
                  <td key={i} className="rounded-sm px-1 py-1.5 text-center tabular-nums text-text"
                      style={{ backgroundColor: cellColor(v) }} title={v != null ? `${y}-${String(i + 1).padStart(2, "0")}: ${v}%` : ""}>
                    {v != null ? Math.round(v) : ""}
                  </td>
                );
              })}
              <td className="rounded-sm px-1 py-1.5 text-center font-mono font-semibold tabular-nums text-text"
                  style={{ backgroundColor: cellColor(annualBy[y]) }}>
                {annualBy[y] != null ? Math.round(annualBy[y]) : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 font-mono text-[10px] text-text-muted/55">
        Monthly &amp; annual returns (%) at base risk — <span className="text-text-muted">green = up, red = down</span>.
        Backtested / modelled, provisional — the full record, down months included.
      </p>
    </div>
  );
}
