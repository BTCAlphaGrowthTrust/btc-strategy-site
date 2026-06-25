// Product packaging: tiers + bundles. Prices are "on request" (institutional norm).
// Bundle memberships are a PROPOSAL for refinement. The Diversifier Bundle is the computed
// low-correlation set (mean pairwise rho ~0.13 vs the full-17's ~0.32).

export type Bundle = {
  id: string;
  name: string;
  tagline: string;
  members: string[];
  flagship?: boolean;
};

export const BUNDLES: Bundle[] = [
  {
    id: "diversifier",
    name: "Diversifier Bundle",
    flagship: true,
    tagline:
      "Six low-correlation strategies spanning all four families — the diversification edge in one subscription (mean pairwise correlation ≈ 0.13, vs 0.32 across all 17).",
    members: ["atg_4h_ema", "atg_gx_1d_4h", "atg_rss_smma_1d", "atg_rss_e1h_t3", "atg_osc_15m_t3", "atg_ema_1h_t3"],
  },
  {
    id: "trend",
    name: "Trend Bundle",
    tagline: "Trend-following: EMA-trend and golden-cross strategies.",
    members: ["atg_4h_ema", "atg_ema_1h_t3", "atg_gx_1d_4h", "atg_gx_4h", "atg_gx_4h_t3", "atg_gx_1h_t3"],
  },
  {
    id: "oscillator",
    name: "Oscillator Bundle",
    tagline: "Stochastic-oscillator strategies across timeframes.",
    members: ["atg_osc_1w_4h", "atg_osc_1m_4h", "atg_osc_4h_t3", "atg_osc_15m_t3"],
  },
  {
    id: "squeeze",
    name: "Squeeze Bundle",
    tagline: "Ribbon-squeeze volatility-breakout strategies.",
    members: ["atg_rss_ema_1d", "atg_rss_ema_4h", "atg_rss_smma_1d", "atg_rss_smma_4h", "atg_rss_e4h_t3", "atg_rss_s4h_t3", "atg_rss_e1h_t3"],
  },
];

export const bundlesForStrategy = (id: string) => BUNDLES.filter((b) => b.members.includes(id));
export const bundleById = (id: string) => BUNDLES.find((b) => b.id === id);

export type Tier = { id: string; name: string; headline: string; what: string };
export const TIERS: Tier[] = [
  {
    id: "single",
    name: "Single",
    headline: "One strategy",
    what: "Any single strategy — full metadata, stats, returns, equity curve, and the risk-% evaluation tool.",
  },
  {
    id: "bundle",
    name: "Bundle",
    headline: "A curated set",
    what: "A themed set — Trend, Oscillator, Squeeze, or the flagship Diversifier Bundle of low-correlation strategies.",
  },
  {
    id: "full17",
    name: "Full-17",
    headline: "Everything",
    what: "Every strategy plus the book-level edge: the full correlation matrix, diversification analytics, and the equal-weight summary.",
  },
];

export const ACCESS_MAILTO = "mailto:thomas@btcalpha.com.au";
