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
/*  evolution-card — one full evolution-loop pass, nothing persisted   */
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
    ? `## direction.md (Portrait + Hypotheses — the learned user model)\n\n${snapshot.direction}`
    : "## direction.md\n\n(not yet authored in this dataset — treat the direction as missing: propose portrait entries and hypotheses from scratch, and say so in directionVerdict)";

  const system = `You are the evolution loop of "Previously", an agent that evolves its own memory of the user. Every turn, a deterministic fitness scorer accumulates evidence-anchored deltas against five buckets — card, recall, search, thinkdeep, interaction (ordinal scores -2..+1, where -2 is an explicit user complaint). When any bucket's net score for the current generation reaches -5, evolution MUST run. A fired run is one merged pass: first the direction document (the learned user model) is re-evaluated, then the user card and the triggered bucket's playbook evolve under the possibly-new direction. This is a READ-ONLY demonstration: you compute what WOULD change, but nothing is persisted and refreshing resets everything.

The direction document has two fixed sections:
- PORTRAIT: a descriptive user portrait in six dimensions (Traits & cognitive style / Triggers & rhythms / Patterns & loops / Strengths & resilience / Communication preferences / Values & boundaries). An entry is portrait-grade only when it holds across contexts, outlives the event that evidenced it, and predicts — never imperatives.
- HYPOTHESES: a bounded pool of falsifiable trait-level guesses, each "- [proposed <slice>] <guess> — falsify if: <condition>". Confirmed hypotheses are PROMOTED into the portrait; refuted ones are REMOVED; ones still unverified long after proposal are RETIRED; the pool is refilled with new proposals.

Your discipline, in order:
1. FITNESS LEDGER: score the newest slices against the five buckets. Every entry MUST carry "evidence" — a VERBATIM quote of the user's own words from the slices below. An entry without evidence is invalid. Construct a realistic ledger: these slices contain a genuine failure pattern, so let at least one bucket's net reach -5 or below (that is what fires this run), while buckets with no evidence simply get no entries.
2. TRIGGERS: in "triggerReasons", state the deterministic verdict — which bucket(s) hit net ≤ -5 and from what evidence.
3. DIRECTION: evaluate direction.md FIRST. Move hypotheses (promote / propose / retire) and add or retire portrait entries strictly as the ledger evidence justifies. Record every movement in "directionChanges" as the moved text lines, and narrate the verdict in one short "directionVerdict" paragraph ("no change" is a valid verdict).
4. EVOLVE: rewrite the user card under the (possibly new) direction. Preserve its exact section structure and heading style. Change only what the evidence justifies; keep it compact.
5. PLAYBOOK: one short note on what the TRIGGERED bucket's playbook should learn from these slices.

${JSON_ONLY}
Output shape:
{
  "triggerReasons": string[],
  "fitnessLedger": [{ "bucket": "card" | "recall" | "search" | "thinkdeep" | "interaction", "delta": number, "evidence": string }],
  "directionVerdict": string,   // one short paragraph
  "directionChanges": {
    "portraitAdded": string[],
    "portraitRetired": string[],
    "hypothesesPromoted": string[],
    "hypothesesProposed": string[],
    "hypothesesRetired": string[]
  },
  "cardAfter": string,          // the FULL rewritten card, markdown
  "playbookNote": string        // one short paragraph
}

${languageInstruction(locale)} Keep the card's markdown headings exactly as they are in the current card (they are part Chinese, part English — do not translate them), and keep "evidence" quotes verbatim in the slice's original language.`;

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
