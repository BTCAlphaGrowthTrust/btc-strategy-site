"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-32 text-center">
      <div className="font-mono text-xs uppercase tracking-wider text-accent">Data unavailable</div>
      <h1 className="mt-3 text-2xl font-semibold">Couldn’t reach the live data right now.</h1>
      <p className="mt-3 max-w-md text-text-muted">
        The strategy data service didn’t respond. This is usually momentary.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-full border border-border px-5 py-2.5 font-medium transition-colors hover:border-accent hover:text-accent"
      >
        Retry
      </button>
    </div>
  );
}
