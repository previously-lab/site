"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import type { EvolutionResult } from "@/lib/playground/contracts";

/**
 * Evolution preset result — mirrors the kernel's evolution card: trigger
 * reasons, the direction verdict, a before/after card diff (side by side on
 * wide screens, stacked on mobile), and the playbook note. The footer repeats
 * the demo contract: nothing is persisted, refresh resets everything.
 */
export function EvolutionResultView({ result }: { result: EvolutionResult }) {
  const t = useTranslations("Playground.ui");

  return (
    <div className="space-y-3">
      {/* Trigger reasons */}
      {result.triggerReasons.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
            <Sparkles className="h-3 w-3 text-[var(--pg-brand)]" />
            {t("triggers")}
          </p>
          <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
            {result.triggerReasons.map((reason, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--pg-brand)]">·</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Direction verdict */}
      <div>
        <p className="mb-1 text-xs font-semibold text-foreground/80">
          {t("direction")}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {result.directionVerdict}
        </p>
      </div>

      {/* Card before / after */}
      <div className="grid gap-2 md:grid-cols-2">
        <div className="rounded-md border border-border/60 bg-muted/40">
          <p className="border-b border-border/60 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
            {t("cardBefore")}
          </p>
          <pre className="max-h-72 overflow-auto px-2.5 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {result.cardBefore}
          </pre>
        </div>
        <div className="rounded-md border border-[var(--pg-brand-line)] bg-[var(--pg-brand-soft)]">
          <p className="border-b border-[var(--pg-brand-line)] px-2.5 py-1.5 text-xs font-semibold text-[var(--pg-brand)]">
            {t("cardAfter")}
          </p>
          <pre className="max-h-72 overflow-auto px-2.5 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground/85">
            {result.cardAfter}
          </pre>
        </div>
      </div>

      {/* Playbook note */}
      {result.playbookNote && (
        <div>
          <p className="mb-1 text-xs font-semibold text-foreground/80">
            {t("playbook")}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {result.playbookNote}
          </p>
        </div>
      )}

      {/* Demo contract */}
      <p className="border-t border-border/60 pt-2 text-xs leading-relaxed text-muted-foreground italic">
        {t("notPersisted")}
      </p>
    </div>
  );
}
