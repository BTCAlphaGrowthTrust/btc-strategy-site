"use client";

import { useMemo, useRef, useState } from "react";
import { type AccumPoint, btc4, usd0 } from "@/lib/program";

const W = 920,
  H = 360,
  ML = 64,
  MR = 64,
  MT = 16,
  MB = 30;
const PW = W - ML - MR,
  PH = H - MT - MB;

const fmtBtc = (v: number) => (v >= 10 ? `${Math.round(v)}` : v.toFixed(1));
const fmtUsd = (v: number) =>
  v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}k` : `$${Math.round(v)}`;

function niceMax(x: number) {
  if (x <= 0) return 1;
  const e = 10 ** Math.floor(Math.log10(x));
  const f = x / e;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e;
}

export default function AccumulationChart({ data }: { data: AccumPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hov, setHov] = useState<number | null>(null);

  const m = useMemo(() => {
    // accumulation rows are per-deploy; cumulative_btc is monotone, capital_deployed is per-deploy.
    // Build cumulative capital + cumulative BTC vs time.
    const rows = data
      .map((d) => ({ t: Date.parse(d.timestamp), btc: d.cumulative_btc, dep: d.capital_deployed }))
      .filter((d) => Number.isFinite(d.t));
    let cumCap = 0;
    const series = rows.map((r) => {
      cumCap += r.dep;
      return { t: r.t, btc: r.btc, cap: cumCap };
    });
    const t0 = series[0].t,
      t1 = series[series.length - 1].t;
    const btcMax = niceMax(Math.max(...series.map((s) => s.btc)));
    const capMax = niceMax(Math.max(...series.map((s) => s.cap)));
    const x = (t: number) => ML + ((t - t0) / (t1 - t0)) * PW;
    const yBtc = (v: number) => MT + PH - (v / btcMax) * PH;
    const yCap = (v: number) => MT + PH - (v / capMax) * PH;

    let dBtc = "",
      dCap = "";
    for (const s of series) {
      dBtc += (dBtc ? "L" : "M") + x(s.t).toFixed(1) + " " + yBtc(s.btc).toFixed(1);
      dCap += (dCap ? "L" : "M") + x(s.t).toFixed(1) + " " + yCap(s.cap).toFixed(1);
    }
    const areaBtc = dBtc + `L${x(t1).toFixed(1)} ${MT + PH} L${x(t0).toFixed(1)} ${MT + PH} Z`;

    const y0 = new Date(t0).getUTCFullYear(),
      y1 = new Date(t1).getUTCFullYear();
    const xticks: { x: number; label: string }[] = [];
    for (let yr = y0 + 1; yr <= y1; yr++) {
      const tt = Date.UTC(yr, 0, 1);
      if (tt >= t0 && tt <= t1) xticks.push({ x: x(tt), label: `'${String(yr).slice(2)}` });
    }
    const yticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      y: MT + PH - f * PH,
      btc: fmtBtc(f * btcMax),
      cap: fmtUsd(f * capMax),
    }));
    return { series, x, yBtc, yCap, dBtc, dCap, areaBtc, xticks, yticks, t0, t1 };
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
    setHov(Math.max(0, Math.min(m.series.length - 1, Math.round(frac * (m.series.length - 1)))));
  }
  const hp = hov != null ? m.series[hov] : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">
          Capital deployed → BTC accumulated · backtested
        </div>
        <div className="flex gap-5 font-mono text-[10px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-text-muted">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#F5A524" }} />
            BTC held
          </span>
          <span className="flex items-center gap-1.5 text-text-muted">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#6E8BB5" }} />
            Capital in
          </span>
        </div>
      </div>

      <div className="mt-3 h-4 font-mono text-[11px] tabular-nums">
        {hp ? (
          <span className="text-text-muted">
            <span className="text-text">{new Date(hp.t).toISOString().slice(0, 10)}</span>
            {"   "}
            <span className="text-accent">{btc4(hp.btc)}</span>
            {"   from "}
            <span style={{ color: "#6E8BB5" }}>{usd0(hp.cap)} deployed</span>
          </span>
        ) : (
          <span className="text-text-muted/50">Hover for cumulative BTC held and capital deployed</span>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-1 w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHov(null)}
      >
        <defs>
          <linearGradient id="accBtc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5A524" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#F5A524" stopOpacity="0" />
          </linearGradient>
        </defs>

        {m.yticks.map((t, i) => (
          <g key={`y${i}`}>
            <line x1={ML} y1={t.y} x2={W - MR} y2={t.y} stroke="#1A1F26" strokeWidth="1" />
            <text x={ML - 8} y={t.y + 3} textAnchor="end" className="font-mono" fontSize="10" fill="#F5A524">
              {t.btc}
            </text>
            <text x={W - MR + 8} y={t.y + 3} textAnchor="start" className="font-mono" fontSize="10" fill="#6E8BB5">
              {t.cap}
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

        <path d={m.areaBtc} fill="url(#accBtc)" />
        <path d={m.dCap} fill="none" stroke="#6E8BB5" strokeWidth="1.4" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
        <path d={m.dBtc} fill="none" stroke="#F5A524" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />

        {hp && (
          <g>
            <line x1={m.x(hp.t)} y1={MT} x2={m.x(hp.t)} y2={MT + PH} stroke="#F5A524" strokeOpacity="0.35" strokeWidth="1" />
            <circle cx={m.x(hp.t)} cy={m.yBtc(hp.btc)} r="3" fill="#F5A524" />
            <circle cx={m.x(hp.t)} cy={m.yCap(hp.cap)} r="3" fill="#6E8BB5" />
          </g>
        )}
      </svg>

      <p className="mt-3 font-mono text-[11px] text-text-muted/60">
        Left axis: BTC accumulated. Right axis: cumulative capital deployed. Hands-off, the position
        compounds across the cycle.
      </p>
    </div>
  );
}
