import Link from "next/link";
import { TIERS } from "@/lib/catalogue";

export default function TierCards() {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
      {TIERS.map((t) => {
        const featured = t.id === "bundle";
        return (
          <div key={t.id} className={`flex flex-col p-7 ${featured ? "bg-surface-2" : "bg-surface"}`}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent">{t.name}</span>
              {featured && (
                <span className="rounded-full border border-accent/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                  popular
                </span>
              )}
            </div>
            <div className="mt-2 font-display text-xl font-semibold">{t.headline}</div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-text-muted">{t.what}</p>
            <div className="mt-6 font-mono text-sm">
              <span className="text-text">Price</span> <span className="text-text-muted">on request</span>
            </div>
            <Link
              href={`/access?tier=${t.id}`}
              className={`mt-4 rounded-full px-5 py-2.5 text-center font-medium transition-colors ${
                featured
                  ? "bg-accent text-bg hover:bg-accent-hover"
                  : "border border-border text-text hover:border-accent hover:text-accent"
              }`}
            >
              Request access
            </Link>
          </div>
        );
      })}
    </div>
  );
}
