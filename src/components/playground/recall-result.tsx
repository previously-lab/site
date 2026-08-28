"use client";

import { useTranslations } from "next-intl";
import type { RecallResult } from "@/lib/playground/contracts";
import { MarkdownRenderer } from "./markdown";

/**
 * One evidence anchor: mono slice id + verbatim quote. Shared by the recall
 * result view and the playground's pre-recorded history.
 */
export function ReferenceCard({
  sliceId,
  quote,
  note,
}: {
  sliceId: string;
  quote: string;
  note?: string;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5">
      <span className="font-mono text-xs text-muted-foreground">{sliceId}</span>
      <blockquote className="mt-1 border-l-2 border-[var(--pg-brand-line)] pl-2 text-xs leading-relaxed text-foreground/80 italic">
        {quote}
      </blockquote>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

/**
 * Recall preset result — mirrors the kernel's recall tool renderer: the
 * colleague's answer, evidence-anchored reference cards (verbatim quote in
 * italic + mono slice id), the searched trail folded away, and a confidence
 * indicator.
 */
export function RecallResultView({ result }: { result: RecallResult }) {
  const t = useTranslations("Playground.ui");
  const pct = Math.round(result.confidence * 100);

  return (
    <div className="space-y-3">
      {/* Answer */}
      <MarkdownRenderer content={result.answer} />

      {/* References — the auditable evidence anchors */}
      {result.references.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-foreground/80">
            {t("references")}
          </p>
          <div className="space-y-1.5">
            {result.references.map((r, i) => (
              <ReferenceCard
                key={i}
                sliceId={r.slice_id}
                quote={r.quote}
                note={r.note}
              />
            ))}
          </div>
        </div>
      )}

      {/* Searched trail — how complete this recall is */}
      {result.searched.length > 0 && (
        <details className="group rounded-md border border-border/60 px-2.5 py-1.5">
          <summary className="cursor-pointer text-xs font-semibold text-foreground/80">
            {t("searched")}
          </summary>
          <ul className="mt-1.5 space-y-0.5">
            {result.searched.map((s, i) => (
              <li
                key={i}
                className="font-mono text-[11px] leading-relaxed text-muted-foreground"
              >
                {s}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Confidence */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {t("confidence")}
        </span>
        <span className="h-1 w-16 overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-[var(--pg-brand)]"
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {pct}%
        </span>
      </div>
    </div>
  );
}
