import Link from "next/link";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-accent font-display text-[13px] font-bold text-bg">
                &#945;
              </span>
              <span className="font-display font-semibold text-text">BTC Alpha</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Backtested / modelled historical data for professional &amp; institutional use.
              Past performance is not indicative of future results — not advice, not a
              recommendation, not a forecast.
            </p>
          </div>
          <div className="flex gap-14 text-sm">
            <div className="flex flex-col gap-2.5">
              <span className="font-medium text-text">Product</span>
              <Link href="/buy-program" className="text-text-muted hover:text-accent-hover">Gaia</Link>
              <Link href="/strategies" className="text-text-muted hover:text-accent-hover">Strategies</Link>
              <Link href="/pricing" className="text-text-muted hover:text-accent-hover">Pricing</Link>
              <a href="https://docs.btcalpha.com.au/docs/methodology/overview" className="text-text-muted hover:text-accent-hover">Methodology</a>
              <Link href="/access" className="text-text-muted hover:text-accent-hover">Request access</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="font-medium text-text">Resources</span>
              <a href="https://docs.btcalpha.com.au" className="text-text-muted hover:text-accent-hover">Documentation</a>
              <ObfuscatedEmail mode="link" label="Contact" fallbackHref="/access" className="text-text-muted hover:text-accent-hover" />
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-text-muted">
          BTC Alpha is operated by ISI Australia Pty Ltd · ABN 27 652 105 345.
          <br />
          © ISI Australia Pty Ltd — BTC Alpha. Factual historical data, not advice.
        </div>
      </div>
    </footer>
  );
}
