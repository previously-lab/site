"use client";

import { useRef, useMemo } from "react";
import { useInView, motion } from "motion/react";

interface Phase {
  label: string;
  detail: string;
  delay: number;
  time: string;
  isLast?: boolean;
}

interface ThinkingVisualProps {
  terminalTitle: string;
  phase1Label: string;
  phase1Detail: string;
  phase2Label: string;
  phase2Detail: string;
  phase3Label: string;
  phase3Detail: string;
  cursorText: string;
}

export function ThinkingVisual({
  terminalTitle, phase1Label, phase1Detail, phase2Label, phase2Detail,
  phase3Label, phase3Detail, cursorText,
}: ThinkingVisualProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Stable random durations — computed once, never changes on re-render
  const phases: Phase[] = useMemo(() => [
    { label: phase1Label, detail: phase1Detail, delay: 0, time: `0.${1 + 0}s` },
    { label: phase2Label, detail: phase2Detail, delay: 1.8, time: `0.${2 + 0}s` },
    { label: phase3Label, detail: phase3Detail, delay: 4.2, time: `0.${3 + 0}s`, isLast: true },
  ], [phase1Label, phase1Detail, phase2Label, phase2Detail, phase3Label, phase3Detail]);

  return (
    <div ref={ref} className="w-full max-w-2xl rounded-xl border border-border bg-card/80 p-5 shadow-sm sm:p-6"
      role="img" aria-label="Agent thinking phases shown transparently in real time">
      {/* Terminal header */}
      <div className="mb-4 flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-destructive/30" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-muted-foreground/20" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-muted-foreground/20" aria-hidden="true" />
        <span className="ml-2 font-mono text-[0.65rem] text-muted-foreground/60">{terminalTitle}</span>
      </div>

      <div className="space-y-3 font-mono text-xs sm:text-sm">
        {phases.map((phase, i) => (
          <motion.div key={i} className="flex flex-col gap-0.5"
            initial={{ opacity: 0, x: -4 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
            transition={{ duration: 0.4, delay: phase.delay * 0.25 }}>
            <div className="flex items-center gap-2">
              {!phase.isLast ? (
                <motion.span className="text-[0.65rem] text-muted-foreground/60"
                  initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: phase.delay * 0.25 + 0.3 }}>✓</motion.span>
              ) : (
                <motion.span className="size-2.5 rounded-full border-2 border-[#0066FF] border-t-transparent"
                  animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} aria-hidden="true" />
              )}
              <span className="text-foreground/90">{phase.label}</span>
              {!phase.isLast && (
                <motion.span className="text-[0.6rem] text-muted-foreground/50"
                  initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: phase.delay * 0.25 + 0.5 }}>{phase.time}</motion.span>
              )}
            </div>
            <motion.p className="ml-5 text-[0.65rem] leading-relaxed text-muted-foreground/70 sm:text-xs"
              initial={{ opacity: 0, height: 0 }} animate={isInView ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3, delay: phase.delay * 0.25 + 0.15 }}>{phase.detail}</motion.p>
          </motion.div>
        ))}
      </div>

      <motion.div className="mt-4 flex items-center gap-2 font-mono text-xs text-muted-foreground/80 sm:text-sm"
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.3, delay: 2 }}>
        <span className="inline-block h-3 w-[1px] animate-pulse bg-[#0066FF]" aria-hidden="true" />
        <span className="text-[0.65rem] italic text-muted-foreground/50">{cursorText}</span>
      </motion.div>
    </div>
  );
}
