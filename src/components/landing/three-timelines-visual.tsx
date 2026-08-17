"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

export interface ThreeTimelineNode {
  time: string;
  text: string;
}

interface ThreeTimelinesVisualProps {
  agentLabel: string;
  agentFile: string;
  coreLabel: string;
  coreFile: string;
  lifeLabel: string;
  lifeFile: string;
  /** Its thinking — three nodes, dim until they light in sequence. */
  agentNodes: ThreeTimelineNode[];
  /** The shared record — two events, received from right and left. */
  coreEvents: ThreeTimelineNode[];
  /** Your life — five nodes, the last one is the one that gets shared. */
  lifeNodes: ThreeTimelineNode[];
}

const BLUE = "oklch(0.6 0.23 260)";
const GREY = "oklch(0.556 0 0)";

/* ── Scroll choreography — seven phases, evenly spaced across the
   full progress range (the section is ~2 viewports tall, so each
   phase gets its own beat while scrolling):
   spines → life nodes → highlight → travel → agent chain →
   return → core glow. ── */
const R = {
  spine: [0.02, 0.12],
  lifeAt: (i: number) => [0.1 + i * 0.035, 0.145 + i * 0.035],
  highlight: [0.3, 0.37],
  chip1: [0.38, 0.52],
  core1: [0.5, 0.57],
  agentAt: (i: number) => [0.58 + i * 0.05, 0.63 + i * 0.05],
  chip2: [0.74, 0.85],
  core2: [0.84, 0.89],
  glow: [0.9, 0.98],
};

interface ChipPos {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

/* ── Small scroll-driven pieces ─────────────────────────── */

function Spine({ p, reduced, bright }: { p: MotionValue<number>; reduced: boolean | null; bright?: boolean }) {
  const scaleY = useTransform(p, R.spine, [0, 1]);
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute bottom-2 left-[3px] top-2 w-px origin-top ${bright ? "bg-foreground/30" : "bg-foreground/15"}`}
      style={reduced ? undefined : { scaleY }}
    />
  );
}

function NodeCard({
  time,
  text,
  color,
  chain,
  cardRef,
}: ThreeTimelineNode & { color: string; chain?: boolean; cardRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div className="relative pl-5 sm:pl-6">
      <span
        aria-hidden="true"
        className="absolute left-0 top-2.5 inline-block size-1.5 rounded-full"
        style={
          chain
            ? { backgroundColor: BLUE, boxShadow: `0 0 8px ${BLUE}` }
            : { backgroundColor: color }
        }
      />
      <div
        ref={cardRef}
        className={`landing-glass rounded-lg border px-2 py-1.5 backdrop-blur sm:px-2.5 sm:py-2 ${
          chain ? "border-l-2 border-l-[oklch(0.6_0.23_260)]" : ""
        }`}
      >
        <p className="font-mono text-[10px] tabular-nums text-muted-foreground/60">{time}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-foreground/85 sm:text-xs">{text}</p>
      </div>
    </div>
  );
}

/** A glowing pill that carries a timestamp between columns — transform-only. */
function TravelChip({
  p,
  reduced,
  pos,
  range,
  time,
}: {
  p: MotionValue<number>;
  reduced: boolean | null;
  pos: ChipPos | null;
  range: number[];
  time: string;
}) {
  const x = useTransform(p, range, [0, pos?.dx ?? 0]);
  const y = useTransform(p, range, [0, pos?.dy ?? 0]);
  const opacity = useTransform(
    p,
    [range[0], range[0] + 0.03, range[1] - 0.03, range[1]],
    [0, 1, 1, 0],
  );
  if (reduced || !pos) return null;
  return (
    <motion.div
      aria-hidden="true"
      className="landing-glass pointer-events-none absolute z-10 rounded-md border px-2 py-1 font-mono text-[10px] tabular-nums backdrop-blur"
      style={{
        left: pos.x,
        top: pos.y,
        x,
        y,
        opacity,
        color: BLUE,
        boxShadow: `0 0 14px oklch(0.6 0.23 260 / 35%)`,
      }}
    >
      {time}
    </motion.div>
  );
}

/* ── The visual ─────────────────────────────────────────── */

/**
 * Act 2 visual — "Three timelines." Two subjects, three timelines,
 * side by side in the vertical-timeline language (hairline spines, mono
 * tabular-nums timestamps, glass nodes): its thinking (agent.md), the
 * shared record (core.md), your life (unwritten by definition). All
 * three columns share one fixed height, so the spines are exactly
 * equal — nodes distribute along the shared length. Hierarchy: the
 * related chain (shared 22:05 life node → core events → agent chain)
 * reads as one blue path; the four unshared life events sit back in
 * grey at half opacity — texture, not story. Scroll-driven with a
 * ~2-viewport runway so each phase gets its own beat; chip deltas are
 * measured from real node positions, recomputed on resize. Reduced
 * motion renders the finished end-state with everything lit.
 */
export function ThreeTimelinesVisual({
  agentLabel,
  agentFile,
  coreLabel,
  coreFile,
  lifeLabel,
  lifeFile,
  agentNodes,
  coreEvents,
  lifeNodes,
}: ThreeTimelinesVisualProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });

  /* Chip endpoints — measured from real node positions */
  const lifeSharedRef = useRef<HTMLDivElement>(null);
  const coreInRef = useRef<HTMLDivElement>(null);
  const agentOutRef = useRef<HTMLDivElement>(null);
  const coreOutRef = useRef<HTMLDivElement>(null);
  const [chip1, setChip1] = useState<ChipPos | null>(null);
  const [chip2, setChip2] = useState<ChipPos | null>(null);

  const measure = useCallback(() => {
    const c = ref.current?.getBoundingClientRect();
    if (!c) return;
    const place = (
      from: React.RefObject<HTMLDivElement | null>,
      to: React.RefObject<HTMLDivElement | null>,
    ): ChipPos | null => {
      const f = from.current?.getBoundingClientRect();
      const t = to.current?.getBoundingClientRect();
      if (!f || !t) return null;
      return {
        x: f.left - c.left,
        y: f.top - c.top,
        dx: t.left - f.left,
        dy: t.top - f.top,
      };
    };
    setChip1(place(lifeSharedRef, coreInRef));
    setChip2(place(agentOutRef, coreOutRef));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /* Life — the shared node gets a highlight ring before it travels */
  const lifeSharedRing = useTransform(p, R.highlight, [0, 1]);
  /* Core events — received; then both glow at the end */
  const core1Opacity = useTransform(p, R.core1, [0, 1]);
  const core2Opacity = useTransform(p, R.core2, [0, 1]);
  const coreGlow = useTransform(p, R.glow, [0, 1]);

  const columnBody =
    "relative flex h-[26rem] flex-col justify-between sm:h-[24rem]";

  return (
    <div
      ref={ref}
      className="relative w-full max-w-6xl py-[7vh]"
      role="img"
      aria-label={`${lifeLabel} · ${coreLabel} · ${agentLabel}`}
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-6">
        {/* Left — its thinking · agent.md (dim until it lights) */}
        <div>
          <header className="mb-4 pl-5 sm:pl-6">
            <p className="text-xs font-medium text-foreground/80 sm:text-sm">{agentLabel}</p>
            <p className="font-mono text-[10px] text-muted-foreground/60 sm:text-xs">{agentFile}</p>
          </header>
          <div className={columnBody}>
            <Spine p={p} reduced={reduced} />
            {agentNodes.map((node, i) => (
              <AgentNode
                key={node.time}
                p={p}
                reduced={reduced}
                index={i}
                node={node}
                cardRef={i === agentNodes.length - 1 ? agentOutRef : undefined}
              />
            ))}
          </div>
        </div>

        {/* Center — the shared record · core.md (part of the blue chain) */}
        <div>
          <header className="mb-4 pl-5 sm:pl-6">
            <p className="text-xs font-medium text-foreground sm:text-sm">{coreLabel}</p>
            <p className="font-mono text-[10px] text-muted-foreground/60 sm:text-xs">{coreFile}</p>
          </header>
          <div className={columnBody}>
            <Spine p={p} reduced={reduced} bright />
            {coreEvents.map((event, i) => (
              <motion.div
                key={event.time + i}
                className="relative"
                style={reduced ? undefined : { opacity: i === 0 ? core1Opacity : core2Opacity }}
              >
                {/* End-state glow — radial gradient, opacity only */}
                <motion.div
                  aria-hidden="true"
                  className="absolute -inset-2 rounded-xl"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, var(--glow-blue) 0%, transparent 70%)",
                    opacity: reduced ? 1 : coreGlow,
                  }}
                />
                <NodeCard {...event} color={BLUE} chain cardRef={i === 0 ? coreInRef : coreOutRef} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right — your life · unwritten. Four unshared events sit back
            in grey at half opacity; the shared one joins the blue chain. */}
        <div>
          <header className="mb-4 pl-5 sm:pl-6">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">{lifeLabel}</p>
            <p className="font-mono text-[10px] text-muted-foreground/50 sm:text-xs">{lifeFile}</p>
          </header>
          <div className={columnBody}>
            <Spine p={p} reduced={reduced} />
            {lifeNodes.map((node, i) => {
              const shared = i === lifeNodes.length - 1;
              return (
                <LifeNode
                  key={node.time}
                  p={p}
                  reduced={reduced}
                  index={i}
                  node={node}
                  shared={shared}
                  cardRef={shared ? lifeSharedRef : undefined}
                  ring={shared ? lifeSharedRing : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Traveling copies — measured deltas, transform/opacity only */}
      <TravelChip p={p} reduced={reduced} pos={chip1} range={R.chip1} time="22:05" />
      <TravelChip p={p} reduced={reduced} pos={chip2} range={R.chip2} time="22:07" />
    </div>
  );
}

/* Agent node — dim (0.3) until its step in the sequence lights it;
   lit state joins the blue chain */
function AgentNode({
  p,
  reduced,
  index,
  node,
  cardRef,
}: {
  p: MotionValue<number>;
  reduced: boolean | null;
  index: number;
  node: ThreeTimelineNode;
  cardRef?: React.Ref<HTMLDivElement>;
}) {
  const [r0, r1] = R.agentAt(index);
  const opacity = useTransform(p, [r0 - 0.01, r0, r1], [0.3, 0.3, 1]);
  return (
    <motion.div style={reduced ? undefined : { opacity }}>
      <NodeCard {...node} color={BLUE} chain cardRef={cardRef} />
    </motion.div>
  );
}

/* Life node — staggered fade-in. Unshared events cap at half opacity
   (texture, not story); the shared one lights fully and gets a ring. */
function LifeNode({
  p,
  reduced,
  index,
  node,
  shared,
  cardRef,
  ring,
}: {
  p: MotionValue<number>;
  reduced: boolean | null;
  index: number;
  node: ThreeTimelineNode;
  shared: boolean;
  cardRef?: React.Ref<HTMLDivElement>;
  ring?: MotionValue<number>;
}) {
  const opacity = useTransform(p, R.lifeAt(index), [0, shared ? 1 : 0.5]);
  return (
    <motion.div className="relative" style={reduced ? { opacity: shared ? 1 : 0.5 } : { opacity }}>
      {ring && (
        <motion.div
          aria-hidden="true"
          className="absolute -inset-1 rounded-lg border"
          style={{
            borderColor: BLUE,
            boxShadow: `0 0 12px oklch(0.6 0.23 260 / 30%)`,
            opacity: reduced ? 1 : ring,
          }}
        />
      )}
      <NodeCard {...node} color={shared ? BLUE : GREY} chain={shared} cardRef={cardRef} />
    </motion.div>
  );
}
