"use client";

import { useState } from "react";
import {
  type Preview,
  type Charts,
  type Basket,
  type Performance,
  type SimulateInput,
  simulate,
  usd0,
  usd2,
  btc4,
  frac1,
  bpsPct,
  titleCaseWord,
} from "@/lib/program";
import PriceMarkersChart from "./PriceMarkersChart";
import AccumulationChart from "./AccumulationChart";
import CostBasisChart from "./CostBasisChart";

// A unified view model — the reference preview and a simulate result both reduce to this.
type View = {
  label: string;
  basket: Basket;
  performance: Performance;
  charts: Charts;
};

function refView(p: Preview): View {
  return { label: "Reference basket", basket: p.reference_basket, performance: p.performance, charts: p.charts };
}

export default function TreasuryModeller({ preview }: { preview: Preview }) {
  const [initialCapital, setInitialCapital] = useState(200000);
  const [startDate, setStartDate] = useState<string>(""); // "" → null (whole cycle)
  const [contribution, setContribution] = useState(1000);
  const [reservePct, setReservePct] = useState(10); // percent in the UI
  const freqBars = 84; // biweekly cadence (84 × 4H bars), matching the reference basket

  const [view, setView] = useState<View>(() => refView(preview));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);

  async function run() {
    setBusy(true);
    setErr(null);
    const body: SimulateInput = {
      initial_capital: initialCapital,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      contribution,
      contribution_freq_bars: freqBars,
      reserve_pct: reservePct / 100,
    };
    try {
      const res = await simulate(body);
      setView({ label: "Your modelled treasury", basket: res.basket, performance: res.performance, charts: res.charts });
      setIsCustom(true);
    } catch (e: any) {
      setErr(e?.message ?? "simulation failed");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setView(refView(preview));
    setIsCustom(false);
    setErr(null);
  }

  const b = view.basket;
  const perf = view.performance;
  const vsDca = perf.vs_dca;

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/[0.03] p-6 sm:p-8">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        Model your own treasury
      </div>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight">
        Re-run the whole cycle on your numbers.
      </h3>
      <p className="mt-3 max-w-2xl text-text-muted">
        Set your starting capital, contributions and cash reserve. We replay the same backtested
        deployment logic on your inputs and re-render every chart and headline below — server-side,
        from the same public endpoint you can curl yourself.
      </p>

      {/* controls */}
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Initial capital (USD)">
          <input
            type="number"
            min={0}
            step={1000}
            value={initialCapital}
            onChange={(e) => setInitialCapital(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-md border border-border bg-bg/60 px-3 py-2 font-mono text-sm tabular-nums text-text outline-none focus:border-accent"
          />
        </Field>
        <Field label="Start date (blank = whole cycle)">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-border bg-bg/60 px-3 py-2 font-mono text-sm tabular-nums text-text outline-none focus:border-accent"
          />
        </Field>
        <Field label="Biweekly contribution (USD)">
          <input
            type="number"
            min={0}
            step={100}
            value={contribution}
            onChange={(e) => setContribution(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-md border border-border bg-bg/60 px-3 py-2 font-mono text-sm tabular-nums text-text outline-none focus:border-accent"
          />
        </Field>
        <Field label={`Cash reserve · ${reservePct}%`}>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={reservePct}
            onChange={(e) => setReservePct(Number(e.target.value))}
            className="mt-2 w-full accent-[#F5A524]"
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={run}
          disabled={busy}
          className="rounded-full bg-accent px-6 py-2.5 font-medium text-bg transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {busy ? "Replaying…" : "Run the simulation →"}
        </button>
        {isCustom && (
          <button
            onClick={reset}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Reset to reference basket
          </button>
        )}
        <span className="font-mono text-[11px] text-text-muted/60">
          {busy ? "" : isCustom ? "Showing your modelled basket" : "Showing the reference basket"}
        </span>
      </div>
      {err && (
        <p className="mt-3 font-mono text-[11px] text-neg">
          Simulation unavailable ({err}). Showing the last basket.
        </p>
      )}

      {/* headline numbers — re-render with the basket */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Headline label="Average cost basis" value={usd2(perf.avg_cost)} accent />
        <Headline
          label="Cheaper than calendar DCA"
          value={vsDca ? bpsPct(vsDca.advantage_bps) : "—"}
          sub={vsDca ? `DCA at ${usd0(vsDca.dca_avg_cost)}` : undefined}
        />
        <Headline label="BTC accumulated" value={btc4(b.holdings_btc)} />
        <Headline
          label="Deployment"
          value={frac1(b.deployment_pct)}
          sub={`${titleCaseWord(b.deployment_state)} · ${usd0(b.dry_powder_usd)} dry powder`}
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Headline label="Capital deployed" value={usd0(b.deployed_usd)} muted />
        <Headline label="Deployments" value={b.deploy_count.toLocaleString("en-US")} muted />
        {b.contributed_usd != null && (
          <Headline label="Total contributed" value={usd0(b.contributed_usd)} muted />
        )}
      </div>

      {/* the three charts re-render to the active basket */}
      <div className="mt-8 space-y-6">
        <ChartBlock
          n="A"
          title="Price + every deployment"
          arg="The program buys statistical dips — markers cluster in the troughs, coloured by tier, sized by depth."
        >
          <PriceMarkersChart price={view.charts.price_series} markers={view.charts.markers} />
        </ChartBlock>
        <ChartBlock
          n="B"
          title="Capital in → BTC out"
          arg="Hands-off accumulation: contributions convert to a growing BTC position across the cycle."
        >
          <AccumulationChart data={view.charts.accumulation} />
        </ChartBlock>
        <ChartBlock
          n="C"
          title="Cost basis below benchmark"
          arg="Your running average cost stays under calendar DCA — the shaded gap is the edge you keep."
        >
          <CostBasisChart data={view.charts.cost_basis_trajectory} />
        </ChartBlock>
      </div>

      {/* reproducibility line */}
      <div className="mt-8 rounded-xl border border-border bg-bg/50 p-4 font-mono text-[12px] leading-relaxed">
        <span className="text-text-muted/60"># every number here is reproducible — no key</span>
        <div className="mt-2 overflow-x-auto whitespace-pre text-text-muted">
          {`curl -X POST btc-signal-distribution.fly.dev/v1/program/preview/simulate \\
  -H 'content-type: application/json' \\
  -d '${JSON.stringify({
    initial_capital: initialCapital,
    start_date: startDate ? new Date(startDate).toISOString() : null,
    contribution,
    contribution_freq_bars: freqBars,
    reserve_pct: reservePct / 100,
  })}'`}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted/70">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Headline({
  label,
  value,
  sub,
  accent,
  muted,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted/70">{label}</div>
      <div
        className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${
          accent ? "text-accent" : muted ? "text-text-muted" : "text-text"
        }`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 font-mono text-[10px] text-text-muted/60">{sub}</div>}
    </div>
  );
}

function ChartBlock({
  n,
  title,
  arg,
  children,
}: {
  n: string;
  title: string;
  arg: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-3">
        <span className="font-mono text-xs text-accent">{n}</span>
        <h4 className="font-display text-base font-semibold text-text">{title}</h4>
      </div>
      <p className="mb-3 max-w-2xl text-sm text-text-muted">{arg}</p>
      {children}
    </div>
  );
}
