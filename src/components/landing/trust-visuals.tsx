"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, motion, useReducedMotion } from "motion/react";

const EASE = [0.25, 0.1, 0.25, 1] as const;

/* ── Card 1: a slice being written into your repo ───────── */

export interface RepoVisualProps {
  root: string;
  /** Tree rows — text includes the tree-drawing prefix; note annotates. */
  rows: { text: string; note?: string }[];
  file: string;
  lines: string[];
}

export function RepoVisual({ root, rows, file, lines }: RepoVisualProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className="font-mono text-[0.65rem] leading-relaxed">
      {/* File tree — the real storage layout in YOUR repo */}
      <div className="text-muted-foreground/60">
        <p className="text-foreground/70">{root}</p>
        {rows.map((row) => (
          <p key={row.text} className="whitespace-pre">
            {row.text}
            {row.note && (
              <span className="text-[oklch(0.7_0.12_85)]/80">{"  "}{row.note}</span>
            )}
          </p>
        ))}
      </div>
      {/* previously.md being written, line by line */}
      <div className="landing-border mt-2 border-t pt-2">
        <p className="mb-1 text-[oklch(0.6_0.23_260)]">{file}</p>
        {lines.map((line, i) => (
          <motion.p
            key={line}
            className="tabular-nums text-muted-foreground/80"
            initial={{ opacity: 0, x: -4 }}
            animate={isInView ? { opacity: 1, x: 0 } : reduced ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.45, ease: EASE }}
          >
            {line}
          </motion.p>
        ))}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : reduced ? { opacity: 1 } : {}}
          transition={{ duration: 0.2, delay: 0.4 + lines.length * 0.45 }}
        >
          <span
            aria-hidden="true"
            className="animate-caret-blink -mb-0.5 inline-block h-3 w-[6px] bg-[oklch(0.6_0.23_260)]"
          />
        </motion.p>
      </div>
    </div>
  );
}

/* ── Card 2: tab closes, the run continues, then resumes ── */

export interface RunVisualProps {
  tabLabel: string;
  closedLabel: string;
  runningLabel: string;
  resumedLabel: string;
}

const AMBER = "oklch(0.7 0.12 85)";
const TICK_MS = 120;
const RUN_TICKS = 22; /* ~2.6s of visible "still running" */

function formatElapsed(ticks: number): string {
  const seconds = ticks; /* 1 demo-second per tick */
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `+${mm}:${ss}`;
}

export function RunVisual({ tabLabel, closedLabel, runningLabel, resumedLabel }: RunVisualProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [ticks, setTicks] = useState(0);

  const running = isInView && !reduced && ticks < RUN_TICKS;
  const resumed = reduced || ticks >= RUN_TICKS;

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setTicks((t) => t + 1), ticks === 0 ? 700 : TICK_MS);
    return () => clearTimeout(timer);
  }, [running, ticks]);

  return (
    <div ref={ref} className="space-y-2 font-mono text-[0.65rem] leading-relaxed">
      {/* The tab */}
      <p className="truncate text-muted-foreground/60">{tabLabel}</p>
      <p className="text-muted-foreground/50">
        <span aria-hidden="true" className="mr-1.5">✕</span>
        {closedLabel}
      </p>
      {/* The run keeps going, elapsed ticking */}
      <p className="flex items-center gap-1.5">
        {resumed ? (
          <span style={{ color: AMBER }} aria-hidden="true">✓</span>
        ) : (
          <motion.span
            className="inline-block size-2 rounded-full border-2 border-t-transparent"
            style={{ borderColor: AMBER, borderTopColor: "transparent" }}
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          />
        )}
        <span className="text-foreground/80">{runningLabel}</span>
        <span className="tabular-nums text-muted-foreground/60">
          {formatElapsed(reduced ? RUN_TICKS : ticks)}
        </span>
      </p>
      {/* Resumed where you left off */}
      <motion.p
        className="flex items-center gap-1.5"
        initial={{ opacity: 0, y: 4 }}
        animate={resumed ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <span
          className="inline-block size-1.5 rounded-full"
          style={{ backgroundColor: AMBER, boxShadow: `0 0 6px ${AMBER}` }}
          aria-hidden="true"
        />
        <span className="text-foreground/80">{resumedLabel}</span>
      </motion.p>
    </div>
  );
}

/* ── Card 3: one command, no strings attached ───────────── */

export interface OssVisualProps {
  command: string;
  badges: string[];
}

export function OssVisual({ command, badges }: OssVisualProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(0);

  const done = reduced || typed >= command.length;
  const badgesDelay = reduced ? 0 : command.length * 0.024 + 0.4;

  useEffect(() => {
    if (!isInView || reduced || typed >= command.length) return;
    const timer = setTimeout(() => setTyped((t) => t + 1), typed === 0 ? 500 : 24);
    return () => clearTimeout(timer);
  }, [isInView, reduced, typed, command.length]);

  return (
    <div ref={ref} className="font-mono text-[0.65rem] leading-relaxed">
      <p className="text-foreground/85">
        <span className="mr-1.5 text-muted-foreground/50" aria-hidden="true">$</span>
        {command.slice(0, reduced ? command.length : typed)}
        {!done && (
          <span
            aria-hidden="true"
            className="animate-caret-blink -mb-0.5 ml-px inline-block h-3 w-[6px] bg-[oklch(0.7_0.15_160)]"
          />
        )}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {badges.map((badge, i) => (
          <motion.span
            key={badge}
            className="landing-glass rounded-full border px-2 py-0.5 text-[0.6rem] text-muted-foreground/80"
            initial={{ opacity: 0, y: 4 }}
            animate={isInView ? { opacity: 1, y: 0 } : reduced ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: badgesDelay + i * 0.15, ease: EASE }}
          >
            {badge}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
