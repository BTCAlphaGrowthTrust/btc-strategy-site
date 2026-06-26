"use client";

import { useState } from "react";

// Web3Forms PUBLIC access key — safe in client code (delivers the lead to the inbox configured
// in the Web3Forms dashboard). It is not a secret.
const ACCESS_KEY = "3fd6281d-f4e2-4017-b966-692f8af5731a";
const TIER_OPTIONS = ["Single", "Bundle", "Full catalogue"];
const tierFromParam = (p?: string) =>
  p === "single" ? "Single" : p === "bundle" ? "Bundle" : p === "full" ? "Full catalogue" : "";

type Status = "idle" | "submitting" | "success" | "error";

export default function AccessForm({ initialTier, context }: { initialTier?: string; context?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [tier, setTier] = useState(tierFromParam(initialTier));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      access_key: ACCESS_KEY,
      subject: `BTC Alpha — access request${tier ? ` (${tier})` : ""}${context ? ` · ${context}` : ""}`,
      from_name: "BTC Alpha — Request access",
      name: fd.get("name"),
      email: fd.get("email"),
      replyto: fd.get("email"),
      company: fd.get("company") || "—",
      tier_interest: tier || "—",
      context: context || "—",
      message: fd.get("message"),
      botcheck: fd.get("botcheck") ? true : false,
    };
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) setStatus("success");
      else {
        setStatus("error");
        setError(data.message || "Something went wrong. Please try again, or use the email link below.");
      }
    } catch {
      setStatus("error");
      setError("Network error. Please try again, or use the email link below.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-pos/40 bg-pos/[0.06] p-8 text-center">
        <div className="font-display text-2xl font-semibold text-pos">Thanks — we&apos;ll be in touch.</div>
        <p className="mx-auto mt-3 max-w-md text-text-muted">
          Your request has been sent and will reach us by email. Expect a reply shortly — for
          anything urgent, use the email link below.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/45 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/40";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Web3Forms honeypot — hidden from humans, catches bots */}
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {context && (
        <div className="rounded-lg border border-accent/30 bg-accent/[0.06] px-4 py-2.5 font-mono text-[12px] text-accent">
          Enquiring about: <span className="font-semibold">{context}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" required>
          <input name="name" required autoComplete="name" placeholder="Jane Doe" className={inputCls} />
        </Field>
        <Field label="Work email" required>
          <input name="email" type="email" required autoComplete="email" placeholder="jane@desk.com" className={inputCls} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Company or desk" hint="optional">
          <input name="company" autoComplete="organization" placeholder="Acme Capital" className={inputCls} />
        </Field>
        <Field label="Live signals — scope">
          <select value={tier} onChange={(e) => setTier(e.target.value)} className={`${inputCls} appearance-none`}>
            <option value="">Select…</option>
            {TIER_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Message" required>
        <textarea
          name="message"
          required
          rows={4}
          defaultValue={context ? `I'm interested in ${context}. ` : ""}
          placeholder="Tell us a little about your desk and what you're looking for."
          className={`${inputCls} resize-y`}
        />
      </Field>

      {status === "error" && (
        <p className="rounded-lg border border-neg/40 bg-neg/[0.06] px-4 py-2.5 text-sm text-neg">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-accent px-6 py-3 font-medium text-bg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Sending…" : "Request access"}
      </button>
    </form>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{label}</span>
        {required && <span className="text-accent">*</span>}
        {hint && <span className="font-mono text-[10px] text-text-muted/50">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
