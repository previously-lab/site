"use client";

import { useRef } from "react";
import { useInView, motion } from "motion/react";

interface Phase {
  label: string;
  detail: string;
  delay: number;
  duration: "thinking" | "done";
}

const PHASES: Phase[] = [
  { label: "Segmenting time…", detail: "Identifying the current conversation window", delay: 0, duration: "done" },
  { label: "Scanning memory…", detail: "Found 12 historical slices in this time range", delay: 1.8, duration: "done" },
  { label: "Updating understanding…", detail: "+2 new observations · ↑1 reinforced · —", delay: 4.2, duration: "thinking" },
];

/**
 * Screen 4 visual: terminal-style phase indicator showing the agent's
 * thinking process step by step. CSS-driven typewriter effect with
 * a blinking cursor. Each phase reveals with staggered timing.
 */
export function ThinkingVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div
      ref={ref}
      className="w-full max-w-lg rounded-xl border border-border bg-card/80 p-5 shadow-sm sm:p-6"
      role="img"
      aria-label="Agent thinking phases shown transparently in real time"
    >
      {/* Terminal header */}
      <div className="mb-4 flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-destructive/30" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-muted-foreground/20" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-muted-foreground/20" aria-hidden="true" />
        <span className="ml-2 font-mono text-[0.65rem] text-muted-foreground/60">phase-indicator</span>
      </div>

      {/* Phase list */}
      <div className="space-y-3 font-mono text-xs sm:text-sm">
        {PHASES.map((phase, i) => (
          <motion.div
            key={i}
            className="flex flex-col gap-0.5"
            initial={{ opacity: 0, x: -4 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
            transition={{ duration: 0.4, delay: phase.delay * 0.25 }}
          >
            {/* Phase header row */}
            <div className="flex items-center gap-2">
              {/* Status icon */}
              {phase.duration === "done" ? (
                <motion.span
                  className="text-[0.65rem] text-muted-foreground/60"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: phase.delay * 0.25 + 0.3 }}
                >
                  ✓
                </motion.span>
              ) : (
                <motion.span
                  className="size-2.5 rounded-full border-2 border-[#0066FF] border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  aria-hidden="true"
                />
              )}
              <span className="text-foreground/90">{phase.label}</span>
              {phase.duration === "done" && (
                <motion.span
                  className="text-[0.6rem] text-muted-foreground/50"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: phase.delay * 0.25 + 0.5 }}
                >
                  0.{Math.floor(Math.random() * 3) + 1}s
                </motion.span>
              )}
            </div>

            {/* Detail line — indented, lighter */}
            <motion.p
              className="ml-5 text-[0.65rem] leading-relaxed text-muted-foreground/70 sm:text-xs"
              initial={{ opacity: 0, height: 0 }}
              animate={isInView ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3, delay: phase.delay * 0.25 + 0.15 }}
            >
              {phase.detail}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Blinking cursor — last line of "thinking" stream */}
      <motion.div
        className="mt-4 flex items-center gap-2 font-mono text-xs text-muted-foreground/80 sm:text-sm"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3, delay: 2 }}
      >
        <span className="inline-block h-3 w-[1px] animate-pulse bg-[#0066FF]" aria-hidden="true" />
        <span className="text-[0.65rem] italic text-muted-foreground/50">
          observing pattern: prefers concise answers…
        </span>
      </motion.div>
    </div>
  );
}
