// Server-side API client for btc-strategy-data-api. Unwraps the { data, meta, links }
// envelope; fetches are ISR-cached (revalidate 1h). All figures are backtested/modelled.

const BASE = "https://btc-strategy-data-api.fly.dev";

async function get<T = any>(path: string): Promise<{ data: T; meta: any }> {
  const r = await fetch(BASE + path, { next: { revalidate: 3600 } });
  if (!r.ok) throw new Error(`${path} -> ${r.status}`);
  return r.json();
}

const median = (a: number[]) => {
  const b = [...a].sort((x, y) => x - y);
  const m = Math.floor(b.length / 2);
  return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};

export type Strategy = {
  id: string; name: string; blurb?: string;
  base_risk_pct: number; verification_state: string;
  stats: { cagr_pct: number | null; profit_factor: number | null;
           max_drawdown_pct: number; sharpe_daily_annualized: number | null;
           win_rate_pct: number; trade_count: number };
};

export async function getLanding() {
  const [summaryR, strategiesR, corrR] = await Promise.all([
    get("/v1/summary"),
    get<any[]>("/v1/strategies"),
    get("/v1/correlation?period=daily"),
  ]);
  const stats = await Promise.all(
    strategiesR.data.map((s: any) =>
      get(`/v1/strategies/${s.id}/stats`).then((r) => ({ id: s.id, ...r.data }))),
  );
  const byId: Record<string, any> = Object.fromEntries(stats.map((s: any) => [s.id, s]));
  const strategies: Strategy[] = strategiesR.data.map((s: any) => ({
    id: s.id, name: s.name, blurb: s.blurb,
    base_risk_pct: s.base_risk_pct, verification_state: s.verification_state,
    stats: byId[s.id],
  }));

  const cagrs = stats.map((s) => s.cagr_pct).filter((x): x is number => x != null);
  const pfs = stats.map((s) => s.profit_factor).filter((x): x is number => x != null);
  const shps = stats.map((s) => s.sharpe_daily_annualized).filter((x): x is number => x != null);
  const dds = stats.map((s) => s.max_drawdown_pct).filter((x): x is number => x != null);

  const book = summaryR.data.equal_weight_book;
  const derived = {
    count: strategies.length,
    cagrMax: Math.max(...cagrs), cagrMedian: median(cagrs),
    pfMax: Math.max(...pfs), pfMedian: median(pfs),
    sharpeMax: Math.max(...shps), sharpeMedian: median(shps),
    ddMedian: median(dds),
    dualVerified: strategies.filter((s) => s.verification_state === "dual_verified").length,
    book,
    effectiveBets: summaryR.data.diversification.effective_bets,
    meanCorr: summaryR.data.mean_pairwise_correlation,
    datasetVersion: summaryR.meta.dataset_version,
  };

  return { strategies, correlation: corrR.data as { ids: string[]; matrix: (number | null)[][]; n_overlap: number[][] }, derived };
}

export async function getCatalogue() {
  const strategiesR = await get<any[]>("/v1/strategies");
  const stats = await Promise.all(
    strategiesR.data.map((s: any) =>
      get(`/v1/strategies/${s.id}/stats`).then((r) => ({ id: s.id, ...r.data }))),
  );
  const byId: Record<string, any> = Object.fromEntries(stats.map((s: any) => [s.id, s]));
  const strategies: Strategy[] = strategiesR.data.map((s: any) => ({
    id: s.id, name: s.name, blurb: s.blurb,
    base_risk_pct: s.base_risk_pct, verification_state: s.verification_state, stats: byId[s.id],
  }));
  return { strategies, datasetVersion: strategiesR.meta.dataset_version };
}

export async function getStrategy(id: string) {
  const [metaR, statsR, curveR, returnsR] = await Promise.all([
    get(`/v1/strategies/${id}`),
    get(`/v1/strategies/${id}/stats`),
    get(`/v1/strategies/${id}/curve`),
    get(`/v1/strategies/${id}/returns?period=daily`),
  ]);
  return {
    meta: metaR.data,
    stats: statsR.data,
    curve: curveR.data as { t: string; equity: number }[],
    returns: returnsR.data as { t: string; ret: number }[],
    datasetVersion: metaR.meta.dataset_version,
  };
}

export async function listStrategyIds(): Promise<string[]> {
  const r = await get<any[]>("/v1/strategies");
  return r.data.map((s) => s.id);
}
