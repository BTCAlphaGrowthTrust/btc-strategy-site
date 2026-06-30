import type { Metadata } from "next";
import AccessForm from "@/components/AccessForm";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

export const metadata: Metadata = {
  title: "Subscribe for live signals — BTC Alpha",
  description:
    "Historical data is free. Request access to the BTC Alpha live trade signals — real-time, actionable, request-based. Professional & institutional use.",
};

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; ctx?: string }>;
}) {
  const { tier, ctx } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="font-mono text-[11px] uppercase tracking-wider text-accent">Live signals</div>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Subscribe for live signals</h1>
      <p className="mt-4 max-w-xl text-text-muted">
        All the historical data is <strong>free</strong> — verify everything first, no key. To receive the{" "}
        <strong>live signals</strong> (real-time, actionable trade alerts as each strategy fires), tell us about
        your desk and which strategies you want. Request-based; licensed for professional &amp; institutional use.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { name: "Single", desc: "One strategy, or Gaia on its own." },
          { name: "Bundle", desc: "A curated set across the book." },
          { name: "Full catalogue", desc: "Every strategy + the Gaia core." },
        ].map((t) => (
          <div key={t.name} className="rounded-xl border border-border bg-surface p-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-accent">{t.name}</div>
            <p className="mt-1 text-sm text-text-muted">{t.desc}</p>
            <p className="mt-2 font-mono text-xs text-text-muted/70">Request pricing →</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-text-muted">
        Operated by <span className="text-text">Thomas (Tom) Makin — Founder &amp; Principal, ISI Australia
        Pty Ltd (ABN 27 652 105 345)</span>. Signals are advisory and non-custodial — you hold your own BTC on
        your own exchange; if BTC Alpha ceases operation you lose a data feed, not your assets (we commit to
        ≥30 days&apos; notice before any wind-down).
      </p>

      <div className="mt-10 rounded-2xl border border-border bg-surface-2 p-6 sm:p-8">
        <AccessForm initialTier={tier} context={ctx} />
      </div>

      <p className="mt-6 text-sm text-text-muted">
        Prefer email? Reach us directly at{" "}
        <ObfuscatedEmail
          mode="link"
          fallbackHref="/access"
          placeholder="the address below"
          className="font-mono text-accent hover:text-accent-hover"
        />{" "}
        — or copy it:{" "}
        <ObfuscatedEmail
          mode="text"
          placeholder="(enable JavaScript to view)"
          className="rounded bg-surface px-2 py-0.5 font-mono text-text"
        />
      </p>
    </div>
  );
}
