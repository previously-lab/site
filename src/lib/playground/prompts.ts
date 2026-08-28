/**
 * Prompt builders for the playground presets. Pure functions — they take the
 * vendored snapshot and a preset and return chat messages, so they can be
 * unit-tested without touching the network or DeepSeek.
 */

import type { PlaygroundPreset } from "./presets";
import type { PlaygroundSnapshot } from "./snapshot";
import { filterStrands, sliceIdOf } from "./slice-utils";

export interface ChatPrompt {
  system: string;
  user: string;
}

const JSON_ONLY =
  "Respond with a single JSON object only — no markdown fences, no commentary.";

function languageInstruction(locale: string): string {
  return locale === "zh"
    ? "Write all free-text fields (answer / reasons / narrative) in Simplified Chinese. Keep slice ids, quotes, and technical identifiers verbatim."
    : "Write all free-text fields in English.";
}

function sliceBlock(snapshot: PlaygroundSnapshot, slicePath: string): string {
  const slice = snapshot.slices[slicePath];
  if (!slice) {
    throw new Error(
      `slice ${slicePath} missing from playground snapshot — re-run pnpm playground:sync`,
    );
  }
  return `### Slice ${sliceIdOf(slicePath)} (${slicePath})\n\n${slice.core}`;
}

/* ------------------------------------------------------------------ */
/*  recall-* — the episodic-recall colleague's discipline, replayed    */
/* ------------------------------------------------------------------ */

function buildRecallPrompt(
  preset: PlaygroundPreset,
  snapshot: PlaygroundSnapshot,
  locale: string,
): ChatPrompt {
  const strands = filterStrands(snapshot.strands, preset.strandKeys);
  const sliceText = preset.slices
    .map((p) => sliceBlock(snapshot, p))
    .join("\n\n---\n\n");

  const system = `You are the episodic-recall colleague of "Previously", an agent whose memory is a timeline of closed conversation slices. A colleague agent asks you a natural-language question about the user's life; you answer ONLY from the memory data provided.

Your discipline:
1. LOCATE first: scan the timeline index and the strand-tag index below to decide which slices could hold the answer.
2. DEEP-READ: the full text of the most relevant slices is provided. Ground every situational claim in them.
3. EVIDENCE: every claim in your answer must be anchored by an entry in "references" with the slice id and a VERBATIM quote from that slice.
4. HONESTY: "there is no such memory" is a valid answer — never invent events, dates, or people that are not in the data.
5. TRAIL: record what you walked through in "searched" (timeline sections scanned, strand tags followed, slices read).

${JSON_ONLY}
Output shape:
{
  "answer": string,                    // natural-language answer to the question
  "references": [{ "slice_id": string, "quote": string, "note"?: string }],
  "searched": string[],                // the locate trail, e.g. "timeline 2026-06..2026-08", "strand: world cup"
  "confidence": number                 // 0..1
}

${languageInstruction(locale)}`;

  const user = `QUESTION: ${preset.questionEn}

## Timeline index (full)

${snapshot.timeline}

## Strand index (relevant tags)

${JSON.stringify(strands, null, 2)}

## Slice full texts

${sliceText}`;

  return { system, user };
}

/* ------------------------------------------------------------------ */
/*  evolution-card — one card-evolution pass, nothing persisted        */
/* ------------------------------------------------------------------ */

function buildEvolutionPrompt(
  preset: PlaygroundPreset,
  snapshot: PlaygroundSnapshot,
  locale: string,
): ChatPrompt {
  const sliceText = preset.slices
    .map((p) => sliceBlock(snapshot, p))
    .join("\n\n---\n\n");
  const directionBlock = snapshot.direction
    ? `## direction.md (the evolution constitution)\n\n${snapshot.direction}`
    : "## direction.md\n\n(not yet authored in this dataset — evaluate against the implicit direction you can infer, and say so in directionVerdict)";

  const system = `You are the Previously Agent's card-evolution pass. At slice boundaries you review the newest slices against the current user card and the direction constitution, and decide how the card should evolve. This is a READ-ONLY demonstration: you compute what WOULD change, but nothing is persisted and refreshing resets everything.

Your discipline:
1. TRIGGERS: explain what in the new slices justifies an evolution run (new facts, closed loops, shifts in patterns) — or that nothing does.
2. DIRECTION: judge whether the direction constitution itself needs a proposal ("no change" is the common case).
3. EVOLVE: rewrite the user card. Preserve its exact section structure and heading style. Change only what the evidence justifies; keep it compact.
4. PLAYBOOK: one short note on what a recall/answer playbook should learn from these slices.

${JSON_ONLY}
Output shape:
{
  "triggerReasons": string[],   // why this run fired
  "directionVerdict": string,   // one short paragraph
  "cardAfter": string,          // the FULL rewritten card, markdown
  "playbookNote": string        // one short paragraph
}

${languageInstruction(locale)} Keep the card's markdown headings exactly as they are in the current card (they are part Chinese, part English — do not translate them).`;

  const user = `## Current user card (current-previously.md)

${snapshot.currentCard}

${directionBlock}

## Newest slices under review

${sliceText}`;

  return { system, user };
}

/* ------------------------------------------------------------------ */
/*  slice-anatomy — how a slice gets remembered                        */
/* ------------------------------------------------------------------ */

function buildAnatomyPrompt(
  preset: PlaygroundPreset,
  snapshot: PlaygroundSnapshot,
  locale: string,
): ChatPrompt {
  const slicePath = preset.slices[0];
  const core = sliceBlock(snapshot, slicePath);

  const system = `You are a guide inside "Previously", an agent whose memory is a timeline of conversation slices. Given one slice's stored file, explain to a curious reader HOW this slice gets remembered — where each part of it comes from. Be concrete and mechanical, not lyrical:

- "slice_id" / "start" / "end" / "timezone": derived from the slicing rule — a slice force-closes a fixed number of minutes after it starts; the id is the start timestamp.
- "focus", "summary", "emotional_tone", "tags", "open_loops": written by the agent when the slice closes, distilled from the turns below.
- "status": closed means the slice is sealed and becomes read-only memory.
- The "## Turn N" body: the raw conversation this memory was distilled from.

Quote the slice's actual values when explaining each field. ${JSON_ONLY}
Output shape:
{
  "narrative": string,   // the explanation, markdown, a few short paragraphs
  "sliceId": string      // the slice id, e.g. "20260716-1913"
}

${languageInstruction(locale)}`;

  const user = `## The slice file (timeline/core.md of ${slicePath})

${core}`;

  return { system, user };
}

/* ------------------------------------------------------------------ */

export function buildPrompt(
  preset: PlaygroundPreset,
  snapshot: PlaygroundSnapshot,
  locale: string,
): ChatPrompt {
  switch (preset.kind) {
    case "recall":
      return buildRecallPrompt(preset, snapshot, locale);
    case "evolution":
      return buildEvolutionPrompt(preset, snapshot, locale);
    case "anatomy":
      return buildAnatomyPrompt(preset, snapshot, locale);
  }
}
