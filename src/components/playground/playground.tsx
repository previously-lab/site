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

type TurnState =
  | { status: "loading" }
  | { status: "done"; data: PlaygroundSuccess }
  | { status: "error"; message: string };

interface Turn {
  presetId: string;
  state: TurnState;
}

/**
 * A conversation fragment demonstrating one capability. The window opens
 * mid-conversation: the pre-recorded history (grounded in the `you` dataset)
 * is already on screen, and instead of a free-form input the visitor gets a
 * few prompts they can ask next — tapping one appends a real, live answer to
 * the same thread. Embedded from MDX as `<Playground capability="recall" />`.
 */
export function Playground({ capability }: { capability: PlaygroundCapability }) {
  const t = useTranslations("Playground");
  const locale = useLocale();
  const history = t.raw(`capabilities.${capability}.history`) as HistoryTurn[];
  const presetIds = CAPABILITY_PRESETS[capability];
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  // Keep the latest exchange in view as the thread grows.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns]);

  // Turns are serialized (busy guard), so an appended turn stays last and an
  // in-place retry (`index`) can't race another request.
  async function run(presetId: string, index?: number) {
    if (busy) return;
    setBusy(true);
    setTurns((prev) =>
      index === undefined
        ? [...prev, { presetId, state: { status: "loading" } }]
        : prev.map((turn, i) =>
            i === index ? { presetId, state: { status: "loading" } } : turn,
          ),
    );

    let next: TurnState;
    try {
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ presetId, locale }),
      });
      const data = await res.json();
      next = res.ok
        ? { status: "done", data: data as PlaygroundSuccess }
        : {
            status: "error",
            message:
              typeof data?.error === "string" ? data.error : t("ui.error"),
          };
    } catch {
      next = { status: "error", message: t("ui.error") };
    }

    setTurns((prev) =>
      prev.map((turn, i) =>
        i === (index ?? prev.length - 1) ? { presetId, state: next } : turn,
      ),
    );
    setBusy(false);
  }

  return (
    <div className="playground-scope overflow-hidden rounded-xl border border-border bg-card">
      {/* Chat header */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className="size-2 rounded-full bg-[var(--pg-brand)]" />
        <span className="text-sm font-semibold tracking-tight">Previously</span>
      </div>

      {/* Conversation thread — pre-recorded history first, live turns after */}
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

        {turns.map((turn, i) => (
          <div key={`live-${i}`} className="space-y-3">
            <UserBubble text={t(`presets.${turn.presetId}.question`)} />
            <div className="min-w-0 max-w-full flex-1">
              {turn.state.status === "loading" && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pg-brand-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--pg-brand)]">
                  <span className="pg-breathe size-1.5 rounded-full bg-[var(--pg-brand)]" />
                  {t(`ui.working.${getPreset(turn.presetId)!.kind}`)}
                </div>
              )}
              {turn.state.status === "error" && (
                <div className="flex items-center gap-3 rounded-md border border-destructive/20 bg-destructive/10 px-3.5 py-2 text-sm text-destructive">
                  <span>{turn.state.message}</span>
                  <button
                    type="button"
                    onClick={() => run(turn.presetId, i)}
                    className="shrink-0 text-xs font-semibold underline underline-offset-2"
                  >
                    {t("ui.retry")}
                  </button>
                </div>
              )}
              {turn.state.status === "done" && (
                <ResultBody data={turn.state.data} />
              )}
            </div>
          </div>
        ))}
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
