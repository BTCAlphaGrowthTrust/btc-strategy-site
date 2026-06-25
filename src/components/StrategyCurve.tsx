"use client";

import { useMemo, useRef, useState } from "react";
import { kFactor, rescaleCurve, cagrFromCurve, maxDDFromCurve, netReturnFromCurve, type Ret } from "@/lib/rescale";
import { pct1, pctBig } from "@/lib/format";

// Chart geometry (viewBox units). Margins leave room for labelled axes.
const W = 920, H = 360, ML = 60, MR = 16, MT = 16, MB = 30;
const PW = W - ML - MR, PH = H - MT - MB;

const fmtMult = (v: number) => (v >= 10 ? `${Math.round(v)}×` : v >= 1 ? `${v.toFixed(v < 2 ? 1 : 0)}×` : `${v.toFixed(2)}×`);
const niceStep = (x: number) => { const e = 10 ** Math.floor(Math.log10(x)); const f = x / e; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * e; };
function logTicks(lo: number, hi: number) {
  const out: number[] = [];
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++)
    for (const m of [1, 2, 5]) { const v = m * 10 ** e; if (v >= lo * 0.92 && v <= hi * 1.08) out.push(v); }
  return out.length ? out : [lo, hi];
}
function linTicks(lo: number, hi: number) {
  const step = niceStep((hi - lo) / 5), out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi * 1.001; v += step) out.push(v);
  return out;
}

export default function StrategyCurve({ returns, baseRisk }: { returns: Ret[]; baseRisk: number }) {
  const [risk, setRisk] = useState(baseRisk);
  const [logScale, setLogScale] = useState(true);
  const [hi, setHi] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const k = kFactor(risk, baseRisk);

  const m = useMemo(() => {
    const curve = rescaleCurve(returns, k);
    const n = curve.length;
    const t0 = Date.parse(curve[0].t), t1 = Date.parse(curve[n - 1].t);
    const eqs = curve.map((c) => c.equity);
    const lo = Math.min(...eqs), hiE = Math.max(...eqs);
    const x = (t: number) => ML + ((t - t0) / (t1 - t0)) * PW;
    const llo = Math.log10(Math.max(lo, 1e-6)), lhi = Math.log10(hiE);
    const y = (e: number) =>
      logScale
        ? MT + PH - ((Math.log10(Math.max(e, 1e-6)) - llo) / (lhi - llo)) * PH
        : MT + PH - ((e - lo) / (hiE - lo)) * PH;
    const step = Math.max(1, Math.floor(n / 720));
    let d = "";
    for (let i = 0; i < n; i += step) d += (d ? "L" : "M") + x(Date.parse(curve[i].t)).toFixed(1) + " " + y(curve[i].equity).toFixed(1);
    d += "L" + x(t1).toFixed(1) + " " + y(curve[n - 1].equity).toFixed(1);
    const area = d + `L${x(t1).toFixed(1)} ${MT + PH} L${x(t0).toFixed(1)} ${MT + PH} Z`;
    // year gridlines
    const y0 = new Date(t0).getUTCFullYear(), y1 = new Date(t1).getUTCFullYear();
    const xticks: { x: number; label: string }[] = [];
    for (let yr = y0 + 1; yr <= y1; yr++) { const tt = Date.UTC(yr, 0, 1); if (tt >= t0 && tt <= t1) xticks.push({ x: x(tt), label: `'${String(yr).slice(2)}` }); }
    const yticks = (logScale ? logTicks(lo, hiE) : linTicks(lo, hiE)).map((v) => ({ y: y(v), label: fmtMult(v) }));
    return { curve, n, t0, t1, x, y, path: d, area, xticks, yticks, y1pos: y(1), lo, hiE,
             cagr: cagrFromCurve(curve), mdd: maxDDFromCurve(curve), net: netReturnFromCurve(curve) };
  }, [returns, k, logScale]);

  function onMove(e: React.MouseEvent) {
    const svg = svgRef.current; if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    if (px < ML || px > W - MR) { setHi(null); return; }
    setHi(Math.max(0, Math.min(m.n - 1, Math.round(((px - ML) / PW) * (m.n - 1)))));
  }
  const hp = hi != null ? m.curve[hi] : null;
  const modelled = Math.abs(risk - baseRisk) > 1e-9;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">
          Equity curve · growth of 1.0 · full backtest · {modelled ? "modelled" : "base risk"}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-5 font-mono tabular-nums">
            <Mini k="CAGR" v={pct1(m.cagr)} accent />
            <Mini k="MAX DD" v={pct1(m.mdd)} />
            <Mini k="NET" v={pctBig(m.net)} />
          </div>
          <button
            onClick={() => setLogScale((s) => !s)}
            className="rounded-md border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {logScale ? "log" : "linear"}
          </button>
        </div>
      </div>

      {/* hover readout */}
      <div className="mt-3 h-4 font-mono text-[11px] tabular-nums">
        {hp ? (
          <span className="text-text-muted">
            <span className="text-text">{hp.t}</span>{"   "}
            <span className="text-accent">{fmtMult(hp.equity)}</span>{"   "}
            <span>({pctBig((hp.equity - 1) * 100)})</span>
          </span>
        ) : (
          <span className="text-text-muted/50">Hover the curve for date &amp; cumulative value</span>
        )}
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" onMouseMove={onMove} onMouseLeave={() => setHi(null)}>
        <defs>
          <linearGradient id="cv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5A524" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#F5A524" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* y gridlines + labels */}
        {m.yticks.map((t, i) => (
          <g key={`y${i}`}>
            <line x1={ML} y1={t.y} x2={W - MR} y2={t.y} stroke="#1A1F26" strokeWidth="1" />
            <text x={ML - 8} y={t.y + 3} textAnchor="end" className="font-mono" fontSize="10" fill="#9DA7B3">{t.label}</text>
          </g>
        ))}
        {/* x gridlines + year labels */}
        {m.xticks.map((t, i) => (
          <g key={`x${i}`}>
            <line x1={t.x} y1={MT} x2={t.x} y2={MT + PH} stroke="#1A1F26" strokeWidth="1" />
            <text x={t.x} y={MT + PH + 18} textAnchor="middle" className="font-mono" fontSize="10" fill="#9DA7B3">{t.label}</text>
          </g>
        ))}
        {/* break-even (1.0) baseline */}
        <line x1={ML} y1={m.y1pos} x2={W - MR} y2={m.y1pos} stroke="#232A33" strokeWidth="1" strokeDasharray="3 3" />
        {/* axes */}
        <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#232A33" strokeWidth="1" />
        <line x1={ML} y1={MT + PH} x2={W - MR} y2={MT + PH} stroke="#232A33" strokeWidth="1" />

        {/* curve */}
        <path d={m.area} fill="url(#cv)" />
        <path d={m.path} fill="none" stroke="#F5A524" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

        {/* hover crosshair + dot */}
        {hp && (
          <g>
            <line x1={m.x(Date.parse(hp.t))} y1={MT} x2={m.x(Date.parse(hp.t))} y2={MT + PH} stroke="#F5A524" strokeOpacity="0.4" strokeWidth="1" />
            <circle cx={m.x(Date.parse(hp.t))} cy={m.y(hp.equity)} r="3" fill="#F5A524" />
          </g>
        )}
      </svg>

      {/* risk-% evaluation tool */}
      <div className="mt-4 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">Evaluate at your risk level</label>
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
          Drag 0.5%–3.0%. The full-history curve, CAGR &amp; drawdown recompute live; the axes rescale
          with it. Profit factor, Sharpe &amp; Sortino are scale-invariant (unchanged). Documented
          transform, identical to the API.
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
