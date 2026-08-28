#!/usr/bin/env node
/**
 * Smoke tests for the playground's pure logic modules (no network, no DeepSeek).
 * Run: node scripts/test-playground-modules.mjs
 *
 * Covers the dependency-free modules directly; prompts.ts is type-checked by
 * tsc and exercised end-to-end during the manual API integration pass.
 */

import assert from "node:assert/strict";
import {
  PLAYGROUND_PRESETS,
  PRESET_IDS,
  getPreset,
  isPresetId,
} from "../src/lib/playground/presets.ts";
import { SlidingWindowRateLimiter } from "../src/lib/playground/rate-limit.ts";
import { filterStrands, sliceIdOf } from "../src/lib/playground/slice-utils.ts";
import { readFile } from "node:fs/promises";

/* ---- presets ---- */
assert.equal(PLAYGROUND_PRESETS.length, 5, "expected 5 presets");
assert.ok(isPresetId("recall-worldcup"));
assert.ok(isPresetId("evolution-card"));
assert.ok(!isPresetId("evil-custom-prompt"));
assert.equal(getPreset("recall-mom")?.kind, "recall");
assert.equal(getPreset("nope"), undefined);
assert.deepEqual(PRESET_IDS, [
  "recall-worldcup",
  "recall-mom",
  "recall-marathon",
  "evolution-card",
  "slice-anatomy",
]);

/* ---- every preset slice must exist in the vendored snapshot ---- */
const snapshot = JSON.parse(
  await readFile(
    new URL("../src/lib/playground/data/snapshot.json", import.meta.url),
    "utf8",
  ),
);
for (const preset of PLAYGROUND_PRESETS) {
  for (const slicePath of preset.slices) {
    assert.ok(
      snapshot.slices[slicePath],
      `snapshot missing slice ${slicePath} for preset ${preset.id}`,
    );
  }
}

/* ---- slice-utils ---- */
assert.equal(sliceIdOf("2026/07/16/1913"), "20260716-1913");
const filtered = filterStrands(snapshot.strands, ["world cup", "senegal"]);
assert.deepEqual(Object.keys(filtered).sort(), ["senegal", "world cup"]);
assert.deepEqual(filtered["world cup"], ["2026/06/19/2027", "2026/06/27/1813"]);
assert.deepEqual(filterStrands(snapshot.strands, ["no-such-tag"]), {});

/* ---- rate limiter: sliding window ---- */
const limiter = new SlidingWindowRateLimiter(3, 60_000);
let t0 = 1_000_000;
assert.equal(limiter.check("ip1", t0).allowed, true);
assert.equal(limiter.check("ip1", t0 + 1000).allowed, true);
assert.equal(limiter.check("ip1", t0 + 2000).allowed, true);
const blocked = limiter.check("ip1", t0 + 3000);
assert.equal(blocked.allowed, false, "4th request in window must be blocked");
assert.ok(blocked.retryAfterMs > 0 && blocked.retryAfterMs <= 60_000);
assert.equal(
  limiter.check("ip2", t0 + 3000).allowed,
  true,
  "other keys are independent",
);
/* window slides: after the oldest entry expires, requests are allowed again */
assert.equal(limiter.check("ip1", t0 + 61_000).allowed, true);

console.log("playground module tests: all passed");
