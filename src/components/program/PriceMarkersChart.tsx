"use client";

import { useMemo, useRef, useState } from "react";
import {
  type Pricepoint,
  type Marker,
  type Tier,
  TIER_ORDER,
  TIER_LABEL,
  TIER_COLOR,
  usd0,
} from "@/lib/program";

// viewBox geometry — matches the StrategyCurve look (labelled log y, year x).
const W = 920,
  H = 380,
  ML = 64,
  MR = 16,
  MT = 16,
  MB = 30;
const PW = W - ML - MR,
  PH = H - MT - MB;

const fmtUsd = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${Math.round(v)}`;

function logTicks(lo: number, hi: number) {
  const out: number[] = [];
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++)
    for (const m of [1, 2, 5]) {
      const v = m * 10 ** e;
      if (v >= lo * 0.92 && v <= hi * 1.08) out.push(v);
    }
  return out.length ? out : [lo, hi];
}

export default function PriceMarkersChart({
  price,
  markers,
}: {
  price: Pricepoint[];
  markers: Marker[];
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hov, setHov] = useState<number | null>(null);

  const m = useMemo(() => {
    const pts = price
      .map((p) => ({ t: Date.parse(p.timestamp), v: p.close }))
      .filter((p) => Number.isFinite(p.t));
    const t0 = pts[0].t,
      t1 = pts[pts.length - 1].t;
    const prices = pts.map((p) => p.v);
    const mkPrices = markers.map((mk) => mk.reference_price);
    const lo = Math.min(...prices, ...mkPrices);
    const hi = Math.max(...prices, ...mkPrices);
    const llo = Math.log10(Math.max(lo, 1)),
      lhi = Math.log10(hi);
    const x = (t: number) => ML + ((t - t0) / (t1 - t0)) * PW;
    const y = (v: number) =>
      MT + PH - ((Math.log10(Math.max(v, 1)) - llo) / (lhi - llo)) * PH;

    let d = "";
    for (const p of pts) d += (d ? "L" : "M") + x(p.t).toFixed(1) + " " + y(p.v).toFixed(1);

    // deploy_pct → marker radius (depth of the dip-buy)
    const dps = markers.map((mk) => mk.deploy_pct);
    const dpLo = Math.min(...dps),
      dpHi = Math.max(...dps);
    const r = (dp: number) =>
      2 + (dpHi > dpLo ? (dp - dpLo) / (dpHi - dpLo) : 0.5) * 4.5;
    const mk = markers
      .map((d2) => ({
        ...d2,
        t: Date.parse(d2.timestamp),
        cx: x(Date.parse(d2.timestamp)),
        cy: y(d2.reference_price),
        rad: r(d2.deploy_pct),
      }))
      .filter((d2) => Number.isFinite(d2.t));

    const y0 = new Date(t0).getUTCFullYear(),
      y1 = new Date(t1).getUTCFullYear();
    const xticks: { x: number; label: string }[] = [];
    for (let yr = y0 + 1; yr <= y1; yr++) {
      const tt = Date.UTC(yr, 0, 1);
      if (tt >= t0 && tt <= t1) xticks.push({ x: x(tt), label: `'${String(yr).slice(2)}` });
    }
    const yticks = logTicks(lo, hi).map((v) => ({ y: y(v), label: fmtUsd(v) }));
    return { path: d, mk, xticks, yticks, t0, t1, x, y };
  }, [price, markers]);

  function onMove(e: React.MouseEvent) {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    if (px < ML || px > W - MR) {
      setHov(null);
      return;
    }
    // nearest marker to the cursor x
    let best = -1,
      bd = Infinity;
    for (let i = 0; i < m.mk.length; i++) {
      const d = Math.abs(m.mk[i].cx - px);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    setHov(bd < 14 ? best : null);
  }

  const hp = hov != null ? m.mk[hov] : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">
          BTC price · every deployment plotted · backtested
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-wider">
          {TIER_ORDER.map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-text-muted">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: TIER_COLOR[t] }}
              />
              {TIER_LABEL[t]}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 h-4 font-mono text-[11px] tabular-nums">
        {hp ? (
          <span className="text-text-muted">
            <span className="text-text">{hp.timestamp.slice(0, 10)}</span>
            {"   "}
            <span style={{ color: TIER_COLOR[hp.tier as Tier] }}>{TIER_LABEL[hp.tier as Tier]}</span>
            {"   "}
            <span className="text-accent">{usd0(hp.reference_price)}</span>
            {"   "}
            <span>depth {(hp.deploy_pct * 100).toFixed(1)}%</span>
          </span>
        ) : (
          <span className="text-text-muted/50">
            Hover a marker for date, tier &amp; deploy depth — bigger dot = deeper dip-buy
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
            <text
              x={ML - 8}
              y={t.y + 3}
              textAnchor="end"
              className="font-mono"
              fontSize="10"
              fill="#9DA7B3"
            >
              {t.label}
            </text>
          </g>
        ))}
        {m.xticks.map((t, i) => (
          <g key={`x${i}`}>
            <line x1={t.x} y1={MT} x2={t.x} y2={MT + PH} stroke="#1A1F26" strokeWidth="1" />
            <text
              x={t.x}
              y={MT + PH + 18}
              textAnchor="middle"
              className="font-mono"
              fontSize="10"
              fill="#9DA7B3"
            >
              {t.label}
            </text>
          </g>
        ))}
        <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#232A33" strokeWidth="1" />
        <line x1={ML} y1={MT + PH} x2={W - MR} y2={MT + PH} stroke="#232A33" strokeWidth="1" />

        {/* price line */}
        <path d={m.path} fill="none" stroke="#9DA7B3" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />

        {/* deploy markers, coloured by aliased tier, sized by depth */}
        {m.mk.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.rad}
            fill={TIER_COLOR[d.tier as Tier]}
            fillOpacity={hov == null || hov === i ? 0.85 : 0.32}
            stroke="#0B0E11"
            strokeWidth="0.5"
          />
        ))}

        {hp && (
          <g>
            <line
              x1={hp.cx}
              y1={MT}
              x2={hp.cx}
              y2={MT + PH}
              stroke={TIER_COLOR[hp.tier as Tier]}
              strokeOpacity="0.4"
              strokeWidth="1"
            />
            <circle cx={hp.cx} cy={hp.cy} r={hp.rad + 2} fill="none" stroke={TIER_COLOR[hp.tier as Tier]} strokeWidth="1.5" />
          </g>
        )}
      </svg>

      <p className="mt-3 font-mono text-[11px] text-text-muted/60">
        {m.mk.length.toLocaleString("en-US")} deployments over the cycle. The program buys into
        statistical dips — markers cluster in the troughs, not the peaks.
      </p>
    </div>
  );
}
