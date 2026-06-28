"use client";

import { useMemo, useRef, useState } from "react";
import { type CostBasisPoint, usd0 } from "@/lib/program";

const W = 920,
  H = 360,
  ML = 64,
  MR = 16,
  MT = 16,
  MB = 30;
const PW = W - ML - MR,
  PH = H - MT - MB;

const fmtUsd = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${Math.round(v)}`;

function niceMax(x: number) {
  if (x <= 0) return 1;
  const e = 10 ** Math.floor(Math.log10(x));
  const f = x / e;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e;
}

export default function CostBasisChart({ data }: { data: CostBasisPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hov, setHov] = useState<number | null>(null);

  const m = useMemo(() => {
    // keep rows where both lines exist (DCA can be null in the warm-up window)
    const rows = data
      .map((d) => ({ t: Date.parse(d.timestamp), basket: d.basket_avg_cost, dca: d.dca_avg_cost }))
      .filter((d) => Number.isFinite(d.t) && d.basket != null);
    const t0 = rows[0].t,
      t1 = rows[rows.length - 1].t;
    const vals = rows.flatMap((r) => (r.dca != null ? [r.basket, r.dca] : [r.basket]));
    const hiV = niceMax(Math.max(...vals));
    const x = (t: number) => ML + ((t - t0) / (t1 - t0)) * PW;
    const y = (v: number) => MT + PH - (v / hiV) * PH;

    let dBasket = "",
      dDca = "";
    for (const r of rows) {
      dBasket += (dBasket ? "L" : "M") + x(r.t).toFixed(1) + " " + y(r.basket).toFixed(1);
      if (r.dca != null) dDca += (dDca ? "L" : "M") + x(r.t).toFixed(1) + " " + y(r.dca).toFixed(1);
    }
    // shaded gap = the advantage: DCA line down to basket line, where basket is cheaper.
    const gapRows = rows.filter((r) => r.dca != null && r.basket <= r.dca!);
    let gap = "";
    if (gapRows.length) {
      // top edge: DCA line; bottom edge: basket line (reversed)
      for (const r of gapRows) gap += (gap ? "L" : "M") + x(r.t).toFixed(1) + " " + y(r.dca!).toFixed(1);
      for (let i = gapRows.length - 1; i >= 0; i--)
        gap += "L" + x(gapRows[i].t).toFixed(1) + " " + y(gapRows[i].basket).toFixed(1);
      gap += "Z";
    }

    const y0 = new Date(t0).getUTCFullYear(),
      y1 = new Date(t1).getUTCFullYear();
    const xticks: { x: number; label: string }[] = [];
    for (let yr = y0 + 1; yr <= y1; yr++) {
      const tt = Date.UTC(yr, 0, 1);
      if (tt >= t0 && tt <= t1) xticks.push({ x: x(tt), label: `'${String(yr).slice(2)}` });
    }
    const yticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ y: MT + PH - f * PH, label: fmtUsd(f * hiV) }));
    return { rows, x, y, dBasket, dDca, gap, xticks, yticks, t0, t1 };
  }, [data]);

  function onMove(e: React.MouseEvent) {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    if (px < ML || px > W - MR) {
      setHov(null);
      return;
    }
    const frac = (px - ML) / PW;
    setHov(Math.max(0, Math.min(m.rows.length - 1, Math.round(frac * (m.rows.length - 1)))));
  }
  const hp = hov != null ? m.rows[hov] : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">
          Average cost basis vs calendar DCA · backtested
        </div>
        <div className="flex gap-5 font-mono text-[10px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-text-muted">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#F5A524" }} />
            Program cost
          </span>
          <span className="flex items-center gap-1.5 text-text-muted">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#6E8BB5" }} />
            Calendar DCA
          </span>
        </div>
      </div>

      <div className="mt-3 h-4 font-mono text-[11px] tabular-nums">
        {hp ? (
          <span className="text-text-muted">
            <span className="text-text">{new Date(hp.t).toISOString().slice(0, 10)}</span>
            {"   "}
            <span className="text-accent">{usd0(hp.basket)}</span>
            {hp.dca != null && (
              <>
                {"   vs DCA "}
                <span style={{ color: "#6E8BB5" }}>{usd0(hp.dca)}</span>
                {"   "}
                <span className="text-pos">
                  {((1 - hp.basket / hp.dca) * 100).toFixed(1)}% cheaper
                </span>
              </>
            )}
          </span>
        ) : (
          <span className="text-text-muted/50">
            Shaded band = the program&apos;s cost-basis advantage over calendar DCA
          </span>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-1 w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHov(null)}
      >
        {m.yticks.map((t, i) => (
          <g key={`y${i}`}>
            <line x1={ML} y1={t.y} x2={W - MR} y2={t.y} stroke="#1A1F26" strokeWidth="1" />
            <text x={ML - 8} y={t.y + 3} textAnchor="end" className="font-mono" fontSize="10" fill="#9DA7B3">
              {t.label}
            </text>
          </g>
        ))}
        {m.xticks.map((t, i) => (
          <g key={`x${i}`}>
            <line x1={t.x} y1={MT} x2={t.x} y2={MT + PH} stroke="#1A1F26" strokeWidth="1" />
            <text x={t.x} y={MT + PH + 18} textAnchor="middle" className="font-mono" fontSize="10" fill="#9DA7B3">
              {t.label}
            </text>
          </g>
        ))}
        <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#232A33" strokeWidth="1" />
        <line x1={ML} y1={MT + PH} x2={W - MR} y2={MT + PH} stroke="#232A33" strokeWidth="1" />

        {/* the hero: shaded advantage band */}
        {m.gap && <path d={m.gap} fill="#3FB950" fillOpacity="0.13" />}

        <path d={m.dDca} fill="none" stroke="#6E8BB5" strokeWidth="1.4" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
        <path d={m.dBasket} fill="none" stroke="#F5A524" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />

        {hp && (
          <g>
            <line x1={m.x(hp.t)} y1={MT} x2={m.x(hp.t)} y2={MT + PH} stroke="#F5A524" strokeOpacity="0.35" strokeWidth="1" />
            <circle cx={m.x(hp.t)} cy={m.y(hp.basket)} r="3" fill="#F5A524" />
            {hp.dca != null && <circle cx={m.x(hp.t)} cy={m.y(hp.dca)} r="3" fill="#6E8BB5" />}
          </g>
        )}
      </svg>

      <p className="mt-3 font-mono text-[11px] text-text-muted/60">
        The program&apos;s running average cost (amber) holds below naive calendar DCA (blue). The
        green band is the gap you keep — every BTC bought cheaper.
      </p>
    </div>
  );
}
