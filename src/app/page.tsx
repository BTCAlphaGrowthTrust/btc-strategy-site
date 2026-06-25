import Link from "next/link";
import { getLanding } from "@/lib/api";
import { pct1, num2 } from "@/lib/format";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";
import { VerificationBadge } from "@/components/Badge";
import TierCards from "@/components/TierCards";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

export const revalidate = 3600;

export default async function Home() {
  const { strategies, correlation, derived: d } = await getLanding();
  const top = [...strategies]
    .filter((s) => s.stats?.cagr_pct != null)
    .sort((a, b) => (b.stats.cagr_pct ?? 0) - (a.stats.cagr_pct ?? 0))
    .slice(0, 6);

  return (
    <>
      {/* status line */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-2 font-mono text-[11px] tracking-wider text-text-muted/70">
          STRATEGY DATA · dataset {d.datasetVersion} · backtested
        </div>
      </div>

      {/* 1 · HERO — who + what + strongest performance proof */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Systematic Bitcoin strategy data
          </div>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-6xl">
            {d.count} systematic strategies.
            <br />
            One API.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
            Backtested, low-correlation BTC trading strategies as a clean data service — for
            desks and funds hunting a real, defensible edge.
          </p>

          {/* single strongest performance proof */}
          <div className="mt-10 flex flex-wrap items-end gap-x-12 gap-y-6">
            <Stat label="Backtested CAGR up to" value={pct1(d.cagrMax)} />
            <Stat label="Profit factor up to" value={`${num2(d.pfMax)}×`} />
            <Stat label="Median profit factor" value={num2(d.pfMedian)} muted />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/strategies" className="rounded-full bg-accent px-6 py-3 font-medium text-bg transition-colors hover:bg-accent-hover">
              Explore strategies →
            </Link>
            <Link href="/access"
               className="rounded-full border border-border px-6 py-3 font-medium text-text transition-colors hover:border-accent hover:text-accent">
              Get access
            </Link>
          </div>
        </div>
      </section>

      {/* 2 · THE EDGE — performance, then diversification */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel n="01" title="The strategies perform" />
          <p className="mt-4 max-w-2xl text-text-muted">
            {d.count} systematic strategies, each backtested over ~8 years on BTC-PERPETUAL and
            net of fees &amp; slippage. Backtested CAGR up to{" "}
            <Num>{pct1(d.cagrMax)}</Num>, profit factor up to <Num>{num2(d.pfMax)}×</Num>,
            median profit factor <Num>{num2(d.pfMedian)}</Num>.
          </p>

          <div className="mt-16 border-t border-border pt-12">
            <SectionLabel n="02" title="The edge is low correlation" />
            <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="max-w-xl">
                <p className="text-text-muted">
                  Strong individually — but they don&apos;t move together. Mean pairwise
                  correlation is just <Num>{num2(d.meanCorr)}</Num>, so {d.count} strategies behave like
                  about <Num>{num2(d.effectiveBets)}</Num> independent bets. Combine them
                  equal-weight and the book is <span className="text-text">steadier than any
                  single piece</span>:
                </p>
                <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-6">
                  <Compare label="Sharpe (risk-adjusted)" book={num2(d.book.sharpe_daily_annualized)}
                           single={`≤ ${num2(d.sharpeMax)} any single`} good />
                  <Compare label="Max drawdown" book={pct1(d.book.max_drawdown_pct)}
                           single={`${pct1(d.ddMedian)} median single`} good />
                  <Compare label="Independent bets" book={num2(d.effectiveBets)}
                           single={`of ${d.count} strategies`} />
                  <Compare label="Mean correlation" book={num2(d.meanCorr)}
                           single="lower is better" />
                </div>
                <p className="mt-8 text-sm text-text-muted/80">
                  The equal-weight book&apos;s Sharpe exceeds <span className="text-text">every</span>{" "}
                  one of the {d.count} strategies individually — diversification you can verify
                  cell by cell. →{" "}
                  <a href="https://docs.btcalpha.com.au/docs/methodology/correlation" className="text-accent hover:text-accent-hover">methodology</a>
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-5">
                <div className="mb-4 font-mono text-[11px] uppercase tracking-wider text-text-muted/70">
                  Cross-strategy correlation · daily
                </div>
                <CorrelationHeatmap ids={correlation.ids} matrix={correlation.matrix} overlap={correlation.n_overlap} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · WHAT WE HAVE — strategy preview */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-end justify-between">
            <SectionLabel n="03" title="What you get" />
            <Link href="/strategies" className="text-sm text-accent hover:text-accent-hover">Explore all {d.count} →</Link>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {top.map((s) => (
              <Link key={s.id} href={`/strategies/${s.id}`} className="group bg-surface p-5 transition-colors hover:bg-surface-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-display text-[16px] font-semibold leading-snug text-text group-hover:text-accent">
                    {s.name}
                  </div>
                  <VerificationBadge status={s.tv_status} />
                </div>
                <div className="mt-1.5 line-clamp-2 text-sm text-text-muted">{s.blurb}</div>
                <div className="mt-5 grid grid-cols-3 gap-2 font-mono tabular-nums">
                  <Cell k="CAGR" v={pct1(s.stats.cagr_pct)} accent />
                  <Cell k="PF" v={num2(s.stats.profit_factor)} />
                  <Cell k="MAX DD" v={pct1(s.stats.max_drawdown_pct)} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · WHAT IT IS — the API */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionLabel n="04" title="It's a clean API" />
              <p className="mt-4 max-w-md text-text-muted">
                Every figure above comes from one documented REST/JSON service — typed schemas,
                realistic examples, an interactive playground, and a stable response contract.
                Metadata, stats, returns, equity curves, correlation and a book-level summary.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <a href="https://docs.btcalpha.com.au" className="text-accent hover:text-accent-hover">Documentation ↗</a>
                <span className="text-text-muted/40">·</span>
                <a href="https://btc-strategy-data-api.fly.dev/docs" className="text-accent hover:text-accent-hover">API reference ↗</a>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5 font-mono text-[13px] leading-relaxed">
              <div className="text-text-muted/60"># the same data, live</div>
              <div className="mt-2"><span className="text-text-muted">$</span> curl btc-strategy-data-api.fly.dev<span className="text-accent">/v1/summary</span></div>
              <pre className="mt-3 overflow-x-auto whitespace-pre text-text-muted">{`{
  "data": {
    "strategy_count": ${d.count},
    "mean_pairwise_correlation": ${num2(d.meanCorr)},
    "diversification": { "effective_bets": ${num2(d.effectiveBets)} },
    "equal_weight_book": { "sharpe_daily_annualized": ${num2(d.book.sharpe_daily_annualized)} }
  },
  "meta": { "basis": "backtested", "dataset_version": "…" }
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · TIERS — buy one, a set, or all of them */}
      <section className="reveal">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionLabel n="05" title={`Buy one, a set, or all ${d.count}`} />
            <Link href="/pricing" className="text-sm text-accent hover:text-accent-hover">Full pricing &amp; bundles →</Link>
          </div>
          <p className="mt-4 max-w-2xl text-text-muted">
            Subscribe to a single strategy, a curated bundle, or the full {d.count}. Licensed for
            professional &amp; institutional use — pricing on request.
          </p>
          <div className="mt-8">
            <TierCards />
          </div>
          <p className="mt-6 font-mono text-xs text-text-muted/60">
            <ObfuscatedEmail mode="text" placeholder="email us" className="text-text-muted/60" /> · backtested / modelled historical data, not advice
          </p>
        </div>
      </section>
    </>
  );
}

/* ---- local presentational helpers ---- */
function Stat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">{label}</div>
      <div className={`mt-1 font-mono text-4xl font-semibold tabular-nums ${muted ? "text-text" : "text-accent"}`}>{value}</div>
    </div>
  );
}
function SectionLabel({ n, title, center }: { n: string; title: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <span className="font-mono text-xs text-accent">{n}</span>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
    </div>
  );
}
function Num({ children }: { children: React.ReactNode }) {
  return <span className="font-mono tabular-nums text-text">{children}</span>;
}
function Compare({ label, book, single, good }: { label: string; book: string; single: string; good?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">{label}</div>
      <div className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${good ? "text-accent" : "text-text"}`}>{book}</div>
      <div className="mt-0.5 font-mono text-[11px] text-text-muted/60">vs {single}</div>
    </div>
  );
}
function Cell({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-text-muted/55">{k}</div>
      <div className={`text-sm tabular-nums ${accent ? "text-accent" : "text-text"}`}>{v}</div>
    </div>
  );
}
