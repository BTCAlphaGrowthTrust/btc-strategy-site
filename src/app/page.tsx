import Link from "next/link";
import { getLanding } from "@/lib/api";
import { getPreview, usd0, bpsPct, frac1 } from "@/lib/program";
import { pct1, num2 } from "@/lib/format";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";
import { VerificationBadge } from "@/components/Badge";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

export const revalidate = 3600;

export default async function Home() {
  const [{ strategies, correlation, derived: d }, preview] = await Promise.all([
    getLanding(),
    getPreview(),
  ]);
  const perf = preview.performance;
  const vsDca = perf.vs_dca;
  const vsVwap = perf.vs_vwap;

  const top = [...strategies]
    .filter((s) => s.stats?.cagr_pct != null)
    .sort((a, b) => (b.stats.cagr_pct ?? 0) - (a.stats.cagr_pct ?? 0))
    .slice(0, 6);
  const dualVerified = strategies.filter((s) => (s as any).verification_state === "dual_verified").length;

  return (
    <>
      {/* status line */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-2 font-mono text-[11px] tracking-wider text-text-muted/70">
          {d.count} systematic BTC strategies + 1 accumulation program · non-custodial · open record, no key
        </div>
      </div>

      {/* 1 · HERO — one portfolio thesis, facts in the subhead */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Systematic BTC portfolio · two subscribable products
          </div>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-6xl">
            The complete systematic BTC portfolio.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">
            A foundation that accumulated BTC at{" "}
            <span className="text-text">{vsDca ? bpsPct(vsDca.advantage_bps) : "—"} below calendar DCA</span>{" "}
            ({usd0(perf.avg_cost)} vs {vsDca ? usd0(vsDca.dca_avg_cost) : "—"}), plus {d.count}{" "}
            low-correlation systematic signals — mean pairwise correlation{" "}
            <span className="text-text">{num2(d.meanCorr)}</span>, about{" "}
            <span className="text-text">{num2(d.effectiveBets)} independent bets</span>. Non-custodial,
            backtested, reproducible from public endpoints with no key.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/gaia" className="rounded-full bg-accent px-6 py-3 font-medium text-bg transition-colors hover:bg-accent-hover">
              Model your treasury →
            </Link>
            <Link href="/strategies"
               className="rounded-full border border-border px-6 py-3 font-medium text-text transition-colors hover:border-accent hover:text-accent">
              Explore the strategies →
            </Link>
          </div>
        </div>
      </section>

      {/* 2 · THE TWO PRODUCTS — layered: foundation then alpha, each independently subscribable */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel n="01" title="Two products, independently subscribable, one stack" />
          <p className="mt-4 max-w-2xl text-text-muted">
            A barbell for a Bitcoin balance sheet: <span className="text-text">Gaia is the defensive BTC
            core</span> — accumulate low, hold your own coins — and <span className="text-text">the
            strategies are the uncorrelated alpha sleeve</span> on top. Subscribe to either on its own,
            or run both. Each number below is reproducible from a keyless public endpoint.
          </p>

          {/* FOUNDATION — Gaia */}
          <div className="mt-10 rounded-xl border border-border bg-surface p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-accent">Foundation · defensive BTC core</span>
                <h3 className="mt-1 font-display text-2xl font-semibold text-text">Gaia</h3>
              </div>
              <Link href="/gaia" className="text-sm font-medium text-accent hover:text-accent-hover">
                Model your treasury →
              </Link>
            </div>
            <p className="mt-4 max-w-3xl text-text-muted">
              Rules-based cycle accumulation that deploys into statistical dips and accumulates below
              the market&apos;s own average. Over the backtested cycle it held at an average cost of{" "}
              <Num>{usd0(perf.avg_cost)}</Num> per BTC. Every figure is reproducible from the keyless{" "}
              <code className="text-accent">GET /v1/program/preview</code>.
            </p>
            <div className="mt-7 grid gap-x-10 gap-y-6 sm:grid-cols-3">
              <Compare
                label="vs calendar DCA"
                book={vsDca ? bpsPct(vsDca.advantage_bps) : "—"}
                single={vsDca ? `${usd0(perf.avg_cost)} vs DCA ${usd0(vsDca.dca_avg_cost)}` : "—"}
                good
              />
              <Compare
                label="vs period VWAP"
                book={vsVwap ? bpsPct(vsVwap.advantage_bps) : "—"}
                single={vsVwap ? `${usd0(perf.avg_cost)} vs VWAP ${usd0(vsVwap.vwap)}` : "—"}
                good
              />
              <Compare
                label="Capital in cheapest quartile"
                book={frac1(perf.pct_capital_in_cheapest_quartile)}
                single="of cycle prices"
              />
            </div>
          </div>

          {/* ALPHA — Strategies, built on top */}
          <div className="mt-5 rounded-xl border border-border bg-surface p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-accent">Alpha sleeve · on top of Gaia</span>
                <h3 className="mt-1 font-display text-2xl font-semibold text-text">Strategies</h3>
              </div>
              <Link href="/strategies" className="text-sm font-medium text-accent hover:text-accent-hover">
                Explore all {d.count} →
              </Link>
            </div>
            <p className="mt-4 max-w-3xl text-text-muted">
              {d.count} low-correlation systematic signals on BTC-PERPETUAL, adding uncorrelated PnL on
              top of the accumulation core. Mean pairwise correlation <Num>{num2(d.meanCorr)}</Num> —
              about <Num>{num2(d.effectiveBets)}</Num> independent bets. Every record is reproducible
              from the keyless <code className="text-accent">GET /v1/strategies</code>.
            </p>
            <div className="mt-7 grid gap-x-10 gap-y-6 sm:grid-cols-3">
              <Compare
                label="Equal-weight book Sharpe"
                book={num2(d.book.sharpe_daily_annualized)}
                single={`exceeds every single (≤ ${num2(d.sharpeMax)})`}
                good
              />
              <Compare
                label="Independent bets"
                book={num2(d.effectiveBets)}
                single={`from ${d.count} strategies`}
              />
              <Compare
                label="Mean pairwise correlation"
                book={num2(d.meanCorr)}
                single="lower is better"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3 · THE PROOF — book-level aggregates */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel n="02" title="The proof — low correlation at book level" />
          <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="max-w-xl">
              <p className="text-text-muted">
                {d.count} systematic strategies, each backtested ~8 years on BTC-PERPETUAL, net of fees
                &amp; slippage. Mean pairwise correlation is <Num>{num2(d.meanCorr)}</Num>, so they
                behave like about <Num>{num2(d.effectiveBets)}</Num> independent bets. Equal-weight, the
                book&apos;s Sharpe of <Num>{num2(d.book.sharpe_daily_annualized)}</Num> exceeds every one
                of the {d.count} strategies individually, at{" "}
                <Num>{pct1(d.book.max_drawdown_pct)}</Num> max drawdown vs {pct1(d.ddMedian)} for the
                median single:
              </p>
              <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-6">
                <Compare label="Sharpe (risk-adjusted)" book={num2(d.book.sharpe_daily_annualized)}
                         single={`≤ ${num2(d.sharpeMax)} any single`} good />
                <Compare label="Max drawdown" book={pct1(d.book.max_drawdown_pct)}
                         single={`${pct1(d.ddMedian)} median single`} good />
                <Compare label="Independent bets" book={num2(d.effectiveBets)}
                         single={`of ${d.count} strategies`} />
                <Compare label="Mean correlation" book={num2(d.meanCorr)} single="lower is better" />
              </div>
              <p className="mt-8 text-sm text-text-muted/80">
                The equal-weight book&apos;s Sharpe exceeds every one of the {d.count} strategies
                individually — verifiable cell by cell. →{" "}
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

          {/* verification honesty (reconciled with the API) + custody */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent/30 bg-accent/[0.04] p-5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-accent">The verification ladder</div>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Every record climbs the same published ladder — nothing skips a rung:{" "}
                <code className="text-accent">engine_backtested</code> → <code className="text-accent">provisional</code> → <code className="text-accent">dual_verified</code>.
                A record reaches <span className="text-text">dual_verified</span> only when the engine&apos;s logic
                reproduces the verified TradingView Pine <span className="text-text">and</span> the backtested
                PnL sits within the TradingView-exported band. Today{" "}
                <span className="text-text">{dualVerified} of {d.count} are dual-verified</span>; the rest are
                engine-backtested (logic matches, PnL band still tightening). The promotion criterion is{" "}
                <span className="text-text">independent, forward verification</span> — until that lands a record
                stays <code>tv_status: provisional</code>. The same <code className="text-accent">verification_state</code>{" "}
                is in the API — curl it and check.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">Non-custodial &amp; continuity</div>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Signals are advisory and non-custodial — <span className="text-text">you hold your own BTC on
                your own exchange</span>; we hold no custody and place no trades on your behalf.{" "}
                <span className="text-text">If BTC Alpha ceases operation, you lose a data feed, not your
                assets</span> — and we commit to at least 30 days&apos; notice before any wind-down.
                Backtested / modelled, provisional — not advice, not a forecast.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 · VERIFY IT FREE — keyless curl, front and centre */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionLabel n="03" title="Verify the record — free, no key" />
              <p className="mt-4 max-w-md text-text-muted">
                Every track record behind the signals — all {d.count} strategies&apos; stats, returns,
                equity curves, correlation and a book-level summary, plus the Gaia accumulation preview —
                is open with no key. Pull it into your own model before you subscribe.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <a href="https://docs.btcalpha.com.au/docs/recipes/evaluate-vs-your-book" className="text-accent hover:text-accent-hover">Evaluate vs your book ↗</a>
                <span className="text-text-muted/40">·</span>
                <a href="https://docs.btcalpha.com.au" className="text-accent hover:text-accent-hover">Documentation ↗</a>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5 font-mono text-[13px] leading-relaxed">
              <div className="text-text-muted/60"># the free track record — no key</div>
              <div className="mt-2"><span className="text-text-muted">$</span> curl btc-strategy-data-api.fly.dev<span className="text-accent">/v1/strategies</span></div>
              <pre className="mt-3 overflow-x-auto whitespace-pre text-text-muted">{`{
  "data": [{
    "id": "…", "name": "…",
    "verification_state": "dual_verified",
    "tv_status": "provisional",
    "instrument": "BTC-PERPETUAL"
  }],
  "meta": { "basis": "backtested" }
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · THE STRATEGIES — per-strategy peaks live here, in the cards */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-end justify-between">
            <SectionLabel n="04" title="The strategies" />
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

      {/* 6 · ACCESS — the culmination */}
      <section className="reveal">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel n="05" title="Request access" />
          <p className="mt-4 max-w-2xl text-text-muted">
            The record is free to verify. Subscribe to Gaia, the {d.count} strategies, or both — each is
            independently subscribable. Live signals fire as each strategy or deployment qualifies. You
            trade on your own venue, at your own size; we only send the signal. Request-based.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/gaia" className="inline-block rounded-full border border-border px-6 py-3 font-medium text-text transition-colors hover:border-accent hover:text-accent">
              Model your treasury →
            </Link>
            <Link href="/access" className="inline-block rounded-full bg-accent px-6 py-3 font-medium text-bg transition-colors hover:bg-accent-hover">
              Request access
            </Link>
          </div>
          <p className="mt-6 font-mono text-xs text-text-muted/60">
            <ObfuscatedEmail mode="text" placeholder="email us" className="text-text-muted/60" /> · operated by Thomas (Tom) Makin — ISI Australia Pty Ltd, ABN 27 652 105 345 · backtested / modelled historical data, provisional, not advice
          </p>
        </div>
      </section>
    </>
  );
}

/* ---- local presentational helpers ---- */
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
      <div className="mt-0.5 font-mono text-[11px] text-text-muted/60">{single}</div>
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
