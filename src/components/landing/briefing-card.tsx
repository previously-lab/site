"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface BriefingEntry {
  time: string;
  text: string;
}

export interface BriefingData {
  title: string;
  recapLabel: string;
  entries: BriefingEntry[];
  focusLabel: string;
  focusText: string;
  threadsLabel: string;
  threadsText: string;
}

interface Segment {
  text: string;
  className?: string;
}

interface Line {
  segments: Segment[];
  className?: string;
}

interface BriefingCardProps {
  data: BriefingData;
  /** Seconds to wait after mount before typing begins. */
  delay?: number;
  className?: string;
}

const CHAR_MS = 18;

/**
 * The hero centerpiece — an "arrival briefing" card styled like the real
 * product's briefing. It types itself out: a recap with time-anchored
 * entries (time in oklch(0.6 0.23 260) — time is the accent), a focus line, and open
 * threads, with a blinking caret.
 *
 * The typewriter is a semantic animation: this is what the product shows
 * when you come back. Under prefers-reduced-motion it renders fully typed.
 */
export function BriefingCard({
  data,
  delay = 0.7,
  className,
}: BriefingCardProps): React.ReactElement {
  const reducedMotion = useReducedMotion();

  const lines = useMemo<Line[]>(
    () => [
      {
        segments: [{ text: `▸ ${data.title}`, className: "text-muted-foreground/60" }],
        className: "font-mono",
      },
      {
        segments: [{ text: data.recapLabel, className: "text-muted-foreground" }],
        className: "mt-3 font-mono text-[0.65rem] uppercase tracking-widest",
      },
      ...data.entries.map<Line>((entry) => ({
        segments: [
          { text: entry.time, className: "text-[oklch(0.6_0.23_260)]" },
          { text: `  ${entry.text}`, className: "text-foreground/85" },
        ],
        className: "mt-1.5",
      })),
      {
        segments: [
          { text: `${data.focusLabel}: `, className: "text-muted-foreground" },
          { text: data.focusText, className: "text-foreground/85" },
        ],
        className: "mt-3",
      },
      {
        segments: [
          { text: `${data.threadsLabel}: `, className: "text-muted-foreground" },
          { text: data.threadsText, className: "text-foreground/85" },
        ],
        className: "mt-1.5",
      },
    ],
    [data],
  );

  const totalChars = useMemo(
    () =>
      lines.reduce(
        (sum, line) =>
          sum + line.segments.reduce((s, seg) => s + seg.text.length, 0),
        0,
      ),
    [lines],
  );

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(totalChars);
      return;
    }
    setProgress(0);
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = (next: number) => {
      if (cancelled) return;
      setProgress(next);
      if (next < totalChars) {
        timer = setTimeout(() => tick(next + 1), CHAR_MS);
      }
    };

    timer = setTimeout(() => tick(1), delay * 1000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reducedMotion, totalChars, delay]);

  // Walk lines/segments and slice each one to the current progress.
  let consumed = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay * 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "landing-glass w-full max-w-xl rounded-xl border p-5 text-left font-mono text-xs leading-relaxed shadow-2xl shadow-black/50 backdrop-blur sm:text-sm",
        className,
      )}
    >
      {lines.map((line, li) => {
        const rendered = line.segments.map((seg, si) => {
          const start = consumed;
          consumed += seg.text.length;
          const visible = Math.max(0, Math.min(progress - start, seg.text.length));
          const isTypingEnd =
            progress > start && progress <= start + seg.text.length;
          return (
            <span key={si} className={seg.className}>
              {seg.text.slice(0, visible)}
              {isTypingEnd && progress < totalChars && (
                <span
                  aria-hidden="true"
                  className="animate-caret-blink -mb-0.5 ml-px inline-block h-3.5 w-[7px] bg-[oklch(0.6_0.23_260)]"
                />
              )}
            </span>
          );
        });
        const started = progress > consumed - line.segments.reduce((s, seg) => s + seg.text.length, 0);
        return (
          <p key={li} className={cn(line.className, !started && "opacity-0")}>
            {rendered}
          </p>
        );
      })}
      {/* Resting caret once fully typed — the briefing is ready, NOW */}
      {progress >= totalChars && (
        <p className="mt-1.5">
          <span
            aria-hidden="true"
            className="animate-caret-blink -mb-0.5 inline-block h-3.5 w-[7px] bg-[oklch(0.6_0.23_260)]"
          />
        </p>
      )}
    </motion.div>
  );
}
