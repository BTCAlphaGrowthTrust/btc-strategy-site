import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getLanding } from "@/lib/api";

export const metadata: Metadata = {
  title: "BTC Alpha — Low-correlation BTC signals, verify before you pay",
  description:
    "Live, systematic BTC-PERPETUAL trade signals — a low-correlation return stream on a ~8-year backtested record you verify free, no key. Non-custodial: you trade your own book.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Verification bar — driven by the SAME live verification_state count as the proof section, so the
  // chrome can never drift from the body. Falls back to a count-free phrasing if the data service is
  // briefly unreachable (the bar must never break the whole layout).
  let barText =
    "Backtested / modelled · most strategies dual-verified · independent forward verification underway";
  try {
    const { strategies } = await getLanding();
    const dv = strategies.filter((s) => (s as any).verification_state === "dual_verified").length;
    barText = `Backtested / modelled · ${dv} of ${strategies.length} dual-verified · independent forward verification underway`;
  } catch {}
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-bg text-text">
        <div className="border-b border-accent/20 bg-accent/[0.06]">
          <p className="mx-auto max-w-6xl px-6 py-1.5 text-center font-mono text-[11px] tracking-wide text-accent/90">
            {barText}
          </p>
        </div>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
