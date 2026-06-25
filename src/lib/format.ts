// Formatting + the correlation diverging colour scale. Pure, no deps. Alias-only —
// no real ids, no method/family mapping.

// Public ids are alias slugs (e.g. "helios"); display as the capitalised name.
export const titleCase = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
export const shortCode = (slug: string) => titleCase(slug);

export const pct1 = (x: number | null | undefined) =>
  x == null ? "—" : `${x.toFixed(1)}%`;
export const pct0 = (x: number | null | undefined) =>
  x == null ? "—" : `${Math.round(x)}%`;
export const num2 = (x: number | null | undefined) =>
  x == null ? "—" : x.toFixed(2);
export const intc = (n: number) => n.toLocaleString("en-US");
export const pctBig = (x: number | null | undefined) =>
  x == null ? "—" : `${Math.round(x).toLocaleString("en-US")}%`;

// Perceptual-ish diverging scale: + → amber, − → teal, ~0 → graphite.
function mix(a: number[], b: number[], t: number) {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}
const NEUTRAL = [22, 27, 33], AMBER = [245, 165, 36], TEAL = [43, 182, 163];
export function corrColor(r: number | null): string {
  if (r == null) return "#0E1216";
  const t = Math.max(-1, Math.min(1, r));
  const e = Math.pow(Math.abs(t), 0.85);
  return t >= 0 ? mix(NEUTRAL, AMBER, e) : mix(NEUTRAL, TEAL, e);
}
