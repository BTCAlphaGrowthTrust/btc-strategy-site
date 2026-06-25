import Link from "next/link";
import type { Metadata } from "next";
import { getCatalogue } from "@/lib/api";
import { BUNDLES } from "@/lib/catalogue";
import { pct1, num2 } from "@/lib/format";
import TierCards from "@/components/TierCards";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Pricing & bundles — BTC Alpha",
  description: "Single, Bundle, or the full catalogue. Pricing on request. Bundle compositions.",
};

export default async function Pricing() {
  const { strategies } = await getCatalogue();
  const byId = Object.fromEntries(strategies.map((s) => [s.id, s]));

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-12">
          <h1 className="text-4xl font-semibold sm:text-5xl">Pricing &amp; bundles</h1>
          <p className="mt-4 max-w-2xl text-text-muted">
            Three ways to subscribe — a single strategy, a curated bundle, or the full {strategies.length}.
            Licensed for professional &amp; institutional use. Pricing on request.
          </p>
          <div className="mt-10">
            <TierCards />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold">Bundle compositions</h2>
          <p className="mt-3 max-w-2xl text-text-muted">
            Bundles are curated sets. The <span className="text-accent">Diversifier Bundle</span> is
            the flagship — the lowest-correlation strategies across all four families.
          </p>

          <div className="mt-10 flex flex-col gap-px overflow-hidden rounded-2xl border border-border bg-border">
            {BUNDLES.map((b) => (
              <div key={b.id} id={b.id} className={`scroll-mt-20 p-7 ${b.flagship ? "bg-surface-2" : "bg-surface"}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`font-display text-xl font-semibold ${b.flagship ? "text-accent" : "text-text"}`}>{b.name}</span>
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    {b.members.length} strategies
                  </span>
                  {b.flagship && (
                    <span className="rounded-full border border-accent/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                      flagship
                    </span>
                  )}
                </div>
                <p className="mt-2 max-w-2xl text-sm text-text-muted">{b.tagline}</p>
                <div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                  {b.members.map((id) => {
                    const s = byId[id];
                    if (!s) return null;
                    return (
                      <Link key={id} href={`/strategies/${id}`} className="group flex items-center justify-between gap-3 bg-surface px-4 py-3 transition-colors hover:bg-surface-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm text-text group-hover:text-accent">{s.name}</div>
                          <div className="truncate font-mono text-[10px] uppercase tracking-wider text-text-muted/55">{s.tv_status}</div>
                        </div>
                        <div className="shrink-0 text-right font-mono tabular-nums">
                          <div className="text-sm text-accent">{pct1(s.stats?.cagr_pct)}</div>
                          <div className="text-[10px] text-text-muted/60">PF {num2(s.stats?.profit_factor)}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link href={`/access?tier=bundle&ctx=${encodeURIComponent(b.name)}`}
                   className="mt-5 inline-block rounded-full border border-border px-5 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent">
                  Request access — {b.name}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-surface p-8 text-center">
            <h2 className="text-2xl font-semibold">Request access</h2>
            <p className="mx-auto mt-3 max-w-lg text-text-muted">
              Tell us which tier or bundle fits and we&apos;ll get you set up. Pricing on request.
            </p>
            <Link href="/access"
               className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-medium text-bg transition-colors hover:bg-accent-hover">
              Request access
            </Link>
            <p className="mt-4 text-sm text-text-muted">
              or email{" "}
              <ObfuscatedEmail mode="text" placeholder="(enable JavaScript to view)" className="font-mono text-text" />
            </p>
            <p className="mt-5 font-mono text-xs text-text-muted/60">backtested / modelled historical data, not advice</p>
          </div>
        </div>
      </section>
    </>
  );
}
