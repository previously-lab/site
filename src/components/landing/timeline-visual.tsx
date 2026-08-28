"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

export interface TimelineBeat {
  date: string;
  title: string;
  desc: string;
}

interface TimelineVisualProps {
  /** Era marker at the top of the spine, e.g. "2025". */
  year: string;
  /** 7 story beats — title + 1–2 sentence description per card. */
  beats: TimelineBeat[];
  strandFriends: string;
  strandRunning: string;
  strandFamily: string;
  strandAlex: string;
  strandCamping: string;
  legendText: string;
  /**
   * The payoff that replaces the NOW dot at the very end of the scroll:
   * once every strand has converged, NOW fades out and this node fades in
   * at the same spot — one question answered across all strands.
   */
  payoff?: ReactNode;
}

/* ── Strand colors ──────────────────────────────────────── */

const BLUE = "oklch(0.6 0.23 260)";
const AMBER = "oklch(0.7 0.12 85)";
const EMERALD = "oklch(0.7 0.15 160)";
const ROSE = "oklch(0.72 0.14 350)";
const VIOLET = "oklch(0.68 0.16 300)";
const GREY = "oklch(0.556 0 0)";

/** Per-beat strand color: friends / running / family / Alex+camping /
    work (grey one-off) / running×Alex crossing / friends. */
const BEAT_STRAND = [BLUE, AMBER, EMERALD, ROSE, GREY, ROSE, BLUE] as const;

/** Five strands — all threads converge into NOW. */
const STRANDS = [
  { color: BLUE, beats: [0, 6], range: [0.34, 0.7] },
  { color: AMBER, beats: [1, 5], range: [0.4, 0.76] },
  { color: EMERALD, beats: [2], range: [0.46, 0.82] },
  { color: ROSE, beats: [3, 5], range: [0.5, 0.84] },
  { color: VIOLET, beats: [3], range: [0.54, 0.88] },
] as const;

/* ── Two layout constant sets — desktop alternates cards left/right;
      mobile pins the spine left and stacks full-width cards. ── */

interface Layout {
  viewBox: string;
  width: number;
  spineX: number;
  spineY0: number;
  nowY: number;
  beatY: readonly number[];
  cardW: number;
  cardH: number;
  /** -1 = card hangs left of the spine, 1 = right. */
  cardSide: readonly number[];
  /** X of the strand dot at a beat on the given side. */
  strandDotX: (side: number) => number;
  bandX: number;
  bandW: number;
  bandFrom: number;
  bandTo: number;
  falloff: number;
}

const DESKTOP: Layout = {
  viewBox: "0 0 1200 2260",
  width: 1200,
  spineX: 600,
  spineY0: 100,
  nowY: 2160,
  beatY: [260, 510, 760, 1010, 1260, 1510, 1760],
  cardW: 420,
  cardH: 120,
  cardSide: [-1, 1, -1, 1, -1, 1, -1],
  strandDotX: (side) => (side === -1 ? 90 : 1110),
  bandX: 60,
  bandW: 1080,
  bandFrom: 220,
  bandTo: 1880,
  falloff: 700,
};

const MOBILE: Layout = {
  viewBox: "0 0 720 2160",
  width: 720,
  spineX: 96,
  spineY0: 90,
  nowY: 2060,
  beatY: [270, 530, 790, 1050, 1310, 1570, 1830],
  cardW: 540,
  cardH: 128,
  cardSide: [1, 1, 1, 1, 1, 1, 1],
  strandDotX: () => 150,
  bandX: 40,
  bandW: 640,
  bandFrom: 230,
  bandTo: 1960,
  falloff: 640,
};

/** Mobile strand lanes — one vertical rail per strand, between spine and cards. */
function laneX(strandIndex: number): number {
  return 140 - strandIndex * 9;
}

/** Wheel falloff — a beat is fully lit at the band, faded far from it. */
function proximity(L: Layout, center: number, beatY: number): number {
  return Math.max(0, 1 - Math.abs(center - beatY) / L.falloff);
}

function cardX(L: Layout, side: number): number {
  if (L === MOBILE) return 150;
  return side === -1 ? 90 : L.width - 90 - L.cardW;
}

function strandPathDesktop(L: Layout, beats: readonly number[]): string {
  const pts: { x: number; y: number }[] = beats.map((b) => ({
    x: L.strandDotX(L.cardSide[b]),
    y: L.beatY[b],
  }));
  pts.push({ x: L.spineX, y: L.nowY - 16 });
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const midY = (pts[i - 1].y + pts[i].y) / 2;
    d += ` C ${pts[i - 1].x} ${midY} ${pts[i].x} ${midY} ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

function strandPathMobile(L: Layout, strandIndex: number, beats: readonly number[]): string {
  const x = laneX(strandIndex);
  const pts: { x: number; y: number }[] = beats.map((b) => ({ x, y: L.beatY[b] }));
  /* Down the lane, then a tight S-curve into the NOW dot. */
  pts.push({ x, y: L.nowY - 140 });
  pts.push({ x: L.spineX, y: L.nowY - 16 });
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const midY = (pts[i - 1].y + pts[i].y) / 2;
    d += ` C ${pts[i - 1].x} ${midY} ${pts[i].x} ${midY} ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

/* ── Scroll-driven pieces ──────────────────────────────── */

interface Driven {
  band: MotionValue<number>;
  reduced: boolean | null;
  L: Layout;
}

function Beat({ band, reduced, L, index, beat }: Driven & { index: number; beat: TimelineBeat }) {
  const y = L.beatY[index];
  const side = L.cardSide[index];
  const color = BEAT_STRAND[index];
  const mobile = L === MOBILE;
  /* Wheel feel — mirror the product: scale 1→0.68, opacity 1→0.3 by distance */
  const opacity = useTransform(band, (c) => 0.3 + 0.7 * proximity(L, c, y));
  const scale = useTransform(band, (c) => 0.68 + 0.32 * proximity(L, c, y));
  const glow = useTransform(band, (c) => proximity(L, c, y) * 0.5);

  const x = cardX(L, side);
  const cardCX = x + L.cardW / 2;
  const dateX = mobile ? x : side === -1 ? L.spineX + 22 : L.spineX - 22;
  const dateY = mobile ? y - L.cardH / 2 - 12 : y - 24;
  const dateAnchor = mobile || side === -1 ? ("start" as const) : ("end" as const);

  return (
    <motion.g
      style={
        reduced
          ? undefined
          : { opacity, scale, transformOrigin: `${cardCX}px ${y}px` }
      }
    >
      {/* Strand-colored glow when the band passes — radial gradient fill
          (no feGaussianBlur; compositor-friendly), animated opacity */}
      <motion.circle
        cx={cardCX}
        cy={y}
        r={mobile ? 130 : 120}
        fill={`url(#bg-${index})`}
        style={reduced ? { opacity: 0.18 } : { opacity: glow }}
      />
      {/* Glass beat card */}
      <rect
        x={x}
        y={y - L.cardH / 2}
        width={L.cardW}
        height={L.cardH}
        rx={10}
        className="landing-fill-glass landing-stroke-hairline"
        strokeWidth={1}
      />
      {/* Title + description — HTML inside the SVG so text wraps */}
      <foreignObject x={x} y={y - L.cardH / 2} width={L.cardW} height={L.cardH}>
        <div className="flex h-full flex-col justify-center gap-1 px-4">
          <p className={`flex items-center gap-2 font-semibold text-foreground/90 ${mobile ? "text-[15px]" : "text-[14px]"}`}>
            <span
              aria-hidden="true"
              className="inline-block size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
            />
            {beat.title}
          </p>
          <p className={`leading-snug text-muted-foreground/75 ${mobile ? "text-[12px]" : "text-[11.5px]"}`}>
            {beat.desc}
          </p>
        </div>
      </foreignObject>
      {/* Connector to the spine */}
      <line
        x1={side === -1 ? x + L.cardW : x}
        y1={y}
        x2={side === -1 ? L.spineX - 10 : L.spineX + 10}
        y2={y}
        strokeWidth={1}
        className="landing-stroke-hairline"
      />
      <circle cx={L.spineX} cy={y} r={4.5} className="fill-foreground/70" />
      {/* Mono timestamp — desktop: on the spine opposite the card;
          mobile: above the card */}
      <text
        x={dateX}
        y={dateY}
        textAnchor={dateAnchor}
        className={`fill-muted-foreground/60 font-mono tabular-nums ${mobile ? "text-[15px]" : "text-[14px]"}`}
      >
        {beat.date}
      </text>
    </motion.g>
  );
}

function Strand({ p, reduced, L, strand, strandIndex }: { p: MotionValue<number>; reduced: boolean | null; L: Layout; strand: (typeof STRANDS)[number]; strandIndex: number }) {
  const pathLength = useTransform(p, [strand.range[0], strand.range[1]], [0, 1]);
  const opacity = useTransform(p, [strand.range[0], strand.range[0] + 0.05], [0, 1]);
  const mobile = L === MOBILE;
  const d = mobile
    ? strandPathMobile(L, strandIndex, strand.beats)
    : strandPathDesktop(L, strand.beats);
  const pl = reduced ? 1 : pathLength;
  /* Dot offset so two strands sharing a beat (05/10, 06/28) stay visible */
  const dotOffset = (strandIndex - 2) * 7;
  return (
    <motion.g style={reduced ? undefined : { opacity }}>
      {/* Glow underlay — a soft wide stroke behind the crisp line,
          instead of a drop-shadow filter */}
      <motion.path
        d={d}
        fill="none"
        stroke={strand.color}
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.22"
        style={{ pathLength: pl }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={strand.color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
        style={{ pathLength: pl }}
      />
      {strand.beats.map((b) => {
        const dotX = mobile ? laneX(strandIndex) : L.strandDotX(L.cardSide[b]);
        const dotY = mobile ? L.beatY[b] : L.beatY[b] + dotOffset;
        return (
          <g key={b}>
            {mobile && (
              <line
                x1={dotX}
                y1={dotY}
                x2={150}
                y2={dotY}
                strokeWidth={1}
                className="landing-stroke-hairline"
              />
            )}
            <circle cx={dotX} cy={dotY} r={4} fill={strand.color} opacity="0.9" />
          </g>
        );
      })}
    </motion.g>
  );
}

function SelectionBand({ band, reduced, L }: Driven) {
  const y = useTransform(band, (c) => c - 75);
  const opacity = useTransform(band, [L.bandFrom, L.bandFrom + 120, L.bandTo - 140, L.bandTo], [0, 1, 1, 0]);
  if (reduced) return null;
  return (
    <motion.g style={{ y, opacity }}>
      <rect x={L.bandX} y={0} width={L.bandW} height={150} rx={12} className="landing-fill-glass" />
      <line x1={L.bandX} x2={L.bandX + L.bandW} y1={0} y2={0} strokeWidth={1} className="landing-stroke-hairline" />
      <line x1={L.bandX} x2={L.bandX + L.bandW} y1={150} y2={150} strokeWidth={1} className="landing-stroke-hairline" />
    </motion.g>
  );
}

/* ── The visual ────────────────────────────────────────── */

/**
 * Act 1 visual — "Time, not threads.", the product's vertical timeline
 * wheel at full scale: a wide, long canvas so scrolling down feels like
 * time flowing past. Beat cards carry a bold title plus a 1–2 sentence
 * description (HTML in foreignObject, so text wraps); five strands —
 * friends (blue), running (amber), family (emerald), Alex (rose),
 * camping (violet) — weave between their beats, cross at 05/10 and
 * 06/28, and all converge into the hollow NOW dot: NOW is where all
 * threads meet. One muted grey beat (work) stays strandless. Glows are
 * radial-gradient fills and wide underlay strokes — no SVG filters.
 *
 * Two layout constant sets, switched live via matchMedia: desktop
 * alternates cards left/right of a central spine; mobile pins the spine
 * left (~13%), stacks full-width cards to its right, and simplifies
 * strands to per-strand lanes with short S-curve convergence into NOW.
 * Reduced motion renders the finished end-state, band hidden.
 */
export function TimelineVisual({
  year,
  beats,
  strandFriends,
  strandRunning,
  strandFamily,
  strandAlex,
  strandCamping,
  legendText,
  payoff,
}: TimelineVisualProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const L = isDesktop ? DESKTOP : MOBILE;
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.6"],
  });

  const spinePL = useTransform(p, [0.02, 0.28], [0, 1]);
  const band = useTransform(p, [0.15, 0.92], [L.bandFrom, L.bandTo]);
  /* NOW appears once the strands have converged — and when a payoff is
     attached, it fades back out at the very end as the payoff takes over. */
  const nowOpacity = useTransform(
    p,
    payoff ? [0.86, 0.92, 0.93, 0.98] : [0.86, 0.92],
    payoff ? [0, 1, 1, 0] : [0, 1],
  );
  const nowScale = useTransform(p, [0.86, 0.92], [0.4, 1]);
  const payoffOpacity = useTransform(p, [0.93, 0.98], [0, 1]);
  const payoffY = useTransform(p, [0.93, 0.98], [20, 0]);

  return (
    <div ref={ref} className="w-full" role="img" aria-label={legendText}>
      <div className="relative">
        {/* Gradient beam traveling down the spine */}
        <div
          aria-hidden="true"
          className="absolute top-[5%] h-[86%] w-px"
          style={{ left: `${(L.spineX / L.width) * 100}%` }}
        >
          <div
            className="landing-beam-y h-[14%] w-px"
            style={{
              background: `linear-gradient(to bottom, transparent, ${BLUE}, transparent)`,
              boxShadow: `0 0 8px oklch(0.6 0.23 260 / 60%)`,
            }}
          />
        </div>

        <svg viewBox={L.viewBox} fill="none" className="w-full" aria-hidden="true">
          <defs>
            {/* Per-beat radial glow gradients (color → transparent) */}
            {BEAT_STRAND.map((color, i) => (
              <radialGradient key={`bg-${i}`} id={`bg-${i}`}>
                <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Era marker at the top of the spine */}
          <line x1={L.spineX} y1={L.spineY0 - 52} x2={L.spineX} y2={L.spineY0} strokeWidth={1} className="landing-stroke-hairline" />
          <text
            x={L.spineX + 18}
            y={L.spineY0 - 18}
            className="fill-muted-foreground font-mono text-[18px] font-semibold tabular-nums"
          >
            {year}
          </text>

          {/* The spine draws itself in */}
          <motion.line
            x1={L.spineX}
            y1={L.spineY0}
            x2={L.spineX}
            y2={L.nowY}
            strokeWidth="2"
            className="text-foreground/60"
            stroke="currentColor"
            style={{ pathLength: reduced ? 1 : spinePL }}
          />

          {/* The traveling selection band — the wheel's center */}
          <SelectionBand band={band} reduced={reduced} L={L} />

          {/* Story beats */}
          {beats.slice(0, 7).map((beat, i) => (
            <Beat
              key={`beat-${i}`}
              band={band}
              reduced={reduced}
              L={L}
              index={i}
              beat={beat}
            />
          ))}

          {/* Five strands weaving between their beats, into NOW */}
          {STRANDS.map((strand, i) => (
            <Strand
              key={strand.color}
              p={p}
              reduced={reduced}
              L={L}
              strand={strand}
              strandIndex={i}
            />
          ))}

          {/* Hollow NOW dot at the bottom of the spine — all threads meet here */}
          <motion.g
            style={
              reduced
                ? { filter: "drop-shadow(0 0 8px oklch(0.6 0.23 260 / 80%))" }
                : {
                    opacity: nowOpacity,
                    scale: nowScale,
                    transformOrigin: `${L.spineX}px ${L.nowY}px`,
                    filter: "drop-shadow(0 0 8px oklch(0.6 0.23 260 / 80%))",
                  }
            }
          >
            <motion.circle
              cx={L.spineX}
              cy={L.nowY}
              r="14"
              fill="none"
              stroke={BLUE}
              strokeWidth="1"
              animate={{ opacity: [0.15, 0.4, 0.15], scale: [1, 1.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <circle cx={L.spineX} cy={L.nowY} r="7" fill="none" stroke={BLUE} strokeWidth="2" />
            {/* Bilingual brand lockup — both words in both locales */}
            <text x={L.spineX} y={L.nowY + 40} textAnchor="middle" className="fill-foreground font-mono text-[24px] font-bold">
              NOW
            </text>
            <text x={L.spineX} y={L.nowY + 64} textAnchor="middle" className="fill-muted-foreground/60 font-mono text-[13px]">
              现在
            </text>
          </motion.g>
        </svg>
      </div>

      {/* The payoff of NOW — scroll-driven crossfade: the NOW dot fades
          out and this node fades in right where attention already is. */}
      {payoff && (
        <motion.div
          style={reduced ? undefined : { opacity: payoffOpacity, y: payoffY }}
          className="mt-8 mb-12 flex justify-center sm:mb-16"
        >
          {payoff}
        </motion.div>
      )}

      {/* Strand legend — crisp HTML, not SVG text */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2 font-mono text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          {[
            { color: BLUE, label: strandFriends },
            { color: AMBER, label: strandRunning },
            { color: EMERALD, label: strandFamily },
            { color: ROSE, label: strandAlex },
            { color: VIOLET, label: strandCamping },
          ].map((s) => (
            <span key={s.color} className="flex items-center gap-1.5 text-muted-foreground/70">
              <span
                aria-hidden="true"
                className="inline-block size-1.5 rounded-full"
                style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}` }}
              />
              {s.label}
            </span>
          ))}
        </div>
        <p className="italic text-muted-foreground/40">{legendText}</p>
      </div>
    </div>
  );
}
