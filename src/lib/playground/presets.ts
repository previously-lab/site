/**
 * Playground preset whitelist — shared by the API route (server) and the UI
 * (client). The playground has no free-form input: every request must name
 * one of these preset IDs, and each preset pins its own question, the slices
 * it may deep-read, and the strand tags used to mimic the recall colleague's
 * locate step.
 *
 * Keep `slices` in sync with the SLICES manifest in
 * scripts/sync-playground-data.mjs — the vendored snapshot only contains the
 * union of all preset slices.
 */

export const PLAYGROUND_KINDS = ["recall", "evolution", "anatomy"] as const;
export type PlaygroundKind = (typeof PLAYGROUND_KINDS)[number];

export interface PlaygroundPreset {
  id: string;
  kind: PlaygroundKind;
  /** Canonical question sent to the model (the dataset is English). */
  questionEn: string;
  /** Slice paths ("YYYY/MM/DD/HHMM") included in the prompt as full text. */
  slices: readonly string[];
  /** Strand tags whose index entries are included in recall prompts. */
  strandKeys: readonly string[];
}

export const PLAYGROUND_PRESETS = [
  {
    id: "recall-worldcup",
    kind: "recall",
    questionEn:
      "What was I doing around the 2026 World Cup final? Who was I with, and what do I remember about it?",
    slices: ["2026/06/19/2027", "2026/06/27/1813", "2026/07/24/1021"],
    strandKeys: ["world cup", "senegal", "watch party", "underdog", "sports"],
  },
  {
    id: "recall-mom",
    kind: "recall",
    questionEn:
      "What happened with my mom's health in 2025? When did I find out, and how did it change me?",
    slices: ["2025/07/30/1755", "2025/08/23/1431"],
    strandKeys: ["mother", "health", "family", "family health", "self-care"],
  },
  {
    id: "recall-marathon",
    kind: "recall",
    questionEn:
      "Tell me about the day I finished my first half-marathon. What happened before and after?",
    slices: ["2026/07/11/1108", "2026/07/16/1913", "2026/07/20/1102"],
    strandKeys: [
      "half-marathon",
      "half marathon",
      "race preparation",
      "trust the process",
      "marathon",
      "proud",
    ],
  },
  {
    id: "evolution-card",
    kind: "evolution",
    questionEn:
      "Run one card-evolution pass over my latest slices — what would change, and why?",
    slices: ["2026/08/11/2054", "2026/08/17/1721"],
    strandKeys: [],
  },
  {
    id: "slice-anatomy",
    kind: "anatomy",
    questionEn:
      "Explain how this slice gets remembered — where does each part of it come from?",
    slices: ["2026/07/16/1913"],
    strandKeys: [],
  },
] as const satisfies readonly PlaygroundPreset[];

export type PresetId = (typeof PLAYGROUND_PRESETS)[number]["id"];

export const PRESET_IDS: readonly string[] = PLAYGROUND_PRESETS.map((p) => p.id);

export function isPresetId(id: string): id is PresetId {
  return PRESET_IDS.includes(id);
}

export function getPreset(id: string): PlaygroundPreset | undefined {
  return PLAYGROUND_PRESETS.find((p) => p.id === id);
}
