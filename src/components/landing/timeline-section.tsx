import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ── Spine shell ─────────────────────────────────────────── */

export function TimelineShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* Continuous decorative spine — responsive: tighter on mobile, scales out on wider screens */}
      <div
        className="pointer-events-none absolute left-4 sm:left-6 lg:left-8 top-0 bottom-0 w-px -translate-x-1/2 bg-border/40"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

/* ── Single timeline row ────────────────────────────────── */

interface TimelineRowProps {
  /** Hierarchical number as a ReactNode — only section-level rows get a label. */
  number?: ReactNode;
  /** "section" = chapter dot (8px, foreground), "sub" = time dot (6px, muted). */
  level?: "section" | "sub";
  className?: string;
  children: ReactNode;
}

/**
 * A content row with a decorative timeline indicator hanging off the left side.
 *
 * Section-level rows show a dot + chapter number (● 01).
 * Sub-level rows show a dot only (○) — the hierarchy is expressed by content,
 * not by sub-numbering that has no reader value.
 *
 *   ● 01  Centered Title Text
 *   ○     Centered description
 *   ○     Full-width content
 */
export function TimelineRow({
  number,
  level = "sub",
  className,
  children,
}: TimelineRowProps) {
  const dot = cn(
    "shrink-0 rounded-full",
    level === "section"
      ? "h-2 w-2 bg-foreground"
      : "h-1.5 w-1.5 bg-muted-foreground",
  );

  return (
    <div className={cn("relative w-full", className)}>
      {/* Indicator — absolute on the spine, top-aligned with first line of text */}
      <div
        className="absolute left-4 sm:left-6 lg:left-8 top-0 flex items-center gap-2"
        aria-hidden="true"
      >
        <span
          className={cn(
            dot,
            level === "section" ? "ml-[-4px]" : "ml-[-3px]",
          )}
        />
        {number !== undefined && (
          <span className="font-mono text-[0.65rem] font-normal tracking-tighter text-muted-foreground/70">
            {number}
          </span>
        )}
      </div>

      {/* Content — symmetric padding reserves space for the indicator on the left */}
      <div className="w-full px-12 sm:px-20 lg:px-28">
        {children}
      </div>
    </div>
  );
}
