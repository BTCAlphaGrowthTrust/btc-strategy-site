// Client-side modelled risk rescale — byte-identical to the API/docs transform.
// ret' = ret * k ; curve recompounded from 1.0 ; CAGR/maxDD recomputed ; clamp at 10%.

export const MAX_RISK = 0.1; // MAX_MODELLED_RISK_PCT

export type Ret = { t: string; ret: number };
export type Pt = { t: string; equity: number };

export const kFactor = (risk: number, base: number) =>
  base ? Math.min(risk, MAX_RISK) / base : 1;

export function rescaleCurve(returns: Ret[], k: number): Pt[] {
  let eq = 1;
  const out: Pt[] = [];
  for (const p of returns) {
    eq *= 1 + p.ret * k;
    out.push({ t: p.t, equity: eq });
  }
  return out;
}

const years = (t0: string, t1: string) =>
  (Date.parse(t1) - Date.parse(t0)) / (365.25 * 864e5);

export function cagrFromCurve(c: Pt[]): number | null {
  if (c.length < 2) return null;
  const y = years(c[0].t, c[c.length - 1].t);
  const f = c[c.length - 1].equity;
  return y <= 0 || f <= 0 ? null : (Math.pow(f, 1 / y) - 1) * 100;
}

export function maxDDFromCurve(c: Pt[]): number {
  let peak = c[0]?.equity ?? 1;
  let mdd = 0;
  for (const p of c) {
    if (p.equity > peak) peak = p.equity;
    if (peak > 0) mdd = Math.min(mdd, ((p.equity - peak) / peak) * 100);
  }
  return mdd;
}

export const netReturnFromCurve = (c: Pt[]) =>
  c.length ? (c[c.length - 1].equity - 1) * 100 : 0;

// Catalogue sweep: 0.5% -> 3.0% in 0.5% steps. CAGR & max-DD vary with sizing;
// profit factor & Sharpe are scale-invariant (attached by the caller from base stats).
export const RISK_LEVELS = [0.005, 0.01, 0.015, 0.02, 0.025, 0.03];

export function sweep(returns: Ret[], baseRisk: number) {
  return RISK_LEVELS.map((risk) => {
    const c = rescaleCurve(returns, kFactor(risk, baseRisk));
    return { risk, cagr: cagrFromCurve(c), maxDD: maxDDFromCurve(c) };
  });
}
