"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { History, ScanSearch, Sparkles } from "lucide-react";
import { getPreset, type PlaygroundKind } from "@/lib/playground/presets";
import type {
  AnatomyResult,
  EvolutionResult,
  PlaygroundSuccess,
  RecallResult,
} from "@/lib/playground/contracts";
import { RecallResultView, ReferenceCard } from "./recall-result";
import { EvolutionResultView } from "./evolution-result";
import { AnatomyResultView } from "./anatomy-result";
import { PhaseIndicator } from "./phase-indicator";

export type PlaygroundCapability = PlaygroundKind;

/** Which live prompts each capability offers at the bottom of the chat. */
const CAPABILITY_PRESETS: Record<PlaygroundCapability, readonly string[]> = {
  recall: ["recall-worldcup", "recall-mom", "recall-marathon"],
  evolution: ["evolution-card"],
  anatomy: ["slice-anatomy"],
};

const KIND_ICON: Record<PlaygroundKind, React.ReactNode> = {
  recall: <History className="h-3.5 w-3.5" />,
  evolution: <Sparkles className="h-3.5 w-3.5" />,
  anatomy: <ScanSearch className="h-3.5 w-3.5" />,
};

/** A pre-recorded exchange — static, grounded in the dataset, never hits the API. */
interface HistoryTurn {
  question: string;
  answer: string;
  references?: { sliceId: string; quote: string }[];
}

type LiveStatus =
  | { status: "running" }
  | { status: "done"; data: PlaygroundSuccess }
  | { status: "error"; message: string };

/** The single live turn — every preset click REPLACES it (no stacking). */
interface LiveTurn {
  presetId: string;
  /** Recall exploration trail (one line per tool the colleague started). */
  lines: string[];
  /** Answer text streamed so far (recall only — the write-as-you-go channel). */
  answer: string;
  state: LiveStatus;
}

/** One SSE event from POST /api/playground (recall presets). */
type SseEvent =
  | { type: "progress"; line: string }
  | { type: "delta"; text: string }
  | { type: "report"; result: RecallResult }
  | { type: "error"; message: string };

/**
 * A conversation fragment demonstrating one capability. The window opens
 * mid-conversation: the pre-recorded history (grounded in the `you` dataset)
 * is already on screen, and instead of a free-form input the visitor gets a
 * few prompts they can ask next — tapping one runs a real, live request
 * (recall presets stream the recall colleague's tool loop over SSE) and
 * REPLACES the previous live turn. Embedded from MDX as
 * `<Playground capability="recall" />`.
 */
export function Playground({ capability }: { capability: PlaygroundCapability }) {
  const t = useTranslations("Playground");
  const locale = useLocale();
  const history = t.raw(`capabilities.${capability}.history`) as HistoryTurn[];
  const presetIds = CAPABILITY_PRESETS[capability];
  const [live, setLive] = useState<LiveTurn | null>(null);
  const [busy, setBusy] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Keep the latest exchange in view as the thread grows.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [live]);

  // Abort an in-flight stream when the component unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  /** Patch the live turn in place (single slot — no index bookkeeping). */
  function patchLive(patch: Partial<LiveTurn>) {
    setLive((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function runRecall(presetId: string, signal: AbortSignal) {
    const res = await fetch("/api/playground", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ presetId, locale }),
      signal,
    });

    // JSON error envelope (rate limited / unavailable / bad request).
    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => null);
      patchLive({
        state: {
          status: "error",
          message:
            typeof data?.error === "string" ? data.error : t("ui.error"),
        },
      });
      return;
    }

    // Real SSE stream: progress lines → answer deltas → the final report.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let sep: number;
      while ((sep = buf.indexOf("\n\n")) >= 0) {
        const chunk = buf.slice(0, sep);
        buf = buf.slice(sep + 2);
        for (const row of chunk.split("\n")) {
          if (!row.startsWith("data: ")) continue;
          let event: SseEvent;
          try {
            event = JSON.parse(row.slice(6)) as SseEvent;
          } catch {
            continue;
          }
          if (event.type === "progress") {
            setLive((prev) =>
              prev ? { ...prev, lines: [...prev.lines, event.line] } : prev,
            );
          } else if (event.type === "delta") {
            setLive((prev) =>
              prev ? { ...prev, answer: prev.answer + event.text } : prev,
            );
          } else if (event.type === "report") {
            patchLive({
              state: {
                status: "done",
                data: {
                  presetId,
                  kind: "recall",
                  result: event.result,
                  cached: false,
                },
              },
            });
          } else if (event.type === "error") {
            patchLive({
              state: { status: "error", message: event.message },
            });
          }
        }
      }
    }
    // Stream ended without a report or error — treat as a failed run.
    setLive((prev) =>
      prev && prev.state.status === "running"
        ? { ...prev, state: { status: "error", message: t("ui.error") } }
        : prev,
    );
  }

  async function runJson(presetId: string, signal: AbortSignal) {
    const res = await fetch("/api/playground", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ presetId, locale }),
      signal,
    });
    const data = await res.json();
    patchLive({
      state: res.ok
        ? { status: "done", data: data as PlaygroundSuccess }
        : {
            status: "error",
            message:
              typeof data?.error === "string" ? data.error : t("ui.error"),
          },
    });
  }

  // Turns are serialized (busy guard); a click REPLACES the live turn.
  async function run(presetId: string) {
    if (busy) return;
    setBusy(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const kind = getPreset(presetId)!.kind;
    setLive({ presetId, lines: [], answer: "", state: { status: "running" } });

    try {
      if (kind === "recall") {
        await runRecall(presetId, controller.signal);
      } else {
        await runJson(presetId, controller.signal);
      }
    } catch (err) {
      if (controller.signal.aborted) return; // replaced by a newer click
      patchLive({ state: { status: "error", message: t("ui.error") } });
    } finally {
      if (abortRef.current === controller) {
        setBusy(false);
      }
    }
  }

  return (
    <div className="playground-scope overflow-hidden rounded-xl border border-border bg-card">
      {/* Chat header */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className="size-2 rounded-full bg-[var(--pg-brand)]" />
        <span className="text-sm font-semibold tracking-tight">Previously</span>
      </div>

      {/* Conversation thread — pre-recorded history first, live turn after */}
      <div
        ref={threadRef}
        className="max-h-[36rem] space-y-5 overflow-y-auto px-4 py-5"
      >
        <p className="text-center font-mono text-[11px] text-muted-foreground/60">
          {t("ui.sceneTime")}
        </p>

        {history.map((turn, i) => (
          <div key={`h-${i}`} className="space-y-3">
            <UserBubble text={turn.question} />
            <div className="space-y-3">
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                {turn.answer}
              </p>
              {turn.references && turn.references.length > 0 && (
                <div className="space-y-1.5">
                  {turn.references.map((r, j) => (
                    <ReferenceCard key={j} sliceId={r.sliceId} quote={r.quote} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {live && (
          <div className="space-y-3">
            <UserBubble text={t(`presets.${live.presetId}.question`)} />
            <div className="min-w-0 max-w-full flex-1 space-y-3">
              {/* Recall: the colleague's exploration card, live */}
              {getPreset(live.presetId)!.kind === "recall" && (
                <PhaseIndicator
                  icon={<History className="h-3.5 w-3.5" />}
                  label={
                    live.state.status === "running"
                      ? t("ui.working.recall")
                      : t("ui.recallDone")
                  }
                  running={live.state.status === "running"}
                  currentLine={live.lines[live.lines.length - 1]}
                  lines={live.lines}
                />
              )}

              {/* Non-recall working pill (one-shot JSON presets) */}
              {live.state.status === "running" &&
                getPreset(live.presetId)!.kind !== "recall" && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pg-brand-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--pg-brand)]">
                    <span className="pg-breathe size-1.5 rounded-full bg-[var(--pg-brand)]" />
                    {t(`ui.working.${getPreset(live.presetId)!.kind}`)}
                  </div>
                )}

              {/* Recall answer text streaming live (write-as-you-go) */}
              {live.state.status === "running" && live.answer && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                  {live.answer}
                </p>
              )}

              {live.state.status === "error" && (
                <div className="flex items-center gap-3 rounded-md border border-destructive/20 bg-destructive/10 px-3.5 py-2 text-sm text-destructive">
                  <span>{live.state.message}</span>
                  <button
                    type="button"
                    onClick={() => run(live.presetId)}
                    className="shrink-0 text-xs font-semibold underline underline-offset-2"
                  >
                    {t("ui.retry")}
                  </button>
                </div>
              )}
              {live.state.status === "done" && (
                <ResultBody data={live.state.data} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* No free-form input — just a few things you might ask next */}
      <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
        {presetIds.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => run(id)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--pg-brand-line)] bg-[var(--pg-brand-soft)] px-3 py-1.5 text-xs font-medium text-[var(--pg-brand)] transition-colors hover:bg-[var(--pg-brand)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {KIND_ICON[getPreset(id)!.kind]}
            {t(`presets.${id}.question`)}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3.5 py-2 text-sm leading-relaxed">
        {text}
      </div>
    </div>
  );
}

function ResultBody({ data }: { data: PlaygroundSuccess }) {
  switch (data.kind) {
    case "recall":
      return <RecallResultView result={data.result as RecallResult} />;
    case "evolution":
      return <EvolutionResultView result={data.result as EvolutionResult} />;
    case "anatomy":
      return <AnatomyResultView result={data.result as AnatomyResult} />;
  }
}
