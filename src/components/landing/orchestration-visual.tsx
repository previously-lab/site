"use client";

import { motion, useReducedMotion } from "motion/react";

interface OrchestrationVisualProps {
  hubLabel: string;
  hubDetail: string;
  w1Label: string;
  w1Detail: string;
  w2Label: string;
  w2Detail: string;
  w3Label: string;
  w3Detail: string;
  w4Label: string;
  w4Detail: string;
}

const BLUE = "oklch(0.6 0.23 260)";
const ROSE = "oklch(0.72 0.14 350)";
const AMBER = "oklch(0.7 0.12 85)";
const EMERALD = "oklch(0.7 0.15 160)";

/* Hub left-center; four specialist cards stacked right. */
const HUB = { x: 60, y: 210, w: 220, h: 76 } as const;
const HUB_EDGE = { x: HUB.x + HUB.w, y: HUB.y + HUB.h / 2 } as const;
const CARD = { x: 640, w: 300, h: 76 } as const;

const CYCLE = 8.8;

/**
 * Act 4 visual — "Specialists, not brute force."
 * Hub-and-spoke: a glass "main agent" node on the left dispatches work
 * along straight connectors to four specialist cards on the right —
 * recall (blue), think (rose), search (amber), curate (emerald).
 * A dispatch pulse travels hub → specialist, the card lights up as its
 * pulse arrives, then a fainter return pulse travels back. One full
 * loop cycles the four specialists in sequence. Transform/opacity
 * only; reduced motion renders the finished end-state, all cards lit.
 */
export function OrchestrationVisual({
  hubLabel,
  hubDetail,
  w1Label,
  w1Detail,
  w2Label,
  w2Detail,
  w3Label,
  w3Detail,
  w4Label,
  w4Detail,
}: OrchestrationVisualProps): React.ReactElement {
  const reduced = useReducedMotion();

  const workers = [
    { label: w1Label, detail: w1Detail, color: BLUE, y: 34 },
    { label: w2Label, detail: w2Detail, color: ROSE, y: 151 },
    { label: w3Label, detail: w3Detail, color: AMBER, y: 268 },
    { label: w4Label, detail: w4Detail, color: EMERALD, y: 385 },
  ];

  return (
    <div
      className="w-full"
      role="img"
      aria-label={`${hubLabel} → ${w1Label}, ${w2Label}, ${w3Label}, ${w4Label}`}
    >
      <svg viewBox="0 0 1000 500" fill="none" className="w-full" aria-hidden="true">
        {/* Connectors + dispatch/return pulses */}
        {workers.map((w, i) => {
          const cardCY = w.y + CARD.h / 2;
          const dx = CARD.x - HUB_EDGE.x;
          const dy = cardCY - HUB_EDGE.y;
          const at = (i * CYCLE) / workers.length;
          return (
            <g key={w.label}>
              <line
                x1={HUB_EDGE.x}
                y1={HUB_EDGE.y}
                x2={CARD.x}
                y2={cardCY}
                strokeWidth={1}
                className="landing-stroke-hairline"
              />
              {!reduced && (
                <>
                  {/* Dispatch pulse — hub → specialist */}
                  <motion.circle
                    cx={HUB_EDGE.x}
                    cy={HUB_EDGE.y}
                    r={4}
                    fill={w.color}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{
                      x: [0, dx],
                      y: [0, dy],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: CYCLE,
                      times: [0, 0.16, 0.2, 0.24],
                      delay: at,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  {/* Return pulse — specialist → hub, fainter */}
                  <motion.circle
                    cx={CARD.x}
                    cy={cardCY}
                    r={3}
                    fill={w.color}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{
                      x: [0, -dx],
                      y: [0, -dy],
                      opacity: [0, 0.55, 0.55, 0],
                    }}
                    transition={{
                      duration: CYCLE,
                      times: [0.3, 0.44, 0.48, 0.52],
                      delay: at,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Hub — the main agent */}
        <g>
          <rect
            x={HUB.x}
            y={HUB.y}
            width={HUB.w}
            height={HUB.h}
            rx={12}
            className="landing-fill-glass landing-stroke-hairline"
            strokeWidth={1}
          />
          <circle cx={HUB.x + 30} cy={HUB.y + 26} r={5} fill={BLUE} />
          <text
            x={HUB.x + 50}
            y={HUB.y + 31}
            className="fill-foreground/90 font-mono text-[16px] font-medium"
          >
            {hubLabel}
          </text>
          <text
            x={HUB.x + 50}
            y={HUB.y + 56}
            className="fill-muted-foreground/70 font-mono text-[12px]"
          >
            {hubDetail}
          </text>
          {!reduced && (
            <motion.circle
              cx={HUB.x + HUB.w}
              cy={HUB.y + HUB.h / 2}
              r={6}
              fill="none"
              stroke={BLUE}
              strokeWidth={1}
              animate={{ opacity: [0, 0.5, 0], scale: [1, 1.8, 1] }}
              transition={{ duration: CYCLE / workers.length, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: `${HUB.x + HUB.w}px ${HUB.y + HUB.h / 2}px` }}
            />
          )}
        </g>

        {/* Specialist cards — light in sequence as dispatches arrive */}
        {workers.map((w, i) => {
          const at = (i * CYCLE) / workers.length;
          return (
            <motion.g
              key={w.label}
              initial={reduced ? undefined : { opacity: 0.45 }}
              animate={reduced ? undefined : { opacity: [0.45, 1, 1, 0.45] }}
              transition={
                reduced
                  ? undefined
                  : {
                      duration: CYCLE,
                      times: [0, 0.2, 0.34, 0.5],
                      delay: at,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            >
              <rect
                x={CARD.x}
                y={w.y}
                width={CARD.w}
                height={CARD.h}
                rx={12}
                className="landing-fill-glass landing-stroke-hairline"
                strokeWidth={1}
              />
              <circle cx={CARD.x + 30} cy={w.y + 26} r={5} fill={w.color} />
              <text
                x={CARD.x + 50}
                y={w.y + 31}
                className="fill-foreground/90 font-mono text-[15px] font-medium"
              >
                {w.label}
              </text>
              <text
                x={CARD.x + 50}
                y={w.y + 56}
                className="fill-muted-foreground/70 font-mono text-[12px]"
              >
                {w.detail}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
