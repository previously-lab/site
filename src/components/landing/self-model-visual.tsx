"use client";

import { useRef } from "react";
import { useInView, motion } from "motion/react";

interface SelfModelVisualProps {
  legend: string;
}

const NODES = [
  { id: 1, cx: 120, cy: 30, label: "Prefers concise", category: "pattern" as const, delay: 0 },
  { id: 2, cx: 180, cy: 90, label: "Full-stack dev", category: "identity" as const, delay: 0.3 },
  { id: 3, cx: 250, cy: 20, label: "Use examples", category: "strategy" as const, delay: 0.5 },
  { id: 4, cx: 310, cy: 100, label: "Early riser", category: "pattern" as const, delay: 0.7 },
  { id: 5, cx: 370, cy: 40, label: "Building app", category: "context" as const, delay: 0.9 },
  { id: 6, cx: 430, cy: 85, label: "Likes feedback", category: "pattern" as const, delay: 1.1 },
  { id: 7, cx: 490, cy: 25, label: "OSS contributor", category: "identity" as const, delay: 1.3 },
  { id: 8, cx: 550, cy: 95, label: "GMT+8", category: "context" as const, delay: 1.5 },
  { id: 9, cx: 90, cy: 120, label: "Likes Python", category: "context" as const, delay: 0.2, fadesOut: true },
];

const CONNECTIONS = [
  { from: 1, to: 2, delay: 1.0 }, { from: 2, to: 4, delay: 1.3 },
  { from: 3, to: 5, delay: 1.5 }, { from: 4, to: 6, delay: 1.7 },
  { from: 5, to: 7, delay: 1.9 }, { from: 6, to: 8, delay: 2.1 },
  { from: 1, to: 3, delay: 1.2 }, { from: 2, to: 6, delay: 1.6 },
];

const CATEGORY_COLORS: Record<string, string> = {
  identity: "fill-[#0066FF]/60 stroke-[#0066FF]",
  pattern: "fill-muted-foreground/40 stroke-muted-foreground",
  strategy: "fill-foreground/30 stroke-foreground",
  context: "fill-muted-foreground/25 stroke-muted-foreground/60",
};

const CATEGORY_RINGS: Record<string, string> = {
  identity: "stroke-[#0066FF]/20",
  pattern: "stroke-muted-foreground/15",
  strategy: "stroke-foreground/10",
  context: "stroke-muted-foreground/10",
};

export function SelfModelVisual({ legend }: SelfModelVisualProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="w-full max-w-4xl" role="img"
      aria-label="Agent's understanding of you evolves like a constellation — beliefs form, connect, and refine over time">
      <svg viewBox="0 0 640 160" fill="none" className="w-full" aria-hidden="true">
        {CONNECTIONS.map((conn, i) => {
          const fromNode = NODES.find((n) => n.id === conn.from)!;
          const toNode = NODES.find((n) => n.id === conn.to)!;
          return (
            <motion.line key={`conn-${i}`} x1={fromNode.cx} y1={fromNode.cy} x2={toNode.cx} y2={toNode.cy}
              stroke="currentColor" strokeWidth="0.5" className="text-border/60"
              initial={{ pathLength: 0, opacity: 0 }} animate={isInView ? { pathLength: 1, opacity: 0.6 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.5, delay: conn.delay }} strokeDasharray="1" strokeDashoffset="0" />
          );
        })}

        {NODES.map((node) => (
          <motion.g key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView
              ? node.fadesOut ? { opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0.5] } : { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0 }}
            transition={node.fadesOut ? { duration: 2.5, delay: node.delay, times: [0, 0.2, 0.6, 1] } : { duration: 0.4, delay: node.delay }}>
            <motion.circle cx={node.cx} cy={node.cy} r="14" strokeWidth="1" className={CATEGORY_RINGS[node.category]} fill="none"
              initial={{ scale: 1 }}
              animate={isInView && !node.fadesOut ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={isInView && !node.fadesOut ? { duration: 3, delay: node.delay + 1, repeat: Infinity, repeatDelay: 2 } : {}} />
            <circle cx={node.cx} cy={node.cy} r="4" strokeWidth="1.5" className={CATEGORY_COLORS[node.category]} />
            <text x={node.cx} y={node.cy - 10} textAnchor="middle" className="fill-foreground/70 text-[7px] font-medium">{node.label}</text>
          </motion.g>
        ))}

        <motion.text x="320" y="145" textAnchor="middle" className="fill-muted-foreground/50 text-[9px] italic"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.5, delay: 2.2 }}>
          {legend}
        </motion.text>
      </svg>
    </div>
  );
}
