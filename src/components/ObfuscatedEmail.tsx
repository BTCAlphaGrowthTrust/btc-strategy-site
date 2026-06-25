"use client";

import { useEffect, useState } from "react";
import { decodeEmail } from "@/lib/contact";

// Renders the contact address assembled in the browser after mount, so the raw SSR HTML
// never contains the plain-text address. Humans (JS on) see it immediately.
// - mode="link": a mailto link (label defaults to the address). Pre-JS falls back to
//   `fallbackHref` (e.g. the /access form) so it's still functional with no plain-text leak.
// - mode="text": the address as one-click-selectable plain text.
type Props = {
  mode?: "link" | "text";
  label?: string;
  className?: string;
  fallbackHref?: string;
  placeholder?: string;
};

export default function ObfuscatedEmail({
  mode = "link",
  label,
  className = "",
  fallbackHref,
  placeholder = "email us",
}: Props) {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    setEmail(decodeEmail());
  }, []);

  if (mode === "text") {
    return (
      <span className={`select-all ${className}`} suppressHydrationWarning>
        {email ?? placeholder}
      </span>
    );
  }

  if (!email) {
    return fallbackHref ? (
      <a href={fallbackHref} className={className} suppressHydrationWarning>
        {label ?? placeholder}
      </a>
    ) : (
      <span className={className} suppressHydrationWarning>
        {label ?? placeholder}
      </span>
    );
  }

  return (
    <a href={`mailto:${email}`} className={className} suppressHydrationWarning>
      {label ?? email}
    </a>
  );
}
