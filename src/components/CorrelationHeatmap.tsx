"use client";

import { useState } from "react";
import { corrColor, shortCode } from "@/lib/format";

export default function CorrelationHeatmap({
  ids,
  matrix,
  overlap,
}: {
  ids: string[];
  matrix: (number | null)[][];
  overlap: number[][];
}) {
  const [hov, setHov] = useState<{ i: number; j: number } | null>(null);
  const codes = ids.map(shortCode);
  const CELL = 19;

  return (
    <div className="select-none">
      <div className="overflow-x-auto pb-1">
        <div className="inline-block">
          {/* column labels */}
          <div className="flex" style={{ paddingLeft: 92 }}>
            {codes.map((c, j) => (
              <div
                key={j}
                style={{ width: CELL }}
                className={`flex h-14 items-end justify-center font-mono text-[8px] leading-none ${
                  hov?.j === j ? "text-accent" : "text-text-muted/55"
                }`}
              >
                <span style={{ writingMode: "vertical-rl" }} className="rotate-180 whitespace-nowrap">
                  {c}
                </span>
              </div>
            ))}
          </div>
          {/* rows */}
          {matrix.map((row, i) => (
            <div key={i} className="flex items-center">
              <div
                style={{ width: 92 }}
                className={`pr-2 text-right font-mono text-[9px] leading-none ${
                  hov?.i === i ? "text-accent" : "text-text-muted/65"
                }`}
              >
                {codes[i]}
              </div>
              {row.map((r, j) => (
                <div
                  key={j}
                  onMouseEnter={() => setHov({ i, j })}
                  onMouseLeave={() => setHov(null)}
                  style={{
                    width: CELL,
                    height: CELL,
                    background: corrColor(r),
                    outline: hov && (hov.i === i || hov.j === j) ? "1px solid rgba(245,165,36,0.4)" : "none",
                    outlineOffset: -1,
                  }}
                  className="border-[0.5px] border-bg"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* legend + crosshair readout */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <span>−1</span>
          <span className="h-2 w-24 rounded-sm" style={{ background: "linear-gradient(90deg,#2BB6A3,#161B21,#F5A524)" }} />
          <span>+1</span>
          <span className="text-text-muted/55">correlation ρ</span>
        </div>
        <div className="tabular-nums">
          {hov ? (
            <span>
              <span className="text-text">{codes[hov.i]}</span> × <span className="text-text">{codes[hov.j]}</span>
              {"   ρ = "}
              <span className="text-accent">
                {matrix[hov.i][hov.j] == null ? "—" : matrix[hov.i][hov.j]!.toFixed(2)}
              </span>
              {"   n = "}
              {overlap[hov.i][hov.j].toLocaleString("en-US")}
            </span>
          ) : (
            <span className="text-text-muted/55">Hover a cell for pairwise ρ and overlap n</span>
          )}
        </div>
      </div>
    </div>
  );
}
