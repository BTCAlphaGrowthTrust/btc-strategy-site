import type { Metadata } from "next";
import Link from "next/link";
import {
  getPreview,
  TIER_ORDER,
  TIER_LABEL,
  TIER_COLOR,
  TIER_BLURB,
  type Tier,
  usd0,
  usd2,
  btc4,
  frac1,
  bpsPct,
  titleCaseWord,
} from "@/lib/program";
import TreasuryModeller from "@/components/program/TreasuryModeller";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Gaia — rules-based BTC cycle accumulation | BTC Alpha",
  description:
    "Gaia: non-custodial, rules-based BTC cycle accumulation. Deploys into statistical dips, accumulated at $7,172.66 avg cost vs $15,462 DCA over the backtested cycle. Reproducible from the public endpoint — model your own treasury.",
};

export default async function GaiaPage() {
  const preview = await getPreview();
  const { reference_basket: rb, performance: perf, charts } = preview;
  const vsDca = perf.vs_dca;
  const vsVwap = perf.vs_vwap;
  const vsLump = perf.vs_lump_sum;
  const vsHodl = perf.vs_hodl;

  return (
    <>
      {/* status line */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-2 font-mono text-[11px] tracking-wider text-text-muted/70">
          BTC ACCUMULATION PROGRAM · non-custodial · you hold your own BTC · open preview, no key
        </div>
      </div>

      {/* 1 · HERO */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Gaia · rules-based BTC cycle accumulation
          </div>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-6xl">
            Accumulate Bitcoin below the market&apos;s own average — over the whole cycle.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">
            Rules-based cycle accumulation that deploys capital into{" "}
            <span className="text-text">statistical dips</span>, not the calendar. Over a{" "}
            <span className="text-text">~8-year backtested cycle</span> it accumulated at an average
            cost of <span className="text-text">{usd0(perf.avg_cost)}</span> per BTC —{" "}
            {vsDca ? bpsPct(vsDca.advantage_bps) : "—"} below calendar DCA ({vsDca ? usd0(vsDca.dca_avg_cost) : "—"}),{" "}
            {vsVwap ? bpsPct(vsVwap.advantage_bps) : "—"} below the period VWAP ({vsVwap ? usd0(vsVwap.vwap) : "—"}).
            Non-custodial — you hold your own BTC.
          </p>

          {/* headline proof — entry quality first */}
          <div className="mt-10 flex flex-wrap items-end gap-x-12 gap-y-6">
            <Stat
              label="Avg cost vs period VWAP"
              value={vsVwap ? bpsPct(vsVwap.advantage_bps) : "—"}
              sub={vsVwap ? `${usd0(perf.avg_cost)} vs VWAP ${usd0(vsVwap.vwap)}` : undefined}
            />
            <Stat
              label="Cheaper than calendar DCA"
              value={vsDca ? bpsPct(vsDca.advantage_bps) : "—"}
              sub={vsDca ? `${usd0(perf.avg_cost)} vs DCA ${usd0(vsDca.dca_avg_cost)}` : undefined}
            />
            <Stat
              label="Capital in cheapest quartile"
              value={frac1(perf.pct_capital_in_cheapest_quartile)}
              sub="of cycle prices"
              muted
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="#model"
              className="rounded-full bg-accent px-6 py-3 font-medium text-bg transition-colors hover:bg-accent-hover"
            >
              Model your own treasury →
            </Link>
            <Link
              href="/access"
              className="rounded-full border border-border px-6 py-3 font-medium text-text transition-colors hover:border-accent hover:text-accent"
            >
              Request access
            </Link>
          </div>
        </div>
      </section>

      {/* 2 · THE PROOF — lead with entry quality */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel n="01" title="The proof — avg cost vs benchmark, every number from the public preview" />
          <p className="mt-4 max-w-2xl text-text-muted">
            On the backtested reference basket the program deployed{" "}
            <Num>{rb.deploy_count.toLocaleString("en-US")}</Num> times across the cycle, holding{" "}
            <Num>{btc4(rb.holdings_btc)}</Num> at an average cost of <Num>{usd2(perf.avg_cost)}</Num>.
            Avg cost vs each benchmark, reproducible from the public endpoint:
          </p>

          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            <Compare
              kicker="vs calendar DCA"
              big={vsDca ? bpsPct(vsDca.advantage_bps) : "—"}
              line={vsDca ? `${usd2(perf.avg_cost)} vs DCA ${usd0(vsDca.dca_avg_cost)}` : "—"}
              good
            />
            <Compare
              kicker="vs period VWAP"
              big={vsVwap ? bpsPct(vsVwap.advantage_bps) : "—"}
              line={vsVwap ? `${usd2(perf.avg_cost)} vs VWAP ${usd0(vsVwap.vwap)}` : "—"}
              good
            />
            <Compare
              kicker="vs lump-sum"
              big={vsLump ? bpsPct(vsLump.advantage_bps) : "—"}
              line={vsLump ? `${usd2(perf.avg_cost)} vs ${usd0(vsLump.lump_avg_cost)} single buy — timing-dependent` : "—"}
            />
            <Compare
              kicker="vs HODL entry"
              big={vsHodl ? bpsPct(vsHodl.advantage_bps) : "—"}
              line={vsHodl ? `${usd2(perf.avg_cost)} vs ${usd0(vsHodl.hodl_avg_cost)} buy-and-hold` : "—"}
            />
          </div>

          {/* deployment snapshot */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Snapshot label="Deployment state" value={titleCaseWord(rb.deployment_state)} />
            <Snapshot label="Deployed" value={frac1(rb.deployment_pct)} sub={`${usd0(rb.deployed_usd)} in`} />
            <Snapshot label="Dry powder" value={usd0(rb.dry_powder_usd)} sub="held in reserve" />
            <Snapshot
              label="Capital in cheapest quartile"
              value={frac1(perf.pct_capital_in_cheapest_quartile)}
              sub="of all cycle prices"
            />
          </div>
          <p className="mt-6 text-sm text-text-muted/80">
            Lump-sum and HODL comparisons are timing-dependent. The benchmark that generalises is
            dip-weighted entry vs a calendar DCA schedule: {vsDca ? bpsPct(vsDca.advantage_bps) : "—"}{" "}
            cheaper at {usd0(perf.avg_cost)} vs {vsDca ? usd0(vsDca.dca_avg_cost) : "—"}. As of{" "}
            <Num>{rb.as_of.slice(0, 10)}</Num>.
          </p>
        </div>
      </section>

      {/* 3 · MODEL YOUR OWN TREASURY — front and centre, the close */}
      <section id="model" className="reveal border-b border-border scroll-mt-6">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel n="02" title="Model your own treasury" />
          <p className="mt-4 max-w-2xl text-text-muted">
            Change the inputs and the same backtested deployment logic replays on your basket,
            re-rendering all three charts and every headline figure. Every output is reproducible from
            the public <code className="text-accent">/v1/program/preview/simulate</code> endpoint.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-text-muted/80">
            The DCA benchmark uses your exact contribution schedule — same cadence, same dollars; the
            only difference is dip-timing vs buying on the calendar date. Switch the frequency to
            weekly, biweekly, or monthly and the DCA line re-computes to your schedule.
          </p>
          <div className="mt-8">
            <TreasuryModeller preview={preview} />
          </div>
        </div>
      </section>

      {/* 4 · TIERS / HORIZONS — aliased only */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel n="03" title="How it deploys — three horizons" />
          <p className="mt-4 max-w-2xl text-text-muted">
            Deployments are graded across three horizons. Deeper statistical dips draw larger
            deployments; the markers on the price chart are coloured and sized to match.
          </p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
            {TIER_ORDER.map((t: Tier) => (
              <div key={t} className="bg-surface p-6">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: TIER_COLOR[t] }}
                  />
                  <span className="font-display text-lg font-semibold text-text">
                    {TIER_LABEL[t]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{TIER_BLURB[t]}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 font-mono text-[11px] text-text-muted/60">
            {charts.markers.length.toLocaleString("en-US")} graded deployments over the backtested
            cycle. Non-custodial — the program emits the signal; your BTC never leaves your control.
          </p>
        </div>
      </section>

      {/* 5 · ACCESS */}
      <section className="reveal border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel n="04" title="Run it on your own treasury" />
          <p className="mt-4 max-w-2xl text-text-muted">
            The preview is free to inspect and reproduce. When you want the program running live on
            your accumulation, that&apos;s the product: a deployment signal as each dip qualifies. You
            buy on your own venue, at your own size, holding your own BTC — we only send the signal.
            Request-based.
          </p>
          <div className="mt-8">
            <Link
              href="/access"
              className="inline-block rounded-full bg-accent px-6 py-3 font-medium text-bg transition-colors hover:bg-accent-hover"
            >
              Request access
            </Link>
          </div>
          <p className="mt-6 font-mono text-xs text-text-muted/60">
            <ObfuscatedEmail mode="text" placeholder="email us" className="text-text-muted/60" /> ·
            backtested / modelled historical data, provisional, not advice
          </p>
        </div>
      </section>

      {/* 6 · DISCLAIMER REGISTER */}
      <section className="reveal">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">
                What these numbers are
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Every figure on this page is{" "}
                <span className="text-text">backtested / modelled</span> on historical data, computed
                by the verification engine ({preview.performance.basis}), and{" "}
                <code className="text-accent">provisional</code>. The simulator replays the same logic
                on your inputs — it is a model of the past, not a forecast. Past performance is not
                indicative of future results.
              </p>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/[0.04] p-5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-accent">
                Verification &amp; custody
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                The program is <span className="text-text">backtested and engine-verified</span> — the
                portable engine is bit-exact versus the canonical reference port. Its{" "}
                <span className="text-text">allocation logic is independently verified against a
                hand-authored TradingView indicator — 94% of deploys land on the same bar at the same
                price</span>. It is still <span className="text-text">not</span> one of the dual-verified
                signal strategies:{" "}
                <code className="text-accent">verification_state: {preview.manifest.verification_state}</code>,{" "}
                <code className="text-accent">tv_status: {preview.manifest.tv_status}</code> — the historical{" "}
                <span className="text-text">avg cost and DCA-savings figures are engine-backtested, not
                independently TradingView-verified</span>. It is{" "}
                <span className="text-text">non-custodial</span> — a data signal only; your funds never
                leave your control, we hold no custody, and we place no trades on your behalf. Not advice,
                not a recommendation, not a forecast.
              </p>
            </div>
          </div>
          <p className="mt-6 text-xs text-text-muted">
            BTC Alpha is operated by ISI Australia Pty Ltd · ABN 27 652 105 345. Factual historical
            data, backtested / modelled, provisional — not advice.
          </p>
        </div>
      </section>
    </>
  );
}

/* ---- presentational helpers ---- */
function Stat({
  label,
  value,
  sub,
  muted,
}: {
  label: string;
  value: string;
  sub?: string;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">{label}</div>
      <div className={`mt-1 font-mono text-4xl font-semibold tabular-nums ${muted ? "text-text" : "text-accent"}`}>
        {value}
      </div>
      {sub && <div className="mt-1 font-mono text-[11px] text-text-muted/60">{sub}</div>}
    </div>
  );
}
function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div>
      <span className="font-mono text-xs text-accent">{n}</span>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
    </div>
  );
}
function Num({ children }: { children: React.ReactNode }) {
  return <span className="font-mono tabular-nums text-text">{children}</span>;
}
function Compare({
  kicker,
  big,
  line,
  good,
}: {
  kicker: string;
  big: string;
  line: string;
  good?: boolean;
}) {
  return (
    <div className="bg-surface p-5">
      <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted/70">{kicker}</div>
      <div className={`mt-1 font-mono text-3xl font-semibold tabular-nums ${good ? "text-accent" : "text-text"}`}>
        {big}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-text-muted">{line}</div>
    </div>
  );
}
function Snapshot({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted/70">{label}</div>
      <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-text">{value}</div>
      {sub && <div className="mt-1 font-mono text-[10px] text-text-muted/60">{sub}</div>}
    </div>
  );
}
