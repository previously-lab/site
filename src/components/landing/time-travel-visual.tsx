"use client";

import { useRef, useState } from "react";
import { useInView, motion } from "motion/react";

interface TimelineDot {
  date: string;
  time: string;
  cx: number;
  isNow?: boolean;
}

const DOTS: TimelineDot[] = [
  { date: "Jul 20", time: "14:30", cx: 60 },
  { date: "Jul 21", time: "09:15", cx: 140 },
  { date: "Jul 22", time: "11:00", cx: 220 },
  { date: "Jul 23", time: "15:45", cx: 300 },
  { date: "Jul 24", time: "10:30", cx: 380 },
  { date: "Jul 25", time: "16:00", cx: 460 },
  { date: "Jul 26", time: "08:00", cx: 540 },
  { date: "Jul 27", time: "13:30", cx: 620 },
];

/**
 * Screen 5 visual: interactive horizontal timeline preview.
 * Dots pulse on hover, clicking a dot reveals a slice preview card.
 * The NOW node (hollow circle) sits at the far right with a subtle glow.
 */
export function TimeTravelVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeDot, setActiveDot] = useState<number | null>(null);

  return (
    <div
      ref={ref}
      className="w-full max-w-4xl"
      role="img"
      aria-label="Interactive timeline — click any point to travel back to that conversation"
    >
      <svg
        viewBox="0 0 720 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full cursor-default"
        aria-hidden="true"
      >
        {/* The timeline line */}
        <motion.line
          x1="40"
          y1="55"
          x2="680"
          y2="55"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-border/60"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
          strokeDasharray="1"
          strokeDashoffset="0"
        />

        {/* ← Load earlier button */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: 1.4 }}
        >
          <text x="15" y="52" textAnchor="start" className="fill-muted-foreground/40 text-[7px]">
            ← Earlier
          </text>
        </motion.g>

        {/* Dots with date/time labels */}
        {DOTS.map((dot, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.35, delay: 0.5 + i * 0.1 }}
            onMouseEnter={() => setActiveDot(i)}
            onMouseLeave={() => setActiveDot(null)}
            className="cursor-pointer"
          >
            {/* Date above */}
            <text
              x={dot.cx}
              y="38"
              textAnchor="middle"
              className="fill-muted-foreground/60 text-[7px]"
            >
              {dot.date}
            </text>

            {/* Dot */}
            <motion.circle
              cx={dot.cx}
              cy="55"
              r={activeDot === i ? 5 : 3.5}
              fill="currentColor"
              className={activeDot === i ? "text-foreground" : "text-muted-foreground/50"}
              animate={
                activeDot === i
                  ? { scale: [1, 1.2, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.6, repeat: activeDot === i ? Infinity : 0 }}
            />

            {/* Outer glow ring on hover */}
            {activeDot === i && (
              <motion.circle
                cx={dot.cx}
                cy="55"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-foreground/20"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0.3, 0, 0.3], scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}

            {/* Time below */}
            <text
              x={dot.cx}
              y="70"
              textAnchor="middle"
              className="fill-muted-foreground/40 text-[6px]"
            >
              {dot.time}
            </text>

            {/* Slice card preview on hover */}
            {activeDot === i && (
              <motion.g
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <rect
                  x={dot.cx - 30}
                  y={8}
                  width="60"
                  height="18"
                  rx="3"
                  className="fill-card stroke-border"
                  strokeWidth="0.5"
                />
                <text
                  x={dot.cx}
                  y={20}
                  textAnchor="middle"
                  className="fill-foreground/80 text-[7px] font-medium"
                >
                  {dot.date} {dot.time}
                </text>
                <line
                  x1={dot.cx}
                  y1={26}
                  x2={dot.cx}
                  y2={dot.isNow ? 48 : 48}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-border"
                />
              </motion.g>
            )}
          </motion.g>
        ))}

        {/* NOW node — hollow circle at the right */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          {/* Glow */}
          <motion.circle
            cx="680"
            cy="55"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-[#0066FF]/20"
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx="680" cy="55" r="5" className="fill-background stroke-foreground" strokeWidth="2" />
          <text x="680" y="70" textAnchor="middle" className="fill-foreground text-[8px] font-semibold">
            NOW
          </text>
        </motion.g>
      </svg>
    </div>
  );
}
