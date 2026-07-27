"use client";

import { useRef, useState } from "react";
import { useInView, motion } from "motion/react";
import { TimeDisplay } from "./time-display";

// ISO timestamps so TimeDisplay can parse and animate each digit
const SLICES = [
  "2026-07-20T14:30:00",
  "2026-07-21T09:15:00",
  "2026-07-22T11:00:00",
  "2026-07-23T15:45:00",
  "2026-07-24T10:30:00",
  "2026-07-25T16:00:00",
  "2026-07-26T08:00:00",
  "2026-07-27T13:30:00",
];

const NOW_X = 770;

/**
 * Screen 5 visual: horizontal timeline strip matching the Aftrbrez
 * product's actual timeline style — date above, dot in middle,
 * time below, all connected by a single horizontal line.
 * Clean and minimal, no cards.
 */
export function TimeTravelVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeDot, setActiveDot] = useState<number | null>(null);

  return (
    <div
      ref={ref}
      className="w-full max-w-4xl overflow-x-auto scrollbar-none"
      role="img"
      aria-label="Interactive timeline — click any point to travel back to that conversation"
    >
      <div className="relative flex items-center justify-between px-4 py-4 min-w-full">
        {/* ── Horizontal connector line ── */}
        <motion.div
          className="absolute left-4 right-4 top-1/2 h-px -translate-y-px bg-border/40"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
          style={{ transformOrigin: "left center" }}
        />

        {/* ── Slice markers ── */}
        {SLICES.map((timestamp, i) => {
          const isActive = activeDot === i;
          return (
            <motion.button
              key={i}
              className="relative z-10 flex shrink-0 flex-col items-center gap-1 w-14 py-1 rounded-md transition-colors"
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.35, delay: 0.5 + i * 0.08 }}
              onMouseEnter={() => setActiveDot(i)}
              onMouseLeave={() => setActiveDot(null)}
              aria-label={`Slice: ${timestamp}`}
            >
              {/* Date — animated digit-by-digit */}
              <TimeDisplay timestamp={timestamp} mode="date" className="text-muted-foreground/50" />

              {/* Dot */}
              <motion.span
                className={`block rounded-full transition-colors ${
                  isActive
                    ? "h-2 w-2 bg-foreground ring-1 ring-foreground/10"
                    : "h-1.5 w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.15 }}
              />

              {/* Time — animated digit-by-digit */}
              <TimeDisplay timestamp={timestamp} mode="time" className="text-muted-foreground/40" />
            </motion.button>
          );
        })}

        {/* ── NOW node ── */}
        <motion.button
          className="relative z-10 flex shrink-0 flex-col items-center gap-1 w-14 py-1 rounded-md transition-colors"
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          onMouseEnter={() => setActiveDot(null)}
          aria-label="Now — return to live conversation"
        >
          <TimeDisplay timestamp={new Date().toISOString()} mode="date" className="text-muted-foreground/50" />

          {/* Hollow dot */}
          <motion.span
            className="block h-2 w-2 rounded-full border border-muted-foreground/30 bg-transparent transition-colors hover:border-muted-foreground/50"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <span className="font-mono text-[0.55rem] font-medium leading-none text-foreground/80">
            NOW
          </span>
        </motion.button>
      </div>
    </div>
  );
}
