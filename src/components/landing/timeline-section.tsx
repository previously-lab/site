import type { ReactNode } from "react";

/**
 * Wraps landing-page sections in the product's visual language:
 * a vertical spine with chapter dots, turning each section into
 * a conceptual "time slice" on the Previously timeline.
 */

/** The outer shell — provides the continuous spine line. */
export function TimelineShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* Continuous spine line — runs the full height behind all sections */}
      <div
        className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-border/60"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

/** A single "chapter" on the timeline — dot, label, and content. */
export function TimelineSection({
  label,
  children,
}: {
  /** Section label rendered above the content (use a ReactNode so
   *  NumberTicker can animate the digit). */
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="relative pb-20 sm:pb-28 lg:pb-36">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Dot column — the dot sits on the spine, aligned with the
            first heading inside the content area (mt-2.5 ≈ h2 center). */}
        <div className="flex w-8 sm:w-12 shrink-0 justify-center">
          <span
            className="mt-2.5 block h-2 w-2 rounded-full bg-foreground"
            aria-hidden="true"
          />
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0 pt-0">
          {/* Section label — monospace, like a timestamp. Rendered
              just above the title so the dot sits beside the title. */}
          <div className="mb-3 font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
            {label}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
