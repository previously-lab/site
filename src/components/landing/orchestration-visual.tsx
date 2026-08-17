"use client";

import { useEffect, useState } from "react";
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

const CYCLE = 8.8;

/* ── Two layout constant sets, switched live via matchMedia.
      Desktop: hub-and-spoke — hub left, four cards right.
      Mobile: vertical — hub on top, four full-width cards stacked,
      a spine down the middle, dispatches travel downward. ── */

interface Layout {
  viewBox: string;
  hub: { x: number; y: number; w: number; h: number };
  /** Where dispatches leave the hub. */
  hubEdge: { x: number; y: number };
  cardX: number;
  cardW: number;
  cardH: number;
  cardY: readonly number[];
  /** Where the connector for card i starts (desktop: always the hub;
      mobile: the hub, then the previous card's bottom edge). */
  connectorFrom: (i: number, L: Layout) => { x: number; y: number };
  /** Where the connector for card i arrives. */
  cardEdge: (i: number, L: Layout) => { x: number; y: number };
}

const DESKTOP: Layout = {
  viewBox: "0 0 1000 500",
  hub: { x: 60, y: 210, w: 220, h: 76 },
  hubEdge: { x: 280, y: 248 },
  cardX: 640,
  cardW: 300,
  cardH: 76,
  cardY: [34, 151, 268, 385],
  connectorFrom: (_i, L) => L.hubEdge,
  cardEdge: (i, L) => ({ x: L.cardX, y: L.cardY[i] + L.cardH / 2 }),
};

const MOBILE: Layout = {
  viewBox: "0 0 400 780",
  hub: { x: 30, y: 20, w: 340, h: 76 },
  hubEdge: { x: 200, y: 96 },
  cardX: 30,
  cardW: 340,
  cardH: 76,
  cardY: [150, 290, 430, 570],
  connectorFrom: (i, L) =>
    i === 0
      ? L.hubEdge
      : { x: 200, y: L.cardY[i - 1] + L.cardH },
  cardEdge: (i, L) => ({ x: 200, y: L.cardY[i] }),
};

/**
 * Act 5 visual — "Specialists, not brute force."
 * A glass "core agent" hub dispatches work to four specialist cards —
 * recall (blue), think (rose), search (amber), curate (emerald).
 * A dispatch pulse travels hub → specialist, the card lights up as its
 * pulse arrives, then a fainter return pulse travels back; one loop
 * cycles the four specialists in sequence. Desktop renders the
 * hub-and-spoke; small screens switch (live, via matchMedia) to a
 * vertical layout — hub on top, full-width cards stacked, dispatches
 * traveling down a central spine. Transform/opacity only; reduced
 * motion renders the finished end-state, all cards lit.
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
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const L = isDesktop ? DESKTOP : MOBILE;
  const workers = [
    { label: w1Label, detail: w1Detail, color: BLUE },
    { label: w2Label, detail: w2Detail, color: ROSE },
    { label: w3Label, detail: w3Detail, color: AMBER },
    { label: w4Label, detail: w4Detail, color: EMERALD },
  ];

  return (
    <div
      className="mx-auto w-full max-w-md md:max-w-none"
      role="img"
      aria-label={`${hubLabel} → ${w1Label}, ${w2Label}, ${w3Label}, ${w4Label}`}
    >
      <svg viewBox={L.viewBox} fill="none" className="w-full" aria-hidden="true">
        {/* Connectors + dispatch/return pulses */}
        {workers.map((w, i) => {
          const from = L.connectorFrom(i, L);
          const to = L.cardEdge(i, L);
          const dx = to.x - L.hubEdge.x;
          const dy = to.y - L.hubEdge.y;
          const at = (i * CYCLE) / workers.length;
          return (
            <g key={w.label}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                strokeWidth={1}
                className="landing-stroke-hairline"
              />
              {!reduced && (
                <>
                  {/* Dispatch pulse — hub → specialist */}
                  <motion.circle
                    cx={L.hubEdge.x}
                    cy={L.hubEdge.y}
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
                    cx={to.x}
                    cy={to.y}
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

        {/* Hub — the core agent */}
        <g>
          <rect
            x={L.hub.x}
            y={L.hub.y}
            width={L.hub.w}
            height={L.hub.h}
            rx={12}
            className="landing-fill-glass landing-stroke-hairline"
            strokeWidth={1}
          />
          <circle cx={L.hub.x + 30} cy={L.hub.y + 26} r={5} fill={BLUE} />
          <text
            x={L.hub.x + 50}
            y={L.hub.y + 31}
            className="fill-foreground/90 font-mono text-[16px] font-medium"
          >
            {hubLabel}
          </text>
          <text
            x={L.hub.x + 50}
            y={L.hub.y + 56}
            className="fill-muted-foreground/70 font-mono text-[12px]"
          >
            {hubDetail}
          </text>
          {!reduced && (
            <motion.circle
              cx={L.hubEdge.x}
              cy={L.hubEdge.y}
              r={6}
              fill="none"
              stroke={BLUE}
              strokeWidth={1}
              animate={{ opacity: [0, 0.5, 0], scale: [1, 1.8, 1] }}
              transition={{ duration: CYCLE / workers.length, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: `${L.hubEdge.x}px ${L.hubEdge.y}px` }}
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
                x={L.cardX}
                y={L.cardY[i]}
                width={L.cardW}
                height={L.cardH}
                rx={12}
                className="landing-fill-glass landing-stroke-hairline"
                strokeWidth={1}
              />
              <circle cx={L.cardX + 30} cy={L.cardY[i] + 26} r={5} fill={w.color} />
              <text
                x={L.cardX + 50}
                y={L.cardY[i] + 31}
                className="fill-foreground/90 font-mono text-[15px] font-medium"
              >
                {w.label}
              </text>
              <text
                x={L.cardX + 50}
                y={L.cardY[i] + 56}
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
