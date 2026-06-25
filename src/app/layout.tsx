import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "BTC Alpha — Strategy Data",
  description:
    "Backtested, modelled historical performance data for a curated set of BTC trading strategies — built for professional & institutional use.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-bg text-text">
        <div className="border-b border-accent/20 bg-accent/[0.06]">
          <p className="mx-auto max-w-6xl px-6 py-1.5 text-center font-mono text-[11px] tracking-wide text-accent/90">
            Provisional figures — pending TradingView cross-check. Not final for public.
          </p>
        </div>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
