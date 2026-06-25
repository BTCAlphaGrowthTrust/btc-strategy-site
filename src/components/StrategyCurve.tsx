"use client";

import { useMemo, useState } from "react";
import { kFactor, rescaleCurve, cagrFromCurve, maxDDFromCurve, netReturnFromCurve, type Ret } from "@/lib/rescale";
import { pct1, pctBig } from "@/lib/format";

const W = 820, H = 280, PAD = 8;

export default function StrategyCurve({ returns, baseRisk }: { returns: Ret[]; baseRisk: number }) {
  const [risk, setRisk] = useState(baseRisk);
  const k = kFactor(risk, baseRisk);

  const { path, area, cagr, mdd, net } = useMemo(() => {
    const curve = rescaleCurve(returns, k);
    const eqs = curve.map((c) => c.equity);
    const lo = Math.log(Math.min(...eqs)), hi = Math.log(Math.max(...eqs));
    const span = hi - lo || 1;
    const n = curve.length;
    const step = Math.max(1, Math.floor(n / 640));
    const x = (i: number) => PAD + (i / (n - 1)) * (W - 2 * PAD);
    const y = (e: number) => H - PAD - ((Math.log(e) - lo) / span) * (H - 2 * PAD);
    let d = "";
    for (let i = 0; i < n; i += step) d += (d ? "L" : "M") + x(i).toFixed(1) + " " + y(curve[i].equity).toFixed(1);
    d += "L" + x(n - 1).toFixed(1) + " " + y(curve[n - 1].equity).toFixed(1);
    const a = d + `L${x(n - 1).toFixed(1)} ${H - PAD} L${x(0).toFixed(1)} ${H - PAD} Z`;
    return { path: d, area: a, cagr: cagrFromCurve(curve), mdd: maxDDFromCurve(curve), net: netReturnFromCurve(curve) };
  }, [returns, k]);

  const modelled = Math.abs(risk - baseRisk) > 1e-9;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">
          Equity curve · log scale · {modelled ? "modelled" : "base risk"}
        </div>
        <div className="flex gap-6 font-mono tabular-nums">
          <Mini k="CAGR" v={pct1(cagr)} accent />
          <Mini k="MAX DD" v={pct1(mdd)} />
          <Mini k="NET" v={pctBig(net)} />
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" preserveAspectRatio="none" style={{ height: 240 }}>
        <defs>
          <linearGradient id="cv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5A524" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#F5A524" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#cv)" />
        <path d={path} fill="none" stroke="#F5A524" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* risk-% evaluation tool */}
      <div className="mt-5 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">
            Evaluate at your risk level
          </label>
          <div className="font-mono tabular-nums text-sm">
            <span className="text-text-muted">per-trade risk </span>
            <span className="text-accent">{(risk * 100).toFixed(1)}%</span>
            <span className="text-text-muted/60"> · base {(baseRisk * 100).toFixed(1)}%</span>
          </div>
        </div>
        <input
          type="range" min={0.005} max={0.03} step={0.0025} value={Math.min(risk, 0.03)}
          onChange={(e) => setRisk(parseFloat(e.target.value))}
          className="mt-3 w-full accent-[#F5A524]"
        />
        <p className="mt-3 font-mono text-[11px] text-text-muted/60">
          Drag 0.5%–3.0%. Returns rescale linearly; CAGR &amp; drawdown recompute live. Profit
          factor, Sharpe &amp; Sortino are scale-invariant (unchanged). Modelled from the base
          backtest — the documented transform, identical to the API.
        </p>
      </div>
    </div>
  );
}

function Mini({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="text-right">
      <div className="text-[9px] uppercase tracking-wider text-text-muted/55">{k}</div>
      <div className={`text-sm ${accent ? "text-accent" : "text-text"}`}>{v}</div>
    </div>
  );
}
