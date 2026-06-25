// PUBLIC LEAK GUARD for the site. Fails if any real strategy id / real label / mechanism word
// appears in the source (src/) or the built output (.next/server/app). Public surface must be
// aliases only. Run: node scripts/leak-guard.mjs   (after `next build`).
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const FORBIDDEN = [
  /atg[_:]\w+/i,
  /\b\d+h_ema\b/i, /\bgx_\w+/i, /\brss_\w+/i, /\bosc_\w+/i, /\bema_\w+/i, /\bsmma\b/i,
  /\bEMA\b/, /\bRSS\b/, /\bGX\b/, /\bOSC\b/, /\bSMMA\b/,
  /golden[ -]?cross/i, /ribbon/i, /\bsqueeze\b/i, /stochastic/i, /oscillator/i,
  /\bSAR\b/, /parabolic/i, /50\/20\/200/, /slow[- ]?rising/i, /tier-?3/i,
];
const SCAN = [
  { dir: "src", exts: [".ts", ".tsx", ".css", ".mjs"] },
  { dir: ".next/server/app", exts: [".html", ".rsc", ".json", ".js", ".body"] },
];

function* walk(dir, exts) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p, exts);
    else if (exts.some((x) => p.endsWith(x))) yield p;
  }
}

const hits = [];
for (const { dir, exts } of SCAN) {
  for (const f of walk(dir, exts)) {
    const text = readFileSync(f, "utf-8");
    for (const rx of FORBIDDEN) {
      const m = text.match(rx);
      if (m) hits.push(`${f}: ${m[0]}`);
    }
  }
}

if (hits.length) {
  console.error(`LEAK GUARD FAILED — ${hits.length} hit(s):`);
  for (const h of [...new Set(hits)].slice(0, 40)) console.error("  " + h);
  process.exit(1);
}
console.log("LEAK GUARD PASSED — no real id / mechanism word in src/ or built output.");
