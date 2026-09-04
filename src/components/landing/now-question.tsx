import { siteConfig } from "@/lib/site";
import { ArrowRight } from "lucide-react";

export interface NowQuestionRef {
  /** Mono date chip, e.g. "2026/07/16". */
  date: string;
  /** One-line note about what that slice contributed. */
  note: string;
  /** Strand color key: running (amber) / alex (rose) / friends (blue). */
  color: string;
}

interface NowQuestionProps {
  question: string;
  answer: string;
  refs: NowQuestionRef[];
  /** Footer meta line, e.g. "one question → 3 slices · running × Alex". */
  meta: string;
  liveCta: string;
}

/**
 * The payoff of Act 1's NOW dot: once every thread converges, you can ask
 * ONE question across all of them. A static, product-styled illustration —
 * a question bubble plus a recall-style answer card whose references carry
 * the same strand colors as the timeline above — with a link to the live
 * demo. Static on purpose: the homepage narrative must never show a loading
 * or error state; the demo is one click away.
 */
export function NowQuestion({
  question,
  answer,
  refs,
  meta,
  liveCta,
}: NowQuestionProps): React.ReactElement {
  return (
    <div className="w-full max-w-xl">
      <div className="landing-fill-glass landing-stroke-hairline overflow-hidden rounded-xl border">
        <div className="space-y-3 px-4 py-4 sm:px-5">
          {/* The cross-strand question */}
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3.5 py-2 text-sm leading-relaxed">
              {question}
            </p>
          </div>

          {/* The answer built from multiple slices */}
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-foreground/90">
              {answer}
            </p>
            <ul className="space-y-1.5 border-l-2 border-border pl-3">
              {refs.map((r) => (
                <li key={r.date} className="flex items-baseline gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block size-1.5 shrink-0 translate-y-[-1px] rounded-full"
                    style={{ backgroundColor: r.color, boxShadow: `0 0 6px ${r.color}` }}
                  />
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {r.date}
                  </span>
                  <span className="text-xs text-muted-foreground/80">
                    {r.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer: what just happened + run it live */}
        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-2.5 sm:px-5">
          <p className="font-mono text-[11px] text-muted-foreground/70">
            {meta}
          </p>
          <a
            href={siteConfig.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {liveCta}
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
