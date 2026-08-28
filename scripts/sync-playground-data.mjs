#!/usr/bin/env node
/**
 * Sync playground demo data from the `you` dataset into a vendored snapshot.
 *
 * Source priority:
 *   1. Local sibling repo  ../you/user            (fast, works offline)
 *   2. GitHub raw          previously-lab/you     (CI / fresh clones)
 *
 * Output: src/lib/playground/data/snapshot.json — a compact JSON snapshot the
 * API route imports at build time. The build never touches the network.
 *
 * Usage: pnpm playground:sync
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCAL_BASE = path.resolve(ROOT, "..", "you", "user");
const REMOTE_BASE =
  "https://raw.githubusercontent.com/previously-lab/you/main/user";
const OUT_DIR = path.join(ROOT, "src", "lib", "playground", "data");
const OUT_FILE = path.join(OUT_DIR, "snapshot.json");

/**
 * Slice manifest — the slices the playground presets deep-read, picked by hand
 * from timeline.md. Keep in sync with src/lib/playground/presets.ts.
 */
const SLICES = [
  // recall-worldcup — World Cup watch parties + the post-final reflection
  "2026/06/19/2027",
  "2026/06/27/1813",
  "2026/07/24/1021",
  // recall-mom — the health scare and the recovery check-in
  "2025/07/30/1755",
  "2025/08/23/1431",
  // recall-marathon — pre-race nerves, race day, post-race reflection
  "2026/07/11/1108",
  "2026/07/16/1913",
  "2026/07/20/1102",
  // evolution-card — the latest slices the card evolution pass runs on
  "2026/08/02/1443",
  "2026/08/11/2054",
  "2026/08/17/1721",
  // slice-anatomy reuses 2026/07/16/1913 (already above)
];

/** Optional files — the evolution layer may not exist yet in the dataset. */
const OPTIONAL_PATHS = ["evolution/direction.md", "evolution/mutations.md"];

async function existsLocal(rel) {
  try {
    await readFile(path.join(LOCAL_BASE, rel));
    return true;
  } catch {
    return false;
  }
}

const useLocal = await existsLocal("episodic/timeline.md");
const sourceLabel = useLocal ? `local ${LOCAL_BASE}` : REMOTE_BASE;
console.log(`[playground:sync] source: ${sourceLabel}`);

async function readText(rel, { optional = false } = {}) {
  if (useLocal) {
    try {
      return await readFile(path.join(LOCAL_BASE, rel), "utf8");
    } catch (err) {
      if (optional) return null;
      throw new Error(`missing local file: ${rel}`, { cause: err });
    }
  }
  const res = await fetch(`${REMOTE_BASE}/${rel}`);
  if (!res.ok) {
    if (optional && res.status === 404) return null;
    throw new Error(`fetch failed ${res.status}: ${REMOTE_BASE}/${rel}`);
  }
  return res.text();
}

const [timeline, strandsRaw, currentCard] = await Promise.all([
  readText("episodic/timeline.md"),
  readText("episodic/strands.json"),
  readText("episodic/current-previously.md"),
]);

const optional = {};
for (const rel of OPTIONAL_PATHS) {
  const text = await readText(rel, { optional: true });
  if (text === null) {
    console.warn(`[playground:sync] optional file missing, skipped: ${rel}`);
  }
  optional[path.basename(rel, ".md")] = text;
}

const slices = {};
for (const slicePath of SLICES) {
  const [core, previously] = await Promise.all([
    readText(`episodic/slices/${slicePath}/timeline/core.md`),
    readText(`episodic/slices/${slicePath}/previously.md`),
  ]);
  slices[slicePath] = { core, previously };
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: useLocal ? "local" : "github",
  timeline,
  strands: JSON.parse(strandsRaw),
  currentCard,
  direction: optional.direction ?? null,
  mutations: optional.mutations ?? null,
  slices,
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, JSON.stringify(snapshot, null, 2) + "\n", "utf8");

const kb = (Buffer.byteLength(JSON.stringify(snapshot)) / 1024).toFixed(1);
console.log(
  `[playground:sync] wrote ${path.relative(ROOT, OUT_FILE)} (${kb} KB, ${SLICES.length} slices)`,
);
