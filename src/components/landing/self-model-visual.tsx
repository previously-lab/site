"use client";

import { useRef } from "react";
import { useInView, motion } from "motion/react";

interface SelfModelVisualProps {
  cardTitle: string;
  identityLabel: string;
  identityValue: string;
  patternLabel: string;
  oldValue: string;
  newValue: string;
  newRef: string;
  behaviorLabel: string;
  behaviorValue: string;
  behaviorRef: string;
  recentLabel: string;
  recentItems: { text: string; meta: string }[];
  updatedNote: string;
}

const EASE = [0.25, 0.1, 0.25, 1] as const;

const EMERALD = "oklch(0.7 0.15 160)";
const RED = "oklch(0.65 0.19 25)";

/**
 * Act 3 visual — "A memory that evolves."
 * A compact glass user card whose entries animate over time: an old
 * line strikes through in red and is replaced, a "Habit" entry appears,
 * and "Recent" entries land in the real current-previously.md format
 * (refs + since) with emerald "+" markers — then a caret blinks at the
 * end. Emerald is this act's accent — the color of evolution diffs;
 * the caret stays brand blue (it is "happening now").
 */
export function SelfModelVisual({
  cardTitle,
  identityLabel,
  identityValue,
  patternLabel,
  oldValue,
  newValue,
  newRef,
  behaviorLabel,
  behaviorValue,
  behaviorRef,
  recentLabel,
  recentItems,
  updatedNote,
}: SelfModelVisualProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div
      ref={ref}
      className="relative w-full max-w-lg"
      role="img"
      aria-label={`${cardTitle}: ${updatedNote}`}
    >
      {/* Emerald stage glow behind the card — layered depth */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-3xl blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.7 0.15 160 / 12%) 0%, transparent 70%)",
        }}
      />
      <motion.div
        className="landing-glass relative rounded-xl border p-5 font-mono text-sm shadow-2xl shadow-black/50 backdrop-blur sm:p-6 sm:text-base"
        style={{
          boxShadow: `0 0 0 1px oklch(0.7 0.15 160 / 8%), 0 25px 50px -12px oklch(0 0 0 / 50%)`,
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between">
          <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground/60">
            {cardTitle}
          </span>
          <motion.span
            className="size-1.5 rounded-full"
            style={{
              backgroundColor: EMERALD,
              boxShadow: `0 0 8px ${EMERALD}`,
            }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: [0, 1, 0.4, 1] } : { opacity: 0 }}
            transition={{ duration: 1.2, delay: 3.6 }}
            aria-hidden="true"
          />
        </div>

        <div className="mt-4 space-y-3">
          {/* Identity — stable */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, x: -6 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
            transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
          >
            <span className="w-16 shrink-0 text-muted-foreground/60">{identityLabel}</span>
            <span className="text-foreground/85">{identityValue}</span>
          </motion.div>

          {/* Pattern — the old belief strikes through in red, replaced */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, x: -6 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
            transition={{ duration: 0.4, delay: 0.6, ease: EASE }}
          >
            <span className="w-16 shrink-0 text-muted-foreground/60">{patternLabel}</span>
            <span className="flex flex-col gap-1">
              <motion.span
                className="relative inline-block w-fit"
                initial={{ opacity: 1, color: "oklch(0.66 0 0)" }}
                animate={
                  isInView ? { opacity: 0.45, color: RED } : { opacity: 1 }
                }
                transition={{ duration: 0.4, delay: 1.6 }}
              >
                {oldValue}
                <motion.span
                  className="absolute left-0 top-1/2 h-px w-full origin-left"
                  style={{ backgroundColor: RED, boxShadow: `0 0 4px ${RED}` }}
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.45, delay: 1.3, ease: "easeInOut" }}
                  aria-hidden="true"
                />
              </motion.span>
              <motion.span
                className="flex flex-wrap items-baseline gap-2"
                initial={{ opacity: 0, y: 4 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                transition={{ duration: 0.4, delay: 1.9, ease: EASE }}
              >
                <span className="text-foreground/85">{newValue}</span>
                <span className="text-[0.65rem]" style={{ color: EMERALD }}>
                  {newRef}
                </span>
              </motion.span>
            </span>
          </motion.div>

          {/* Habit — a learned behavior appears, emerald "+" like a diff */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, x: -6 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
            transition={{ duration: 0.4, delay: 2.2, ease: EASE }}
          >
            <span className="w-16 shrink-0 text-muted-foreground/60">{behaviorLabel}</span>
            <span className="flex flex-wrap items-baseline gap-2">
              <span
                className="font-semibold"
                style={{ color: EMERALD, textShadow: `0 0 8px oklch(0.7 0.15 160 / 50%)` }}
                aria-hidden="true"
              >
                +
              </span>
              <span className="text-foreground/85">{behaviorValue}</span>
              <span className="text-[0.65rem]" style={{ color: EMERALD }}>
                {behaviorRef}
              </span>
            </span>
          </motion.div>

          {/* Recent — real current-previously.md entries with refs + since */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, x: -6 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
            transition={{ duration: 0.4, delay: 2.7, ease: EASE }}
          >
            <span className="w-16 shrink-0 text-muted-foreground/60">{recentLabel}</span>
            <span className="flex flex-col gap-3">
              {recentItems.map((item, i) => (
                <motion.span
                  key={item.meta}
                  className="flex flex-col gap-1"
                  initial={{ opacity: 0, y: 4 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                  transition={{ duration: 0.4, delay: 2.9 + i * 0.35, ease: EASE }}
                >
                  <span className="flex flex-wrap items-baseline gap-2">
                    <span
                      className="font-semibold"
                      style={{ color: EMERALD, textShadow: `0 0 8px oklch(0.7 0.15 160 / 50%)` }}
                      aria-hidden="true"
                    >
                      +
                    </span>
                    <span className="text-foreground/85">{item.text}</span>
                  </span>
                  <span className="pl-4 text-[0.65rem] text-muted-foreground/50 tabular-nums">
                    {item.meta}
                  </span>
                </motion.span>
              ))}
            </span>
          </motion.div>

          {/* Caret — the card is still being written */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3, delay: 3.8 }}
          >
            <span
              aria-hidden="true"
              className="animate-caret-blink -mb-0.5 inline-block h-3.5 w-[7px] bg-[oklch(0.6_0.23_260)]"
            />
          </motion.div>
        </div>

        {/* Footer note */}
        <motion.p
          className="landing-border mt-4 border-t pt-3 text-xs italic text-muted-foreground/50"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 4.0 }}
        >
          {updatedNote}
        </motion.p>
      </motion.div>
    </div>
  );
}
