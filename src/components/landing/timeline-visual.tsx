"use client";

import { useRef, useState } from "react";
import { useInView, motion } from "motion/react";

interface TimelineVisualProps {
  beforeCardLabels: string[];
  afterCardLabels: string[];
  beforeLabel: string;
  afterLabel: string;
  strandWork: string;
  strandTravel: string;
  earlierLabel: string;
  nowLabel: string;
  legendText: string;
}

/* ── Layout constants ─────────────────────────────────── */

const CARD_W = 100;
const CARD_H = 26;
const DOT_Y = 115;
const CARD_CENTER_Y = 65;

const SCATTERED = [
  { cx: 140, cy: 40 }, { cx: 420, cy: 30 }, { cx: 670, cy: 44 },
  { cx: 210, cy: 120 }, { cx: 500, cy: 110 }, { cx: 680, cy: 130 },
];

const TIMELINE_X = [100, 218, 336, 454, 572, 690];
const NOW_X = 755;

const DATES = ["Jul 20", "Jul 21", "Jul 22", "Jul 23", "Jul 24", "Jul 25"] as const;

function Card({ cx, cy, label, muted, isHovered }: {
  cx: number; cy: number; label: string; muted?: boolean; isHovered?: boolean;
}) {
  const halfW = CARD_W / 2;
  const halfH = CARD_H / 2;
  return (
    <g>
      {isHovered && (
        <rect x={cx - halfW - 3} y={cy - halfH - 3} width={CARD_W + 6} height={CARD_H + 6} rx={7} className="fill-[#0066FF]/8" />
      )}
      <rect x={cx - halfW} y={cy - halfH} width={CARD_W} height={CARD_H} rx={5}
        className={muted
          ? isHovered ? "fill-muted/90 stroke-foreground/30" : "fill-muted/70 stroke-border/60"
          : isHovered ? "fill-card stroke-foreground/40" : "fill-card stroke-border"}
        strokeWidth={isHovered ? 1 : 0.75}
      />
      <text x={cx} y={cy + 4} textAnchor="middle"
        className={muted
          ? isHovered ? "fill-foreground/90 text-[9px] font-medium" : "fill-foreground/70 text-[9px] font-medium"
          : "fill-foreground/85 text-[9px] font-medium"}
      >{label}</text>
    </g>
  );
}

export function TimelineVisual({
  beforeCardLabels, afterCardLabels, beforeLabel, afterLabel,
  strandWork, strandTravel, earlierLabel, nowLabel, legendText,
}: TimelineVisualProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredBefore, setHoveredBefore] = useState<number | null>(null);
  const [hoveredAfter, setHoveredAfter] = useState<number | null>(null);

  const strands = [
    { ids: [0, 2, 5], color: "#0066FF", label: strandWork, labelX: 218 },
    { ids: [1, 3, 4], color: "oklch(0.7 0.12 85)", label: strandTravel, labelX: 336 },
  ] as const;

  return (
    <div ref={ref} className="w-full" role="img" aria-label={`${beforeLabel}. ${afterLabel}.`}>
      {/* ═══ TOP — Before ═══ */}
      <div className="mb-6">
        <motion.p className="mb-6 text-center text-[11px] font-medium text-muted-foreground/60"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          {beforeLabel}
        </motion.p>
        <svg viewBox="0 0 800 170" fill="none" className="w-full" aria-hidden="true">
          {beforeCardLabels.slice(0, 6).map((label, i) => {
            const isHovered = hoveredBefore === i;
            return (
              <motion.g key={`before-${i}`}
                initial={{ opacity: 0, y: -6 }}
                animate={isInView ? { opacity: 1, y: 0, scale: isHovered ? 1.06 : 1 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setHoveredBefore(i)} onMouseLeave={() => setHoveredBefore(null)}
                style={{ cursor: "pointer" }}
              >
                <Card cx={SCATTERED[i].cx} cy={SCATTERED[i].cy} label={label} muted isHovered={isHovered} />
              </motion.g>
            );
          })}
          <motion.g initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.2 } : { opacity: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="text-muted-foreground/40">
            <line x1={190} y1={40} x2={160} y2={120} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1={370} y1={30} x2={190} y2={40} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
            <line x1={260} y1={120} x2={450} y2={110} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 2" />
          </motion.g>
        </svg>
      </div>

      {/* Divider */}
      <motion.hr className="my-10 border-border/20"
        initial={{ opacity: 0, scaleX: 0 }} animate={isInView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }} />

      {/* ═══ BOTTOM — After ═══ */}
      <div className="mt-6">
        <motion.p className="mb-6 text-center text-[11px] font-semibold text-foreground/70"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.4, delay: 1.4 }}>
          {afterLabel}
        </motion.p>
        <svg viewBox="0 0 800 200" fill="none" className="w-full" aria-hidden="true">
          <motion.line x1={TIMELINE_X[0]} y1={DOT_Y} x2={NOW_X} y2={DOT_Y} stroke="currentColor" strokeWidth="1.5" className="text-foreground/70"
            initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.9, delay: 1.5, ease: "easeInOut" }} strokeDasharray="1" strokeDashoffset="0" />

          {strands.map((strand, si) => {
            const arcY = CARD_CENTER_Y - CARD_H / 2 - 8;
            const points = strand.ids.map((id) => TIMELINE_X[id]);
            const d = points.map((x, pi) => {
              if (pi === 0) return `M ${x} ${arcY}`;
              return `Q ${(points[pi - 1] + x) / 2} ${arcY - 22} ${x} ${arcY}`;
            }).join(" ");
            return (
              <motion.g key={`strand-${si}`} initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 2.4 + si * 0.3 }}>
                <path d={d} fill="none" stroke={strand.color} strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
                <text x={strand.labelX} y={arcY - 28} textAnchor="middle" fill={strand.color} className="text-[7px] font-medium" opacity="0.6">
                  {strand.label}
                </text>
              </motion.g>
            );
          })}

          {afterCardLabels.slice(0, 6).map((label, i) => {
            const cx = TIMELINE_X[i];
            const isHovered = hoveredAfter === i;
            return (
              <motion.g key={`after-${i}`} initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1, scale: isHovered ? 1.05 : 1 } : { opacity: 0 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setHoveredAfter(i)} onMouseLeave={() => setHoveredAfter(null)}
                style={{ cursor: "pointer" }}
              >
                <line x1={cx} y1={CARD_CENTER_Y + CARD_H / 2} x2={cx} y2={DOT_Y - 4} stroke="currentColor" strokeWidth="0.75" className="text-border/50" />
                <Card cx={cx} cy={CARD_CENTER_Y} label={label} isHovered={isHovered} />
                <motion.circle cx={cx} cy={DOT_Y} r={isHovered ? 5.5 : 4} className="fill-foreground/80" />
                <text x={cx} y={DOT_Y + 16} textAnchor="middle" className="fill-muted-foreground/50 text-[7px]">{DATES[i]}</text>
              </motion.g>
            );
          })}

          <motion.g initial={{ opacity: 0, scale: 0 }} animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }} transition={{ duration: 0.5, delay: 2.6 }}>
            <motion.circle cx={NOW_X} cy={DOT_Y} r="10" fill="none" stroke="#0066FF" strokeWidth="0.75"
              animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.25, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
            <circle cx={NOW_X} cy={DOT_Y} r="5" className="fill-background stroke-foreground" strokeWidth="2" />
            <text x={NOW_X} y={DOT_Y + 16} textAnchor="middle" className="fill-foreground text-[8px] font-bold">{nowLabel}</text>
          </motion.g>

          <motion.text x={TIMELINE_X[0] - 12} y={DOT_Y + 5} textAnchor="end" className="fill-muted-foreground/40 text-[7px]"
            initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.3, delay: 2.8 }}>
            {earlierLabel}
          </motion.text>
        </svg>

        <motion.p className="mt-3 text-right text-[7px] italic text-muted-foreground/35"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.4, delay: 2.9 }}>
          {legendText}
        </motion.p>
      </div>
    </div>
  );
}
