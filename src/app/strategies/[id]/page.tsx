import Link from "next/link";
import type { Metadata } from "next";
import { getStrategy, listStrategyIds } from "@/lib/api";
import { pct1, num2, pctBig, intc } from "@/lib/format";
import { bundlesForStrategy } from "@/lib/catalogue";
import { VerificationBadge } from "@/components/Badge";
import StrategyCurve from "@/components/StrategyCurve";
import RangeTable from "@/components/RangeTable";
import MonthlyHeatmap from "@/components/MonthlyHeatmap";
import { sweep } from "@/lib/rescale";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await listStrategyIds()).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const { meta } = await getStrategy(id);
    return { title: `${meta.name} — BTC Alpha`, description: meta.blurb ?? undefined };
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
              {meta.instrument}
            </div>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{meta.name}</h1>
            {meta.blurb && <p className="mt-3 max-w-2xl text-text-muted">{meta.blurb}</p>}
          </div>
          <VerificationBadge status={meta.tv_status} />
        </div>
        <p className="mt-3 font-mono text-[11px] text-text-muted/55">
          Two confidence signals: external TradingView cross-check{" "}
          <span className="text-text-muted">{meta.tv_status}</span>
          {meta.verification_state && <> · internal validation <span className="text-text-muted">{meta.verification_state.replace("_", "-")}</span></>}.{" "}
          <a href="https://docs.btcalpha.com.au/docs/concepts/verification" className="text-accent hover:text-accent-hover">how we verify →</a>
        </p>

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

        {/* REQUIRED leverage disclosure — signals imply leveraged positions, not 1:1 deployment */}
        {meta.leverage_typical != null && (
          <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/[0.06] p-5">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <div className="font-mono text-[11px] uppercase tracking-wider text-amber-400">⚠ Leverage — read before sizing</div>
              <div className="font-mono text-sm text-text">
                typical <span className="font-semibold text-amber-300">{meta.leverage_typical}×</span> · max{" "}
                <span className="font-semibold text-amber-300">{meta.leverage_max}×</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-text-muted">
              These signals imply a <strong className="text-text">leveraged</strong> position — <strong className="text-text">not a 1:1
              deployment</strong>. At the stated risk %, the position notional is about <strong className="text-text">{meta.leverage_typical}×</strong> your
              deployed capital (typical), and up to <strong className="text-text">{meta.leverage_max}×</strong> on a tight-stop trade. You
              execute on your own venue at your own size — cap your leverage at your discretion.
            </p>
          </div>
        )}

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

        {/* monthly/annual returns heatmap — fund-standard track record (outcome data, down months shown) */}
        {stats.fund_dd?.distribution?.monthly_returns_pct?.length ? (
          <div className="mt-8 rounded-xl border border-border bg-surface p-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">Monthly returns — the full record</div>
            <div className="mt-4">
              <MonthlyHeatmap
                monthly={stats.fund_dd.distribution.monthly_returns_pct}
                annual={stats.fund_dd.distribution.annual_returns_pct}
              />
            </div>
          </div>
        ) : null}

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

          {/* the data is free — live signals are the product */}
          <div className="rounded-xl border border-border bg-surface-2 p-6">
            <div className="font-mono text-[11px] uppercase tracking-wider text-accent">Live signals</div>
            <div className="mt-3 font-display text-lg font-semibold">The data is free — subscribe for the signals</div>
            <p className="mt-2 text-sm text-text-muted">
              Every stat, return series and the risk-% tool on this page are <strong>free, no key</strong> —
              verify {meta.name} against your own book first. The product is the <strong>live signals</strong>:
              real-time, actionable trade alerts as it fires. Request-based today.
            </p>
            <Link href={`/access?ctx=${encodeURIComponent(meta.name)}`} className="mt-5 block rounded-full bg-accent px-5 py-2.5 text-center font-medium text-bg transition-colors hover:bg-accent-hover">
              Subscribe for live signals
            </Link>
            <Link href="/access" className="mt-3 block rounded-full border border-border px-5 py-2.5 text-center font-medium text-text transition-colors hover:border-accent hover:text-accent">
              Contact for access — request-based
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
