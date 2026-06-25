import Link from "next/link";
import type { Metadata } from "next";
import { getCatalogue } from "@/lib/api";
import { pct1, num2 } from "@/lib/format";
import { bundlesForStrategy, BUNDLES } from "@/lib/catalogue";
import { VerificationBadge } from "@/components/Badge";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Strategy catalogue — BTC Alpha",
  description: "Browse all 17 backtested BTC strategies. Subscribe to one, a bundle, or all 17.",
};

export default async function Catalogue() {
  const { strategies, datasetVersion } = await getCatalogue();
  const sorted = [...strategies].sort((a, b) => (b.stats?.cagr_pct ?? -1e9) - (a.stats?.cagr_pct ?? -1e9));

  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-2 font-mono text-[11px] tracking-wider text-text-muted/70">
          CATALOGUE · {strategies.length} strategies · dataset {datasetVersion} · backtested
        </div>
      </div>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-10">
          <h1 className="text-4xl font-semibold sm:text-5xl">Strategy catalogue</h1>
          <p className="mt-4 max-w-2xl text-text-muted">
            Every strategy is backtested over ~8 years on BTC-PERPETUAL, net of fees &amp; slippage,
            and individually evaluable. Subscribe to one, a curated bundle, or the full {strategies.length}.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {BUNDLES.map((b) => (
              <Link key={b.id} href={`/pricing#${b.id}`}
                className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${
                  b.flagship ? "border-accent/40 text-accent" : "border-border text-text-muted hover:text-accent"
                }`}>
                {b.name} · {b.members.length}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((s) => {
              const bundles = bundlesForStrategy(s.id);
              return (
                <Link key={s.id} href={`/strategies/${s.id}`} className="group flex flex-col bg-surface p-5 transition-colors hover:bg-surface-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-display text-[16px] font-semibold leading-snug text-text group-hover:text-accent">
                      {s.name}
                    </div>
                    <VerificationBadge state={s.verification_state} />
                  </div>
                  <div className="mt-1.5 line-clamp-2 text-sm text-text-muted">{s.blurb}</div>
                  <div className="mt-5 grid grid-cols-4 gap-2 font-mono tabular-nums">
                    <Cell k="CAGR" v={pct1(s.stats?.cagr_pct)} accent />
                    <Cell k="PF" v={num2(s.stats?.profit_factor)} />
                    <Cell k="DD" v={pct1(s.stats?.max_drawdown_pct)} />
                    <Cell k="WIN" v={s.stats ? `${s.stats.win_rate_pct.toFixed(0)}%` : "—"} />
                  </div>
                  <div className="mt-5 flex flex-1 flex-wrap items-end gap-1.5 pt-1">
                    {bundles.map((b) => (
                      <span key={b.id}
                        className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                          b.flagship ? "bg-accent/12 text-accent" : "bg-surface-2 text-text-muted/70"
                        }`}>
                        {b.name.replace(" Bundle", "")}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
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
