"use client";

import { useRef } from "react";
import { useInView, motion } from "motion/react";

const STATS = [
  { label: "MIT License", value: "" },
  { label: "Self-hosted", value: "" },
  { label: "No telemetry", value: "" },
  { label: "Community-driven", value: "" },
];

/**
 * Screen 8 visual: simple, confident typography with badges reinforcing
 * the open-source nature of the project. Clean and minimal — lets the
 * message speak without visual distraction.
 */
export function OpenSourceVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div
      ref={ref}
      className="flex flex-wrap items-center justify-center gap-3"
      role="img"
      aria-label="MIT licensed, self-hosted, no telemetry, community-driven"
    >
      {STATS.map((stat, i) => (
        <motion.div
          key={i}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2"
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.35, delay: 0.2 + i * 0.12 }}
        >
          {/* Check icon */}
          <svg
            viewBox="0 0 16 16"
            className="size-3.5 shrink-0 text-muted-foreground/50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <motion.path
              d="M3 8l3.5 3.5L13 5"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.12 }}
              strokeDasharray="1"
              strokeDashoffset="0"
            />
          </svg>
          <span className="text-xs font-medium text-foreground/70 sm:text-sm">{stat.label}</span>
        </motion.div>
      ))}

      {/* GitHub stats — subtle, appears last */}
      <motion.div
        className="mt-6 flex w-full items-center justify-center gap-6"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.9 }}
      >
        {/* Star count */}
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" className="size-4 text-muted-foreground/60" fill="currentColor" aria-hidden="true">
            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
          </svg>
          <span className="font-mono text-xs text-muted-foreground/70">Stars on GitHub</span>
        </div>
        {/* Divider */}
        <span className="text-border/60" aria-hidden="true">·</span>
        {/* MIT */}
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" className="size-4 text-muted-foreground/60" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span className="font-mono text-xs text-muted-foreground/70">MIT Licensed</span>
        </div>
      </motion.div>
    </div>
  );
}
