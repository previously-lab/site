/**
 * Playground API contracts — zod schemas validating the model's JSON output,
 * plus the response envelope types shared by the route and the UI.
 */

import { z } from "zod";
import type { PlaygroundKind } from "./presets";

/* ------------------------------------------------------------------ */
/*  Per-kind result shapes                                             */
/* ------------------------------------------------------------------ */

/** What the model returns for a recall preset. */
export const recallResultSchema = z.object({
  answer: z.string(),
  references: z
    .array(
      z.object({
        slice_id: z.string(),
        quote: z.string(),
        note: z.string().optional(),
      }),
    )
    .default([]),
  searched: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});
export type RecallResult = z.infer<typeof recallResultSchema>;

/** The five fitness buckets the kernel scores every turn against. */
export const fitnessBucketSchema = z.enum([
  "card",
  "recall",
  "search",
  "thinkdeep",
  "interaction",
]);
export type FitnessBucket = z.infer<typeof fitnessBucketSchema>;

/**
 * One ledger entry: an ordinal delta (-2..+1) anchored to a verbatim quote
 * of the user's own words from the slices under review (evidence-less deltas
 * are force-zeroed in the real kernel — the prompt enforces the same).
 */
export const fitnessLedgerEntrySchema = z.object({
  bucket: fitnessBucketSchema,
  delta: z.number().int().min(-2).max(1),
  evidence: z.string(),
});
export type FitnessLedgerEntry = z.infer<typeof fitnessLedgerEntrySchema>;

/**
 * The direction document's movements in one merged run: portrait entries
 * added/retired, and hypothesis migrations (confirmed → promoted into the
 * portrait; newly proposed; refuted or stale → retired). Entries are the
 * moved text lines themselves.
 */
export const directionChangesSchema = z.object({
  portraitAdded: z.array(z.string()).default([]),
  portraitRetired: z.array(z.string()).default([]),
  hypothesesPromoted: z.array(z.string()).default([]),
  hypothesesProposed: z.array(z.string()).default([]),
  hypothesesRetired: z.array(z.string()).default([]),
});
export type DirectionChanges = z.infer<typeof directionChangesSchema>;

/**
 * What the model returns for evolution-card — one full evolution-loop pass:
 * the fitness ledger that fired the trigger, the direction document's
 * movements, then the card mutation + playbook note. `cardBefore` is NOT
 * part of the model output — the route attaches the vendored card verbatim
 * so the diff is honest by construction.
 */
export const evolutionModelSchema = z.object({
  triggerReasons: z.array(z.string()).default([]),
  fitnessLedger: z.array(fitnessLedgerEntrySchema).default([]),
  directionVerdict: z.string().default(""),
  directionChanges: directionChangesSchema.default({
    portraitAdded: [],
    portraitRetired: [],
    hypothesesPromoted: [],
    hypothesesProposed: [],
    hypothesesRetired: [],
  }),
  cardAfter: z.string(),
  playbookNote: z.string().default(""),
});
export const evolutionResultSchema = evolutionModelSchema.extend({
  cardBefore: z.string(),
});
export type EvolutionResult = z.infer<typeof evolutionResultSchema>;

/** What the model returns for slice-anatomy; the route attaches frontmatter. */
export const anatomyModelSchema = z.object({
  narrative: z.string(),
  sliceId: z.string(),
});
export const anatomyResultSchema = anatomyModelSchema.extend({
  frontmatter: z.record(z.string(), z.unknown()),
});
export type AnatomyResult = z.infer<typeof anatomyResultSchema>;

export type PlaygroundResult = RecallResult | EvolutionResult | AnatomyResult;

/* ------------------------------------------------------------------ */
/*  Response envelope                                                  */
/* ------------------------------------------------------------------ */

export interface PlaygroundSuccess {
  presetId: string;
  kind: PlaygroundKind;
  result: PlaygroundResult;
  cached: boolean;
}

export interface PlaygroundError {
  error: string;
  code: "bad_request" | "rate_limited" | "unavailable" | "upstream";
}
