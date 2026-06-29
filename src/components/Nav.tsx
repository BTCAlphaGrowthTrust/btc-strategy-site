import Link from "next/link";

const links = [
  { href: "/buy-program", label: "Gaia" },
  { href: "/strategies", label: "Strategies" },
  { href: "https://docs.btcalpha.com.au/docs/methodology/overview", label: "Methodology", external: true },
  { href: "https://docs.btcalpha.com.au", label: "Docs ↗", external: true },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/72 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-accent font-display text-[15px] font-bold text-bg">
            &#945;
          </span>
          <span className="font-display text-[17px] font-semibold tracking-tight text-text">
            BTC Alpha
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              className="text-text-muted transition-colors hover:text-accent-hover"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/access"
            className="rounded-full bg-accent px-4 py-1.5 font-medium text-bg transition-colors hover:bg-accent-hover"
          >
            Request access
          </Link>
        </nav>
      </div>
    </header>
  );
}
