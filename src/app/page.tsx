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
  const dualVerified = strategies.filter((s) => (s as any).verification_state === "dual_verified").length;

  return (
    <>
      {/* status line */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-2 font-mono text-[11px] tracking-wider text-text-muted/70">
          LIVE TRADE SIGNALS · {d.count} systematic BTC strategies · non-custodial · open record, no key
        </div>
      </div>

      {/* 1 · HERO — what it is, in one read, honestly framed */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Live, systematic Bitcoin signals
          </div>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-6xl">
            A low-correlation BTC return stream you verify before you pay.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">
            {d.count} rules-based strategies on BTC-PERPETUAL, on a{" "}
            <span className="text-text">~8-year backtested record</span> that is{" "}
            <span className="text-text">open and free to inspect with no key</span>. Non-custodial — you
            trade your own book. Independent verification is underway.
          </p>

          {/* book-level proof only — no single-strategy peak in the hero */}
          <div className="mt-10 flex flex-wrap items-end gap-x-12 gap-y-6">
            <Stat label="Equal-weight book Sharpe" value={num2(d.book.sharpe_daily_annualized)}
                  sub={`beats every single (≤ ${num2(d.sharpeMax)})`} />
            <Stat label="Independent bets" value={num2(d.effectiveBets)}
                  sub={`from ${d.count} strategies · mean corr ${num2(d.meanCorr)}`} />
            <Stat label="Book max drawdown" value={pct1(d.book.max_drawdown_pct)}
                  sub={`vs ${pct1(d.ddMedian)} median single`} muted />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/access" className="rounded-full bg-accent px-6 py-3 font-medium text-bg transition-colors hover:bg-accent-hover">
              Request access →
            </Link>
            <Link href="/strategies"
               className="rounded-full border border-border px-6 py-3 font-medium text-text transition-colors hover:border-accent hover:text-accent">
              Verify the record free
            </Link>
          </div>
        </div>
      </section>

      {/* 2 · THREE DOORS — each reader reaches THEIR value in one click */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-3">
            <Door kicker="You allocate" title="A book that beats its own best piece"
                  href="https://docs.btcalpha.com.au/docs/methodology/correlation"
                  cta="The correlation method ↗" external>
              {d.count} strategies, mean pairwise correlation{" "}
              <strong className="text-text">{num2(d.meanCorr)}</strong> — about{" "}
              <strong className="text-text">{num2(d.effectiveBets)} independent bets</strong>.
              Equal-weight, the book Sharpe is{" "}
              <strong className="text-text">{num2(d.book.sharpe_daily_annualized)}</strong>, higher than{" "}
              <strong className="text-text">every</strong> single strategy, at{" "}
              <strong className="text-text">{pct1(d.book.max_drawdown_pct)}</strong> max drawdown vs{" "}
              {pct1(d.ddMedian)} for the median single. Non-custodial.
            </Door>

            <Door kicker="You integrate" title="One schema. Push or pull. No key to look."
                  href="https://docs.btcalpha.com.au/docs/get-started/quickstart"
                  cta="Quickstart + integration ↗" external>
              <div className="rounded-lg border border-border bg-bg/50 p-3 font-mono text-[12px] leading-relaxed">
                <span className="text-text-muted/60"># the full record — free, no key</span>
                <div className="mt-1"><span className="text-text-muted">$</span> curl btc-strategy-data-api.fly.dev<span className="text-accent">/v1/strategies</span></div>
              </div>
              <div className="mt-3">
                One documented JSON schema. <strong className="text-text">Signed webhook push</strong>{" "}
                (raw-bytes HMAC) or <strong className="text-text">pull</strong> with gap-free{" "}
                <code className="text-accent">/history?since=</code>.
              </div>
            </Door>

            <Door kicker="You're sizing the allocation" title="No fund capacity cap. Your venue, your size."
                  href="/access" cta="Request access →">
              Signals, not a fund: <strong className="text-text">no pooled capital and no capacity
              constraint on our side</strong>. You execute on your own venue, at your own size — funds{" "}
              <strong className="text-text">never leave your exchange</strong>. Sizing is yours via{" "}
              <code className="text-accent">base_risk_pct</code>, bounded only by your venue&apos;s
              BTC-PERPETUAL liquidity and slippage.
            </Door>
          </div>
        </div>
      </section>

      {/* 3 · THE PROOF — lead with book-level aggregates */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel n="01" title="The proof — the edge is low correlation, at book level" />
          <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="max-w-xl">
              <p className="text-text-muted">
                {d.count} systematic strategies, each backtested ~8 years on BTC-PERPETUAL, net of fees
                &amp; slippage. Strong individually — but they don&apos;t move together. Mean pairwise
                correlation is <Num>{num2(d.meanCorr)}</Num>, so they behave like about{" "}
                <Num>{num2(d.effectiveBets)}</Num> independent bets. Equal-weight, the book is{" "}
                <span className="text-text">steadier than any single piece</span>:
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

          {/* verification honesty (reconciled with the API) + custody */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent/30 bg-accent/[0.04] p-5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-accent">Where verification stands</div>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                <span className="text-text">{dualVerified} of {d.count} are dual-verified</span> — the
                engine&apos;s logic reproduces the verified TradingView Pine <span className="text-text">and</span>{" "}
                the backtested PnL sits within the TradingView-exported band. The rest are
                engine-backtested (logic matches; PnL band still tightening). The same{" "}
                <code className="text-accent">verification_state</code> is in the API — curl it and check.
                <span className="text-text"> Independent, forward verification is underway</span>; every
                record stays <code>tv_status: provisional</code> until then.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">Your money stays yours</div>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                We send a signal — nothing more. <span className="text-text">Your funds never leave your
                exchange</span>, we hold no custody, and we place no trades on your behalf. Backtested /
                modelled, provisional — not advice, not a forecast.
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
              <SectionLabel n="02" title="Verify the record — free, no key" />
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
            <SectionLabel n="03" title="The strategies" />
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
          <SectionLabel n="04" title="Request access" />
          <p className="mt-4 max-w-2xl text-text-muted">
            The record is free to verify. When you want to <strong className="text-text">act</strong> on it
            in real time, that&apos;s the product: live, actionable signals as each strategy fires — a
            single strategy, a bundle, or the full {d.count}. You trade on your own venue, at your own size;
            we only send the signal. Request-based.
          </p>
          <div className="mt-8">
            <Link href="/access" className="inline-block rounded-full bg-accent px-6 py-3 font-medium text-bg transition-colors hover:bg-accent-hover">
              Request access
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
function Door({ kicker, title, href, cta, external, children }: {
  kicker: string; title: string; href: string; cta: string; external?: boolean; children: React.ReactNode;
}) {
  const inner = (
    <div className="flex h-full flex-col bg-surface p-6 transition-colors hover:bg-surface-2">
      <div className="font-mono text-[11px] uppercase tracking-wider text-accent">{kicker}</div>
      <div className="mt-2 font-display text-lg font-semibold leading-snug text-text">{title}</div>
      <div className="mt-3 flex-1 text-sm leading-relaxed text-text-muted">{children}</div>
      <div className="mt-5 text-sm font-medium text-accent">{cta}</div>
    </div>
  );
  return external
    ? <a href={href} className="group block h-full">{inner}</a>
    : <Link href={href} className="group block h-full">{inner}</Link>;
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
