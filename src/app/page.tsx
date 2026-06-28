import Link from "next/link";
import { getLanding } from "@/lib/api";
import { pct1, num2 } from "@/lib/format";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";
import { VerificationBadge } from "@/components/Badge";
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
          LIVE TRADE SIGNALS · {d.count} systematic BTC strategies · 8-year track record
        </div>
      </div>

      {/* 1 · HERO — the signals product; the record is the proof */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Live Bitcoin trade signals
          </div>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-6xl">
            Live trade signals from {d.count} systematic Bitcoin strategies.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
            A real, low-correlation edge — proven on an <span className="text-text">8-year, independently
            verifiable</span> track record. Subscribe for the live signals; the full record is{" "}
            <span className="text-text">free to verify yourself</span>, no key.
          </p>

          {/* edge-led proof (Sharpe beats every single, then bets, then CAGR as the eye-catcher) */}
          <div className="mt-10 flex flex-wrap items-end gap-x-12 gap-y-6">
            <Stat label="Equal-weight book Sharpe" value={num2(d.book.sharpe_daily_annualized)}
                  sub={`beats every single (≤ ${num2(d.sharpeMax)})`} />
            <Stat label="Independent bets" value={num2(d.effectiveBets)} sub={`of ${d.count} strategies`} />
            <Stat label="Backtested CAGR up to" value={pct1(d.cagrMax)} muted />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/access" className="rounded-full bg-accent px-6 py-3 font-medium text-bg transition-colors hover:bg-accent-hover">
              Subscribe for live signals →
            </Link>
            <Link href="/strategies"
               className="rounded-full border border-border px-6 py-3 font-medium text-text transition-colors hover:border-accent hover:text-accent">
              Verify the record free
            </Link>
          </div>
        </div>
      </section>

      {/* 2 · HOW THE LIVE SIGNALS WORK (new) */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel n="01" title="How the live signals work" />
          <p className="mt-4 max-w-2xl text-text-muted">
            You subscribe; the moment a strategy fires, you get an actionable signal. We give you the
            trade — <span className="text-text">you execute it on your own venue, at your own size.</span>{" "}
            <span className="text-text">We never touch your capital.</span>
          </p>

          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-3">
            <HowBlock title="What you receive">
              A real-time signal each time a strategy fires — aliased (Helios, Athena, …) with the trade
              details: <strong className="text-text">direction</strong> (long / short / close),{" "}
              <strong className="text-text">instrument</strong> (BTC-PERPETUAL), the{" "}
              <strong className="text-text">base risk %</strong>, a <strong className="text-text">reference
              price</strong> (the level at signal time — not a guaranteed fill) and the{" "}
              <strong className="text-text">stop / invalidation</strong> level. Live signals carry{" "}
              <code className="text-accent">is_test: false</code>; the occasional test/connectivity signal is
              flagged so you never act on one.
            </HowBlock>
            <HowBlock title="How your desk consumes them">
              <strong className="text-text">Available now:</strong>{" "}
              <strong className="text-text">signed webhook push</strong> (HMAC-verified POST to your
              endpoint) and pull from a gated REST API —{" "}
              <code className="text-accent">GET /v1/signals/latest</code> and{" "}
              <code className="text-accent">/history</code> for gap-free catch-up — and/or{" "}
              <strong className="text-text">email alerts</strong>. One documented JSON schema to integrate
              against. <strong className="text-text">On the roadmap (not live yet):</strong> streaming.
            </HowBlock>
            <HowBlock title="What a subscription delivers">
              Signals for the strategies you choose — a <strong className="text-text">single strategy</strong>,
              a <strong className="text-text">curated bundle</strong>, or the{" "}
              <strong className="text-text">full catalogue</strong>. We give the{" "}
              <strong className="text-text">risk % per signal</strong>; you scale it to your own book and
              venue. Request-based; professional &amp; institutional.
            </HowBlock>
          </div>

          {/* custody differentiator + verification honesty */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent/30 bg-accent/[0.04] p-5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-accent">Your money stays yours</div>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                We send a signal — nothing more. <span className="text-text">Your funds never leave your
                exchange</span>, we hold no custody, and we place no trades on your behalf. You trade on your
                venue, at your size.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">Verification in progress</div>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Track records are <span className="text-text">backtested / modelled</span> and currently{" "}
                <span className="text-text">provisional</span> — pending independent (TradingView)
                cross-verification. Not advice, not a forecast. Verify every record yourself, free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · THE PROOF — performance + low correlation + heatmap (reframed as evidence) */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel n="02" title="The proof — every signal comes from a strategy with this record" />
          <p className="mt-4 max-w-2xl text-text-muted">
            {d.count} systematic strategies, each backtested over ~8 years on BTC-PERPETUAL and net of fees
            &amp; slippage. Backtested CAGR up to <Num>{pct1(d.cagrMax)}</Num>, profit factor up to{" "}
            <Num>{num2(d.pfMax)}×</Num>, median profit factor <Num>{num2(d.pfMedian)}</Num>.
          </p>

          <div className="mt-16 border-t border-border pt-12">
            <SectionLabel n="03" title="The edge is low correlation" />
            <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="max-w-xl">
                <p className="text-text-muted">
                  Strong individually — but they don&apos;t move together. Mean pairwise correlation is just{" "}
                  <Num>{num2(d.meanCorr)}</Num>, so {d.count} strategies behave like about{" "}
                  <Num>{num2(d.effectiveBets)}</Num> independent bets. Combine them equal-weight and the book
                  is <span className="text-text">steadier than any single piece</span>:
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
                  The equal-weight book&apos;s Sharpe exceeds <span className="text-text">every</span> one of
                  the {d.count} strategies individually — diversification you can verify cell by cell. →{" "}
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

      {/* 4 · VERIFY IT FREE — the record behind the signals, open + keyless */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionLabel n="04" title="Verify the record — free, no key" />
              <p className="mt-4 max-w-md text-text-muted">
                Don&apos;t take our word for it. Every track record behind the signals — all {d.count}{" "}
                strategies&apos; stats, returns, equity curves, correlation and a book-level summary — is{" "}
                <span className="text-text">free and open, no key</span>. Pull it into your own model and
                check the proof before you subscribe.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <a href="https://docs.btcalpha.com.au/docs/recipes/evaluate-vs-your-book" className="text-accent hover:text-accent-hover">Evaluate vs your book ↗</a>
                <span className="text-text-muted/40">·</span>
                <a href="https://docs.btcalpha.com.au" className="text-accent hover:text-accent-hover">Documentation ↗</a>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5 font-mono text-[13px] leading-relaxed">
              <div className="text-text-muted/60"># the free track record — no key</div>
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

      {/* 5 · THE STRATEGIES — catalogue preview */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-end justify-between">
            <SectionLabel n="05" title="The strategies" />
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

      {/* 6 · SUBSCRIBE FOR LIVE SIGNALS — the culmination */}
      <section className="reveal">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel n="06" title="Subscribe for live signals" />
          <p className="mt-4 max-w-2xl text-text-muted">
            The track record is free to verify. When you want to <strong className="text-text">act</strong> on
            it in real time, that&apos;s the product: live, actionable signals as each strategy fires — a
            single strategy, a bundle, or the full {d.count}. You trade on your venue, at your size; we only
            send the signal. Request-based; professional &amp; institutional.
          </p>
          <div className="mt-8">
            <Link href="/access" className="inline-block rounded-full bg-accent px-6 py-3 font-medium text-bg transition-colors hover:bg-accent-hover">
              Subscribe for live signals
            </Link>
          </div>
          <p className="mt-6 font-mono text-xs text-text-muted/60">
            <ObfuscatedEmail mode="text" placeholder="email us" className="text-text-muted/60" /> · backtested / modelled historical data, provisional, not advice
          </p>
        </div>
      </section>
    </>
  );
}

/* ---- local presentational helpers ---- */
function Stat({ label, value, sub, muted }: { label: string; value: string; sub?: string; muted?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">{label}</div>
      <div className={`mt-1 font-mono text-4xl font-semibold tabular-nums ${muted ? "text-text" : "text-accent"}`}>{value}</div>
      {sub && <div className="mt-1 font-mono text-[11px] text-text-muted/60">{sub}</div>}
    </div>
  );
}
function HowBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface p-6">
      <div className="font-display text-base font-semibold text-text">{title}</div>
      <p className="mt-3 text-sm leading-relaxed text-text-muted">{children}</p>
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
