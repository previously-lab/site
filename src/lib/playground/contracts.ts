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

/**
 * What the model returns for evolution-card. `cardBefore` is NOT part of the
 * model output — the route attaches the vendored card verbatim so the diff is
 * honest by construction.
 */
export const evolutionModelSchema = z.object({
  triggerReasons: z.array(z.string()).default([]),
  directionVerdict: z.string(),
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
