"use client";

import { useTranslations } from "next-intl";
import type { AnatomyResult } from "@/lib/playground/contracts";
import { MarkdownRenderer } from "./markdown";

/**
 * Anatomy preset result — a guided tour of one slice: the narrative explains
 * where each frontmatter field comes from, then the actual frontmatter is
 * shown as a mono key/value list under its slice id.
 */
export function AnatomyResultView({ result }: { result: AnatomyResult }) {
  const t = useTranslations("Playground.ui");
  const entries = Object.entries(result.frontmatter);

  return (
    <div className="space-y-3">
      {/* Narrative */}
      <MarkdownRenderer content={result.narrative} />

      {/* The slice's actual frontmatter */}
      <div className="rounded-md border border-border/60 bg-muted/40">
        <p className="border-b border-border/60 px-2.5 py-1.5 text-xs font-semibold text-foreground/80">
          {t("frontmatter")}
          <span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">
            {result.sliceId}
          </span>
        </p>
        <dl className="space-y-1.5 px-2.5 py-2">
          {entries.map(([key, value]) => (
            <div key={key} className="text-[11px] leading-relaxed">
              <dt className="font-mono font-semibold text-[var(--pg-brand)]">
                {key}
              </dt>
              <dd className="font-mono whitespace-pre-wrap text-muted-foreground">
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
