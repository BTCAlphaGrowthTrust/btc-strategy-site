// Product packaging: tiers + bundles. Prices "on request". Bundles are grouped by
// PERFORMANCE / CHARACTER only (never by method) and reference public alias slugs only —
// no real ids, no mechanism. The Diversifier is the computed low-correlation set.

export type Bundle = {
  id: string;
  name: string;
  tagline: string;
  members: string[]; // alias slugs
  flagship?: boolean;
};

export const BUNDLES: Bundle[] = [
  {
    id: "diversifier",
    name: "Diversifier Bundle",
    flagship: true,
    tagline:
      "Six low-correlation strategies — the diversification edge in one subscription (mean pairwise correlation ≈ 0.15, well below the catalogue average).",
    members: ["helios", "kronos", "selene", "boreas", "aether", "eos"],
  },
  {
    id: "flagship",
    name: "Flagship Bundle",
    tagline: "The headline performers — the strongest backtested return profiles in the catalogue.",
    members: ["helios", "athena", "orion", "hyperion", "atlas"],
  },
  {
    id: "steady",
    name: "Steady Bundle",
    tagline: "The efficient set — strong risk-adjusted returns at the shallowest drawdowns.",
    members: ["hyperion", "atlas", "selene", "kronos", "apollo"],
  },
];

export const bundlesForStrategy = (slug: string) => BUNDLES.filter((b) => b.members.includes(slug));
export const bundleById = (id: string) => BUNDLES.find((b) => b.id === id);

export type Tier = { id: string; name: string; headline: string; what: string };
export const TIERS: Tier[] = [
  {
    id: "single",
    name: "Single",
    headline: "One strategy",
    what: "Any single strategy — full stats, returns, equity curve, and the risk-% evaluation tool.",
  },
  {
    id: "bundle",
    name: "Bundle",
    headline: "A curated set",
    what: "A themed set — Flagship, Steady, or the flagship Diversifier Bundle of low-correlation strategies.",
  },
  {
    id: "full",
    name: "Full catalogue",
    headline: "Everything",
    what: "Every strategy plus the book-level edge: the full correlation matrix, diversification analytics, and the equal-weight summary.",
  },
];

export const ACCESS_MAILTO = "mailto:thomas@btcalpha.com.au";
