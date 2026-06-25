import type { Metadata } from "next";
import AccessForm from "@/components/AccessForm";

export const metadata: Metadata = {
  title: "Request access — BTC Alpha",
  description:
    "Request access to the BTC Alpha systematic strategy data — a single strategy, a curated bundle, or the full catalogue. Professional & institutional use.",
};

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; ctx?: string }>;
}) {
  const { tier, ctx } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="font-mono text-[11px] uppercase tracking-wider text-accent">Get access</div>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Request access</h1>
      <p className="mt-4 max-w-xl text-text-muted">
        Tell us about your desk and what you&apos;re after — a single strategy, a curated bundle,
        or the full catalogue. We&apos;ll come back with access and pricing. Licensed for
        professional &amp; institutional use.
      </p>

      <div className="mt-10 rounded-2xl border border-border bg-surface-2 p-6 sm:p-8">
        <AccessForm initialTier={tier} context={ctx} />
      </div>

      <p className="mt-6 text-sm text-text-muted">
        Prefer email? Reach us directly at{" "}
        <a href="mailto:thomas@btcalpha.com.au" className="font-mono text-accent hover:text-accent-hover">
          thomas@btcalpha.com.au
        </a>{" "}
        — or copy it:{" "}
        <span className="select-all rounded bg-surface px-2 py-0.5 font-mono text-text">thomas@btcalpha.com.au</span>
      </p>
    </div>
  );
}
