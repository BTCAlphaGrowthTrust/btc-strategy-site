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
