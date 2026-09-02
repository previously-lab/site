/**
 * Playground data access. Server-only: the API route imports this; client
 * components receive results over HTTP.
 *
 * The playground reads the LIVE `you` dataset — the GitHub repo IS the demo
 * user's memory, and the playground accesses it exactly the way the real
 * kernel would. Fetches hit raw.githubusercontent.com and are cached
 * in-memory for REMOTE_TTL_MS; the vendored snapshot.json (pnpm
 * playground:sync) is only a fallback for when GitHub is unreachable.
 */

import "server-only";
import { createHash } from "node:crypto";
import vendored from "./data/snapshot.json";
import { PLAYGROUND_PRESETS } from "./presets";

export interface PlaygroundSnapshot {
  generatedAt: string;
  source: string;
  timeline: string;
  strands: Record<string, string[]>;
  currentCard: string;
  direction: string | null;
  slices: Record<string, { core: string; previously: string }>;
  /** Content hash — response caches key on this, so a dataset update
   *  automatically invalidates cached preset answers. */
  version: string;
}

const REMOTE_BASE =
  "https://raw.githubusercontent.com/previously-lab/you/main/user";
const REMOTE_TTL_MS = 5 * 60_000;
/** After a failed remote fetch, wait this long before hammering GitHub again. */
const FALLBACK_RETRY_MS = 60_000;

const CORE_FILES = {
  timeline: "episodic/timeline.md",
  strands: "episodic/strands.json",
  currentCard: "episodic/current-previously.md",
  direction: "evolution/direction.md",
} as const;

/** Union of every preset's deep-read slices — presets.ts is the single
 *  source of truth (the vendored-snapshot sync script mirrors it). */
function slicePaths(): string[] {
  const set = new Set<string>();
  for (const p of PLAYGROUND_PRESETS) for (const s of p.slices) set.add(s);
  return [...set];
}

async function fetchText(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${REMOTE_BASE}/${path}`, {
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

function hashOf(contents: string[]): string {
  const h = createHash("sha256");
  for (const c of contents) h.update(c);
  return h.digest("hex").slice(0, 12);
}

/** Fetch the whole snapshot from the live repo. Returns null if any core
 *  file is unavailable (direction is optional). */
async function fetchRemoteSnapshot(): Promise<PlaygroundSnapshot | null> {
  const paths = slicePaths();
  const [timeline, strandsRaw, currentCard, direction, ...sliceFiles] =
    await Promise.all([
      fetchText(CORE_FILES.timeline),
      fetchText(CORE_FILES.strands),
      fetchText(CORE_FILES.currentCard),
      fetchText(CORE_FILES.direction),
      ...paths.flatMap((p) => [
        fetchText(`episodic/slices/${p}/timeline/core.md`),
        fetchText(`episodic/slices/${p}/previously.md`),
      ]),
    ]);

  if (!timeline || !strandsRaw || !currentCard) return null;
  let strands: Record<string, string[]>;
  try {
    strands = JSON.parse(strandsRaw);
  } catch {
    return null;
  }

  const slices: PlaygroundSnapshot["slices"] = {};
  for (let i = 0; i < paths.length; i++) {
    const core = sliceFiles[i * 2];
    const previously = sliceFiles[i * 2 + 1];
    if (!core) return null; // a preset slice missing = broken demo, fall back
    slices[paths[i]] = { core, previously: previously ?? "" };
  }

  return {
    generatedAt: new Date().toISOString(),
    source: `github:${REMOTE_BASE}`,
    timeline,
    strands,
    currentCard,
    direction,
    slices,
    version: hashOf([timeline, strandsRaw, currentCard, ...sliceFiles.map((f) => f ?? "")]),
  };
}

const vendoredSnapshot: PlaygroundSnapshot = {
  ...(vendored as Omit<PlaygroundSnapshot, "version">),
  version: hashOf([JSON.stringify(vendored)]),
};

let cache: { at: number; snapshot: PlaygroundSnapshot } | null = null;

/** Remote-first snapshot access, cached. Falls back to the vendored snapshot
 *  when GitHub is unreachable, and retries the remote after a short backoff. */
export async function getSnapshot(): Promise<PlaygroundSnapshot> {
  const now = Date.now();
  if (cache) {
    const ttl =
      cache.snapshot === vendoredSnapshot ? FALLBACK_RETRY_MS : REMOTE_TTL_MS;
    if (now - cache.at < ttl) return cache.snapshot;
  }
  const remote = await fetchRemoteSnapshot();
  if (remote) {
    cache = { at: now, snapshot: remote };
  } else {
    if (!cache || cache.snapshot !== vendoredSnapshot) {
      console.warn("[playground] live dataset unreachable, using vendored fallback");
    }
    cache = { at: now, snapshot: vendoredSnapshot };
  }
  return cache.snapshot;
}
