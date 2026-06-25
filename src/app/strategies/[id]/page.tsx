import Link from "next/link";
import type { Metadata } from "next";
import { getStrategy, listStrategyIds } from "@/lib/api";
import { pct1, num2, pctBig, family, intc } from "@/lib/format";
import { bundlesForStrategy, bundleById, ACCESS_MAILTO } from "@/lib/catalogue";
import { VerificationBadge } from "@/components/Badge";
import StrategyCurve from "@/components/StrategyCurve";
import RangeTable from "@/components/RangeTable";
import { sweep } from "@/lib/rescale";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await listStrategyIds()).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const { meta } = await getStrategy(id);
    return { title: `${meta.label} — BTC Alpha`, description: meta.description ?? undefined };
  } catch {
    return { title: "Strategy — BTC Alpha" };
  }
}

export default async function StrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { meta, stats, returns, datasetVersion } = await getStrategy(id);
  const rangeRows = sweep(returns, meta.base_risk_pct)
    .filter((r) => r.cagr != null && r.cagr > 10)
    .map((r) => ({ ...r, pf: stats.profit_factor, sharpe: stats.sharpe_daily_annualized }));
  const bundles = bundlesForStrategy(id);
  const inDiversifier = bundles.some((b) => b.flagship);
  const subj = (t: string) => `${ACCESS_MAILTO}?subject=${encodeURIComponent(`BTC Alpha — ${t}: ${meta.label}`)}`;

  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-2 font-mono text-[11px] tracking-wider text-text-muted/70">
          <Link href="/strategies" className="hover:text-accent">CATALOGUE</Link> / {id} · dataset {datasetVersion}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/60">
              {family(meta.strategy_type)} · {meta.timeframe} · {meta.instrument}
            </div>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{meta.label}</h1>
            {meta.description && <p className="mt-3 max-w-2xl text-text-muted">{meta.description}</p>}
          </div>
          <VerificationBadge state={meta.verification_state} />
        </div>

        {/* stat grid */}
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
          <Stat k="CAGR" v={pct1(stats.cagr_pct)} accent />
          <Stat k="Profit factor" v={num2(stats.profit_factor)} accent />
          <Stat k="Max drawdown" v={pct1(stats.max_drawdown_pct)} />
          <Stat k="Net return" v={pctBig(stats.net_return_pct)} />
          <Stat k="Win rate" v={`${stats.win_rate_pct.toFixed(1)}%`} />
          <Stat k="Sharpe" v={num2(stats.sharpe_daily_annualized)} sub="daily, annualized" />
          <Stat k="Sortino" v={num2(stats.sortino_daily_annualized)} sub="daily, annualized" />
          <Stat k="Trades" v={intc(stats.trade_count)} />
          <Stat k="Time underwater" v={`${intc(stats.time_underwater.longest_days)}d`} sub="longest" />
          <Stat k="Denomination" v={(meta.ccy ?? stats.ccy ?? "BTC")} sub="inverse" />
        </div>

        {/* curve + risk-% evaluation */}
        <div className="mt-8">
          <StrategyCurve returns={returns} baseRisk={meta.base_risk_pct} />
        </div>

        {/* profitable risk range table */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <RangeTable rows={rangeRows} baseRisk={meta.base_risk_pct} />
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">Pick your sizing</div>
            <p className="mt-3 text-sm text-text-muted">
              The table lists each 0.5% level where this strategy clears 10% CAGR, up to 3.0%.
              Use the slider above to dial any value in between — the curve, CAGR and drawdown
              recompute live.
            </p>
            <p className="mt-3 font-mono text-[11px] text-text-muted/60">
              Drawdown is shown beside every CAGR — you weigh the trade-off.
            </p>
          </div>
        </div>

        {/* two columns: provenance + subscribe */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">Provenance</div>
            <dl className="mt-4 grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2">
              <Prov k="Base risk" v={`${(meta.base_risk_pct * 100).toFixed(1)}% per trade`} />
              <Prov k="Window" v={`${meta.window?.from} → ${meta.window?.to}`} />
              <Prov k="Engine" v={meta.engine} />
              <Prov k="Data source" v={meta.data_source} />
              <Prov k="Commission" v={`${meta.backtest_assumptions?.commission_bps_per_side} bps / side`} />
              <Prov k="Slippage" v={`${meta.backtest_assumptions?.slippage_ticks} ticks`} />
              <Prov k="Parameters" v={meta.parameters ? "stamped" : "— (null until stamped)"} />
              <Prov k="Engine commit" v={meta.engine_commit ?? "— (null until stamped)"} />
            </dl>
            <p className="mt-5 font-mono text-[11px] text-text-muted/60">
              Backtested / modelled historical data, net of the costs above — not advice. →{" "}
              <a href={meta.methodology_url ?? "https://docs.btcalpha.com.au/docs/methodology/overview"} className="text-accent hover:text-accent-hover">
                full methodology
              </a>
            </p>
          </div>

          {/* subscribe actions */}
          <div className="rounded-xl border border-border bg-surface-2 p-6">
            <div className="font-mono text-[11px] uppercase tracking-wider text-accent">Subscribe</div>
            <div className="mt-3 font-display text-lg font-semibold">Get this strategy</div>
            <p className="mt-2 text-sm text-text-muted">
              Live data, stats, returns and the risk-% tool — as a single-strategy subscription, or
              bundled. Pricing on request.
            </p>
            <a href={subj("Single tier")} className="mt-5 block rounded-full bg-accent px-5 py-2.5 text-center font-medium text-bg transition-colors hover:bg-accent-hover">
              Subscribe — Single tier
            </a>
            {inDiversifier && (
              <Link href="/pricing#diversifier" className="mt-3 block rounded-full border border-accent/40 px-5 py-2.5 text-center font-medium text-accent transition-colors hover:bg-accent/10">
                or get it in the Diversifier Bundle
              </Link>
            )}
            <Link href="/pricing" className="mt-3 block rounded-full border border-border px-5 py-2.5 text-center font-medium text-text transition-colors hover:border-accent hover:text-accent">
              or Full-17 — everything
            </Link>
            {bundles.length > 0 && (
              <p className="mt-4 font-mono text-[11px] text-text-muted/60">
                Included in: {bundles.map((b) => b.name.replace(" Bundle", "")).join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ k, v, sub, accent }: { k: string; v: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-surface p-5">
      <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted/60">{k}</div>
      <div className={`mt-1.5 font-mono text-2xl font-semibold tabular-nums ${accent ? "text-accent" : "text-text"}`}>{v}</div>
      {sub && <div className="mt-0.5 font-mono text-[10px] text-text-muted/50">{sub}</div>}
    </div>
  );
}

function Prov({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wider text-text-muted/55">{k}</dt>
      <dd className="mt-0.5 text-text">{v}</dd>
    </div>
  );
}
