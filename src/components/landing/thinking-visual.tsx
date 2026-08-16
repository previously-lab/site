"use client";

import { useRef } from "react";
import { useInView, motion } from "motion/react";

interface ThinkingVisualProps {
  terminalTitle: string;
  /** The user's question — the cross-time recall being demoed. */
  query: string;
  workerLabel: string;
  workerDetail: string;
  pointersLabel: string;
  mainLabel: string;
  mainDetail: string;
  answerLabel: string;
  sliceSummaries: string[];
}

const EASE = [0.25, 0.1, 0.25, 1] as const;
const BLUE = "oklch(0.6 0.23 260)";

/** Scan sweep timing — the glowing worker line passing over summaries. */
const SCAN_START = 0.7;
const SCAN_DURATION = 1.3;

/**
 * Act 3 visual — "No black box."
 * The two-tier recall pipeline running in a glass terminal with a faint
 * blue rim light: a worker scan sweeps a glowing line over the slice
 * summaries, pointers come back, then the main model deep-reads the
 * slice that matters. Every step shows its state — spinning while
 * active, checked when done. The sweep is transform-only.
 */
export function ThinkingVisual({
  terminalTitle,
  query,
  workerLabel,
  workerDetail,
  pointersLabel,
  mainLabel,
  mainDetail,
  answerLabel,
  sliceSummaries,
}: ThinkingVisualProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const scanEnd = SCAN_START + SCAN_DURATION;
  const pointersAt = scanEnd + 0.3;
  const mainAt = pointersAt + 0.4;
  const answerAt = mainAt + 1.1;

  return (
    <div
      ref={ref}
      className="w-full max-w-3xl"
      role="img"
      aria-label={`${terminalTitle}: ${workerLabel}, ${pointersLabel}, ${mainLabel}`}
    >
      <motion.div
        className="landing-glass rounded-xl border p-6 font-mono text-sm backdrop-blur sm:p-8 sm:text-base"
        style={{
          /* blue rim light + deep drop shadow */
          boxShadow: `0 0 0 1px oklch(0.6 0.23 260 / 10%), 0 0 42px -8px oklch(0.6 0.23 260 / 22%), 0 25px 50px -12px oklch(0 0 0 / 55%)`,
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* Terminal header */}
        <div className="mb-4 flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/25" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" aria-hidden="true" />
          <span className="ml-2 text-[0.65rem] text-muted-foreground/60">{terminalTitle}</span>
        </div>

        {/* The query being recalled */}
        <motion.p
          className="mb-4 flex items-baseline gap-2"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <span className="shrink-0 text-muted-foreground/50" aria-hidden="true">❯</span>
          <span className="text-foreground/90">{query}</span>
        </motion.p>

        {/* Step 1 — worker scan */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -4 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <span className="relative flex size-2.5 shrink-0 items-center justify-center">
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-t-transparent"
              style={{ borderColor: BLUE, borderTopColor: "transparent" }}
              initial={{ opacity: 1 }}
              animate={isInView ? { rotate: 360, opacity: 0 } : { opacity: 1 }}
              transition={{
                rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                opacity: { duration: 0.2, delay: pointersAt },
              }}
              aria-hidden="true"
            />
            <motion.span
              className="absolute inset-0 flex items-center justify-center text-[0.65rem] text-muted-foreground/70"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.2, delay: pointersAt }}
              aria-hidden="true"
            >
              ✓
            </motion.span>
          </span>
          <span className="text-foreground/90">{workerLabel}</span>
          <span className="text-[0.65rem] text-muted-foreground/60">{workerDetail}</span>
        </motion.div>

        {/* Slice summaries — the glowing scan line sweeps down over them */}
        <div className="landing-border relative ml-5 mt-2 space-y-1 overflow-hidden rounded-md border-l py-1 pl-3">
          {sliceSummaries.map((summary, i) => (
            <motion.p
              key={summary}
              className="px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground/70 sm:text-sm"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
            >
              {summary}
            </motion.p>
          ))}
          {/* Scan bar — translateY only, real glow */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-5"
            style={{
              background: `linear-gradient(to bottom, transparent, oklch(0.6 0.23 260 / 22%), transparent)`,
              boxShadow: `0 0 16px oklch(0.6 0.23 260 / 45%)`,
            }}
            initial={{ y: "-100%", opacity: 0 }}
            animate={
              isInView ? { y: ["-100%", "620%"], opacity: [0, 1, 1, 0] } : { opacity: 0 }
            }
            transition={{
              duration: SCAN_DURATION + 0.4,
              delay: SCAN_START,
              times: [0, 0.15, 0.9, 1],
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Worker done — pointers returned */}
        <motion.div
          className="mt-3 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: pointersAt }}
        >
          <span className="text-[0.65rem] text-muted-foreground/70" aria-hidden="true">✓</span>
          <span
            className="tabular-nums"
            style={{ color: BLUE, textShadow: `0 0 10px oklch(0.6 0.23 260 / 45%)` }}
          >
            {pointersLabel}
          </span>
        </motion.div>

        {/* Step 2 — main model deep read */}
        <motion.div
          className="mt-3"
          initial={{ opacity: 0, x: -4 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
          transition={{ duration: 0.4, delay: mainAt }}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5 shrink-0 items-center justify-center">
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-t-transparent"
                style={{ borderColor: BLUE, borderTopColor: "transparent" }}
                initial={{ opacity: 1 }}
                animate={isInView ? { rotate: 360, opacity: 0 } : { opacity: 1 }}
                transition={{
                  rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                  opacity: { duration: 0.2, delay: answerAt - 0.3 },
                }}
                aria-hidden="true"
              />
              <motion.span
                className="absolute inset-0 flex items-center justify-center text-[0.65rem] text-muted-foreground/70"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.2, delay: answerAt - 0.3 }}
                aria-hidden="true"
              >
                ✓
              </motion.span>
            </span>
            <span className="text-foreground/90">{mainLabel}</span>
            <span className="text-[0.65rem] text-muted-foreground/60">{mainDetail}</span>
          </div>
        </motion.div>

        {/* Answer streams — caret blinks, the run is live */}
        <motion.div
          className="landing-border mt-4 flex items-center gap-2 border-t pt-3"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: answerAt }}
        >
          <span className="text-xs italic text-muted-foreground/60 sm:text-sm">
            {answerLabel}
          </span>
          <span
            aria-hidden="true"
            className="animate-caret-blink -mb-0.5 inline-block h-3.5 w-[7px] bg-[oklch(0.6_0.23_260)]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
