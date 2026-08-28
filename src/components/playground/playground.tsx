"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { History, ScanSearch, Sparkles } from "lucide-react";
import { getPreset, type PlaygroundKind } from "@/lib/playground/presets";
import type {
  AnatomyResult,
  EvolutionResult,
  PlaygroundSuccess,
  RecallResult,
} from "@/lib/playground/contracts";
import { RecallResultView } from "./recall-result";
import { EvolutionResultView } from "./evolution-result";
import { AnatomyResultView } from "./anatomy-result";

const KIND_ICON: Record<PlaygroundKind, React.ReactNode> = {
  recall: <History className="h-3.5 w-3.5" />,
  evolution: <Sparkles className="h-3.5 w-3.5" />,
  anatomy: <ScanSearch className="h-3.5 w-3.5" />,
};

type RunState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; data: PlaygroundSuccess }
  | { status: "error"; message: string };

/**
 * A self-contained fake chat window for one preset. The preset chip plays the
 * role of the user asking a question; clicking it POSTs to /api/playground and
 * streams the staged conversation: user bubble → breathing "working" pill →
 * the kind-specific result card. Used both by /playground and from MDX as
 * `<Playground preset="recall-worldcup" />`.
 */
export function Playground({ preset }: { preset: string }) {
  const t = useTranslations("Playground");
  const locale = useLocale();
  const [state, setState] = useState<RunState>({ status: "idle" });

  const def = getPreset(preset);
  if (!def) return null;

  async function run() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ presetId: preset, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({
          status: "error",
          message: typeof data?.error === "string" ? data.error : t("ui.error"),
        });
        return;
      }
      setState({ status: "done", data: data as PlaygroundSuccess });
    } catch {
      setState({ status: "error", message: t("ui.error") });
    }
  }

  const loading = state.status === "loading";

  return (
    <div className="playground-scope overflow-hidden rounded-xl border border-border bg-card">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-[var(--pg-brand)]" />
        </span>
        <span className="ml-1 font-mono text-xs text-muted-foreground">
          {t("ui.windowTitle")}
        </span>
      </div>

      {/* Chat area */}
      <div className="space-y-4 px-4 py-4">
        {state.status === "idle" ? (
          <p className="py-6 text-center text-xs leading-relaxed text-muted-foreground">
            {t("ui.idleHint")}
          </p>
        ) : (
          <>
            {/* User bubble — the preset question */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3.5 py-2 text-sm leading-relaxed">
                {t(`presets.${preset}.question`)}
              </div>
            </div>

            {/* Agent side */}
            <div className="flex justify-start">
              <div className="min-w-0 max-w-full flex-1">
                {state.status === "loading" && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pg-brand-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--pg-brand)]">
                    <span className="pg-breathe size-1.5 rounded-full bg-[var(--pg-brand)]" />
                    {t("ui.working")}
                  </div>
                )}
                {state.status === "error" && (
                  <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3.5 py-2 text-sm text-destructive">
                    {state.message}
                  </div>
                )}
                {state.status === "done" && (
                  <ResultBody data={state.data} />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Preset chip — "ask as the user" */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--pg-brand-line)] bg-[var(--pg-brand-soft)] px-3 py-1.5 text-xs font-medium text-[var(--pg-brand)] transition-colors hover:bg-[var(--pg-brand)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {KIND_ICON[def.kind]}
          {state.status === "idle"
            ? t(`presets.${preset}.label`)
            : t("ui.runAgain")}
        </button>
        {state.status === "done" && state.data.cached && (
          <span className="font-mono text-[11px] text-muted-foreground/70">
            {t("ui.cachedBadge")}
          </span>
        )}
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
