/**
 * Ported from previously-lab/agent src/lib/episodic/flash/recall.ts @ 0601d19
 * (playground port).
 *
 * The episodic-recall colleague, ported onto the docs site's playground
 * dataset: the same RECALL_ROLE system prompt (on the shared sub-agent base
 * ported from src/lib/agents/prompts.ts), the same six read tools + the
 * recallReport report tool, the same prepareStep last-step report guarantee,
 * the same MAX_SLICE_READS quota and hallucinated-id filtering, and the same
 * timeout partial-answer semantics (write-as-you-go, confidence 0.2).
 *
 * Data-source differences from the kernel (documented adaptations):
 * - All reads come from the in-memory playground snapshot (getSnapshot()) —
 *   no filesystem, no GitHub, no index.json. readGlobalTimeline therefore
 *   always takes the markdown pagination path (paginateTimelineMarkdown).
 * - The dataset's slice ids are COMPACT ("20260716-1913"), not the kernel's
 *   dashed "YYYY-MM-DD-HHMM" — resolveSlicePath accepts the compact id, the
 *   dashed id (via parseSliceId), and a raw slice path, since strands list
 *   paths. Tool descriptions point at the compact format the model actually
 *   sees in the timeline.
 * - Only the 11 preset slices are deep-readable; readSlice/readSliceSummary on
 *   any other slice return the kernel's "This time slice does not exist" ERROR
 *   string (honest degradation).
 * - No currentSliceId / playbook / owner/repo concepts — the user prompt drops
 *   the ongoing-slice paragraph and adds the demo locale's language instead.
 * - RECALL_TIMEOUT_MS is 120s here (kernel: 240s) — the playground is a
 *   visitor-facing demo.
 *
 * Thinking: ON with effort "low" (the kernel default), via the DeepSeek
 * providerOptions shape ported from src/lib/models/effort-injector.ts. The
 * kernel's documented DeepSeek quirk applies — thinking mode rejects a
 * FORCED tool_choice with a 400 (which the prepareStep last-step report
 * guarantee would trigger) — so a failed thinking run retries once with
 * thinking OFF, mirroring the kernel runner's downgrade.
 */

import { tool } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";
import matter from "gray-matter";
import type { PlaygroundSnapshot } from "../snapshot";
import type { RecallResult } from "../contracts";
import {
  parseSliceId,
  parseTurns,
  applyRange,
  reassembleSlice,
} from "./turn-parser";
import {
  splitTurns,
  segmentSearch,
  textLines,
  searchResultToString,
} from "./doc-segments";
import { runAgent } from "./runner";

// ─── Shared sub-agent base ─────────────────────────────────────────────
// Ported verbatim from previously-lab/agent src/lib/agents/prompts.ts @ 0601d19

const SHARED_SUBAGENT_BASE = `You are a sub-agent of the Previously memory system — a personal AI that organizes conversations into time slices.

Relationship:
- Your caller is the MAIN AGENT — your colleague, not your superior and not the user. You both serve the same user, each from your own role.
- The user is always a THIRD PARTY: refer to them in third person ("the user", "they"), never role-play as the user, never address the caller as if it were the user, and never mimic the user's voice.

Time and slices:
- A slice id like 2026-08-11-0930 encodes the slice's START as a user-local wall clock (YYYY-MM-DD-HHMM, 24h). A slice covers a bounded window of conversation.
- Treat timestamps and dates in the task material as authoritative; never infer dates from your own knowledge.

Discipline:
- You run once, with a bounded step budget and a hard deadline. Do exactly the task in the user message — no exploration beyond the tools you are given, and never repeat a call that was already rejected.
- Report through the designated report tool, following its input schema exactly. Keep every field short — this is metadata, not prose.
- Write your analysis in English; quote user-facing material verbatim in its original language.`;

function buildSubAgentSystem(roleInstructions: string): string {
  return `${SHARED_SUBAGENT_BASE}\n\n${roleInstructions}`;
}

// ─── Slice id ↔ path resolution ────────────────────────────────────────
//
// Dataset deviation: the playground's timeline uses COMPACT ids
// ("20260716-1913"); the kernel's parseSliceId expects dashed
// "YYYY-MM-DD-HHMM". Accept both, plus raw slice paths ("2026/07/16/1913"),
// because readStrand returns paths.

/** Resolve a model-supplied slice reference to a snapshot slice path. */
function resolveSlicePath(ref: string): string | null {
  const compact = ref.match(/^(\d{4})(\d{2})(\d{2})-(\d{4})$/);
  if (compact) {
    const [, y, m, d, hm] = compact;
    return `${y}/${m}/${d}/${hm}`;
  }
  const dashed = parseSliceId(ref);
  if (dashed) return `${dashed.y}/${dashed.m}/${dashed.d}/${dashed.hm}`;
  if (/^\d{4}\/\d{2}\/\d{2}\/\d{4}$/.test(ref)) return ref;
  return null;
}

// ─── Global timeline (markdown pagination path only) ───────────────────

/** How many pointer lines readGlobalTimeline returns (kernel value). */
const TIMELINE_PAGE_SIZE = 40;

/** Ported from the kernel's paginateTimelineMarkdown — timeline.md is
 *  rendered newest-first, so the first pointer lines (`- **id** …`) are
 *  already the newest slices. */
function paginateTimelineMarkdown(
  content: string,
  limit: number = TIMELINE_PAGE_SIZE,
): string {
  const pointerLines = content.split("\n").filter((l) => l.startsWith("- **"));
  if (pointerLines.length === 0) {
    return "(timeline is empty — no slices yet)";
  }
  const page = pointerLines.slice(0, limit);
  const header =
    `Global timeline: showing newest ${page.length} of ${pointerLines.length} slices. ` +
    "Older slices: use readTimelineWindow with a date range.";
  return `${header}\n${page.join("\n")}`;
}

/** The catalog's slice ids, parsed from timeline.md's `- **id**` pointer
 *  lines (compact YYYYMMDD-HHMM). Used to drop hallucinated references. */
function validSliceIdsFrom(timeline: string): Set<string> {
  const ids = new Set<string>();
  for (const line of timeline.split("\n")) {
    const match = line.match(/^- \*\*(\S+)\*\*/);
    if (match) ids.add(match[1]);
  }
  return ids;
}

/** Compact id → "YYYY-MM-DD" for window filtering. */
function sliceDateOf(id: string): string {
  const m = id.match(/^(\d{4})(\d{2})(\d{2})-\d{4}$/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : id.slice(0, 10);
}

/** Timeline catalog over a date window (inclusive YYYY-MM-DD) — compact
 *  pointer lines, newest first (timeline.md order). */
function readTimelineWindowImpl(
  timeline: string,
  from?: string,
  to?: string,
): string {
  const pointerLines = timeline.split("\n").filter((l) => l.startsWith("- **"));
  const inWindow = pointerLines.filter((l) => {
    const id = l.match(/^- \*\*(\S+)\*\*/)?.[1];
    if (!id) return false;
    const date = sliceDateOf(id);
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  });
  const page = inWindow.slice(0, 40);
  if (page.length === 0) {
    return `(no slices in window ${from ?? "start"} → ${to ?? "now"})`;
  }
  return `Timeline ${from ?? "start"} → ${to ?? "now"} (${page.length} slices):\n${page.join("\n")}`;
}

// ─── Slice reads against the snapshot ──────────────────────────────────

/** Range filter for readSlice — the kernel's Document Segment Read protocol:
 *  turn filters (turns / last / date), keyword search (misses degrade to the
 *  full slice with a note), and 1-indexed line ranges. */
type RecallReadRange = {
  type: "turns" | "last" | "date" | "search" | "lines";
  indices?: number[];
  count?: number;
  after?: string;
  keywords?: string[];
  context?: number;
  start?: number;
  end?: number;
};

const INVALID_ID_ERROR =
  "ERROR: Invalid slice ID. Expected the compact format shown in the timeline: YYYYMMDD-HHMM (e.g. 20260724-1021).";

const MISSING_SLICE_ERROR =
  "ERROR: This time slice does not exist in the readable dataset. Only the slices listed in the timeline may be readable — answer from what you have.";

/** Frontmatter-only relevance check — the cheapest way to verify a candidate
 *  slice before spending a full-read quota slot on it. */
function readSliceSummaryImpl(
  snapshot: PlaygroundSnapshot,
  sliceRef: string,
): string {
  const path = resolveSlicePath(sliceRef);
  if (!path) return INVALID_ID_ERROR;
  const raw = snapshot.slices[path]?.core;
  if (!raw) return MISSING_SLICE_ERROR;

  const { data } = matter(raw);
  const { turns } = parseTurns(raw);
  const fmt = (v: unknown): string =>
    Array.isArray(v) && v.length ? v.join("; ") : "(none)";
  return [
    `slice ${sliceRef}`,
    `start: ${typeof data.start === "string" ? data.start : "?"}`,
    `end: ${typeof data.end === "string" ? data.end : "(active)"}`,
    `turns: ${turns.length}`,
    `focus: ${typeof data.focus === "string" && data.focus ? data.focus : "(none)"}`,
    `summary: ${typeof data.summary === "string" && data.summary ? data.summary : "(none)"}`,
    `tags: ${fmt(data.tags)}`,
    `tone: ${typeof data.emotional_tone === "string" && data.emotional_tone ? data.emotional_tone : "(none)"}`,
    `open_loops: ${fmt(data.open_loops)}`,
    `decisions: ${fmt(data.decisions)}`,
  ].join("\n");
}

function readSliceImpl(
  snapshot: PlaygroundSnapshot,
  sliceRef: string,
  range?: RecallReadRange,
): string {
  const path = resolveSlicePath(sliceRef);
  if (!path) return INVALID_ID_ERROR;
  const raw = snapshot.slices[path]?.core;
  if (!raw) return MISSING_SLICE_ERROR;
  if (!range) return raw;

  // Keyword search — matches return only the relevant turns; a miss degrades
  // to the full slice with a note.
  if (range.type === "search") {
    const keywords = range.keywords ?? [];
    const context = range.context ?? 1;
    const hits = segmentSearch(splitTurns(raw), keywords, context, context);
    return searchResultToString(sliceRef, keywords, hits, raw);
  }
  // Line range — read the file like a code file, 1-indexed inclusive.
  if (range.type === "lines") {
    const { content, clamped } = textLines(raw, range.start ?? 1, range.end ?? 1);
    if (content === "" && (range.start ?? 1) > (range.end ?? 1)) {
      return `ERROR: Invalid line range ${range.start}-${range.end} in ${sliceRef}.`;
    }
    const header = `Lines ${range.start}-${range.end} of ${sliceRef}${clamped ? " (clamped)" : ""}:\n\n`;
    return content === "" ? `${header}(empty range)` : header + content;
  }
  // Classic turn filters.
  const { frontmatter, turns } = parseTurns(raw);
  const filtered = applyRange(turns, range as { type: "turns" | "last" | "date" });
  return filtered.length === 0
    ? `${frontmatter}\n\n_(No turns matched the requested range.)_`
    : reassembleSlice(frontmatter, filtered);
}

// ─── Full-slice read quota ─────────────────────────────────────────────

/**
 * Max readSlice calls per recall run (kernel value). After the quota,
 * readSlice returns a note instead of content and the sub-agent answers from
 * what it has already read.
 */
export const MAX_SLICE_READS = 5;

/** Per-run quota counter — a closure, so concurrent recall runs never share it. */
function createSliceReadQuota(max: number = MAX_SLICE_READS) {
  let used = 0;
  return {
    tryTake() {
      if (used >= max) return false;
      used += 1;
      return true;
    },
    get used() {
      return used;
    },
  };
}

// ─── Structured output schema: recallReport ─────────────────────────

/** Zod input schema — also the runner's report-validation schema. */
const recallReportInputSchema = z.object({
  answer: z
    .string()
    .describe(
      "Your natural-language answer to your colleague's question, in the " +
      "user's language. Answer like a colleague who remembers (or doesn't). " +
      "\"You\" in your answer is your colleague (the main agent), NEVER the " +
      "user — refer to the user in the third person (\"the user said …\" / " +
      "\"用户当时说 …\"). \"You two haven't talked about this\" is a valid " +
      "and important answer — never force a hit.",
    ),

  references: z
    .array(
      z.object({
        slice_id: z
          .string()
          .describe("Slice ID exactly as shown in the timeline (e.g. 20260724-1021) — the slice the quote comes from."),
        quote: z
          .string()
          .describe("VERBATIM quote from the slice's conversation text. Never paraphrase."),
        note: z
          .string()
          .describe("One line: which assertion in your answer this quote backs."),
      }),
    )
    .catch([])
    .describe(
      "Evidence anchors: EVERY situational assertion in your answer (moods, " +
      "circumstances, what was said) must be backed by an entry here with a " +
      "verbatim quote. Claims you cannot anchor must be hedged as uncertain " +
      "in the answer. Empty when the honest answer is \"no such memory\".",
    ),

  searched: z
    .array(z.string())
    .catch([])
    .describe(
      "What you searched: timeline windows, strands traced, slice summaries " +
      "checked, slices read in full. Lets your colleague judge how complete " +
      "this recall is.",
    ),

  confidence: z
    .number()
    .min(0)
    .max(1)
    .catch(0.5)
    .describe("Your confidence in this answer's completeness and accuracy, 0-1"),
});

type RecallReport = z.infer<typeof recallReportInputSchema>;

const recallReportSchema = tool({
  description:
    "Report your answer to your colleague. Call this ONCE you have gathered " +
    "enough evidence (or are confident there is none).",
  inputSchema: recallReportInputSchema,
});

// ─── Agent setup ──────────────────────────────────────────────────────

/**
 * The recall sub-agent's static role block — ported verbatim from the kernel.
 * The system prompt is `buildSubAgentSystem(RECALL_ROLE)`, so every recall
 * call shares one prefix for provider prompt caches.
 */
const RECALL_ROLE = `You are the recall colleague: you remember this user's past conversations and answer the main agent's questions about them.

You hold the FULL read-only memory toolset: the timeline catalog (readGlobalTimeline / readTimelineWindow), topic strands (listStrands / readStrand), slice summaries (readSliceSummary — frontmatter only, the cheap relevance check), and full slice content (readSlice — with optional range filters). Your value is an answer backed by evidence, not a pile of pointers.

Recall strategy (mirror how a person remembers):
1. TIME ANCHOR FIRST — if the question carries one ("last week", "that night", "in March"), scope the physical window with readTimelineWindow before anything else.
2. TRACE CLUES — check listStrands / the strands hint for topics the question touches, and readStrand the matching ones to find their slices.
3. BROADEN LAST — only then scan the global timeline for anything the first two passes missed.
4. VERIFY BEFORE ANSWERING — check candidate slices with readSliceSummary, then read the most promising ones in full with readSlice (range filters keep it cheap). You may read at most ${MAX_SLICE_READS} slices in full — spend them on the strongest candidates.

Answering:
- Answer in the user's language, colleague to colleague ("Yes — you and the user talked about that on …", "You two haven't talked about this").
- PERSON DISCIPLINE (critical): in your answer, "you" is ALWAYS your colleague (the main agent), NEVER the user. The user is a third party — refer to them as "the user" / "用户" ("the user said …", "用户当时提到 …"). Never attribute the user's words, moods, or decisions to "you", and never address your colleague as if it were the user. The conversation you describe happened BETWEEN your colleague and the user — you were not in it.
- EVERY situational assertion (what was said, moods, circumstances, decisions) must carry a references[] entry with a VERBATIM quote from the slice. What you cannot anchor, hedge explicitly as uncertain.
- "You two haven't talked about this" / "I can't recall that" is a VALID and important answer. Never force a hit: a confident false memory is far worse than an honest miss. Say what you searched (searched[]) so your colleague can judge completeness.
- The current session's slice is the ONGOING conversation, NOT a past memory — never cite it, even if it shows up in the timeline or a strand. You recall the PAST only.

Writing discipline (critical): a hard deadline may cut you off mid-exploration, and everything you have already written is preserved and handed to your colleague. So keep a RUNNING plain-text account of what you have established as you go — do not save all writing for the final report.`;

// ─── Public API ────────────────────────────────────────────────────────

/**
 * Step budget for the recall sub-agent (kernel value). prepareRecallStep
 * guarantees the last step is the report.
 */
export const MAX_STEPS = 20;

/**
 * prepareStep for the recall sub-agent: when the step budget is nearly
 * exhausted and recallReport hasn't been called yet, force the model to call
 * it. Ported verbatim from the kernel.
 */
export function prepareRecallStep({
  steps,
  maxSteps = MAX_STEPS,
}: {
  steps: ReadonlyArray<{ toolCalls?: ReadonlyArray<{ toolName: string }> }>;
  maxSteps?: number;
}): { toolChoice: { type: "tool"; toolName: "recallReport" } } | undefined {
  const reportCalled = steps.some((s) =>
    (s.toolCalls ?? []).some((tc) => tc.toolName === "recallReport"),
  );
  if (!reportCalled && steps.length >= maxSteps - 1) {
    return { toolChoice: { type: "tool", toolName: "recallReport" } };
  }
  return undefined;
}

/**
 * Drop references whose slice id is not in the catalog — the model sometimes
 * hallucinates plausible-looking ids. Ported verbatim from the kernel.
 */
export function filterKnownSliceIds<T extends { slice_id: string }>(
  items: T[],
  validIds: ReadonlySet<string> | null,
): T[] {
  if (!validIds) return items;
  return items.filter((i) => {
    if (validIds.has(i.slice_id)) return true;
    console.warn(`[Recall] Dropping hallucinated slice id: ${i.slice_id}`);
    return false;
  });
}

/** Wall-clock budget for one recall run (kernel: 240s; demo: 120s). */
export const RECALL_TIMEOUT_MS = 120_000;

/** Confidence stamped on answers recovered from an interrupted run's partial
 *  text — real content, but never evidence-checked to completion. */
const PARTIAL_ANSWER_CONFIDENCE = 0.2;

/** Pull a string field out of an opaque tool-call input (progress lines). */
function inputString(input: unknown, key: string): string {
  return typeof input === "object" && input !== null && key in input
    ? String((input as Record<string, unknown>)[key] ?? "")
    : "";
}

export interface PlaygroundRecallInput {
  question: string;
  snapshot: PlaygroundSnapshot;
  /** Demo locale — the answer's language. */
  locale: "en" | "zh";
  model: LanguageModel;
  /** Receives each exploration progress line as the matching tool starts. */
  onProgressLine?: (line: string) => void;
  /**
   * Receives the CURRENT line of the colleague's thinking/writing on every
   * delta (the kernel's live-subtitle channel), unthrottled.
   */
  onLine?: (line: string, stage: "thinking" | "writing") => void;
  /** Receives each streamed delta of the report's `answer` field. */
  onAnswerDelta?: (delta: string) => void;
}

export type PlaygroundRecallResult =
  | { ok: true; result: RecallResult }
  | { ok: false; error: string; timedOut?: boolean };

/**
 * Run the episodic recall sub-agent on the playground dataset.
 *
 * The runner owns the loop: `stopWhen: isStepCount(MAX_STEPS)` lets the model
 * explore (timeline → window → strands → summaries → full reads) and then
 * call recallReport; the `prepareStep` passthrough forces recallReport on the
 * final step if the model hasn't called it yet.
 *
 * Timeout semantics (kernel): a soft timeout is never a hard error when the
 * sub-agent already wrote a partial answer — it comes back at confidence 0.2.
 */
export async function runPlaygroundRecall(
  input: PlaygroundRecallInput,
): Promise<PlaygroundRecallResult> {
  const { question, snapshot, locale, onProgressLine, onLine, onAnswerDelta } = input;

  const strandNames = Object.keys(snapshot.strands);
  const strandsHint = strandNames.length > 0
    ? `
Available strands (keyword tags threaded across slices): ${strandNames.join(", ")}
IMPORTANT: After checking any time anchor, trace the strands that match the question with readStrand — they give you a direct path to relevant slices.`
    : "";

  const languageLine =
    locale === "zh"
      ? "The visitor's language is Simplified Chinese — write your answer in Simplified Chinese (keep slice ids and quotes verbatim)."
      : "The visitor's language is English — write your answer in English.";

  const userPrompt = `Your colleague (the main agent) asks: "${question}"
${strandsHint}

Follow your recall strategy: time anchor first (readTimelineWindow), then clue strands (readStrand), broaden only after that; verify candidates with readSliceSummary and read the strongest slices in full (readSlice, at most ${MAX_SLICE_READS}) before answering.

${languageLine}

IMPORTANT: You MUST end by calling recallReport. Even when the honest answer is "we haven't talked about this", call it — with empty references and your searched trail.`;

  // The catalog's slice ids — used afterwards to drop hallucinated references.
  const validSliceIds = validSliceIdsFrom(snapshot.timeline);
  const sliceQuota = createSliceReadQuota();

  // DeepSeek thinking shapes, ported from the kernel's effort-injector:
  // thinking ON at effort "low" is the kernel default for every sub-agent;
  // "disabled" is the thinking-off shape used by the downgrade retry.
  const thinkingOn = {
    deepseek: { thinking: { type: "enabled" }, reasoningEffort: "low" },
  };
  const thinkingOff = {
    deepseek: { thinking: { type: "disabled" } },
  };

  const attempt = (thinking: boolean) =>
    runAgent<RecallReport>({
      model: input.model,
      system: buildSubAgentSystem(RECALL_ROLE),
      prompt: userPrompt,
      temperature: 0.3,
      providerOptions: thinking ? thinkingOn : thinkingOff,
      tools: {
      readGlobalTimeline: tool({
        description:
          "Read the global timeline index — pointer lines for the newest " +
          "conversation slices (with the total count). Use readTimelineWindow " +
          "to reach older slices.",
        inputSchema: z.object({}),
        execute: async () => paginateTimelineMarkdown(snapshot.timeline),
      }),
      readTimelineWindow: tool({
        description:
          "Read the timeline catalog over a date window (inclusive, YYYY-MM-DD) — " +
          "one compact pointer line per slice. Your FIRST move when the question " +
          "carries a time anchor ('last week', 'that night', 'in March').",
        inputSchema: z.object({
          from: z
            .string()
            .optional()
            .describe("Start date YYYY-MM-DD (inclusive). Omit for the beginning."),
          to: z
            .string()
            .optional()
            .describe("End date YYYY-MM-DD (inclusive). Omit for now."),
        }),
        execute: async ({ from, to }: { from?: string; to?: string }) =>
          readTimelineWindowImpl(snapshot.timeline, from, to),
      }),
      listStrands: tool({
        description:
          "List all known strands — every keyword tag woven through past " +
          "slices. Use this to discover which topics exist before tracing one.",
        inputSchema: z.object({}),
        execute: async () => {
          const names = Object.keys(snapshot.strands);
          if (names.length === 0) return "(no strands yet — no topic tags woven)";
          return `Known strands (${names.length}): ${names.join(", ")}`;
        },
      }),
      readStrand: tool({
        description:
          "Follow a strand (keyword tag) that threads through multiple time slices. " +
          "Returns all slice paths carrying that tag. Use this to trace a topic across time.",
        inputSchema: z.object({
          strand: z.string().describe("The strand (tag) to follow."),
        }),
        execute: async ({ strand }: { strand: string }) => {
          const paths = snapshot.strands[strand];
          if (!paths || paths.length === 0) {
            return `Strand "${strand}" not found. No slices carry this tag.`;
          }
          return `Strand "${strand}" appears in: ${paths.slice(0, 20).join(", ")}`;
        },
      }),
      readSliceSummary: tool({
        description:
          "Read a slice's summary (frontmatter only): focus, summary, tags, " +
          "tone, turn count, open loops, decisions. The CHEAP relevance check — " +
          "verify candidates here before spending a full-read quota slot.",
        inputSchema: z.object({
          sliceId: z
            .string()
            .describe("Slice ID exactly as shown in the timeline (e.g. '20260724-1021')."),
        }),
        execute: async ({ sliceId }: { sliceId: string }) =>
          readSliceSummaryImpl(snapshot, sliceId),
      }),
      readSlice: tool({
        description:
          "Read a slice's full conversation record. Costs one of your " +
          `${MAX_SLICE_READS} full-read quota slots — spend them on the ` +
          "strongest candidates only. Optional `range`: turns = specific turn " +
          "indices; last = most recent N turns; date = turns after a timestamp; " +
          "search = keyword match (misses return the full slice with a note); " +
          "lines = 1-indexed line range.",
        inputSchema: z.object({
          sliceId: z
            .string()
            .describe("Slice ID exactly as shown in the timeline (e.g. '20260724-1021')."),
          range: z
            .object({
              type: z
                .enum(["turns", "last", "date", "search", "lines"])
                .describe(
                  "turns = specific turn indices. last = most recent N turns. " +
                  "date = turns after a given timestamp. " +
                  "search = keyword match, returns matching turns (+ context); " +
                  "if nothing matches, returns the full slice with a note. " +
                  "lines = 1-indexed line range of the raw file.",
                ),
              indices: z
                .array(z.number())
                .optional()
                .describe("Turn indices (0-based). Only for type 'turns'."),
              count: z
                .number()
                .optional()
                .describe("Number of recent turns. Only for type 'last'."),
              after: z
                .string()
                .optional()
                .describe("ISO 8601 timestamp. Only for type 'date'."),
              keywords: z
                .array(z.string())
                .optional()
                .describe("Case-insensitive keywords to match. Only for type 'search'."),
              context: z
                .number()
                .optional()
                .describe("Turns of context around each match (default 1). Only for type 'search'."),
              start: z
                .number()
                .optional()
                .describe("First line (1-indexed, inclusive). Only for type 'lines'."),
              end: z
                .number()
                .optional()
                .describe("Last line (1-indexed, inclusive). Only for type 'lines'."),
            })
            .optional()
            .describe("Optional range filter. When omitted, returns the full slice content."),
        }),
        execute: async ({ sliceId, range }: { sliceId: string; range?: RecallReadRange }) => {
          if (!sliceQuota.tryTake()) {
            return (
              `(Full-slice read quota exhausted — ${MAX_SLICE_READS} reads per run.) ` +
              "Answer from what you have already read, or fall back to summaries."
            );
          }
          return readSliceImpl(snapshot, sliceId, range);
        },
      }),
      recallReport: recallReportSchema,
      },
      reportToolName: "recallReport",
      reportSchema: recallReportInputSchema,
      maxSteps: MAX_STEPS,
      timeoutMs: RECALL_TIMEOUT_MS,
      // Last-resort guarantee: if the model burned the budget exploring
      // without reporting, force recallReport on the final step.
      prepareStep: prepareRecallStep,
      onProgressLine,
      onLine,
      // The playground has no main agent — the report's `answer` field IS the
      // reply, so stream it token-by-token out of the report tool's input.
      streamedReportField: "answer",
      onAnswerDelta,
      // Stream the sub-agent's exploration trail live: each tool the recall
      // colleague starts surfaces as a progress line. Ported from the kernel's
      // onToolProgress mapping.
      onToolProgress: ({ toolName, input: toolInput }) => {
        if (toolName === "readGlobalTimeline") {
          return "Reading global timeline…";
        }
        if (toolName === "readTimelineWindow") {
          return "Scoping timeline window…";
        }
        if (toolName === "listStrands") {
          return "Listing memory topics…";
        }
        if (toolName === "readStrand") {
          const strand = inputString(toolInput, "strand");
          return strand ? `Tracing strand: ${strand}…` : "Tracing a strand…";
        }
        if (toolName === "readSliceSummary") {
          const sid = inputString(toolInput, "sliceId");
          return sid ? `Checking summary of ${sid}…` : "Checking a slice summary…";
        }
        if (toolName === "readSlice") {
          const sid = inputString(toolInput, "sliceId");
          return sid ? `Reading slice ${sid}…` : "Reading a slice…";
        }
        if (toolName === "recallReport") {
          return "Compiling the answer…";
        }
        return undefined;
      },
    });

  let res = await attempt(true);

  // DeepSeek quirk (kernel-documented): thinking mode rejects a FORCED
  // tool_choice with a 400 ("Thinking mode does not support this
  // tool_choice"), which the prepareStep last-step report guarantee can
  // trigger and which surfaces as the AI SDK's "No output generated". Retry
  // once with thinking OFF — the kernel runner does the same downgrade.
  if (
    !res.ok &&
    !res.timedOut &&
    /tool_choice|thinking|no output generated/i.test(res.error ?? "")
  ) {
    console.warn(
      `[Recall] thinking run failed (${res.error}) — retrying with thinking off`,
    );
    res = await attempt(false);
  }

  if (!res.ok) {
    if (res.timedOut) {
      // Soft-timeout degradation: never a hard error. If the sub-agent had
      // already written a partial answer (write-as-you-go discipline), hand
      // it back at low confidence.
      console.warn(`[Recall] ${res.error}`);
      const partial = res.text?.trim();
      if (partial) {
        return {
          ok: true,
          result: {
            answer: `${partial}\n\n(Interrupted before finishing — this is a partial answer; treat it as uncertain.)`,
            references: [],
            searched: [],
            confidence: PARTIAL_ANSWER_CONFIDENCE,
          },
        };
      }
      return { ok: false, timedOut: true, error: res.error ?? "Recall timed out" };
    }
    return { ok: false, error: res.error ?? "Recall failed" };
  }

  const report = res.report;
  if (!report) {
    // recallReport not called (or failed validation) — the model may have
    // written its answer as plain text instead; return it at low confidence.
    console.warn(
      "[Recall] recallReport not called. Final text:",
      res.text?.slice(0, 200) ?? "(no text)",
    );
    const text = res.text?.trim() ?? "";
    if (!text) {
      return { ok: false, error: "The model didn't come back with a usable answer." };
    }
    return {
      ok: true,
      result: {
        answer: text,
        references: [],
        searched: [],
        confidence: PARTIAL_ANSWER_CONFIDENCE,
      },
    };
  }

  // Post-processing: drop hallucinated slice ids (kernel behavior; the
  // ongoing-slice exclusion does not apply — there is no session here).
  const references = filterKnownSliceIds(report.references ?? [], validSliceIds);

  console.log(
    `[Recall] Answered with ${references.length} reference(s), confidence=${(report.confidence ?? 0.5).toFixed(2)}, ${sliceQuota.used} full read(s)`,
  );
  return {
    ok: true,
    result: {
      answer: report.answer ?? "",
      references,
      searched: report.searched ?? [],
      confidence: report.confidence ?? 0.5,
    },
  };
}
