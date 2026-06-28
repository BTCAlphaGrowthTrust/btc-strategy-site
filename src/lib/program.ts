// Types + helpers for the BTC accumulation program preview/simulate API.
// All figures are backtested / modelled. Public surface is aliases only — tiers are
// core / cyclical / tactical (already aliased upstream); no mechanism words anywhere.

export const PROGRAM_BASE =
  process.env.PROGRAM_API_BASE ?? "https://btc-signal-distribution.fly.dev";

// ---- aliased tiers — the ONLY tier vocabulary allowed on the public surface ----
export type Tier = "core" | "cyclical" | "tactical";
export const TIER_ORDER: Tier[] = ["core", "cyclical", "tactical"];
export const TIER_LABEL: Record<Tier, string> = {
  core: "Core",
  cyclical: "Cyclical",
  tactical: "Tactical",
};
// Marker colour by aliased tier. Amber = brand accent; teal + slate complete the triad.
export const TIER_COLOR: Record<Tier, string> = {
  core: "#F5A524",
  cyclical: "#2BB6A3",
  tactical: "#6E8BB5",
};
export const TIER_BLURB: Record<Tier, string> = {
  core: "The backbone — broad, patient deployments that build the long-horizon position.",
  cyclical: "Cycle-aware adds that lean in when the market drifts below its own longer trend.",
  tactical: "Opportunistic, deeper deployments reserved for the sharpest statistical dips.",
};

export type Pricepoint = { timestamp: string; close: number };
export type Marker = {
  timestamp: string;
  reference_price: number;
  tier: Tier;
  deploy_pct: number;
};
export type AccumPoint = {
  timestamp: string;
  cumulative_btc: number;
  capital_deployed: number;
};
export type CostBasisPoint = {
  timestamp: string;
  basket_avg_cost: number;
  dca_avg_cost: number | null;
};
export type Charts = {
  price_series: Pricepoint[];
  markers: Marker[];
  accumulation: AccumPoint[];
  cost_basis_trajectory: CostBasisPoint[];
};

export type Basket = {
  deployment_state: string;
  deployment_pct: number;
  dry_powder_usd: number;
  holdings_btc: number;
  avg_cost_basis: number;
  contributed_usd?: number;
  deployed_usd: number;
  deploy_count: number;
};

export type ReferenceBasket = Basket & {
  as_of: string;
  advantage_bps_vs_dca?: number;
  last_deploy?: any;
};

export type Performance = {
  basis: string;
  avg_cost: number;
  vs_vwap?: { vwap: number; advantage_bps: number };
  vs_dca?: { dca_avg_cost: number; advantage_bps: number; cheaper_pct?: number };
  vs_lump_sum?: { lump_avg_cost: number; advantage_bps: number };
  vs_hodl?: { hodl_avg_cost: number; advantage_bps: number };
  pct_capital_in_cheapest_quartile?: number;
};

export type Manifest = {
  alias: string;
  name: string;
  instrument: string;
  kind: string;
  non_custodial: boolean;
  tiers: string[];
  verification_state: string;
  tv_status: string;
  disclaimer: string;
};

export type Preview = {
  manifest: Manifest;
  reference_basket: ReferenceBasket;
  performance: Performance;
  charts: Charts;
};

export type SimulateResult = {
  basket: Basket;
  performance: Performance;
  charts: Charts;
};

export type SimulateInput = {
  initial_capital: number;
  start_date: string | null;
  contribution: number;
  contribution_freq_bars: number;
  reserve_pct: number;
};

export async function getPreview(): Promise<Preview> {
  const r = await fetch(PROGRAM_BASE + "/v1/program/preview", {
    next: { revalidate: 3600 },
  });
  if (!r.ok) throw new Error(`/v1/program/preview -> ${r.status}`);
  const j = await r.json();
  return j.data as Preview;
}

export async function simulate(input: SimulateInput): Promise<SimulateResult> {
  const r = await fetch(PROGRAM_BASE + "/v1/program/preview/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error(`/v1/program/preview/simulate -> ${r.status}`);
  const j = await r.json();
  return j.data as SimulateResult;
}

// ---- formatting (USD / BTC / bps / pct) ----
export const usd0 = (x: number | null | undefined) =>
  x == null ? "—" : `$${Math.round(x).toLocaleString("en-US")}`;
export const usd2 = (x: number | null | undefined) =>
  x == null
    ? "—"
    : `$${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const btc4 = (x: number | null | undefined) =>
  x == null ? "—" : `${x.toLocaleString("en-US", { maximumFractionDigits: 4 })} BTC`;
export const pct1 = (x: number | null | undefined) =>
  x == null ? "—" : `${x.toFixed(1)}%`;
// API gives deployment_pct/quartile as fractions (0–1); render as a percent.
export const frac1 = (x: number | null | undefined) =>
  x == null ? "—" : `${(x * 100).toFixed(1)}%`;
// bps → a readable percentage (cost-basis advantages run thousands of bps).
export const bpsPct = (bps: number | null | undefined) =>
  bps == null ? "—" : `${(bps / 100).toFixed(1)}%`;
export const titleCaseWord = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : s;
